const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

async function membership(documentId, userId) {
  const result = await pool.query(
    `SELECT d.id, d.workspace_id, d.content, d.title, wm.role
     FROM documents d
     JOIN workspace_members wm ON wm.workspace_id=d.workspace_id
     WHERE d.id=$1 AND wm.user_id=$2`,
    [documentId, userId]
  );
  return result.rows[0] || null;
}

async function workspaceMembership(workspaceId, userId) {
  const result = await pool.query(
    `SELECT wm.role FROM workspace_members wm WHERE wm.workspace_id=$1 AND wm.user_id=$2`,
    [workspaceId, userId]
  );
  return result.rows[0] || null;
}

router.get("/workspace/:workspaceId", authMiddleware, async (req,res)=>{
  try {
    if (!await workspaceMembership(req.params.workspaceId, req.user.id)) return res.status(403).json({success:false,message:"Access denied"});
    const result=await pool.query(`SELECT * FROM documents WHERE workspace_id=$1 ORDER BY updated_at DESC`,[req.params.workspaceId]);
    res.json({success:true,documents:result.rows,document:result.rows[0]||null});
  } catch(error){ console.error("Get documents:",error.message); res.status(500).json({success:false,message:"Failed to load documents"}); }
});

router.post("/workspace/:workspaceId", authMiddleware, async (req,res)=>{
  try {
    const membership=await workspaceMembership(req.params.workspaceId,req.user.id);
    if(!membership || !["owner","admin","editor"].includes(membership.role)) return res.status(403).json({success:false,message:"You cannot create documents here"});
    const title=String(req.body.title||"Untitled Document").trim()||"Untitled Document";
    const content=req.body.content && typeof req.body.content === "object" ? req.body.content : {objects:[]};
    const result=await pool.query(`INSERT INTO documents(workspace_id,created_by,title,content) VALUES($1,$2,$3,$4) RETURNING *`,[req.params.workspaceId,req.user.id,title,JSON.stringify(content)]);
    await pool.query(`INSERT INTO activities(workspace_id,user_id,action,entity_type,entity_id,metadata) VALUES($1,$2,'created document','document',$3,$4)`,[req.params.workspaceId,req.user.id,result.rows[0].id,JSON.stringify({title})]);
    res.status(201).json({success:true,document:result.rows[0]});
  } catch(error){console.error("Create document:",error.message);res.status(500).json({success:false,message:"Failed to create document"});}
});

router.put("/:documentId", authMiddleware, async (req,res)=>{
  try {
    const current=await membership(req.params.documentId,req.user.id);
    if(!current || !["owner","admin","editor"].includes(current.role)) return res.status(403).json({success:false,message:"You cannot edit this document"});
    const content=req.body.content && typeof req.body.content === "object" ? req.body.content : {objects:[]};
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const versionResult = await client.query(`SELECT COALESCE(MAX(version_number),0)+1 AS next FROM document_versions WHERE document_id=$1`, [req.params.documentId]);
      await client.query(`INSERT INTO document_versions(document_id,created_by,content,version_number) VALUES($1,$2,$3,$4)`, [req.params.documentId,req.user.id,JSON.stringify(content),versionResult.rows[0].next]);
      const result=await client.query(`UPDATE documents SET content=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *`,[JSON.stringify(content),req.params.documentId]);
      await client.query(`INSERT INTO activities(workspace_id,user_id,action,entity_type,entity_id,metadata) VALUES($1,$2,'updated canvas','document',$3,$4)`,[current.workspace_id,req.user.id,req.params.documentId,JSON.stringify({objects:Array.isArray(content.objects)?content.objects.length:0})]);
      await client.query('COMMIT');
      res.json({success:true,document:result.rows[0]});
    } catch (txError) { await client.query('ROLLBACK'); throw txError; } finally { client.release(); }
  } catch(error){console.error("Update document:",error.message);res.status(500).json({success:false,message:"Failed to save document"});}
});

router.patch("/:documentId/title", authMiddleware, async(req,res)=>{
  try{
    const current=await membership(req.params.documentId,req.user.id);
    if(!current || !["owner","admin","editor"].includes(current.role)) return res.status(403).json({success:false,message:"You cannot rename this document"});
    const title=String(req.body.title||"").trim();
    if(!title) return res.status(400).json({success:false,message:"Title is required"});
    const result=await pool.query(`UPDATE documents SET title=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *`,[title,req.params.documentId]);
    res.json({success:true,document:result.rows[0]});
  }catch(error){res.status(500).json({success:false,message:"Failed to rename document"});}
});

module.exports=router;
