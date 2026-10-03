export default function Toast({message,type="info",onClose}){if(!message)return null;return <div className={`cc-toast cc-toast-${type}`} onClick={onClose}>{message}</div>}
