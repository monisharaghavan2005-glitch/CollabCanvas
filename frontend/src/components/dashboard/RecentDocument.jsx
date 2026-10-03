import { FileText, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
export default function RecentDocument({document}){return <Link to={`/workspace/${document.workspace_id}`} className="document-row"><div className="document-icon"><FileText size={18}/></div><div><strong>{document.title}</strong><span>{new Date(document.updated_at).toLocaleString()}</span></div><ArrowUpRight size={16} className="document-open"/></Link>}
