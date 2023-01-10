import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import Location from "../components/Location.js";
import locationTypeSelect from "../lib/locationTypeSelect.js";

export default class LocationsView {
  constructor(props) {
    this.navigate = props.navigate;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.searchTerm = "";
    this.filter = null;
    this.limit = state.config.queryLimit;
    this.offset = 0;

    this.creatingLocation = false;

    this.render();
  }

  resetFilters = () => {
    this.searchTerm = "";
    this.filter = null;
    this.offset = 0;
  }

  toggleCreatingLocation = () => {
    this.resetFilters();
    this.creatingLocation = !this.creatingLocation;
    this.render();
  };

  getLocations = async () => {
    let url = `${window.location.origin}/api/get_locations/${state.currentProject}/${this.limit}/${this.offset}`;
    if (
      !this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `${window.location.origin}/api/get_locations_keyword/${state.currentProject}/${this.limit}/${this.offset}/${this.searchTerm}`;
    if (
      this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `${window.location.origin}/api/get_locations_filter_keyword/${state.currentProject}/${this.limit}/${this.offset}/${this.filter}/${this.searchTerm}`;
    if (this.filter && (this.searchTerm === "" || this.searchTerm === " "))
      url = `${window.location.origin}/api/get_locations_filter/${state.currentProject}/${this.limit}/${this.offset}/${this.filter}`;

    try {
      const res = await fetch(url);
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
    if (formProps.type === "None") formProps.type = null;

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

    const locationsMap = locationData.map((location) => {
      // create element
      const elem = createElement("div", {
        id: `location-component-${location.id}`,
        class: "component",
      });

      new Location({
        domComponent: elem,
        location: location,
        id: location.id,
        title: location.title,
        description: location.description,
        type: location.type,
        isSub: location.is_sub,
        parentLocationId: location.parent_location_id,
        projectId: location.project_id,
        navigate: this.navigate,
        parentRender: this.render,
        handleTypeFilterChange: this.handleTypeFilterChange,
      });

      return elem;
    });

    if (locationsMap.length) return locationsMap;
    else return [createElement("div", {}, "None...")];
  };

  handleTypeFilterChange = (value) => {
    if (value === "None") value = null;
    this.filter = value;
    this.offset = 0;
    this.render();
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creatingLocation) {
      return this.renderCreatingLocation();
    }

    // append
    this.domComponent.append(
      createElement(
        "div",
        {
          style:
            "display: flex; justify-content: space-between; align-items: flex-end;",
        },
        [
          createElement(
            "div",
            { style: "display: flex; flex-direction: column;" },
            [
              createElement("small", {}, "Filter by type"),
              locationTypeSelect(this.handleTypeFilterChange, this.filter),
            ]
          ),
          createElement(
            "div",
            { style: "display: flex; flex-direction: column;" },
            [
              createElement(
                "button",
                { style: "align-self: flex-end; margin-bottom: 10px;" },
                "+ Location",
                {
                  type: "click",
                  event: this.toggleCreatingLocation,
                }
              ),
              createElement(
                "input",
                { placeholder: "Search Locations", value: this.searchTerm },
                null,
                {
                  type: "change",
                  event: (e) => {
                    this.offset = 0;
                    (this.searchTerm = e.target.value), this.render();
                  },
                }
              ),
            ]
          ),
        ]
      ),
      createElement("h1", { style: "align-self: center;" }, "Locations"),
      createElement("br"),
      ...(await this.renderLocationsElems()),
      createElement("a", { style: "align-self: center;" }, "More", {
        type: "click",
        event: async (e) => {
          this.offset += state.config.queryOffset;
          e.target.before(...(await this.renderLocationsElems()));
        },
      })
    );
  };
}
