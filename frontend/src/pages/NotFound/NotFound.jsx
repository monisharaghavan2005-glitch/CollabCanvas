import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
export default function NotFound(){return <main className="notfound-page"><div><span>404</span><h1>That canvas doesn't exist.</h1><p>The page may have moved, or the link is no longer valid.</p><Link to="/dashboard"><ArrowLeft size={16}/>Back to dashboard</Link></div></main>}
