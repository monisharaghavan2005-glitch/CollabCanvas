import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "./hooks/useAuth";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import Workspace from "./pages/Workspace/Workspace";
import Settings from "./pages/Settings/Settings";
import NotFound from "./pages/NotFound/NotFound";

function Protected({children}){const {user,loading}=useAuth(); if(loading)return <div className="app-loading"><span/>Loading CollabCanvas…</div>; return user?children:<Navigate to="/login" replace/>;}
function PublicOnly({children}){const {user,loading}=useAuth(); if(loading)return <div className="app-loading"><span/>Loading…</div>; return user?<Navigate to="/dashboard" replace/>:children;}
function ScrollReset() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
export default function App(){return <BrowserRouter><ScrollReset/><Routes><Route path="/" element={<Landing/>}/><Route path="/login" element={<PublicOnly><Login/></PublicOnly>}/><Route path="/register" element={<PublicOnly><Register/></PublicOnly>}/><Route path="/dashboard" element={<Protected><Dashboard/></Protected>}/><Route path="/workspace/:workspaceId" element={<Protected><Workspace/></Protected>}/><Route path="/settings" element={<Protected><Settings/></Protected>}/><Route path="*" element={<NotFound/>}/></Routes></BrowserRouter>}
