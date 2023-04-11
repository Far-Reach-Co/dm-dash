import createElement from "./createElement.js";

export default function loreTypeSelect(onChangeCallback, currentType) {
  function renderLoreTypeSelectOptions() {
    const types = [
      "History",
      "Event",
      "Mythology",
      "Magic",
      "Background",
      "Story",
      "Culture",
      "Group",
      "Society",
      "Organization",
      "Nature",
      "Industry",
      "Economy",
      "Religion",
      "Mystery",
      "Personal",
      "Quality",
      "Attribute",
    ];
    const typeList = [];
    types.forEach((type) => {
      const elem = createElement("option", { value: type }, type);
      if (currentType && currentType === type) elem.selected = true;
      typeList.push(elem);
    });
    return typeList;
  }

  return createElement(
    "select",
    { id: "type", name: "type", required: false, title: "Choose a lore type" },
    [
      createElement("option", { value: "None" }, "None"),
      ...renderLoreTypeSelectOptions(),
    ],
    {
      type: "change",
      event: (e) => {
        if (onChangeCallback) onChangeCallback(e.target.value);
      },
    }
  );
}
