import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import loreTypeSelect from "../lib/loreTypeSelect.js";
import { postThing } from "../lib/apiUtils.js";
import NoteManager from "./NoteManager.js";
import {
  uploadImage,
} from "../lib/imageUtils.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import { renderImageLarge } from "../lib/imageRenderUtils.js";
import CurrentLocationComponent from "../lib/CurrentLocationComponent.js";
import CurrentCharacterComponent from "../lib/CurrentCharacterComponent.js";
import CurrentItemComponent from "../lib/CurrentItemComponent.js";

export default class SingleLoreView {
  constructor(props) {
    this.navigate = props.navigate;
    this.lore = props.params.content;
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

  renderLoreType = () => {
    if (this.lore.type) {
      return createElement(
        "small",
        { style: "color: var(--light-gray); margin-left: 5px;" },
        this.lore.type
      );
    } else return createElement("div", { style: "display: none;" });
  };

  toggleUploadingImage = () => {
    this.uploadingImage = !this.uploadingImage;
    this.render();
  };

  saveLore = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      this.toggleUploadingImage();
      const newImage = await uploadImage(formProps.image, state.currentProject.id, this.lore.image_id);
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
        this.lore.image_id = newImage.id;
      }
      delete formProps.image;
      this.toggleUploadingImage();
    }

    // update UI
    this.lore.title = formProps.title;
    this.lore.description = formProps.description;
    this.lore.type = formProps.type;
    this.toggleEdit();

    await postThing(`/api/edit_lore/${this.lore.id}`, formProps);
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
          loreTypeSelect(null, this.lore.type),
          createElement("br"),
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.lore.title,
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
            this.lore.description
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
            this.saveLore(e);
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

    const currentLocationComponent = createElement("div", {});
    new CurrentLocationComponent({
      domComponent: currentLocationComponent,
      module: this.lore,
      moduleType: "lore",
      navigate: this.navigate,
    });

    const currentCharacterComponent = createElement("div", {});
    new CurrentCharacterComponent({
      domComponent: currentCharacterComponent,
      module: this.lore,
      moduleType: "lore",
      navigate: this.navigate,
    });

    const currentItemComponent = createElement("div", {});
    new CurrentItemComponent({
      domComponent: currentItemComponent,
      module: this.lore,
      moduleType: "lore",
      navigate: this.navigate,
    });

    const noteManagerElem = createElement("div");
    new NoteManager({
      domComponent: noteManagerElem,
      altEndpoint: `/api/get_notes_by_lore/${this.lore.id}`,
      loreId: this.lore.id,
    });

    // append
    this.domComponent.append(
      createElement("div", { class: "single-item-title-container" }, [
        createElement("div", { class: "single-item-title" }, [
          this.lore.title,
          this.renderLoreType(),
        ]),
        createElement("img", {
          src: "/assets/lore.svg",
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
            `"${this.lore.description}"`
          ),
        ]),
        createElement("div", { class: "single-info-box" }, [
          currentLocationComponent,
          createElement("br"),
          currentCharacterComponent,
          createElement("br"),
          currentItemComponent,
          createElement("br"),
        ]),
      ]),
      createElement("br"),
      await renderImageLarge(this.lore.image_id),
      createElement("br"),
      createElement("br"),
      noteManagerElem
    );
  };
}
