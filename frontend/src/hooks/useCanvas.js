import { useCallback, useEffect, useRef, useState } from "react";

export default function useCanvas(initial=[]) {
  const [objects,setObjects]=useState(initial);
  const [history,setHistory]=useState([initial]);
  const [index,setIndex]=useState(0);
  const applying=useRef(false);
  const commit=useCallback((next)=>{
    const snapshot=JSON.parse(JSON.stringify(next));
    setObjects(snapshot);
    if(applying.current) return;
    setHistory(prev=>[...prev.slice(0,index+1),snapshot]);
    setIndex(prev=>prev+1);
  },[index]);
  const replace=useCallback((next)=>{ const snapshot=JSON.parse(JSON.stringify(next)); applying.current=true; setObjects(snapshot); setHistory([snapshot]); setIndex(0); queueMicrotask(()=>{applying.current=false;}); },[]);
  const undo=useCallback(()=>{ if(index<=0)return; const next=history[index-1]; applying.current=true; setObjects(JSON.parse(JSON.stringify(next))); setIndex(index-1); queueMicrotask(()=>{applying.current=false;}); },[history,index]);
  const redo=useCallback(()=>{ if(index>=history.length-1)return; const next=history[index+1]; applying.current=true; setObjects(JSON.parse(JSON.stringify(next))); setIndex(index+1); queueMicrotask(()=>{applying.current=false;}); },[history,index]);
  useEffect(()=>{ if(!Array.isArray(initial)) return; },[initial]);
  return {objects,setObjects,commit,replace,undo,redo,canUndo:index>0,canRedo:index<history.length-1};
}
