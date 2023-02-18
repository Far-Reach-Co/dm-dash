import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import locationSelect from "../lib/locationSelect.js";
import locationTypeSelect from "../lib/locationTypeSelect.js";
import { uploadImage } from "../lib/imageUtils.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import NoteManager from "./NoteManager.js";
import { renderImageLarge } from "../lib/imageRenderUtils.js";
import renderLoreList from "../lib/renderLoreList.js";

export default class SingleLocationView {
  constructor(props) {
    this.navigate = props.navigate;
    this.location = props.params.content;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.creatingSubLocation = false;
    this.addParentLocation = false;
    this.edit = false;
    this.uploadingImage = false;
    this.parentLocationLoading = false;
    this.subLocationLoading = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  toggleParentLocationLoading = () => {
    this.parentLocationLoading = !this.parentLocationLoading;
    this.render();
  };

  toggleSubLocationLoading = () => {
    this.subLocationLoading = !this.subLocationLoading;
    this.render();
  };

  toggleCreatingSubLocation = () => {
    this.creatingSubLocation = !this.creatingSubLocation;
    this.render();
  };

  toggleAddParentLocation = () => {
    this.addParentLocation = !this.addParentLocation;
    this.render();
  };

  toggleUploadingImage = () => {
    this.uploadingImage = !this.uploadingImage;
    this.render();
  };

  saveLocationForParent = async (e) => {
    this.toggleParentLocationLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    //transform to parent location id
    formProps.parent_location_id = formProps.location_id;
    if (formProps.parent_location_id == 0) delete formProps.parent_location_id;
    delete formProps.location_id;

    if (formProps.parent_location_id) {
      formProps.is_sub = true;
      // Update UI
      this.location.parent_location_id = formProps.parent_location_id;
      this.location.is_sub = true;

      await postThing(`/api/edit_location/${this.location.id}`, formProps);
    }

    this.toggleParentLocationLoading();
  };

  renderAddParentLocation = async () => {
    this.domComponent.append(
      createElement(
        "div",
        { class: "component-title" },
        `Select parent-location for ${this.location.title}`
      ),
      createElement("br"),
      createElement(
        "form",
        {},
        [
          await locationSelect(null, this.location),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: async (e) => {
            e.preventDefault();
            this.addParentLocation = false;
            await this.saveLocationForParent(e);
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Cancel", {
        type: "click",
        event: this.toggleAddParentLocation,
      })
    );
  };

  newSubLocation = async (e) => {
    this.toggleSubLocationLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    const projectId = state.currentProject.id;
    formProps.project_id = projectId;
    formProps.is_sub = true;
    formProps.parent_location_id = this.location.id;
    if (formProps.type === "None") formProps.type = null;

    await postThing("/api/add_location", formProps);
    this.toggleSubLocationLoading();
  };

  renderCreateSubLocation = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      `Create new sub-location for ${this.location.title}`
    );
    const form = createElement(
      "form",
      {},
      [
        createElement("div", {}, "Type Select (Optional)"),
        locationTypeSelect(null, null),
        createElement("br"),
        createElement("label", { for: "title" }, "Title"),
        createElement("br"),
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
        createElement("button", { type: "submit" }, "Create"),
      ],
      {
        type: "submit",
        event: async (e) => {
          e.preventDefault();
          this.creatingSubLocation = false;
          await this.newSubLocation(e);
        },
      }
    );

    const cancelButton = createElement(
      "button",
      { class: "btn-red" },
      "Cancel"
    );
    cancelButton.addEventListener("click", () => {
      this.toggleCreatingSubLocation();
    });

    this.domComponent.append(
      titleOfForm,
      form,
      createElement("br"),
      cancelButton
    );
  };

  renderSubLocations = async () => {
    let subLocations = await getThings(
      `/api/get_sublocations/${this.location.id}`
    );
    if (!subLocations) subLocations = [];

    const subLocationsMap = subLocations.map((location) => {
      const elem = createElement(
        "a",
        {
          class: "small-clickable",
          style: "margin: 3px",
        },
        location.title,
        {
          type: "click",
          event: () => {
            this.navigate({
              title: "single-location",
              sidebar: true,
              params: { content: location },
            });
          },
        }
      );
      return elem;
    });

    if (subLocationsMap.length) return subLocationsMap;
    else return [createElement("small", {}, "None...")];
  };

  renderCharacters = async () => {
    let charactersByLocation = await getThings(
      `/api/get_characters_by_location/${this.location.id}`
    );
    if (!charactersByLocation) charactersByLocation = [];

    const elemMap = charactersByLocation.map((character) => {
      const elem = createElement(
        "a",
        {
          class: "small-clickable",
          style: "margin: 3px",
        },
        character.title,
        {
          type: "click",
          event: () =>
            this.navigate({
              title: "single-character",
              sidebar: true,
              params: { content: character },
            }),
        }
      );

      return elem;
    });

    if (elemMap.length) return elemMap;
    else return [createElement("small", {}, "None...")];
  };

  renderItems = async () => {
    let itemsByLocation = await getThings(
      `/api/get_items_by_location/${this.location.id}`
    );
    if (!itemsByLocation) itemsByLocation = [];

    const elemMap = itemsByLocation.map((item) => {
      const elem = createElement(
        "a",
        {
          class: "small-clickable",
          style: "margin: 3px",
        },
        item.title,
        {
          type: "click",
          event: () =>
            this.navigate({
              title: "single-item",
              sidebar: true,
              params: { content: item },
            }),
        }
      );

      return elem;
    });

    if (elemMap.length) return elemMap;
    else return [createElement("small", {}, "None...")];
  };

