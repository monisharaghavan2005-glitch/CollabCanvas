import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Lock, Mail, Eye, EyeOff } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import "./Login.css";

export default function Login(){
 const navigate=useNavigate(); const {login}=useAuth();
 const [form,setForm]=useState({email:"",password:""}); const [error,setError]=useState(""); const [loading,setLoading]=useState(false); const [show,setShow]=useState(false);
 const submit=async e=>{e.preventDefault();setError("");setLoading(true);try{await login(form);navigate("/dashboard");}catch(err){setError(err.response?.data?.message||"Unable to sign in. Check your details and try again.");}finally{setLoading(false);}};
 return <main className="auth-page"><div className="auth-card"><Link to="/" className="auth-back"><ArrowLeft size={16}/>Back to home</Link><div className="auth-logo">C</div><h1>Welcome back</h1><p className="auth-subtitle">Sign in to continue to your live collaboration workspace.</p>{error&&<div className="auth-error">{error}</div>}<form className="auth-form" onSubmit={submit}><label>Email<div className="input-wrap"><Mail size={17}/><input type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div></label><label>Password<div className="input-wrap"><Lock size={17}/><input type={show?"text":"password"} autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/><button type="button" className="password-toggle" onClick={()=>setShow(!show)}>{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label><button className="auth-submit" disabled={loading}>{loading?"Signing in…":<>Sign In<ArrowRight size={17}/></>}</button></form><p className="auth-switch">Don't have an account? <Link to="/register">Create one</Link></p></div></main>;
}
