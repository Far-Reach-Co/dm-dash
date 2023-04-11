import { deleteThing, postThing } from "../lib/apiUtils.js";
import createElement from "../lib/createElement.js";
import { renderImageSmallOrPlaceholder } from "../lib/imageRenderUtils.js";
import {
  getPresignedForImageDownload,
  uploadImage,
} from "../lib/imageUtils.js";
import loreTypeSelect from "../lib/loreTypeSelect.js";
import listItemTitle from "../lib/listItemTitle.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import state from "../lib/state.js";
import RichText from "../lib/RichText.js";

export default class Lore {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.lore = props.lore;
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.title = props.title;
    this.projectId = props.projectId;
    this.type = props.type;
    this.imageId = props.imageId;

    this.navigate = props.navigate;
    this.parentRender = props.parentRender;
    this.handleTypeFilterChange = props.handleTypeFilterChange
      ? props.handleTypeFilterChange
      : null;

    this.edit = false;
    this.uploadingImage = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  toggleUploadingImage = () => {
    this.uploadingImage = !this.uploadingImage;
    this.render();
  };

  saveLore = async (e, description) => {
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
        this.imageId
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
        this.imageId = newImage.id;
        this.lore.image_id = newImage.id;
      }
      delete formProps.image;
      this.uploadingImage = false;
    }

    // update UI
    this.title = formProps.title;
    this.lore.title = formProps.title;
    this.description = formProps.description;
    this.lore.description = formProps.description;
    this.type = formProps.type;
    this.lore.type = formProps.type;
    this.toggleEdit();

    await postThing(`/api/edit_lore/${this.id}`, formProps);
  };

  renderRemoveImage = async () => {
    if (this.imageId) {
      const imageSource = await getPresignedForImageDownload(this.imageId);

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
                  postThing(`/api/edit_lore/${this.id}`, {
                    image_id: null,
                  });
                  deleteThing(
                    `/api/remove_image/${state.currentProject.id}/${this.imageId}`
                  );
                  e.target.parentElement.remove();
                  this.imageId = null;
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
      value: this.description,
    });

    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("div", {}, "Type Select (Optional)"),
          loreTypeSelect(null, this.type),
          createElement("br"),
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.title,
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
            this.saveLore(e, richText.children[1].innerHTML);
          },
        }
      ),
      createElement("hr"),
      createElement("button", { class: "btn-red" }, "Cancel", {
        type: "click",
        event: this.toggleEdit,
      }),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Remove Lore", {
        type: "click",
        event: () => {
          if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
            deleteThing(`/api/remove_lore/${this.id}`);
            this.toggleEdit();
            this.domComponent.remove();
          }
        },
      })
    );
  };

  renderLoreType = () => {
    if (this.type) {
      return createElement(
        "a",
        { class: "small-clickable", title: "Set filter to this type" },
        this.type,
        {
          type: "click",
          event: () => {
            if (this.handleTypeFilterChange) {
              this.handleTypeFilterChange(this.type);
            }
          },
        }
      );
    } else return createElement("div", { style: "display: none;" });
  };

  renderImage = async () => {
    if (this.imageId) {
      const imageSource = await getPresignedForImageDownload(this.imageId);
      if (imageSource) {
        return createElement("img", {
          src: imageSource.url,
          width: 30,
          height: 30,
        });
      } else {
        return createElement("img", {
          src: "/assets/lore.svg",
          width: 30,
          height: 30,
        });
      }
    } else {
      return createElement("img", {
        src: "/assets/lore.svg",
        width: 30,
        height: 30,
      });
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    const descriptionComponent = createElement("div", { class: "description" });
    descriptionComponent.innerHTML = this.description;

    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        await listItemTitle(this.title, this.toggleEdit),
        this.renderLoreType(),
        await renderImageSmallOrPlaceholder(this.imageId, "/assets/lore.svg"),
      ]),
      descriptionComponent,
      createElement("br"),
      createElement("button", { title: "Open detail view" }, "Open", {
        type: "click",
        event: () =>
          this.navigate({
            title: "single-lore",
            id: this.id,
            sidebar: true,
            params: { content: this.lore },
          }),
      })
    );
  };
}
