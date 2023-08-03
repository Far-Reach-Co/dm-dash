import createElement from "./createElement.js";
import hidableEditLink from "./hidableEditLink.js";

export default function listItemTitle(title, toggleEdit, auth) {
  return createElement(
    "div",
    { class: "title-edit d-flex align-items-center" },
    [title, hidableEditLink(toggleEdit, auth)]
  );
}
