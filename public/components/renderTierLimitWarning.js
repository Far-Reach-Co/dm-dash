import createElement from "./createElement.js";
import modal from "./modal.js";

export default function renderTierLimitWarning(message) {
  modal.show(
    createElement("div", { class: "modal-pro-warning-container" }, [
      createElement("h2", {}, "Limited Feature"),
      createElement("hr", { style: "margin-top: 0px;" }),
      createElement("div", { style: "max-width: 300px;" }, message),
      createElement("br"),
      createElement("div", {}, "Thank you."),
      createElement("br"),
      createElement("small", {}, "-- FRC Staff"),
    ])
  );
}

window.renderTierLimitWarning = renderTierLimitWarning;
