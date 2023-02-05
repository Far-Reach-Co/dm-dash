import { deleteThing, postThing } from "../lib/apiUtils.js";
import createElement from "../lib/createElement.js";
import { renderImageSmallOrPlaceholder } from "../lib/imageRenderUtils.js";
import { getPresignedForImageDownload, uploadImage } from "../lib/imageUtils.js";
import loreTypeSelect from "../lib/loreTypeSelect.js";
import listItemTitle from "../lib/listItemTitle.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import state from "../lib/state.js";

export default class Lore {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.lore = props.lore;
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.title = props.title;
    this.projectId = props.projectId;
    this.locationId = props.locationId;
    this.characterId = props.characterId;
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

  saveLore = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      this.toggleUploadingImage();
      const newImage = await uploadImage(formProps.image, state.currentProject.id, this.imageId);
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
        this.imageId = newImage.id;
        this.lore.image_id = newImage.id;
      }
      delete formProps.image;
      this.toggleUploadingImage();
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
          loreTypeSelect(null, this.type),
          createElement("br"),
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.title,
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
            this.description
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
      ),
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
      return createElement("a", { class: "small-clickable" }, this.type, {
        type: "click",
        event: () => {
          if (this.handleTypeFilterChange) {
            this.handleTypeFilterChange(this.type);
          }
        },
      });
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

    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        await listItemTitle(this.title, this.toggleEdit),
        this.renderLoreType(),
        await renderImageSmallOrPlaceholder(this.imageId, "/assets/lore.svg"),
      ]),
      createElement("div", { class: "description" }, this.description),
      createElement("br"),
      createElement("button", {}, "Open", {
        type: "click",
        event: () =>
          this.navigate({
            title: "single-lore",
            sidebar: true,
            params: { content: this.lore },
          }),
      })
    );
  };
}
