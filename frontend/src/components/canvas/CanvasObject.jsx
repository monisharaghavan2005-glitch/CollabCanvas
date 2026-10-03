import { useRef } from "react";

function shapePath(type, width, height) {
  const w = width;
  const h = height;
  const cx = w / 2;
  const cy = h / 2;

  if (type === "triangle") {
    return `M ${cx} 4 L ${w - 4} ${h - 4} L 4 ${h - 4} Z`;
  }

  if (type === "diamond") {
    return `M ${cx} 3 L ${w - 3} ${cy} L ${cx} ${h - 3} L 3 ${cy} Z`;
  }

  if (type === "pentagon") {
    const points = Array.from({ length: 5 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
      return `${cx + Math.cos(a) * (w / 2 - 4)},${cy + Math.sin(a) * (h / 2 - 4)}`;
    }).join(" ");
    return `M ${points.replaceAll(",", " ")} Z`;
  }

  if (type === "hexagon") {
    const points = Array.from({ length: 6 }, (_, i) => {
      const a = Math.PI / 6 + (i * Math.PI * 2) / 6;
      return `${cx + Math.cos(a) * (w / 2 - 4)} ${cy + Math.sin(a) * (h / 2 - 4)}`;
    }).join(" L ");
    return `M ${points} Z`;
  }

  if (type === "octagon") {
    const points = Array.from({ length: 8 }, (_, i) => {
      const a = Math.PI / 8 + (i * Math.PI * 2) / 8;
      return `${cx + Math.cos(a) * (w / 2 - 4)} ${cy + Math.sin(a) * (h / 2 - 4)}`;
    }).join(" L ");
    return `M ${points} Z`;
  }

  if (type === "star") {
    const points = [];
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? Math.min(w, h) * 0.47 : Math.min(w, h) * 0.21;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      points.push(`${cx + Math.cos(a) * radius} ${cy + Math.sin(a) * radius}`);
    }
    return `M ${points.join(" L ")} Z`;
  }

  if (type === "heart") {
    return `M ${cx} ${h - 10}
      C ${w * 0.1} ${h * 0.45}, ${w * 0.15} ${h * 0.08}, ${w * 0.36} ${h * 0.12}
      C ${w * 0.48} ${h * 0.14}, ${cx} ${h * 0.27}, ${cx} ${h * 0.27}
      C ${cx} ${h * 0.27}, ${w * 0.52} ${h * 0.14}, ${w * 0.64} ${h * 0.12}
      C ${w * 0.85} ${h * 0.08}, ${w * 0.9} ${h * 0.45}, ${cx} ${h - 10} Z`;
  }

  if (type === "arrow") {
    return `M 8 ${cy - 14} H ${w - 34} V ${cy - 30} L ${w - 5} ${cy}
      L ${w - 34} ${cy + 30} V ${cy + 14} H 8 Z`;
  }

  if (type === "lightning") {
    return `M ${w * 0.58} 4 L ${w * 0.22} ${h * 0.55} H ${w * 0.47}
      L ${w * 0.38} ${h - 4} L ${w * 0.8} ${h * 0.38}
      H ${w * 0.55} Z`;
  }

  if (type === "cloud") {
    return `M ${w * 0.2} ${h * 0.7}
      C ${w * 0.04} ${h * 0.68}, ${w * 0.03} ${h * 0.42}, ${w * 0.22} ${h * 0.38}
      C ${w * 0.25} ${h * 0.12}, ${w * 0.62} ${h * 0.07}, ${w * 0.7} ${h * 0.34}
      C ${w * 0.98} ${h * 0.3}, ${w * 1.0} ${h * 0.68}, ${w * 0.76} ${h * 0.7} Z`;
  }

  if (type === "speech") {
    return `M 8 8 H ${w - 8} V ${h - 25} H ${w * 0.32}
      L ${w * 0.18} ${h - 5} L ${w * 0.2} ${h - 25} H 8 Z`;
  }

  if (type === "cylinder") {
    return `M 8 18
      C 8 6, ${w - 8} 6, ${w - 8} 18
      V ${h - 18}
      C ${w - 8} ${h - 6}, 8 ${h - 6}, 8 ${h - 18} Z
      M 8 18 C 8 30, ${w - 8} 30, ${w - 8} 18`;
  }

  return null;
}

