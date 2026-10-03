import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  RotateCw,
  Trash2,
  Copy,
} from "lucide-react";
import "./PropertiesPanel.css";

const FONT_OPTIONS = [
  "Inter","Arial","Helvetica","Roboto","Poppins","Montserrat",
  "Open Sans","Lato","Georgia","Times New Roman","Courier New",
  "Verdana","Trebuchet MS","Impact",
];

function PropertiesPanel({ selectedObject, onChange, onDelete, onDuplicate }) {
  if (!selectedObject) {
    return (
      <aside className="properties-panel">
        <div className="properties-header">
          <div>
            <span>Design</span>
            <small>Inspector</small>
          </div>
        </div>
        <div className="properties-empty">
          <div className="properties-empty-icon">✦</div>
          <h3>No selection</h3>
          <p>Select an object on the canvas to edit its properties.</p>
          <div className="properties-shortcuts">
            <div><kbd>V</kbd><span>Select</span></div>
            <div><kbd>T</kbd><span>Text</span></div>
            <div><kbd>R</kbd><span>Rectangle</span></div>
          </div>
        </div>
      </aside>
    );
  }

  const update = (key, value) =>
    onChange?.(selectedObject.id, { [key]: value });

  const isText = selectedObject.type === "text";
  const isSticky = selectedObject.type === "sticky";
  const isShape =
    !isText &&
    !isSticky &&
    selectedObject.type !== "connector" &&
    selectedObject.type !== "draw";

  return (
    <aside className="properties-panel">
      <div className="properties-header">
        <div>
          <span>Design</span>
          <small>{selectedObject.type}</small>
        </div>
        <div className="properties-actions">
          <button onClick={onDuplicate} title="Duplicate"><Copy size={15} /></button>
          <button className="danger" onClick={onDelete} title="Delete"><Trash2 size={15} /></button>
        </div>
      </div>

      <section className="property-section">
        <div className="section-title">Position</div>
        <div className="property-grid">
          <label><span>X</span><input type="number" value={Math.round(selectedObject.x || 0)} onChange={(e) => update("x", Number(e.target.value))} /></label>
          <label><span>Y</span><input type="number" value={Math.round(selectedObject.y || 0)} onChange={(e) => update("y", Number(e.target.value))} /></label>
        </div>
      </section>

      <section className="property-section">
        <div className="section-title">Size</div>
        <div className="property-grid">
          <label><span>W</span><input type="number" value={Math.round(selectedObject.width || 0)} onChange={(e) => update("width", Math.max(20, Number(e.target.value)))} /></label>
          <label><span>H</span><input type="number" value={Math.round(selectedObject.height || 0)} onChange={(e) => update("height", Math.max(20, Number(e.target.value)))} /></label>
        </div>
      </section>

      <section className="property-section">
        <div className="section-title">Rotation</div>
        <div className="rotation-control">
          <RotateCw size={14} />
          <input type="number" value={selectedObject.rotation || 0} onChange={(e) => update("rotation", Number(e.target.value))} />
          <span>°</span>
        </div>
      </section>

      {isShape && (
        <section className="property-section">
          <div className="section-title">Appearance</div>
          <div className="color-row">
            <span>Fill</span>
            <input className="color-input" type="color" value={selectedObject.fill || "#4f46e5"} onChange={(e) => update("fill", e.target.value)} />
            <code>{selectedObject.fill || "#4f46e5"}</code>
          </div>
          <div className="color-row">
            <span>Stroke</span>
            <input className="color-input" type="color" value={selectedObject.stroke || "#8b93ff"} onChange={(e) => update("stroke", e.target.value)} />
            <code>{selectedObject.stroke || "#8b93ff"}</code>
          </div>
        </section>
      )}

      {(isText || isSticky) && (
        <section className="property-section">
          <div className="section-title">Typography</div>

          <select className="font-select" value={selectedObject.fontFamily || "Inter"} onChange={(e) => update("fontFamily", e.target.value)}>
            {FONT_OPTIONS.map((font) => <option key={font} value={font}>{font}</option>)}
          </select>

          <div className="property-grid">
            <label><span>Size</span><input type="number" min="8" max="200" value={selectedObject.fontSize || 24} onChange={(e) => update("fontSize", Number(e.target.value))} /></label>
            <label><span>Line</span><input type="number" min="0.8" max="3" step="0.1" value={selectedObject.lineHeight || 1.35} onChange={(e) => update("lineHeight", Number(e.target.value))} /></label>
          </div>

          <div className="text-style-buttons">
            <button className={selectedObject.fontWeight === "700" ? "active" : ""} onClick={() => update("fontWeight", selectedObject.fontWeight === "700" ? "400" : "700")}><Bold size={16} /></button>
            <button className={selectedObject.fontStyle === "italic" ? "active" : ""} onClick={() => update("fontStyle", selectedObject.fontStyle === "italic" ? "normal" : "italic")}><Italic size={16} /></button>
            <button className={selectedObject.textDecoration === "underline" ? "active" : ""} onClick={() => update("textDecoration", selectedObject.textDecoration === "underline" ? "none" : "underline")}><Underline size={16} /></button>
          </div>

          <div className="alignment-buttons">
            <button className={selectedObject.textAlign === "left" ? "active" : ""} onClick={() => update("textAlign", "left")}><AlignLeft size={16} /></button>
            <button className={selectedObject.textAlign === "center" ? "active" : ""} onClick={() => update("textAlign", "center")}><AlignCenter size={16} /></button>
            <button className={selectedObject.textAlign === "right" ? "active" : ""} onClick={() => update("textAlign", "right")}><AlignRight size={16} /></button>
          </div>

          <div className="color-row">
            <span>Text color</span>
            <input className="color-input" type="color" value={selectedObject.color || "#ffffff"} onChange={(e) => update("color", e.target.value)} />
          </div>
        </section>
      )}

      <section className="property-section">
        <label className="range-row">
          <div><span>Opacity</span><strong>{Math.round((selectedObject.opacity ?? 1) * 100)}%</strong></div>
          <input type="range" min="0.1" max="1" step="0.05" value={selectedObject.opacity ?? 1} onChange={(e) => update("opacity", Number(e.target.value))} />
        </label>
      </section>

      <div className="property-footer">
        <button onClick={onDuplicate}><Copy size={14} />Duplicate</button>
        <button className="delete-button" onClick={onDelete}><Trash2 size={14} />Delete</button>
      </div>
    </aside>
  );
}

export default PropertiesPanel;
