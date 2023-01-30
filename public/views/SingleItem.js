import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import locationSelect from "../lib/locationSelect.js";
import characterSelect from "../lib/characterSelect.js";
import itemTypeSelect from "../lib/itemTypeSelect.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import NoteManager from "./NoteManager.js";
import {
  getPresignedForImageDownload,
  uploadImage,
} from "../lib/imageUtils.js";
import modal from "../components/modal.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";

export default class SingleItemView {
  constructor(props) {
    this.navigate = props.navigate;
    this.item = props.params.content;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.edit = false;
    this.uploadingImage = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  renderItemType = () => {
    if (this.item.type) {
      return createElement(
        "small",
        { style: "color: var(--light-gray); margin-left: 5px;" },
        this.item.type
      );
    } else return createElement("div", { style: "display: none;" });
  };

  toggleUploadingImage = () => {
    this.uploadingImage = true;
    this.render();
  };

  saveItem = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      this.toggleUploadingImage();
      const newImageRef = await uploadImage(formProps.image);
      // if success update formProps and set imageRef for UI
      if (newImageRef) {
        formProps.image_ref = newImageRef;
        this.item.image_ref = newImageRef;
      }
      delete formProps.image;
      this.toggleUploadingImage();
    }

    // update UI
    this.item.title = formProps.title;
    this.item.description = formProps.description;
    this.item.type = formProps.type;
    this.toggleEdit();

    await postThing(`/api/edit_item/${this.item.id}`, formProps);
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
          itemTypeSelect(null, this.item.type),
          createElement("br"),
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.item.title,
          }),
          createElement("label", { for: "description" }, "Description"),
          createElement(
            "textarea",
            {
              id: "description",
              name: "description",
              cols: "30",
              rows: "7",
            },
            this.item.description
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
            this.saveItem(e);
          },
        }
      )
    );
  };

  handleImageClick = (imageSource) => {
    modal.show(
      createElement("img", { src: imageSource.url, class: "modal-image" })
    );
  };

  renderImage = async () => {
    if (this.item.image_ref) {
      const imageSource = await getPresignedForImageDownload(
        this.item.image_ref
      );
      if (imageSource) {
        return createElement(
          "img",
          {
            class: "clickable-image",
            src: imageSource.url,
            width: "50%",
            height: "auto",
          },
          null,
          {
            type: "click",
            event: () => this.handleImageClick(imageSource),
          }
        );
      } else return createElement("div", { style: "visibility: hidden;" });
    } else return createElement("div", { style: "visibility: hidden;" });
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

    const currentLocationComponent = createElement("div", {});
    new CurrentLocationComponent({
      domComponent: currentLocationComponent,
      item: this.item,
      navigate: this.navigate,
    });

    const currentCharacterComponent = createElement("div", {});
    new CurrentCharacterComponent({
      domComponent: currentCharacterComponent,
      item: this.item,
      navigate: this.navigate,
    });

    const noteManagerElem = createElement("div");
    new NoteManager({
      domComponent: noteManagerElem,
      altEndpoint: `/api/get_notes_by_item/${this.item.id}`,
      itemId: this.item.id,
    });

    // append
    this.domComponent.append(
      createElement("div", { class: "single-item-title-container" }, [
        createElement("div", { class: "single-item-title" }, [
          this.item.title,
          this.renderItemType(),
        ]),
        createElement("img", {
          src: "/assets/item.svg",
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
            "Description:"
          ),
          createElement(
            "div",
            { class: "description" },
            `"${this.item.description}"`
          ),
        ]),
        createElement("div", { class: "single-info-box" }, [
          currentLocationComponent,
          createElement("br"),
          currentCharacterComponent,
          createElement("br"),
        ]),
      ]),
      createElement("br"),
      await this.renderImage(),
      createElement("br"),
      createElement("br"),
      noteManagerElem
    );
  };
}

class CurrentLocationComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "current-location-component";
    this.item = props.item;
    this.navigate = props.navigate;

    this.editingCurrentLocation = false;

    this.render();
  }

  toggleEditingCurrentLocation = () => {
    this.editingCurrentLocation = !this.editingCurrentLocation;
    this.render();
  };

  renderEditCurrentLocationButtonOrNull = () => {
    // dont render if user is not an editor
    if (state.currentProject.isEditor === false)
      return createElement("div", { style: "invisibility: hidden;" });

    if (!this.editingCurrentLocation) {
      return createElement(
        "a",
        {
          class: "small-clickable",
          style: "align-self: flex-end;",
        },
        "Edit",
        {
          type: "click",
          event: this.toggleEditingCurrentLocation,
        }
      );
    } else return createElement("div", { style: "invisibility: hidden;" });
  };

  updateCurrentLocation = (newLocationId) => {
    postThing(`/api/edit_item/${this.item.id}`, {
      location_id: newLocationId,
    });
  };

  renderCurrentLocation = async () => {
    let location = null;
    if (this.item.location_id) {
      location = await getThings(`/api/get_location/${this.item.location_id}`);
    }

    if (this.editingCurrentLocation) {
      return createElement(
        "div",
        { style: "display: flex; flex-direction: column;" },
        await locationSelect(this.item.location_id, null, (newLocationId) => {
          this.item.location_id = newLocationId;
          this.toggleEditingCurrentLocation();
          this.updateCurrentLocation(newLocationId);
        })
      );
    }

    if (!location) {
      return createElement("small", {}, "None...");
    } else {
      return createElement(
        "a",
        { class: "small-clickable", style: "margin: 3px;" },
        location.title,
        {
          type: "click",
          event: () =>
            this.navigate({
              title: "single-location",
              sidebar: true,
              params: { content: location },
            }),
        }
      );
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      createElement("div", { class: "single-info-box-subheading" }, [
        "Current Location",
        this.renderEditCurrentLocationButtonOrNull(),
      ]),
      await this.renderCurrentLocation()
    );
  };
}

class CurrentCharacterComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "current-location-component";
    this.item = props.item;
    this.navigate = props.navigate;

    this.editingCurrentCharacter = false;

    this.render();
  }

  toggleEditingCurrentCharacter = () => {
    this.editingCurrentCharacter = !this.editingCurrentCharacter;
    this.render();
  };

  renderEditCurrentCharacterButtonOrNull = () => {
    // dont render if user is not an editor
    if (state.currentProject.isEditor === false)
      return createElement("div", { style: "invisibility: hidden;" });

    if (!this.editingCurrentCharacter) {
      return createElement(
        "a",
        {
          class: "small-clickable",
          style: "align-self: flex-end;",
        },
        "Edit",
        {
          type: "click",
          event: this.toggleEditingCurrentCharacter,
        }
      );
    } else return createElement("div", { style: "invisibility: hidden;" });
  };

  updateCurrentCharacter = (newCharacterId) => {
    postThing(`/api/edit_item/${this.item.id}`, {
      character_id: newCharacterId,
    });
  };

  renderCurrentCharacter = async () => {
    let character = null;
    if (this.item.character_id) {
      character = await getThings(
        `/api/get_character/${this.item.character_id}`
      );
    }

    if (this.editingCurrentCharacter) {
      return createElement(
        "div",
        { style: "display: flex; flex-direction: column;" },
        await characterSelect(this.item.character_id, (newCharacterId) => {
          this.item.character_id = newCharacterId;
          this.toggleEditingCurrentCharacter();
          this.updateCurrentCharacter(newCharacterId);
        })
      );
    }

    if (!character) {
      return createElement("small", {}, "None...");
    } else {
      return createElement(
        "a",
        { class: "small-clickable", style: "margin: 3px;" },
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
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      createElement("div", { class: "single-info-box-subheading" }, [
        "With Character",
        this.renderEditCurrentCharacterButtonOrNull(),
      ]),
      await this.renderCurrentCharacter()
    );
  };
}
