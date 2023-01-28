import createElement from "./createElement.js";

export default function renderSpinner() {
  return createElement("div", {class: "lds-dual-ring"})
}