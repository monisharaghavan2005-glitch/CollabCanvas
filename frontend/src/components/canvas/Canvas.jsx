import { useRef, useState } from "react";
import CanvasObject from "./CanvasObject";
import "./Canvas.css";

const SHAPE_TYPES = new Set([
  "rectangle",
  "roundedRectangle",
  "circle",
  "triangle",
  "diamond",
  "pentagon",
  "hexagon",
  "octagon",
  "star",
  "heart",
  "arrow",
  "lightning",
  "cloud",
  "speech",
  "cylinder",
]);

function createObject(type, x, y) {
  const common = {
    id: crypto.randomUUID(),
    x,
    y,
    width: 180,
    height: 110,
    rotation: 0,
    opacity: 1,
    fill: "#5865f2",
    stroke: "#8b93ff",
    strokeWidth: 2,
  };

  if (type === "text") {
    return {
      ...common,
      type,
      width: 280,
      height: 75,
      text: "Double-click to edit",
      fontFamily: "Inter",
      fontSize: 28,
      fontWeight: "600",
      fontStyle: "normal",
      textDecoration: "none",
      textAlign: "left",
      lineHeight: 1.35,
      color: "#f8fafc",
      fill: "transparent",
    };
  }

  if (type === "sticky") {
    return {
      ...common,
      type,
      width: 190,
      height: 170,
      text: "Write an idea...",
      fill: "#f5c84b",
      stroke: "#f8d977",
      color: "#241d0b",
      fontFamily: "Inter",
      fontSize: 18,
      fontWeight: "500",
      lineHeight: 1.35,
      textAlign: "left",
    };
  }

  if (type === "connector") {
    return {
      ...common,
      type,
      width: 240,
      height: 30,
      x2: x + 240,
      y2: y,
      stroke: "#94a3b8",
      strokeWidth: 3,
      fill: "transparent",
    };
  }

  return {
    ...common,
    type,
  };
}

