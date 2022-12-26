import createElement from "./createElement.js";

export default function locationTypeSelect(onChangeCallback, currentType) {
  function renderLocationTypeSelectOptions() {
    const types = [
      "Shop",
      "Town",
      "Village",
      "City",
      "Country",
      "Region",
      "Continent",
      "Planet",
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
      ...renderLocationTypeSelectOptions(),
    ],
    {type: "change", event: (e) => {
      if(onChangeCallback) onChangeCallback(e.target.value);
    }}
  );
}