import { X } from "lucide-react";
export default function Modal({open,title,children,onClose}){if(!open)return null;return <div className="cc-modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose?.()}><div className="cc-modal"><header><div><h3>{title}</h3></div><button onClick={onClose}><X size={18}/></button></header>{children}</div></div>}
