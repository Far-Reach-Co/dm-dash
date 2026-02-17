import createElement from "../createElement.js";
import { ICONS } from "./toolbarConfig.js";

export function renderStyledLayerInfoElem(toolbar) {
  const style = toolbar.layerStyles[toolbar.tableApp.currentLayer];
  return createElement("small", { class: style.class }, style.label);
}

export function renderLayersButton(toolbar) {
  if (!toolbar.can("canManageLayers")) return toolbar.hiddenElement();

  const layerColor = toolbar.layerStyles[toolbar.tableApp.currentLayer]?.color;
  return toolbar.renderToolbarButton(ICONS.layers, "Layers", {
    active: toolbar.activePanel === "layers",
    layerColor,
    onClick: () => {
      toolbar.clearSelection();
      toolbar.activePanel = toolbar.activePanel === "layers" ? null : "layers";
      toolbar._updateLayersAnchor();
      toolbar._updateGridAnchor();
    },
  });
}

export function renderLayersPanel(toolbar) {
  if (toolbar.activePanel !== "layers") return toolbar.hiddenElement();

  return createElement("div", { class: "vtt-toolbar-panel open" }, [
    renderStyledLayerInfoElem(toolbar),
    createElement(
      "button",
      { title: "Change the layer you are interacting with" },
      "Switch Layer",
      {
        type: "click",
        event: () => {
          toolbar.tableApp.changeLayer();
          toolbar._updateLayersAnchor();
        },
      },
    ),
  ]);
}
