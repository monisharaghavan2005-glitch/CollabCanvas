import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, FileText, Plus, Users, Search, LogOut, Settings, RefreshCw } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { getWorkspaces, createWorkspace, getWorkspaceActivity } from "../../services/workspaceService";
import { getWorkspaceDocument } from "../../services/documentService";
import Modal from "../../components/common/Modal";
import WorkspaceCard from "../../components/dashboard/WorkspaceCard";
import RecentDocument from "../../components/dashboard/RecentDocument";
import StatsCard from "../../components/dashboard/StatsCard";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import Loader from "../../components/common/Loader";
import Avatar from "../../components/common/Avatar";
import "./Dashboard.css";

export default function Dashboard(){
 const {user,logout}=useAuth(); const [workspaces,setWorkspaces]=useState([]); const [documents,setDocuments]=useState([]); const [activities,setActivities]=useState([]); const [loading,setLoading]=useState(true); const [query,setQuery]=useState(""); const [modal,setModal]=useState(false); const [form,setForm]=useState({name:"",description:""}); const [error,setError]=useState("");
 const load=async()=>{setLoading(true);try{const w=await getWorkspaces();const list=w.workspaces||[];setWorkspaces(list);const docs=(await Promise.all(list.slice(0,8).map(x=>getWorkspaceDocument(x.id).catch(()=>({documents:[]}))))).flatMap(x=>x.documents||[]).sort((a,b)=>new Date(b.updated_at)-new Date(a.updated_at));setDocuments(docs.slice(0,8));const acts=(await Promise.all(list.slice(0,4).map(x=>getWorkspaceActivity(x.id).catch(()=>({activities:[]}))))).flatMap(x=>x.activities||[]).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));setActivities(acts.slice(0,8));}catch(e){setError(e.response?.data?.message||"Could not load your workspace data.");}finally{setLoading(false);}};
 useEffect(()=>{load();},[]);
 const filtered=useMemo(()=>workspaces.filter(w=>`${w.name} ${w.description}`.toLowerCase().includes(query.toLowerCase())),[workspaces,query]);
 const submit=async e=>{e.preventDefault();if(!form.name.trim())return;try{await createWorkspace(form);setModal(false);setForm({name:"",description:""});await load();}catch(e){setError(e.response?.data?.message||"Could not create workspace.");}};
 const memberCount=workspaces.reduce((n,w)=>n+(w.member_count||0),0); const docCount=workspaces.reduce((n,w)=>n+(w.document_count||0),0);
 return <div className="dashboard-page"><header className="dashboard-header"><div><p className="dashboard-eyebrow">Your command center</p><h1>Welcome back, {user?.name?.split(" ")[0]||"there"}.</h1><p className="dashboard-subtitle">Everything you create is connected to real workspace data and live collaboration.</p></div><div className="dashboard-actions"><button className="icon-btn" onClick={load} title="Refresh"><RefreshCw size={17}/></button><Link className="dashboard-settings" to="/settings"><Settings size={16}/></Link><button className="profile-chip" onClick={logout}><Avatar name={user?.name}/><span>{user?.name}</span><LogOut size={14}/></button><button className="dashboard-create-btn" onClick={()=>setModal(true)}><Plus size={18}/>New Workspace</button></div></header>
 <div className="dashboard-search"><Search size={17}/><input placeholder="Search workspaces…" value={query} onChange={e=>setQuery(e.target.value)}/></div>
 {error&&<div className="dashboard-error">{error}</div>}
 {loading?<Loader label="Loading your workspace data…"/>:<><section className="dashboard-stats"><StatsCard icon={FileText} label="Documents" value={docCount}/><StatsCard icon={Users} label="Workspace members" value={memberCount}/><StatsCard icon={Activity} label="Recent activity" value={activities.length}/></section>
 <section className="dashboard-section"><div className="section-heading"><div><h2>Your Workspaces</h2><p>Open a space to continue designing and collaborating.</p></div><button className="section-action" onClick={()=>setModal(true)}><Plus size={15}/>Create</button></div>{filtered.length?<div className="workspace-grid">{filtered.map(w=><WorkspaceCard key={w.id} workspace={w}/>)}</div>:<div className="empty-state"><strong>{query?"No matching workspaces":"No workspaces yet"}</strong><span>{query?"Try another search.":"Create your first workspace to start collaborating."}</span>{!query&&<button onClick={()=>setModal(true)}>Create workspace</button>}</div>}</section>
 <section className="dashboard-section"><div className="section-heading"><div><h2>Recent Documents</h2><p>Live data from your workspaces.</p></div></div>{documents.length?<div className="documents-list">{documents.map(d=><RecentDocument key={d.id} document={d}/>)}</div>:<div className="empty-state"><strong>No documents yet</strong><span>Create a workspace and your canvas document will appear here.</span></div>}</section>
 <section className="dashboard-section"><div className="section-heading"><div><h2>Activity</h2><p>What has changed across your workspaces.</p></div></div><ActivityFeed activities={activities}/></section></>}
 <Modal open={modal} onClose={()=>setModal(false)} title="Create a workspace"><form className="modal-form" onSubmit={submit}><label>Name<input autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Product Design"/></label><label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What will your team use this space for?"/></label><div className="modal-actions"><button type="button" onClick={()=>setModal(false)}>Cancel</button><button className="dashboard-create-btn" type="submit">Create workspace</button></div></form></Modal></div>
}
