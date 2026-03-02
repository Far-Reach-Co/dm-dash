import createElement from "../lib/salt-lib/createElement.js";

export default function renderSpinner() {
  return createElement("div", { class: "lds-dual-ring" });
}
