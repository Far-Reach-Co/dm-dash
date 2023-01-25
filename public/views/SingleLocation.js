import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import Note from "../components/Note.js";
import locationSelect from "../lib/locationSelect.js";
import locationTypeSelect from "../components/locationTypeSelect.js";
import {
  getPresignedForImageDownload,
  uploadImage,
} from "../lib/imageUtils.js";
import modal from "../lib/modal.js";

export default class SingleLocationView {
  constructor(props) {
    this.navigate = props.navigate;
    this.params = props.params;
    this.location = this.params.location;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.creatingNote = false;
    this.creatingSubLocation = false;
    this.addParentLocation = false;
    this.edit = false;
    this.uploadingImage = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  toggleCreatingNote = () => {
    this.creatingNote = !this.creatingNote;
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
    this.uploadingImage = true;
    this.render();
  };

  getParentLocation = async () => {
    if (!this.location.parent_location_id) return null;
    try {
      const res = await fetch(
        `${window.location.origin}/api/get_location/${this.location.parent_location_id}`,
        {
          headers: {
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      if (res.status === 200) {
        return data;
      } else throw new Error();
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  getSubLocations = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/get_sublocations/${this.location.id}`,
        {
          headers: {
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      if (res.status === 200) {
        return data;
      } else throw new Error();
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  saveLocationForParent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.parent_location_id = formProps.location_id;
    delete formProps.location_id;
    formProps.is_sub = true;

    try {
      const res = await fetch(
        `${window.location.origin}/api/edit_location/${this.location.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formProps),
        }
      );
      const data = await res.json();
      if (res.status === 200) {
        this.location.parent_location_id = formProps.parent_location_id;
        this.location.is_sub = true;
      } else throw new Error();
    } catch (err) {
      window.alert("Failed to save location...");
      console.log(err);
    }
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
            await this.saveLocationForParent(e);
            this.toggleAddParentLocation();
          },
        }
      ),
      createElement("br"),
      createElement("button", {}, "Cancel", {
        type: "click",
        event: this.toggleAddParentLocation,
      })
    );
  };

  newSubLocation = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    const projectId = state.currentProject.id;
    formProps.project_id = projectId;
    formProps.is_sub = true;
    formProps.parent_location_id = this.location.id;
    if (formProps.type === "None") formProps.type = null;

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
        this.render();
      } else throw new Error();
    } catch (err) {
      window.alert("Failed to create new location...");
      console.log(err);
    }
  };

  renderCreateSubLocation = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      `Create new sub-location for ${this.location.title}`
    );
    const form = createElement("form", {}, [
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
    ]);
    form.addEventListener("submit", async (e) => {
      await this.newSubLocation(e);
      this.toggleCreatingSubLocation();
    });

    const cancelButton = createElement("button", {}, "Cancel");
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

  newNote = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.user_id = state.user.id;
    formProps.project_id = state.currentProject.id;

    formProps.location_id = this.location.id;
    formProps.character_id = null;
    formProps.item_id = null;

    try {
      const res = await fetch(`${window.location.origin}/api/add_note`, {
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
      window.alert("Failed to create new note...");
      console.log(err);
    }
  };

  renderCreateNewNote = async () => {
    this.domComponent.append(
      createElement(
        "div",
        { class: "component-title" },
        `Create new note for ${this.location.title}`
      ),
      createElement(
        "form",
        {},
        [
          createElement("label", { for: "title" }, "Title"),
          createElement("br"),
          createElement("input", {
            id: "title",
            name: "title",
            placeholder: "Title",
            required: true,
          }),
          createElement("label", { for: "description" }, "Description"),
          createElement("textarea", {
            id: "description",
            name: "description",
            required: true,
            cols: "30",
            rows: "7",
          }),
          createElement("br"),
          createElement("button", { type: "submit" }, "Create"),
        ],
        {
          type: "submit",
          event: async (e) => {
            await this.newNote(e);
            this.toggleCreatingNote();
          },
        }
      ),
      createElement("br"),
      createElement("button", {}, "Cancel", {
        type: "click",
        event: this.toggleCreatingNote,
      })
    );
  };

  getNotesByLocation = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/get_notes_by_location/${this.location.id}`,
        {
          headers: {
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      if (res.status === 200) {
        return data;
      } else throw new Error();
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  renderLocationNotes = async () => {
    let notesByLocation = await this.getNotesByLocation();
    return notesByLocation.map((note) => {
      const elem = createElement("div", {
        id: `note-component-${note.id}`,
        class: "sub-view-component",
      });

      new Note({
        domComponent: elem,
        parentRender: this.render,
        id: note.id,
        projectId: note.project_id,
        title: note.title,
        description: note.description,
        dateCreated: note.date_created,
        locationId: note.location_id,
        characterId: note.character_id,
        itemId: note.item_id,
        navigate: this.navigate,
      });

      return elem;
    });
  };

  getCharactersByLocation = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/get_characters_by_location/${this.location.id}`,
        {
          headers: {
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      if (res.status === 200) {
        return data;
      } else throw new Error();
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  renderSubLocations = async () => {
    const subLocations = await this.getSubLocations();

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
              params: { location },
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
    let charactersByLocation = await this.getCharactersByLocation();

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
              params: { character },
            }),
        }
      );

      return elem;
    });

    if (elemMap.length) return elemMap;
    else return [createElement("small", {}, "None...")];
  };

  getItemsByLocation = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/get_items_by_location/${this.location.id}`,
        {
          headers: {
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      if (res.status === 200) {
        return data;
      } else throw new Error();
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  renderItems = async () => {
    let itemsByLocation = await this.getItemsByLocation();

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
              params: { item },
            }),
        }
      );

      return elem;
    });

    if (elemMap.length) return elemMap;
    else return [createElement("small", {}, "None...")];
  };

  renderParentLocation = async () => {
    const parentLocation = await this.getParentLocation();
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
              params: { location: parentLocation },
            }),
        }
      );
    } else {
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
        this.location.image_ref = newImageRef;
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
    try {
      const res = await fetch(
        `${window.origin}/api/edit_location/${this.location.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(formProps),
        }
      );
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
            this.saveLocation(e);
          },
        }
      )
    );
  };

  handleImageClick = (imageSource) => {
    modal.show(createElement("img", {src: imageSource.url, class: "modal-image"}))
  };

  renderImage = async () => {
    if (this.location.image_ref) {
      const imageSource = await getPresignedForImageDownload(
        this.location.image_ref
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

    if (this.creatingNote) {
      return this.renderCreateNewNote();
    }

    if (this.creatingSubLocation) {
      return this.renderCreateSubLocation();
    }

    if (this.addParentLocation) {
      return this.renderAddParentLocation();
    }

    // append
    this.domComponent.append(
      createElement("a", { class: "back-button" }, "← Locations", {
        type: "click",
        event: () => this.navigate({ title: "locations", sidebar: true }),
      }),
      createElement("div", { class: "single-item-title-container" }, [
        createElement("div", { class: "single-item-title" }, [
          this.location.title,
          this.renderLocationType(),
        ]),
        createElement("img", {
          src: "../assets/location.svg",
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
      createElement("br"),
      await this.renderImage(),
      createElement("br"),
      createElement("div", { class: "single-item-subheading" }, [
        "Notes",
        createElement("button", { style: "align-self: flex-end;" }, "+ Note", {
          type: "click",
          event: () => {
            this.toggleCreatingNote();
          },
        }),
      ]),
      createElement("div", { class: "sub-view" }, [
        ...(await this.renderLocationNotes()),
      ]),
      createElement("br")
    );
  };
}
