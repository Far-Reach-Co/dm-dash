import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import Note from "../components/Note.js";
import locationSelect from "../lib/locationSelect.js";
import characterTypeSelect from "../lib/characterTypeSelect.js";
import { getThings } from "../lib/apiUtils.js";

export default class SingleCharacterView {
  constructor(props) {
    this.navigate = props.navigate;
    this.character = props.params.content;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.creatingNote = false;
    this.edit = false;

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

  newNote = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.user_id = state.user.id;
    formProps.project_id = state.currentProject.id;

    formProps.character_id = this.character.id;
    formProps.location_id = null;
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
        `Create new note for ${this.character.title}`
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

  renderCharacterNotes = async () => {
    let notesByCharacter = await getThings(
      `/api/get_notes_by_character/${this.character.id}`
    );
    if (!notesByCharacter) notesByCharacter = [];
    return notesByCharacter.map((note) => {
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

  renderCharacterType = () => {
    if (this.character.type) {
      return createElement(
        "small",
        { style: "color: var(--light-gray); margin-left: 5px;" },
        this.character.type
      );
    } else return createElement("div", { style: "display: none;" });
  };

  renderItems = async () => {
    let itemsByCharacter = await getThings(
      `/api/get_items_by_character/${this.character.id}`
    );
    if (!itemsByCharacter) itemsByCharacter = [];

    const elemMap = itemsByCharacter.map((item) => {
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
    else
      return [
        createElement("small", { style: "margin-left: 5px;" }, "None..."),
      ];
  };

  saveCharacter = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if (formProps.type === "None") formProps.type = null;
    // update UI
    this.character.title = formProps.title;
    this.character.description = formProps.description;
    this.character.type = formProps.type;

    try {
      const res = await fetch(
        `${window.location.origin}/api/edit_character/${this.character.id}`,
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
      // window.alert("Failed to save character...");
      console.log(err);
    }
  };

  renderEdit = async () => {
    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("div", {}, "Type Select (Optional)"),
          characterTypeSelect(null, this.character.type),
          createElement("br"),
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.character.title,
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
            this.character.description
          ),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: (e) => {
            this.saveCharacter(e);
            this.toggleEdit();
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

    if (this.creatingNote) {
      return this.renderCreateNewNote();
    }

    const currentLocationComponent = createElement("div", {});
    new CurrentLocationComponent({
      domComponent: currentLocationComponent,
      character: this.character,
      navigate: this.navigate,
    });

    // append
    this.domComponent.append(
      createElement("div", { class: "single-item-title-container" }, [
        createElement("div", { class: "single-item-title" }, [
          this.character.title,
          this.renderCharacterType(),
        ]),
        createElement("img", {
          src: "/assets/character.svg",
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
            `"${this.character.description}"`
          ),
        ]),
        createElement("div", { class: "single-info-box" }, [
          currentLocationComponent,
          createElement("br"),
          createElement(
            "div",
            { class: "single-info-box-subheading" },
            "Items"
          ),
          ...(await this.renderItems()),
          createElement("br"),
        ]),
      ]),
      createElement("br"),
      createElement("br"),
      createElement("div", { class: "single-item-subheading" }, [
        "Notes:",
        createElement("button", {}, "+ Note", {
          type: "click",
          event: () => {
            this.toggleCreatingNote();
          },
        }),
      ]),
      createElement("div", { class: "sub-view" }, [
        ...(await this.renderCharacterNotes()),
      ]),
      createElement("br")
    );
  };
}

class CurrentLocationComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "current-location-component";
    this.character = props.character;
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
    fetch(`${window.location.origin}/api/edit_character/${this.character.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        location_id: newLocationId,
      }),
    });
  };

  renderCurrentLocation = async () => {
    let location = null;
    if (this.character.location_id) {
      location = await getThings(
        `/api/get_location/${this.character.location_id}`
      );
    }

    if (this.editingCurrentLocation) {
      return createElement(
        "div",
        { style: "display: flex; flex-direction: column;" },
        await locationSelect(
          this.character.location_id,
          null,
          (newLocationId) => {
            this.character.location_id = newLocationId;
            this.toggleEditingCurrentLocation();
            this.updateCurrentLocation(newLocationId);
          }
        )
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
