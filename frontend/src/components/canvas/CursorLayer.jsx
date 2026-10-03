import { MousePointer2 } from "lucide-react";

function CursorLayer({ cursors = {} }) {
  const cursorList = Array.isArray(cursors)
    ? cursors
    : Object.values(cursors || {});

  return (
    <div className="cursor-layer">
      {cursorList.map((cursor) => {
        if (!cursor) return null;

        return (
          <div
            key={cursor.socketId || cursor.userId}
            className="remote-cursor"
            style={{
              left: `${cursor.x || 0}px`,
              top: `${cursor.y || 0}px`,
            }}
          >
            <MousePointer2
              size={17}
              strokeWidth={2}
            />

            <div className="remote-cursor-name">
              {cursor.name || "Collaborator"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CursorLayer;