function CanvasObject({
  object,
  selected,
  editing,
  onSelect,
  onMove,
  onChange,
  onFinishEdit,
}) {
  const drag = useRef(null);

  const handlePointerDown = (event) => {
    event.stopPropagation();
    onSelect?.(object.id);

    if (event.button !== 0) return;

    drag.current = {
      startX: event.clientX,
      startY: event.clientY,
      objectX: object.x,
      objectY: object.y,
    };

    const move = (e) => {
      if (!drag.current) return;

      const dx = e.clientX - drag.current.startX;
      const dy = e.clientY - drag.current.startY;

      onMove?.(object.id, {
        x: drag.current.objectX + dx,
        y: drag.current.objectY + dy,
      });
    };

    const up = () => {
      drag.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const style = {
    left: object.x,
    top: object.y,
    width: object.width,
    height: object.height,
    transform: `rotate(${object.rotation || 0}deg)`,
    opacity: object.opacity ?? 1,
  };

  const textStyle = {
    fontFamily: object.fontFamily || "Inter",
    fontSize: `${object.fontSize || 24}px`,
    fontWeight: object.fontWeight || "400",
    fontStyle: object.fontStyle || "normal",
    textDecoration: object.textDecoration || "none",
    textAlign: object.textAlign || "left",
    lineHeight: object.lineHeight || 1.35,
    color: object.color || "#fff",
    letterSpacing:
      object.letterSpacing != null
        ? `${object.letterSpacing}px`
        : undefined,
  };

  const renderShape = () => {
    if (object.type === "circle") {
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${object.width} ${object.height}`}>
          <ellipse
            cx={object.width / 2}
            cy={object.height / 2}
            rx={object.width / 2 - 4}
            ry={object.height / 2 - 4}
            fill={object.fill}
            stroke={object.stroke}
            strokeWidth={object.strokeWidth || 2}
          />
        </svg>
      );
    }

    if (object.type === "roundedRectangle") {
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${object.width} ${object.height}`}>
          <rect
            x="4"
            y="4"
            width={object.width - 8}
            height={object.height - 8}
            rx="22"
            fill={object.fill}
            stroke={object.stroke}
            strokeWidth={object.strokeWidth || 2}
          />
        </svg>
      );
    }

    const path = shapePath(
      object.type,
      object.width,
      object.height
    );

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${object.width} ${object.height}`}>
        <path
          d={path}
          fill={object.fill}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth || 2}
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  let content = null;

  if (object.type === "text") {
    content = editing ? (
      <textarea
        autoFocus
        className="canvas-edit-textarea"
        value={object.text || ""}
        style={textStyle}
        onChange={(e) =>
          onChange?.(object.id, {
            text: e.target.value,
          })
        }
        onBlur={onFinishEdit}
        onPointerDown={(e) => e.stopPropagation()}
      />
    ) : (
      <div className="canvas-text-object" style={textStyle}>
        {object.text || "Text"}
      </div>
    );
  } else if (object.type === "sticky") {
    content = editing ? (
      <textarea
        autoFocus
        className="canvas-edit-textarea sticky-editor"
        value={object.text || ""}
        style={textStyle}
        onChange={(e) =>
          onChange?.(object.id, {
            text: e.target.value,
          })
        }
        onBlur={onFinishEdit}
        onPointerDown={(e) => e.stopPropagation()}
      />
    ) : (
      <div className="sticky-content" style={textStyle}>
        {object.text || "Idea"}
      </div>
    );
  } else if (object.type === "connector") {
    content = (
      <svg width="100%" height="100%" overflow="visible">
        <line
          x1="3"
          y1={object.height / 2}
          x2={object.width - 10}
          y2={object.height / 2}
          stroke={object.stroke}
          strokeWidth={object.strokeWidth || 3}
        />
        <polygon
          points={`${object.width - 10},${object.height / 2} ${object.width - 25},${object.height / 2 - 7} ${object.width - 25},${object.height / 2 + 7}`}
          fill={object.stroke}
        />
      </svg>
    );
  } else if (object.type === "draw") {
    const points = object.points || [];
    let d = "";
    for (let i = 0; i < points.length; i += 2) {
      d += `${i === 0 ? "M" : "L"} ${points[i]} ${points[i + 1]} `;
    }

    content = (
      <svg width="100%" height="100%">
        <path
          d={d}
          fill="none"
          stroke={object.stroke}
          strokeWidth={object.strokeWidth || 4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  } else {
    content = renderShape();
  }

  return (
    <div
      className={`canvas-object ${selected ? "selected" : ""}`}
      style={style}
      onPointerDown={handlePointerDown}
      onDoubleClick={(event) => {
        event.stopPropagation();
        if (object.type === "text" || object.type === "sticky") {
          onSelect?.(object.id);
        }
      }}
    >
      {content}

      {selected && (
        <>
          <span className="selection-handle nw" />
          <span className="selection-handle ne" />
          <span className="selection-handle sw" />
          <span className="selection-handle se" />
        </>
      )}
    </div>
  );
}

export default CanvasObject;
