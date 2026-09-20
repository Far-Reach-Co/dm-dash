import createElement from "../../lib/salt-lib/createElement.js";
import { ICONS } from "./toolbarConfig.js";

const LAYERS = ["Map", "Object", "Fog"];

export function renderLayerSegment({ activeLayer, onSelect, label }) {
  return createElement("div", { class: "vtt-layer-control" }, [
    label
      ? createElement("small", { class: "vtt-layer-control-label" }, label)
      : null,
    createElement(
      "div",
      {
        class: "vtt-layer-segment",
        role: "group",
        "aria-label": label || "Layer",
      },
      LAYERS.map((layer) =>
        createElement(
          "button",
          {
            type: "button",
            class: `vtt-layer-segment-btn vtt-layer-${layer.toLowerCase()}${
              activeLayer === layer ? " is-active" : ""
            }`,
            "aria-pressed": activeLayer === layer ? "true" : "false",
            title: `${label || "Use"} ${layer} layer`,
          },
          layer,
          { type: "click", event: () => onSelect(layer) },
        ),
      ),
    ),
  ]);
}

export function renderStyledLayerInfoElem(toolbar) {
  const style = toolbar.layerStyles[toolbar.tableApp.currentLayer];
  return createElement("small", { class: style.class }, style.label);
}

export function renderLayersButton(toolbar) {
  if (!toolbar.can("canManageLayers")) return toolbar.hiddenElement();

  const layerColor = toolbar.layerStyles[toolbar.tableApp.currentLayer]?.color;
  return toolbar.renderToolbarButton(ICONS.layers(), "Layers", {
    active: toolbar.activePanel === "layers",
    layerColor,
    onClick: () => {
      toolbar.clearSelection();
      toolbar.activePanel = toolbar.activePanel === "layers" ? null : "layers";
      void toolbar._updateLayersAnchor();
      void toolbar._updateGridAnchor();
    },
  });
}

export function renderLayersPanel(toolbar) {
  if (toolbar.activePanel !== "layers") return toolbar.hiddenElement();

  return createElement("div", { class: "vtt-toolbar-panel open" }, [
    renderStyledLayerInfoElem(toolbar),
    renderLayerSegment({
      activeLayer: toolbar.tableApp.currentLayer,
      label: "Work on",
      onSelect: (layer) => {
        toolbar.tableApp.setCurrentLayer(layer);
        void toolbar._updateLayersAnchor();
      },
    }),
  ]);
}
