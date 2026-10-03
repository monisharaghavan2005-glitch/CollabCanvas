import { Users, Wifi, WifiOff } from "lucide-react";

function PresenceBar({
  users = [],
  connected = false,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: connected
            ? "#4ade80"
            : "#f87171",
          fontSize: 13,
        }}
      >
        {connected ? (
          <Wifi size={15} />
        ) : (
          <WifiOff size={15} />
        )}

        {connected ? "Live" : "Offline"}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          color: "#cbd5e1",
          fontSize: 13,
        }}
      >
        <Users size={16} />

        {users.length} online
      </div>

      <div
        style={{
          display: "flex",
          marginLeft: 4,
        }}
      >
        {users.slice(0, 5).map((user, index) => (
          <div
            key={user.socketId || user.userId || index}
            title={user.name}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              marginLeft: index === 0 ? 0 : -7,
              border:
                "2px solid #0f172a",
              background:
                "linear-gradient(135deg,#7c3aed,#06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 11,
              fontWeight: 700,
              zIndex: 10 - index,
            }}
          >
            {(user.name || "?")
              .charAt(0)
              .toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PresenceBar;