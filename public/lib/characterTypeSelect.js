import createElement from "./createElement.js";

export default function characterTypeSelect(onChangeCallback, currentType) {
  function renderCharacterTypeSelectOptions() {
    const types = [
      "Player",
      "NPC",
      "Creature",
      "Monster",
      "Robot",
      "Person",
      "Entity",
      "Spirit",
      "Deity",
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
    { id: "type", name: "type", required: false },
    [
      createElement("option", { value: "None" }, "None"),
      ...renderCharacterTypeSelectOptions(),
    ],
    {type: "change", event: (e) => {
      if(onChangeCallback) onChangeCallback(e.target.value);
    }}
  );
}