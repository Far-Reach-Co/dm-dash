import createElement from "../lib/createElement.js";
import {
  getPresignedForImageDownload,
  uploadImage,
} from "../lib/imageUtils.js";
import locationTypeSelect from "../lib/locationTypeSelect.js";
import listItemTitle from "../lib/listItemTitle.js";
import state from "../lib/state.js";

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
    this.imageRef = props.imageRef;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  toggleUploadingImage = () => {
    this.uploadingImage = true;
    this.render();
  };

  removeLocation = async () => {
    const res = await fetch(`${window.origin}/api/remove_location/${this.id}`, {
      method: "DELETE",
      headers: { "x-access-token": `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.status === 204) {
      // window.alert(`Deleted ${this.title}`)
    } else {
      // window.alert("Failed to delete location...");
    }
  };

  saveLocation = async (e) => {
    e.preventDefault();
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
        this.imageRef = newImageRef;
        this.location.image_ref = newImageRef;
      }
      delete formProps.image;
      this.toggleUploadingImage();
    }

    // update UI
    this.title = formProps.title;
    this.location.title = formProps.title;
    this.description = formProps.description;
    this.location.description = formProps.description;
    this.type = formProps.type;
    this.location.type = formProps.type;
    this.toggleEdit();

    // send data to update in db
    try {
      const res = await fetch(`${window.origin}/api/edit_location/${this.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formProps),
      });
      await res.json();
      if (res.status === 200) {
      } else throw new Error();
    } catch (err) {
      // window.alert("Failed to save location...");
      console.log(err);
    }
  };

  renderEdit = async () => {
    if (this.uploadingImage) {
      return this.domComponent.append(
        createElement("h2", {}, "Please wait while we process your data...")
      );
    }

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
            this.saveLocation(e);
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
    if (this.imageRef) {
      const imageSource = await getPresignedForImageDownload(this.imageRef);
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

    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        await listItemTitle(this.title, this.toggleEdit),
        this.renderLocationType(),
        await this.renderImage(),
      ]),
      createElement("div", { class: "description" }, this.description),
      createElement("br"),
      createElement("button", {}, "Open", {
        type: "click",
        event: () =>
          this.navigate({
            title: "single-location",
            sidebar: true,
            params: { content: this.location },
          }),
      })
    );
  };
}
