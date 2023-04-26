import state from "./state.js";
import createElement from "./createElement.js";

export default function hidableEditLink(toggleEdit) {
  if (state.currentProject.isEditor === false) {
    return createElement("div", { style: "visibility: hidden;" });
  } else {
    return createElement(
      "div",
      { class: "edit-btn", title: "Open edit utility" },
      "[Edit]",
      {
        type: "click",
        event: toggleEdit,
      }
    );
  }
}
