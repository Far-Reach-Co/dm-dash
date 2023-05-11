import createElement from "./createElement.js";

export default function locationTypeSelect(onChangeCallback, currentType) {
  function renderLocationTypeSelectOptions() {
    const types = [
      "Shop",
      "store",
      "Place",
      "Temple",
      "Building",
      "House",
      "Container",
      "Realm",
      "Section",
      "Underground",
      "Floating",
      "Island",
      "Institution",
      "School",
      "Town",
      "Village",
      "City",
      "Country",
      "Region",
      "Area",
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
    {
      id: "type",
      name: "type",
      required: false,
      title: "Choose a location type",
    },
    [
      createElement("option", { value: "None" }, "None"),
      ...renderLocationTypeSelectOptions(),
    ],
    {
      type: "change",
      event: (e) => {
        if (onChangeCallback) onChangeCallback(e.target.value);
      },
    }
  );
}
