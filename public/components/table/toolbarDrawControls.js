import createElement from "../../lib/salt-lib/createElement.js";
import { ICONS } from "./toolbarConfig.js";

export function renderDrawModeToggle(toolbar) {
  const isDrawing = toolbar.tableApp.canvasLayer.isDrawingMode();
  return toolbar.renderToolbarButton(ICONS.pencil(), "Toggle draw mode", {
    active: isDrawing,
    onClick: () => {
      toolbar.clearSelection();
      toolbar.tableApp.canvasLayer.setDrawingMode(!isDrawing);
      void toolbar._updateDrawToggle();
      void toolbar._updateDrawBar();
    },
  });
}

export function renderDrawBar(toolbar) {
  if (!toolbar.tableApp.canvasLayer.isDrawingMode()) {
    return toolbar.hiddenElement();
  }

  const canvasLayer = toolbar.tableApp.canvasLayer;
  const drawingTool = toolbar.tableApp.canvasLayer.getDrawingTool();

  return createElement("div", { class: "vtt-draw-bar" }, [
    createElement("small", {}, "Tool"),
    createElement(
      "select",
      {
        class: "vtt-draw-control vtt-draw-select",
        value: drawingTool,
      },
      [
        createElement("option", { value: "freehand" }, "Freehand"),
        createElement("option", { value: "line" }, "Line"),
        createElement("option", { value: "rect" }, "Rectangle"),
        createElement("option", { value: "ellipse" }, "Ellipse"),
        createElement("option", { value: "text" }, "Text"),
      ],
      {
        type: "change",
        event: (e) => {
          canvasLayer.setDrawingTool(e.target.value);
          void toolbar._updateDrawBar();
        },
      },
    ),
    createElement("small", {}, "Color"),
    createElement(
      "input",
      {
        type: "color",
        value: toolbar.tableApp.canvasLayer.getDrawingBrushColor(),
        style:
          "cursor: pointer; height: 26px; width: 32px; border: none; border-radius: var(--border-radius); padding: 0;",
      },
      null,
      {
        type: "input",
        event: (e) => {
          canvasLayer.setDrawingBrushColor(e.target.value);
        },
      },
    ),
    createElement(
      "small",
      { style: "margin-left: var(--space-sm);" },
      "Width",
    ),
    createElement(
      "input",
      {
        type: "number",
        class: "vtt-draw-control vtt-draw-width",
        value: canvasLayer.getDrawingBrushWidth(),
        min: 1,
      },
      null,
      {
        type: "input",
        event: (e) => {
          canvasLayer.setDrawingBrushWidth(e.target.valueAsNumber);
        },
      },
    ),
    createElement(
      "button",
      {
        type: "button",
        class: "vtt-draw-control vtt-draw-undo",
        title: "Undo most recent drawing object (Cmd/Ctrl+Z)",
      },
      "Undo",
      {
        type: "click",
        event: async () => {
          await canvasLayer.undoLastDraw();
        },
      },
    ),
  ]);
}
