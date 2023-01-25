import createElement from "./createElement.js";
import defaultEditButton from "./defaultEditButton.js";

export default function listItemTitle(title, toggleEdit) {
  return createElement("div", { class: "title-edit" }, [
    title,
    defaultEditButton(toggleEdit),
  ]);
}
