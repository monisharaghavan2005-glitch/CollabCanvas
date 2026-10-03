import { ArrowRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
export default function WorkspaceCard({workspace}){return <Link to={`/workspace/${workspace.id}`} className="workspace-card"><div className="workspace-icon">{workspace.name?.charAt(0).toUpperCase()||"W"}</div><div className="workspace-info"><h3>{workspace.name}</h3><p>{workspace.member_count||0} members · {workspace.document_count||0} documents</p></div><Users size={15}/><ArrowRight size={18}/></Link>}
