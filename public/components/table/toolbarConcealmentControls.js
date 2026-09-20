import createElement from "../../lib/salt-lib/createElement.js";
import { ICONS } from "./toolbarConfig.js";

export function renderConcealmentButton(toolbar) {
  if (!toolbar.can("canManageLayers")) return toolbar.hiddenElement();
  const concealment = toolbar.tableApp.canvasLayer?.concealmentLayer;

  return toolbar.renderToolbarButton(ICONS.eyeOff(), "Concealment", {
    active: toolbar.activePanel === "concealment" || !!concealment?.mode,
    onClick: () => {
      if (concealment?.mode) {
        toolbar.tableApp.canvasLayer.setConcealmentMode(null);
        toolbar.activePanel = null;
      } else {
      toolbar.activePanel =
        toolbar.activePanel === "concealment" ? null : "concealment";
      }
      void toolbar._updateConcealmentAnchor();
      void toolbar._updateLayersAnchor();
      void toolbar._updateGridAnchor();
    },
  });
}

export function renderConcealmentPanel(toolbar) {
  if (toolbar.activePanel !== "concealment") return toolbar.hiddenElement();
  const canvasLayer = toolbar.tableApp.canvasLayer;
  const concealment = canvasLayer?.concealmentLayer;
  if (!concealment) return toolbar.hiddenElement();

  const update = () => void toolbar._updateConcealmentAnchor();
  const controls = [];

  if (!concealment.hasMask()) {
    controls.push(
      createElement(
        "button",
        { type: "button", title: "Cover the configured grid" },
        "Cover Grid",
        {
          type: "click",
          event: async () => {
            await canvasLayer.coverGridWithConcealment();
            update();
          },
        },
      ),
    );
  } else {
    controls.push(
      createElement("small", {}, "Paint grid squares"),
      createElement("div", { class: "vtt-concealment-modes" }, [
        createElement(
          "button",
          {
            type: "button",
            class: `vtt-concealment-mode${
              concealment.mode === "reveal" ? " is-active" : ""
            }`,
          },
          "Reveal",
          {
            type: "click",
            event: () => {
              canvasLayer.setConcealmentMode(
                concealment.mode === "reveal" ? null : "reveal",
              );
              update();
            },
          },
        ),
        createElement(
          "button",
          {
            type: "button",
            class: `vtt-concealment-mode${
              concealment.mode === "conceal" ? " is-active" : ""
            }`,
          },
          "Conceal",
          {
            type: "click",
            event: () => {
              canvasLayer.setConcealmentMode(
                concealment.mode === "conceal" ? null : "conceal",
              );
              update();
            },
          },
        ),
      ]),
      concealment.mode
        ? createElement(
            "button",
            { type: "button", class: "vtt-concealment-done" },
            "Done",
            {
              type: "click",
              event: () => {
                canvasLayer.setConcealmentMode(null);
                update();
              },
            },
          )
        : null,
      createElement(
        "button",
        { type: "button", class: "btn-danger" },
        "Clear All",
        {
          type: "click",
          event: async () => {
            if (!window.confirm("Clear all concealment from this table?")) return;
            await canvasLayer.clearConcealment();
            update();
          },
        },
      ),
    );
  }

  return createElement("div", { class: "vtt-toolbar-panel open" }, controls);
}
