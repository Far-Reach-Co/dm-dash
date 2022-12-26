import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import Location from "../components/Location.js";
import locationTypeSelect from "../lib/locationTypeSelect.js";

export default class LocationsView {
  constructor(props) {
    this.navigate = props.navigate;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.creatingLocation = false;

    this.render();
  }

  toggleCreatingLocation = () => {
    this.creatingLocation = !this.creatingLocation;
    this.render();
  };

  getLocations = async () => {
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

  newLocation = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    const projectId = state.currentProject;
    formProps.project_id = projectId;
    formProps.is_sub = false;
    if(formProps.type === "None") formProps.type = null;

    try {
      const res = await fetch(`${window.location.origin}/api/add_location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formProps),
      });
      await res.json();
      if (res.status === 201) {
        this.render();
      } else throw new Error();
    } catch (err) {
      window.alert("Failed to create new location...");
      console.log(err);
    }
  };

  renderCreatingLocation = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new location"
    );
    const form = createElement("form", {}, [
      createElement("label", { for: "title" }, "Title"),
      createElement("input", {
        id: "title",
        name: "title",
        placeholder: "Location Title",
        required: true,
      }),
      createElement("label", { for: "description" }, "Description"),
      createElement("textarea", {
        id: "description",
        name: "description",
      }),
      createElement("br"),
      createElement("div", {}, "Type Select (Optional)"),
      locationTypeSelect(null, null),
      createElement("br"),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", async (e) => {
      await this.newLocation(e);
      this.toggleCreatingLocation();
    });

    const cancelButton = createElement("button", {}, "Cancel");
    cancelButton.addEventListener("click", () => {
      this.toggleCreatingLocation();
    });

    this.domComponent.append(
      titleOfForm,
      createElement("br"),
      form,
      createElement("br"),
      cancelButton
    );
  };

  renderLocationsElems = async () => {
    let locationData = await this.getLocations();
    if (this.filter) {
      locationData = locationData.filter((location) => {
        return (location.type && location.type === this.filter);
      });
    }
    const locationsMap = locationData.map((location) => {
      // create element
      const elem = createElement("div", {
        id: `location-component-${location.id}`,
        class: "component",
      });

      new Location({
        domComponent: elem,
        location,
        navigate: this.navigate,
        parentRender: this.render,
      });

      return elem;
    });

    if(locationsMap.length) return locationsMap;
    else return [createElement("div", {}, "None...")]
  };

  handleTypeFilterChange = (value) => {
    if(value === "None") value = null;
    this.filter = value;
    this.render();
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creatingLocation) {
      return this.renderCreatingLocation();
    }

    const locationElems = await this.renderLocationsElems();
    // append
    this.domComponent.append(
      createElement(
        "div",
        { style: "display: flex; justify-content: space-between;" },
        [
          createElement("div", {}, [
            createElement("div", {}, "Filter by type"),
            locationTypeSelect(this.handleTypeFilterChange, this.filter),
          ]),
          createElement(
            "button",
            { style: "align-self: flex-end;" },
            "+ Location",
            {
              type: "click",
              event: this.toggleCreatingLocation,
            }
          ),
        ]
      ),
      createElement("h1", { style: "align-self: center;" }, "Locations"),
      createElement("br"),
      ...locationElems
    );
  };
}
