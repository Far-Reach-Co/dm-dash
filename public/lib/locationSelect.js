import createElement from "../lib/createElement.js";
import state from "./state.js";

export default async function locationSelect(selectedLocation, locationToSkip, onChangeCallback) {
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

  async function renderLocationSelectOptions() {
    let locations = await getLocations();

    const locationElemsList = [];

    locations.forEach((location) => {
      let isInSubHeirarchy = false;

      if (locationToSkip) {
        // skip location and its sub locations
        if (location.id === locationToSkip.id) return;
        // check sublocation lineage and skip
        let checkingSubHeirachy = true;
        
        let locationToCheck = location;
        while(checkingSubHeirachy) {
          if (locationToCheck.is_sub) {
            if (locationToCheck.parent_location_id === locationToSkip.id) {
              isInSubHeirarchy = true;
              checkingSubHeirachy = false;
            } else {
              const parentLocation = locations.filter(
                (location) => locationToCheck.parent_location_id === location.id
              )[0];
              locationToCheck = parentLocation
              checkingSubHeirachy = true;
            }
          } else checkingSubHeirachy = false;
        }
      }
      
      if(isInSubHeirarchy) return;

      const elem = createElement(
        "option",
        { value: location.id },
        location.title
      );
      if (selectedLocation == location.id) elem.selected = true;
      locationElemsList.push(elem);
    });
    
    return locationElemsList;
  }

  return createElement(
    "select",
    { id: "location_id", name: "location_id", required: false },
    [
      createElement("option", { value: 0 }, "None"),
      ...(await renderLocationSelectOptions()),
    ],
    {type: "change", event: (e) => {
      if(onChangeCallback) onChangeCallback(e.target.value);
    }}
  );
}
