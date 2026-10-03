const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

async function access(documentId, userId) {
  const r = await pool.query(`SELECT d.id,d.workspace_id,d.content,d.title,wm.role FROM documents d JOIN workspace_members wm ON wm.workspace_id=d.workspace_id WHERE d.id=$1 AND wm.user_id=$2`, [documentId,userId]);
  return r.rows[0] || null;
}

router.get('/documents/:documentId/versions', auth, async (req,res)=>{
  try {
    const doc = await access(req.params.documentId, req.user.id);
    if(!doc) return res.status(403).json({success:false,message:'Access denied'});
    const r = await pool.query(`SELECT v.id,v.version_number,v.created_at,v.created_by,u.name AS user_name FROM document_versions v JOIN users u ON u.id=v.created_by WHERE v.document_id=$1 ORDER BY v.version_number DESC LIMIT 50`,[doc.id]);
    res.json({success:true,versions:r.rows});
  } catch(e){ res.status(500).json({success:false,message:'Failed to load versions'}); }
});

router.get('/documents/:documentId/versions/:versionId', auth, async (req,res)=>{
  try {
    const doc = await access(req.params.documentId, req.user.id);
    if(!doc) return res.status(403).json({success:false,message:'Access denied'});
    const r=await pool.query(`SELECT * FROM document_versions WHERE id=$1 AND document_id=$2`,[req.params.versionId,doc.id]);
    if(!r.rows[0]) return res.status(404).json({success:false,message:'Version not found'});
    res.json({success:true,version:r.rows[0]});
  } catch(e){res.status(500).json({success:false,message:'Failed to load version'});}
});

router.get('/documents/:documentId/comments', auth, async(req,res)=>{
  try{
    const doc=await access(req.params.documentId,req.user.id); if(!doc)return res.status(403).json({success:false,message:'Access denied'});
    const r=await pool.query(`SELECT c.*,u.name AS user_name FROM document_comments c JOIN users u ON u.id=c.user_id WHERE c.document_id=$1 AND c.resolved=false ORDER BY c.created_at DESC`,[doc.id]);
    res.json({success:true,comments:r.rows});
  }catch(e){res.status(500).json({success:false,message:'Failed to load comments'});}
});

router.post('/documents/:documentId/comments', auth, async(req,res)=>{
  try{
    const doc=await access(req.params.documentId,req.user.id); if(!doc)return res.status(403).json({success:false,message:'Access denied'});
    const body=String(req.body.body||'').trim(); if(!body)return res.status(400).json({success:false,message:'Comment cannot be empty'});
    const objectId=req.body.objectId||null;
    const r=await pool.query(`INSERT INTO document_comments(document_id,user_id,object_id,body) VALUES($1,$2,$3,$4) RETURNING *`,[doc.id,req.user.id,objectId,body]);
    await pool.query(`INSERT INTO activities(workspace_id,user_id,action,entity_type,entity_id,metadata) VALUES($1,$2,'commented on document','document',$3,$4)`,[doc.workspace_id,req.user.id,doc.id,JSON.stringify({objectId})]);
    const full=await pool.query(`SELECT c.*,u.name AS user_name FROM document_comments c JOIN users u ON u.id=c.user_id WHERE c.id=$1`,[r.rows[0].id]);
    res.status(201).json({success:true,comment:full.rows[0]});
  }catch(e){console.error(e);res.status(500).json({success:false,message:'Failed to add comment'});}
});

router.patch('/comments/:commentId/resolve', auth, async(req,res)=>{
  try{
    const r=await pool.query(`UPDATE document_comments c SET resolved=true,updated_at=CURRENT_TIMESTAMP FROM documents d JOIN workspace_members wm ON wm.workspace_id=d.workspace_id WHERE c.id=$1 AND c.document_id=d.id AND wm.user_id=$2 RETURNING c.*`,[req.params.commentId,req.user.id]);
    if(!r.rows[0])return res.status(404).json({success:false,message:'Comment not found'});
    res.json({success:true,comment:r.rows[0]});
  }catch(e){res.status(500).json({success:false,message:'Failed to resolve comment'});}
});

module.exports=router;
