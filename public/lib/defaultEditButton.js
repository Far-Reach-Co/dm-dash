import state from "./state.js";
import createElement from "./createElement.js";

// Rename to hidableEditLink
export default function defaultEditButton(toggleEdit) {
  if (state.currentProject.isEditor === false) {
    return createElement("div", { style: "visibility: hidden;" });
  } else {
    return createElement("div", { class: "edit-btn" }, "[Edit]", {
      type: "click",
      event: toggleEdit,
    });
  }
}
