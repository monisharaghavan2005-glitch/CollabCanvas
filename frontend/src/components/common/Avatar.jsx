export default function Avatar({ name="User", size="md", online=false }) {
  const initials=name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase()||"U";
  return <span className={`cc-avatar cc-avatar-${size}`} title={name}><span>{initials}</span>{online&&<i/>}</span>;
}
