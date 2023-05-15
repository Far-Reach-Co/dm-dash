import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import Location from "../components/Location.js";
import locationTypeSelect from "../lib/locationTypeSelect.js";
import { uploadImage } from "../lib/imageUtils.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import searchElement from "../lib/searchElement.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import RichText from "../lib/RichText.js";

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
    this.newLocationLoading = false;

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

  toggleNewLocationLoading = () => {
    this.newLocationLoading = !this.newLocationLoading;
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

  newLocation = async (e, description) => {
    this.toggleNewLocationLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;

    const projectId = state.currentProject.id;
    formProps.project_id = projectId;
    formProps.is_sub = false;
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image && formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      const newImage = await uploadImage(
        formProps.image,
        state.currentProject.id,
        this.imageId
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
      }
      delete formProps.image;
    }

    await postThing("/api/add_location", formProps);
    this.toggleNewLocationLoading();
  };

  renderCreatingLocation = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new location"
    );

    const richText = new RichText({});

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
      richText,
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
      e.preventDefault();
      this.creatingLocation = false;
      await this.newLocation(e, richText.children[1].innerHTML);
    });

    const cancelButton = createElement(
      "button",
      { class: "btn-red" },
      "Cancel"
    );
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
        imageId: location.image_id,
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

  renderAddButtonOrNull = () => {
    if (state.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else
      return createElement(
        "button",
        { class: "new-btn", title: "Create new location" },
        "+ Location",
        {
          type: "click",
          event: this.toggleCreatingLocation,
        }
      );
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creatingLocation) {
      return this.renderCreatingLocation();
    }

    if (this.newLocationLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Please wait while we create your location...")
      );
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
            searchElement("Search Locations", this),
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
