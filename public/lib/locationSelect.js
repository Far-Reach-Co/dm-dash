import createElement from "../lib/createElement.js";
import state from "./state.js";

export default async function locationSelect(selectedLocation) {

  async function getLocations() {
    try {
      const res = await fetch(
        `${window.location.origin}/api/get_locations/${state.currentProject}`
      );
      const data = await res.json();
      if (res.status === 200) {
        return data;
      } else throw new Error();
    } catch (err) {
      console.log(err);
    }
  };

  const locations = await getLocations();

  function renderLocationSelectOptions() {
    return locations.map((location) => {
      const elem = createElement("option", { value: location.id }, location.title);
      if(selectedLocation === location.id) elem.selected = true;
      return elem;
    });
  }

  return createElement(
    "select",
    { id: "location_id", name: "location_id", required: false },
    [
      createElement("option", { value: 0 }, "None"),
      ...renderLocationSelectOptions(),
    ]
  );
}
