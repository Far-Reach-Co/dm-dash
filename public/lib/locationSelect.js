import createElement from "../lib/createElement.js";
import state from "./state.js";

export default async function locationSelect(selectedLocation, locationToSkip) {
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
  }

  const locations = await getLocations();

  function renderLocationSelectOptions() {
    const locationsList = [];
    locations.forEach((location) => {
      if (locationToSkip && location.id == locationToSkip.id) return;
      const elem = createElement(
        "option",
        { value: location.id },
        location.title
      );
      if (selectedLocation === location.id) elem.selected = true;
      locationsList.push(elem);
    });
    return locationsList;
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
