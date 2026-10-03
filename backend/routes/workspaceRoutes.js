const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const memberCheck = async (workspaceId, userId) => {
  const result = await pool.query(
    `SELECT wm.role, w.owner_id FROM workspace_members wm
     JOIN workspaces w ON w.id = wm.workspace_id
     WHERE wm.workspace_id = $1 AND wm.user_id = $2`,
    [workspaceId, userId]
  );
  return result.rows[0] || null;
};

router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.id, w.name, w.description, w.owner_id, w.created_at, w.updated_at,
              COUNT(DISTINCT wm2.user_id)::int AS member_count,
              COUNT(DISTINCT d.id)::int AS document_count,
              MAX(d.updated_at) AS last_document_update
       FROM workspaces w
       JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = $1
       LEFT JOIN workspace_members wm2 ON wm2.workspace_id = w.id
       LEFT JOIN documents d ON d.workspace_id = w.id
       GROUP BY w.id
       ORDER BY w.updated_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, workspaces: result.rows });
  } catch (error) {
    console.error("List workspaces:", error.message);
    res.status(500).json({ success: false, message: "Failed to load workspaces" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();
    if (!name) return res.status(400).json({ success: false, message: "Workspace name is required" });

    await client.query("BEGIN");
    const workspace = await client.query(
      `INSERT INTO workspaces (name, description, owner_id) VALUES ($1,$2,$3) RETURNING *`,
      [name, description, req.user.id]
    );
    await client.query(
      `INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1,$2,'owner')`,
      [workspace.rows[0].id, req.user.id]
    );
    const document = await client.query(
      `INSERT INTO documents (workspace_id, created_by, title, content) VALUES ($1,$2,'Untitled Canvas','{"objects":[]}') RETURNING *`,
      [workspace.rows[0].id, req.user.id]
    );
    await client.query(
      `INSERT INTO activities (workspace_id,user_id,action,entity_type,entity_id,metadata) VALUES ($1,$2,'created workspace','workspace',$1,$3)`,
      [workspace.rows[0].id, req.user.id, JSON.stringify({ name })]
    );
    await client.query("COMMIT");
    res.status(201).json({ success: true, workspace: workspace.rows[0], document: document.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create workspace:", error.message);
    res.status(500).json({ success: false, message: "Failed to create workspace" });
  } finally { client.release(); }
});

router.get("/:workspaceId", authMiddleware, async (req, res) => {
  try {
    const membership = await memberCheck(req.params.workspaceId, req.user.id);
    if (!membership) return res.status(403).json({ success: false, message: "You do not have access to this workspace" });
    const result = await pool.query(
      `SELECT w.*, u.name AS owner_name,
              (SELECT COUNT(*)::int FROM workspace_members WHERE workspace_id=w.id) AS member_count,
              (SELECT COUNT(*)::int FROM documents WHERE workspace_id=w.id) AS document_count
       FROM workspaces w JOIN users u ON u.id=w.owner_id WHERE w.id=$1`,
      [req.params.workspaceId]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: "Workspace not found" });
    res.json({ success: true, workspace: { ...result.rows[0], role: membership.role } });
  } catch (error) {
    console.error("Get workspace:", error.message);
    res.status(500).json({ success: false, message: "Failed to load workspace" });
  }
});

router.get("/:workspaceId/members", authMiddleware, async (req, res) => {
  try {
    if (!(await memberCheck(req.params.workspaceId, req.user.id))) return res.status(403).json({ success:false,message:"Access denied" });
    const result = await pool.query(
      `SELECT u.id,u.name,u.email,wm.role,wm.joined_at FROM workspace_members wm JOIN users u ON u.id=wm.user_id WHERE wm.workspace_id=$1 ORDER BY wm.joined_at`,
      [req.params.workspaceId]
    );
    res.json({ success:true, members:result.rows });
  } catch (error) { res.status(500).json({ success:false,message:"Failed to load members" }); }
});

router.get("/:workspaceId/activity", authMiddleware, async (req,res)=>{
  try {
    if (!(await memberCheck(req.params.workspaceId, req.user.id))) return res.status(403).json({success:false,message:"Access denied"});
    const result=await pool.query(
      `SELECT a.*,u.name AS user_name FROM activities a JOIN users u ON u.id=a.user_id WHERE a.workspace_id=$1 ORDER BY a.created_at DESC LIMIT 50`,
      [req.params.workspaceId]
    );
    res.json({success:true,activities:result.rows});
  } catch(error){res.status(500).json({success:false,message:"Failed to load activity"});}
});

router.patch("/:workspaceId", authMiddleware, async (req,res)=>{
  try{
    const membership=await memberCheck(req.params.workspaceId,req.user.id);
    if(!membership || !["owner","admin"].includes(membership.role)) return res.status(403).json({success:false,message:"Only owners and admins can update workspace settings"});
    const result=await pool.query(`UPDATE workspaces SET name=COALESCE(NULLIF($1,''),name),description=COALESCE($2,description),updated_at=CURRENT_TIMESTAMP WHERE id=$3 RETURNING *`,[String(req.body.name||"").trim(),req.body.description ?? null,req.params.workspaceId]);
    res.json({success:true,workspace:result.rows[0]});
  }catch(error){res.status(500).json({success:false,message:"Failed to update workspace"});}
});

module.exports = router;
