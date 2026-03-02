import createElement from "../lib/salt-lib/createElement.js";

export default function hidableEditLink(toggleEdit, auth) {
  if (!auth) {
    return createElement("div", { class: "invisible" });
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
