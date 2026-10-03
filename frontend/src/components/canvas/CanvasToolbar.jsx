import {
  MousePointer2,
  Shapes,
  Type,
  StickyNote,
  Minus,
  Pencil,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid3X3,
  Magnet,
  ChevronDown,
  Square,
  Circle,
  Triangle,
  Diamond,
  Hexagon,
  Star,
  Heart,
  Cloud,
  Zap,
  ArrowRight,
  MessageSquare,
  Cylinder,
  X,
} from "lucide-react";

import "./Canvas.css";

const SHAPES = [
  ["rectangle", "Rectangle", Square],
  ["roundedRectangle", "Rounded", Square],
  ["circle", "Circle", Circle],
  ["triangle", "Triangle", Triangle],
  ["diamond", "Diamond", Diamond],
  ["pentagon", "Pentagon", Hexagon],
  ["hexagon", "Hexagon", Hexagon],
  ["octagon", "Octagon", Hexagon],
  ["star", "Star", Star],
  ["heart", "Heart", Heart],
  ["arrow", "Arrow", ArrowRight],
  ["lightning", "Lightning", Zap],
  ["cloud", "Cloud", Cloud],
  ["speech", "Speech", MessageSquare],
  ["cylinder", "Cylinder", Cylinder],
];

function ToolButton({ active, icon: Icon, label, shortcut, onClick }) {
  return (
    <button
      className={`editor-tool ${active ? "active" : ""}`}
      onClick={onClick}
      title={`${label}${shortcut ? ` (${shortcut})` : ""}`}
      type="button"
    >
      <Icon size={18} />
      <span>{label}</span>
      {shortcut && <kbd>{shortcut}</kbd>}
    </button>
  );
}

function CanvasToolbar({
  activeTool,
  setActiveTool,
  onUndo,
  onRedo,
  onDelete,
  onDuplicate,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  canUndo,
  canRedo,
  canDelete,
  zoom = 1,
  gridEnabled = true,
  setGridEnabled,
  snapEnabled = true,
  setSnapEnabled,
}) {
  const chooseShape = (type) => {
    setActiveTool(type);
  };

  return (
    <>
      <aside className="editor-left-toolbar">
        <div className="tool-brand">C</div>

        <div className="tool-group">
          <ToolButton
            active={activeTool === "select"}
            icon={MousePointer2}
            label="Select"
            shortcut="V"
            onClick={() => setActiveTool("select")}
          />

          <ToolButton
            active={SHAPES.some(([type]) => type === activeTool)}
            icon={Shapes}
            label="Shapes"
            onClick={() =>
              setActiveTool(
                activeTool === "shape-menu" ? "select" : "shape-menu"
              )
            }
          />

          <ToolButton
            active={activeTool === "text"}
            icon={Type}
            label="Text"
            shortcut="T"
            onClick={() => setActiveTool("text")}
          />

          <ToolButton
            active={activeTool === "sticky"}
            icon={StickyNote}
            label="Sticky"
            shortcut="S"
            onClick={() => setActiveTool("sticky")}
          />

          <ToolButton
            active={activeTool === "connector"}
            icon={Minus}
            label="Connector"
            shortcut="L"
            onClick={() => setActiveTool("connector")}
          />

          <ToolButton
            active={activeTool === "draw"}
            icon={Pencil}
            label="Draw"
            shortcut="P"
            onClick={() => setActiveTool("draw")}
          />
        </div>

        <div className="tool-divider" />

        <div className="tool-group compact-tools">
          <button
            type="button"
            className="editor-icon-button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
          >
            <Undo2 size={17} />
          </button>

          <button
            type="button"
            className="editor-icon-button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
          >
            <Redo2 size={17} />
          </button>
        </div>

        <div className="toolbar-spacer" />

        <div className="tool-group compact-tools">
          <button
            type="button"
            className="editor-icon-button"
            onClick={() => setGridEnabled?.(!gridEnabled)}
            title="Toggle grid"
          >
            <Grid3X3 size={17} />
          </button>

          <button
            type="button"
            className={`editor-icon-button ${snapEnabled ? "selected" : ""}`}
            onClick={() => setSnapEnabled?.(!snapEnabled)}
            title="Toggle snap"
          >
            <Magnet size={17} />
          </button>

          <button
            type="button"
            className="editor-icon-button"
            onClick={onZoomOut}
            title="Zoom out"
          >
            <ZoomOut size={17} />
          </button>

          <button
            type="button"
            className="zoom-readout"
            onClick={onResetZoom}
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            className="editor-icon-button"
            onClick={onZoomIn}
            title="Zoom in"
          >
            <ZoomIn size={17} />
          </button>

          <button
            type="button"
            className="editor-icon-button"
            title="Fit canvas"
            onClick={onResetZoom}
          >
            <Maximize size={16} />
          </button>
        </div>
      </aside>

      {activeTool === "shape-menu" && (
        <div className="shape-library">
          <div className="shape-library-header">
            <div>
              <strong>Shapes</strong>
              <span>Choose an object to place on the canvas</span>
            </div>

            <button
              type="button"
              className="shape-close"
              onClick={() => setActiveTool("select")}
            >
              <X size={16} />
            </button>
          </div>

          <div className="shape-section-title">Basic & diagram</div>

          <div className="shape-grid">
            {SHAPES.map(([type, label, Icon]) => (
              <button
                key={type}
                type="button"
                className="shape-choice"
                onClick={() => chooseShape(type)}
                title={label}
              >
                <span className="shape-choice-icon">
                  <Icon size={22} strokeWidth={1.7} />
                </span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="shape-library-footer">
            <span>Click a shape, then click anywhere on the canvas.</span>
          </div>
        </div>
      )}
    </>
  );
}

export default CanvasToolbar;