function Canvas({
  objects = [],
  selectedObjectId,
  activeTool,
  zoom = 1,
  gridEnabled = true,
  onSelect,
  onObjectMove,
  onObjectCreate,
  onObjectChange,
  onCanvasClick,
  onCursorMove,
}) {
  const canvasRef = useRef(null);

  const [editingId, setEditingId] = useState(null);

  const [isDrawing, setIsDrawing] = useState(false);

  const [drawingPoints, setDrawingPoints] = useState([]);

  const drawingRef = useRef({
    points: [],
    startX: 0,
    startY: 0,
  });

  const getPoint = (event) => {
    if (!canvasRef.current) {
      return { x: 0, y: 0 };
    }

    const rect =
      canvasRef.current.getBoundingClientRect();

    return {
      x:
        (event.clientX - rect.left) /
        zoom,

      y:
        (event.clientY - rect.top) /
        zoom,
    };
  };

  /*
   * Check whether the pointer started on an existing object.
   */
  const isObjectTarget = (event) => {
    return Boolean(
      event.target.closest?.(".canvas-object")
    );
  };

  /*
   * Normal click creation:
   * shapes, text, sticky, connector
   */
  const createAtPoint = (point) => {
    if (
      SHAPE_TYPES.has(activeTool) ||
      activeTool === "text" ||
      activeTool === "sticky" ||
      activeTool === "connector"
    ) {
      const newObject = createObject(
        activeTool,
        point.x - 90,
        point.y - 55
      );

      onObjectCreate?.(newObject);

      if (
        activeTool === "text" ||
        activeTool === "sticky"
      ) {
        setEditingId(newObject.id);
      }

      return true;
    }

    return false;
  };

  /*
   * START POINTER
   *
   * This fixes the old problem where .canvas-world
   * was catching blank canvas clicks.
   */
  const handlePointerDown = (event) => {
    if (event.button !== 0) return;

    if (isObjectTarget(event)) {
      return;
    }

    const point = getPoint(event);

    /*
     * FREEHAND DRAWING
     */
    if (activeTool === "draw") {
      event.preventDefault();

      drawingRef.current = {
        points: [point.x, point.y],
        startX: point.x,
        startY: point.y,
      };

      setDrawingPoints([
        point.x,
        point.y,
      ]);

      setIsDrawing(true);

      canvasRef.current?.setPointerCapture?.(
        event.pointerId
      );

      return;
    }

    /*
     * Create normal objects.
     */
    if (createAtPoint(point)) {
      return;
    }

    /*
     * Select tool on blank canvas.
     */
    if (activeTool === "select") {
      onCanvasClick?.();
    }
  };

  /*
   * FREEHAND DRAWING MOVE
   */
  const handlePointerMove = (event) => {
    const point = getPoint(event);

    onCursorMove?.(point);

    if (!isDrawing) return;

    const previous =
      drawingRef.current.points;

    const lastX =
      previous[previous.length - 2];

    const lastY =
      previous[previous.length - 1];

    /*
     * Don't create hundreds of points for
     * tiny mouse movements.
     */
    const distance = Math.sqrt(
      Math.pow(point.x - lastX, 2) +
        Math.pow(point.y - lastY, 2)
    );

    if (distance < 2) {
      return;
    }

    const updatedPoints = [
      ...previous,
      point.x,
      point.y,
    ];

    drawingRef.current.points =
      updatedPoints;

    setDrawingPoints(updatedPoints);
  };

  /*
   * FINISH FREEHAND DRAWING
   */
  const handlePointerUp = (event) => {
    if (!isDrawing) return;

    const points =
      drawingRef.current.points;

    setIsDrawing(false);

    canvasRef.current?.releasePointerCapture?.(
      event.pointerId
    );

    /*
     * Need at least two points to make
     * a meaningful stroke.
     */
    if (points.length < 4) {
      setDrawingPoints([]);
      drawingRef.current.points = [];
      return;
    }

    const xs = [];
    const ys = [];

    for (let i = 0; i < points.length; i += 2) {
      xs.push(points[i]);
      ys.push(points[i + 1]);
    }

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = Math.max(
      30,
      maxX - minX + 20
    );

    const height = Math.max(
      30,
      maxY - minY + 20
    );

    /*
     * Convert absolute canvas points
     * into points relative to the object.
     */
    const relativePoints = [];

    for (let i = 0; i < points.length; i += 2) {
      relativePoints.push(
        points[i] - minX + 10
      );

      relativePoints.push(
        points[i + 1] - minY + 10
      );
    }

    const newObject = {
      id: crypto.randomUUID(),
      type: "draw",

      x: minX - 10,
      y: minY - 10,

      width,
      height,

      rotation: 0,

      opacity: 1,

      fill: "transparent",

      stroke: "#7dd3fc",

      strokeWidth: 4,

      points: relativePoints,
    };

    onObjectCreate?.(newObject);

    setDrawingPoints([]);

    drawingRef.current.points = [];
  };

  /*
   * ESC cancels drawing.
   */
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsDrawing(false);
      setDrawingPoints([]);
      drawingRef.current.points = [];
    }
  };

  /*
   * Draw preview while dragging.
   */
  const renderDrawingPreview = () => {
    if (
      !isDrawing ||
      drawingPoints.length < 4
    ) {
      return null;
    }

    let path = "";

    for (
      let i = 0;
      i < drawingPoints.length;
      i += 2
    ) {
      path += `${
        i === 0 ? "M" : "L"
      } ${drawingPoints[i]} ${
        drawingPoints[i + 1]
      } `;
    }

    return (
      <svg
        className="drawing-preview-layer"
        width="100%"
        height="100%"
      >
        <path
          d={path}
          fill="none"
          stroke="#60a5fa"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.95"
        />
      </svg>
    );
  };

  return (
    <div
      ref={canvasRef}
      className={`canvas-surface ${
        gridEnabled
          ? "show-grid"
          : "hide-grid"
      } ${
        activeTool === "draw"
          ? "drawing-mode"
          : ""
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* WORLD */}

      <div
        className="canvas-world"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {objects.map((object) => (
          <CanvasObject
            key={object.id}
            object={object}
            selected={
              object.id ===
              selectedObjectId
            }
            editing={
              object.id === editingId
            }
            onSelect={onSelect}
            onMove={onObjectMove}
            onChange={onObjectChange}
            onFinishEdit={() =>
              setEditingId(null)
            }
          />
        ))}

        {isDrawing &&
          renderDrawingPreview()}
      </div>

      {/* EMPTY STATE */}

      {objects.length === 0 &&
        !isDrawing && (
          <div className="canvas-empty-minimal">
            <div className="empty-pulse" />

            <strong>
              Canvas ready
            </strong>

            <span>
              Select a tool and click or
              drag on the canvas
            </span>
          </div>
        )}

      {/* DRAWING INDICATOR */}

      {activeTool === "draw" && (
        <div className="drawing-mode-indicator">
          <span className="drawing-live-dot" />
          Draw mode — drag anywhere on
          the canvas
          <kbd>Esc</kbd>
        </div>
      )}

      {/* STATUS */}

      <div className="canvas-status-pill">
        <span className="status-dot" />

        {objects.length}{" "}
        {objects.length === 1
          ? "object"
          : "objects"}
      </div>
    </div>
  );
}

export default Canvas;