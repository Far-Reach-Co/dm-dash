import createElement from "../createElement.js";
import { ICONS } from "./toolbarConfig.js";

export function renderDrawModeToggle(toolbar) {
  const isDrawing = toolbar.tableApp.canvasLayer.isDrawingMode();
  return toolbar.renderToolbarButton(ICONS.pencil, "Toggle draw mode", {
    active: isDrawing,
    onClick: () => {
      toolbar.clearSelection();
      toolbar.tableApp.canvasLayer.setDrawingMode(!isDrawing);
      toolbar._updateDrawToggle();
      toolbar._updateDrawBar();
    },
  });
}

export function renderDrawBar(toolbar) {
  if (!toolbar.tableApp.canvasLayer.isDrawingMode()) {
    return toolbar.hiddenElement();
  }

  return createElement("div", { class: "vtt-draw-bar" }, [
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
          toolbar.tableApp.canvasLayer.setDrawingBrushColor(e.target.value);
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
        value: toolbar.tableApp.canvasLayer.getDrawingBrushWidth(),
        min: 1,
        style: "width: 44px; height: 26px; padding: 2px 4px;",
      },
      null,
      {
        type: "input",
        event: (e) => {
          toolbar.tableApp.canvasLayer.setDrawingBrushWidth(e.target.valueAsNumber);
        },
      },
    ),
  ]);
}
