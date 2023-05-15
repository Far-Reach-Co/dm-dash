import createElement from "./createElement.js";

export default function itemTypeSelect(onChangeCallback, currentType) {
  function renderItemTypeSelectOptions() {
    const types = [
      "Weapon",
      "Tool",
      "Magic",
      "Material",
      "Natural",
      "Clothing",
      "Ingredient",
      "Mineral",
      "Biological",
      "Food",
      "Artifact",
      "Component",
      "Structure",
      "Unknown",
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
    { id: "type", name: "type", required: false, title: "Choose an item type" },
    [
      createElement("option", { value: "None" }, "None"),
      ...renderItemTypeSelectOptions(),
    ],
    {
      type: "change",
      event: (e) => {
        if (onChangeCallback) onChangeCallback(e.target.value);
      },
    }
  );
}