  renderParentLocation = async () => {
    let parentLocation = null;
    if (this.location.parent_location_id) {
      parentLocation = await getThings(
        `/api/get_location/${this.location.parent_location_id}`
      );
    }

    if (parentLocation) {
      return createElement(
        "a",
        { class: "small-clickable", style: "margin: 3px" },
        parentLocation.title,
        {
          type: "click",
          event: () =>
            this.navigate({
              title: "single-location",
              sidebar: true,
              params: { content: parentLocation },
            }),
        }
      );
    } else {
      if (state.currentProject.isEditor === false) {
        return createElement("small", {}, "None...");
      }
      return createElement("button", {}, "+ Parent-Location", {
        type: "click",
        event: this.toggleAddParentLocation,
      });
    }
  };

  renderLocationType = () => {
    if (this.location.type) {
      return createElement(
        "small",
        { style: "color: var(--light-gray); margin-left: 5px;" },
        this.location.type
      );
    } else return createElement("div", { style: "display: none;" });
  };

  renderSubLocationsPlusButtonOrNull = () => {
    if (state.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else {
      return createElement("a", { style: "align-self: flex-end;" }, "+", {
        type: "click",
        event: this.toggleCreatingSubLocation,
      });
    }
  };

  saveLocation = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      this.toggleUploadingImage();
      const newImage = await uploadImage(
        formProps.image,
        state.currentProject.id,
        this.location.image_id
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
        this.location.image_id = newImage.id;
      }
      delete formProps.image;
      this.toggleUploadingImage();
    }

    // update UI
    this.location.title = formProps.title;
    this.location.description = formProps.description;
    this.location.type = formProps.type;
    this.toggleEdit();

    // send data to update in db
    await postThing(`/api/edit_location/${this.location.id}`, formProps);
  };

  renderEdit = async () => {
    if (this.uploadingImage) {
      return this.domComponent.append(
        renderLoadingWithMessage("Uploading your image...")
      );
    }

    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("div", {}, "Type Select (Optional)"),
          locationTypeSelect(null, this.location.type),
          createElement("br"),
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.location.title,
          }),
          createElement("br"),
          createElement("label", { for: "description" }, "Description"),
          createElement(
            "textarea",
            {
              id: "description",
              name: "description",
              cols: "30",
              rows: "7",
            },
            this.location.description
          ),
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
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: (e) => {
            e.preventDefault();
            this.saveLocation(e);
          },
        }
      )
    );
  };

  renderEditButtonOrNull = () => {
    if (state.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else {
      return createElement(
        "a",
        { class: "small-clickable", style: "margin-left: 3px;" },
        "Edit",
        {
          type: "click",
          event: this.toggleEdit,
        }
      );
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    if (this.parentLocationLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage(
          "Please wait while we update your location data..."
        )
      );
    }

    if (this.subLocationLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage(
          "Please wait while we create your new location..."
        )
      );
    }

    if (this.creatingSubLocation) {
      return await this.renderCreateSubLocation();
    }

    if (this.addParentLocation) {
      return await this.renderAddParentLocation();
    }

    const noteManagerElem = createElement("div");
    new NoteManager({
      domComponent: noteManagerElem,
      altEndpoint: `/api/get_notes_by_location/${this.location.id}`,
      locationId: this.location.id,
    });

    // append
    this.domComponent.append(
      createElement("div", { class: "single-item-title-container" }, [
        createElement("div", { class: "single-item-title" }, [
          this.location.title,
          this.renderLocationType(),
        ]),
        createElement("img", {
          src: "/assets/location.svg",
          width: 45,
          height: 45,
        }),
      ]),
      this.renderEditButtonOrNull(),
      createElement("br"),
      createElement("div", { class: "single-item-main-section" }, [
        createElement("div", {}, [
          createElement(
            "div",
            { class: "single-item-subheading" },
            "Description"
          ),
          createElement("div", { class: "description" }, [
            `"${this.location.description}"`,
          ]),
        ]),
        createElement("div", { class: "single-info-box" }, [
          createElement(
            "div",
            { class: "single-info-box-subheading" },
            "Characters"
          ),
          ...(await this.renderCharacters()),
          createElement("br"),
          createElement(
            "div",
            { class: "single-info-box-subheading" },
            "Items"
          ),
          ...(await this.renderItems()),
          createElement("br"),
          createElement("div", { class: "single-info-box-subheading" }, "Lore"),
          ...(await renderLoreList("location", this.location.id)),
          createElement("br"),
          createElement(
            "div",
            { class: "single-info-box-subheading" },
            "Parent Location"
          ),
          await this.renderParentLocation(),
          createElement("br"),
          createElement("div", { class: "single-info-box-subheading" }, [
            "Sub-Locations",
            this.renderSubLocationsPlusButtonOrNull(),
          ]),
          ...(await this.renderSubLocations()),
          createElement("br"),
        ]),
      ]),
      createElement("br"),
      await renderImageLarge(this.location.image_id),
      createElement("br"),
      createElement("br"),
      noteManagerElem
    );
  };
}
