import createElement from "./createElement.js";

export default function hidableEditLink(toggleEdit, auth) {
  if (!auth) {
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
