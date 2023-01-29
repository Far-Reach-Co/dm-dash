import createElement from "./createElement.js";

export default function searchElement(placeholder, component) {
  return createElement(
      "input",
      {
        placeholder: placeholder,
        value: component.searchTerm,
      },
      null,
      {
        type: "change",
        event: (e) => {
          component.offset = 0;
          component.searchTerm = e.target.value.toLowerCase();
          component.render();
        },
      }
    )
}