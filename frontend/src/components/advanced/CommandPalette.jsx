import { useEffect, useMemo, useState } from 'react';
import { Search, Command, MousePointer2, StickyNote, Type, History, MessageCircle, Sparkles, Grid3X3, ZoomIn, Download } from 'lucide-react';

const iconMap={select:MousePointer2,sticky:StickyNote,text:Type,history:History,comments:MessageCircle,copilot:Sparkles,grid:Grid3X3,zoom:ZoomIn,export:Download};
export default function CommandPalette({open,onClose,onAction}){
 const [query,setQuery]=useState('');
 useEffect(()=>{if(!open)return;setQuery('');const fn=e=>{if(e.key==='Escape')onClose();};window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn)},[open,onClose]);
 const items=[['select','Select tool','Switch to selection'],['sticky','New sticky note','Place a sticky on the canvas'],['text','New text','Place a text object'],['history','Time Machine','Browse saved document versions'],['comments','Comments','Open collaborative comments'],['copilot','Canvas Copilot','Analyze this board locally'],['grid','Toggle grid','Show or hide the canvas grid'],['zoom','Reset zoom','Return to 100%'],['export','Export canvas','Download the current board as JSON']];
 const filtered=useMemo(()=>items.filter(x=>`${x[1]} ${x[2]}`.toLowerCase().includes(query.toLowerCase())),[query]);
 if(!open)return null;
 return <div className="cc-command-backdrop" onMouseDown={onClose}><div className="cc-command" onMouseDown={e=>e.stopPropagation()}><div className="cc-command-search"><Search size={18}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search actions, tools, workspace commands…"/><kbd>ESC</kbd></div><div className="cc-command-list">{filtered.map(([id,label,desc])=>{const Icon=iconMap[id]||Command;return <button key={id} onClick={()=>{onAction(id);onClose()}}><span className="cc-command-icon"><Icon size={17}/></span><span><strong>{label}</strong><small>{desc}</small></span><span className="cc-command-arrow">↵</span></button>})}</div><div className="cc-command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>Enter</kbd> Run</span><span><kbd>Esc</kbd> Close</span></div></div></div>
}
