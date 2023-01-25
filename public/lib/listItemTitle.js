import createElement from "./createElement.js";
import hidableEditLink from "./hidableEditLink.js";

export default function listItemTitle(title, toggleEdit) {
  return createElement("div", { class: "title-edit" }, [
    title,
    hidableEditLink(toggleEdit),
  ]);
}
