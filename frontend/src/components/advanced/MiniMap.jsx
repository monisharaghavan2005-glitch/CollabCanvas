export default function MiniMap({objects=[],zoom=1}){
 if(!objects.length)return <div className="cc-minimap cc-minimap-empty"><span>Mini-map</span><small>Objects will appear here</small></div>;
 const maxX=Math.max(900,...objects.map(o=>(o.x||0)+(o.width||120))),maxY=Math.max(600,...objects.map(o=>(o.y||0)+(o.height||100)));
 return <div className="cc-minimap"><div className="cc-minimap-head"><span>Canvas map</span><small>{Math.round(zoom*100)}%</small></div><div className="cc-minimap-stage" style={{aspectRatio:`${maxX}/${maxY}`}}>{objects.map(o=><span key={o.id} className={`cc-mini-object cc-mini-${o.type}`} style={{left:`${Math.max(0,(o.x||0)/maxX*100)}%`,top:`${Math.max(0,(o.y||0)/maxY*100)}%`,width:`${Math.max(2,(o.width||30)/maxX*100)}%`,height:`${Math.max(2,(o.height||30)/maxY*100)}%`}}/>)}</div></div>
}
