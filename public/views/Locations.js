import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import Location from "../components/Location.js";
import locationTypeSelect from "../lib/locationTypeSelect.js";
import { uploadImage } from "../lib/imageUtils.js";
import { getThings } from "../lib/apiUtils.js";

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
    this.savingData = false;

    this.render();
  }

  resetFilters = () => {
    this.searchTerm = "";
    this.filter = null;
    this.offset = 0;
  };

  toggleCreatingLocation = () => {
    this.resetFilters();
    this.creatingLocation = !this.creatingLocation;
    this.render();
  };

  toggleSavingData = () => {
    this.savingData = true;
    this.render();
  };

  getLocations = async () => {
    let url = `/api/get_locations/${state.currentProject.id}/${this.limit}/${this.offset}`;
    if (
      !this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `/api/get_locations_keyword/${state.currentProject.id}/${this.limit}/${this.offset}/${this.searchTerm}`;
    if (
      this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `/api/get_locations_filter_keyword/${state.currentProject.id}/${this.limit}/${this.offset}/${this.filter}/${this.searchTerm}`;
    if (this.filter && (this.searchTerm === "" || this.searchTerm === " "))
      url = `/api/get_locations_filter/${state.currentProject.id}/${this.limit}/${this.offset}/${this.filter}`;

    return await getThings(url);
  };

  newLocation = async (e) => {
    e.preventDefault();
    this.toggleSavingData();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    const projectId = state.currentProject.id;
    formProps.project_id = projectId;
    formProps.is_sub = false;
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      const newImageRef = await uploadImage(formProps.image);
      // if success update formProps and set imageRef for UI
      if (newImageRef) {
        formProps.image_ref = newImageRef;
      }
      delete formProps.image;
    }

    try {
      const res = await fetch(`${window.location.origin}/api/add_location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formProps),
      });
      await res.json();
      if (res.status === 201) {
      } else throw new Error();
    } catch (err) {
      // window.alert("Failed to create new location...");
      console.log(err);
    }

    this.creatingLocation = false;
    this.toggleSavingData();
  };

  renderCreatingLocation = async () => {
    if (this.savingData) {
      return this.domComponent.append(
        createElement("h2", {}, "Please wait while we process your data...")
      );
    }

    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new location"
    );
    const form = createElement("form", {}, [
      createElement("div", {}, "Type Select (Optional)"),
      locationTypeSelect(null, null),
      createElement("br"),
      createElement("label", { for: "title" }, "Title"),
      createElement("input", {
        id: "title",
        name: "title",
        placeholder: "Location Title",
        required: true,
      }),
      createElement("br"),
      createElement("label", { for: "description" }, "Description"),
      createElement("textarea", {
        id: "description",
        name: "description",
      }),
      createElement("br"),
      createElement(
        "label",
        { for: "image", class: "file-input" },
        "Upload Image"
      ),
      createElement("input", {
        id: "image",
        name: "image",
        type: "file",
        accept: "image/*",
      }),
      createElement("br"),
      createElement("br"),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", async (e) => {
      await this.newLocation(e);
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
        imageRef: location.image_ref,
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

  renderAddButtonOrNull = () => {
    if (state.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else
      return createElement("button", { class: "new-btn" }, "+ Location", {
        type: "click",
        event: this.toggleCreatingLocation,
      });
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
          class: "view-options-container",
        },
        [
          this.renderAddButtonOrNull(),
          createElement("div", { class: "view-filter-options-container" }, [
            createElement(
              "div",
              { style: "display: flex; flex-direction: column;" },
              [
                createElement("small", {}, "Filter by type"),
                locationTypeSelect(this.handleTypeFilterChange, this.filter),
              ]
            ),
            createElement("br"),
            createElement(
              "input",
              { placeholder: "Search Locations", value: this.searchTerm },
              null,
              {
                type: "change",
                event: (e) => {
                  this.offset = 0;
                  (this.searchTerm = e.target.value.toLowerCase()),
                    this.render();
                },
              }
            ),
          ]),
        ]
      ),
      createElement("hr"),
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
