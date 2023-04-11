import createElement from "../lib/createElement.js";
import {
  getPresignedForImageDownload,
  uploadImage,
} from "../lib/imageUtils.js";
import locationTypeSelect from "../lib/locationTypeSelect.js";
import listItemTitle from "../lib/listItemTitle.js";
import state from "../lib/state.js";
import { deleteThing, postThing } from "../lib/apiUtils.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import { renderImageSmallOrPlaceholder } from "../lib/imageRenderUtils.js";
import RichText from "../lib/RichText.js";

export default class Location {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.location = props.location;
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.type = props.type;
    this.isSub = props.isSub;
    this.parentLocationId = props.parentLocationId;
    this.projectId = props.projectId;

    this.navigate = props.navigate;
    this.parentRender = props.parentRender;
    this.handleTypeFilterChange = props.handleTypeFilterChange
      ? props.handleTypeFilterChange
      : null;

    this.edit = false;
    this.uploadingImage = false;
    this.imageId = props.imageId;

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

  removeLocation = async () => {
    await deleteThing(`/api/remove_location/${this.id}`);
  };

  saveLocation = async (e, description) => {
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
        this.location.image_id = newImage.id;
      }
      delete formProps.image;
      this.uploadingImage = false;
    }

    // update UI
    this.title = formProps.title;
    this.location.title = formProps.title;
    this.description = formProps.description;
    this.location.description = formProps.description;
    this.type = formProps.type;
    this.location.type = formProps.type;
    this.toggleEdit();

    await postThing(`/api/edit_location/${this.id}`, formProps);
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
                  postThing(`/api/edit_location/${this.id}`, {
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
          createElement("div", {}, "Type Select"),
          locationTypeSelect(null, this.type),
          createElement("br"),
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.title,
          }),
          createElement("br"),
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
            this.saveLocation(e, richText.children[1].innerHTML);
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Remove Location", {
        type: "click",
        event: () => {
          if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
            this.removeLocation();
            this.toggleEdit();
            this.domComponent.remove();
          }
        },
      })
    );
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
          src: "/assets/location.svg",
          width: 30,
          height: 30,
        });
      }
    } else {
      return createElement("img", {
        src: "/assets/location.svg",
        width: 30,
        height: 30,
      });
    }
  };

  renderLocationType = () => {
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

  renderEditButtonOrNull = () => {
    if (state.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else {
      return createElement("button", {}, "Edit", {
        type: "click",
        event: this.toggleEdit,
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
        this.renderLocationType(),
        await renderImageSmallOrPlaceholder(
          this.imageId,
          "/assets/location.svg"
        ),
      ]),
      descriptionComponent,
      createElement("br"),
      createElement("button", { title: "Open detail view" }, "Open", {
        type: "click",
        event: () =>
          this.navigate({
            title: "single-location",
            id: this.id,
            sidebar: true,
            params: { content: this.location },
          }),
      })
    );
  };
}
