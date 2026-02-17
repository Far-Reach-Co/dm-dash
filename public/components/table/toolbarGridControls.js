import createElement from "../createElement.js";
import socketIntegration from "./socketIntegration.js";
import { ICONS } from "./toolbarConfig.js";

export function renderGridButton(toolbar) {
  if (!toolbar.can("canManageGrid")) return toolbar.hiddenElement();

  return toolbar.renderToolbarButton(ICONS.grid, "Grid control", {
    active: toolbar.activePanel === "grid",
    onClick: () => {
      toolbar.clearSelection();
      toolbar.activePanel = toolbar.activePanel === "grid" ? null : "grid";
      toolbar._updateGridAnchor();
      toolbar._updateLayersAnchor();
    },
  });
}

export function renderGridPanel(toolbar) {
  if (toolbar.activePanel !== "grid") return toolbar.hiddenElement();

  const gridGroup = toolbar.tableApp.canvasLayer.gridManager?.getGroup();
  const isVisible = gridGroup?.visible ?? false;

  if (!toolbar.gridSizeInputs) {
    toolbar.gridSizeInputs = { width: 40, height: 40 };
  }

  const updateInput = (key) => (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val)) {
      toolbar.gridSizeInputs[key] = val;
    }
  };

  return createElement("div", { class: "vtt-toolbar-panel open" }, [
    createElement(
      "button",
      { title: "Hide or show the grid lines and toggle snap-to-grid" },
      isVisible ? "Hide Grid" : "Show Grid",
      {
        type: "click",
        event: () => {
          isVisible
            ? toolbar.tableApp.canvasLayer.hideGrid()
            : toolbar.tableApp.canvasLayer.showGrid();
          socketIntegration.gridToggle(!isVisible);
          toolbar._updateGridAnchor();
        },
      },
    ),
    createElement(
      "div",
      {
        class: "d-flex flex-row align-items-center",
        style: "gap: var(--space-sm);",
      },
      [
        createElement("small", {}, "W"),
        createElement(
          "input",
          {
            type: "number",
            value: toolbar.gridSizeInputs.width,
            min: 1,
            max: 100,
            style: "width: 56px; padding: 2px 4px;",
          },
          null,
          { type: "input", event: updateInput("width") },
        ),
        createElement("small", {}, "H"),
        createElement(
          "input",
          {
            type: "number",
            value: toolbar.gridSizeInputs.height,
            min: 1,
            max: 100,
            style: "width: 56px; padding: 2px 4px;",
          },
          null,
          { type: "input", event: updateInput("height") },
        ),
      ],
    ),
    createElement(
      "button",
      { title: "Resize the grid area (in squares)" },
      "Resize",
      {
        type: "click",
        event: () => {
          const w = toolbar.gridSizeInputs.width;
          const h = toolbar.gridSizeInputs.height;
          toolbar.tableApp.canvasLayer.gridManager.rebuildGrid(w, h);
          socketIntegration.gridResized({ width: w, height: h });
        },
      },
    ),
  ]);
}
