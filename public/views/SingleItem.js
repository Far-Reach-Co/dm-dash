import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import itemTypeSelect from "../lib/itemTypeSelect.js";
import { deleteThing, getThings, postThing } from "../lib/apiUtils.js";
import NoteManager from "./NoteManager.js";
import {
  getPresignedForImageDownload,
  uploadImage,
} from "../lib/imageUtils.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import { renderImageLarge } from "../lib/imageRenderUtils.js";
import CurrentLocationComponent from "../lib/CurrentLocationComponent.js";
import CurrentCharacterComponent from "../lib/CurrentCharacterComponent.js";
import renderLoreList from "../lib/renderLoreList.js";
import RichText from "../lib/RichText.js";

export default class SingleItemView {
  constructor(props) {
    this.navigate = props.navigate;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.edit = false;
    this.uploadingImage = false;

    this.init(props);
  }

  init = async (props) => {
    // set params if not from navigation
    var searchParams = new URLSearchParams(window.location.search);
    var contentId = searchParams.get("id");
    if (props.params && props.params.content) {
      this.item = props.params.content;
    } else this.item = await getThings(`/api/get_item/${contentId}`);

    this.render();
  };

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
    this.uploadingImage = !this.uploadingImage;
    this.render();
  };

  saveItem = async (e, description) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      this.toggleUploadingImage();
      const newImage = await uploadImage(
        formProps.image,
        state.currentProject.id,
        this.item.image_id
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
        this.item.image_id = newImage.id;
      }
      delete formProps.image;
      this.uploadingImage = false;
    }

    // update UI
    this.item.title = formProps.title;
    this.item.description = formProps.description;
    this.item.type = formProps.type;
    this.toggleEdit();

    await postThing(`/api/edit_item/${this.item.id}`, formProps);
  };

  renderRemoveImage = async () => {
    if (this.item.image_id) {
      const imageSource = await getPresignedForImageDownload(
        this.item.image_id
      );

      return createElement(
        "div",
        { style: "display: flex; align-items: baseline;" },
        [
          createElement("img", {
            src: imageSource.url,
            width: 100,
            height: "auto",
          }),
          createElement(
            "div",
            {
              style: "color: var(--red1); cursor: pointer;",
              title: "Remove image",
            },
            "ⓧ",
            {
              type: "click",
              event: (e) => {
                e.preventDefault();
                if (
                  window.confirm("Are you sure you want to delete this image?")
                ) {
                  postThing(`/api/edit_item/${this.item.id}`, {
                    image_id: null,
                  });
                  deleteThing(
                    `/api/remove_image/${state.currentProject.id}/${this.item.image_id}`
                  );
                  e.target.parentElement.remove();
                  this.item.image_id = null;
                }
              },
            }
          ),
        ]
      );
    } else return createElement("div", { style: "visibility: none;" });
  };

  renderEdit = async () => {
    if (this.uploadingImage) {
      return this.domComponent.append(
        renderLoadingWithMessage("Uploading your image...")
      );
    }

    const richText = new RichText({
      value: this.item.description,
    });

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
          richText,
          createElement("br"),
          createElement(
            "label",
            { for: "image", class: "file-input" },
            "Add/Change Image"
          ),
          await this.renderRemoveImage(),
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
            this.saveItem(e, richText.children[1].innerHTML);
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
        {
          class: "small-clickable",
          style: "margin-left: 3px;",
          title: "Open edit utility",
        },
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
      module: this.item,
      moduleType: "item",
      navigate: this.navigate,
    });

    const currentCharacterComponent = createElement("div", {});
    new CurrentCharacterComponent({
      domComponent: currentCharacterComponent,
      module: this.item,
      moduleType: "item",
      navigate: this.navigate,
    });

    const noteManagerElem = createElement("div");
    new NoteManager({
      domComponent: noteManagerElem,
      altEndpoint: `/api/get_notes_by_item/${this.item.id}`,
      itemId: this.item.id,
    });

    const descriptionComponent = createElement("div", { class: "description" });
    descriptionComponent.innerHTML = this.item.description;

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
          descriptionComponent,
        ]),
        createElement("div", { class: "single-info-box" }, [
          currentLocationComponent,
          createElement("br"),
          currentCharacterComponent,
          createElement("br"),
          createElement("div", { class: "single-info-box-subheading" }, "Lore"),
          ...(await renderLoreList("item", this.item.id, this.navigate)),
          createElement("br"),
        ]),
      ]),
      createElement("br"),
      await renderImageLarge(this.item.image_id),
      createElement("br"),
      createElement("br"),
      noteManagerElem
    );
  };
}
