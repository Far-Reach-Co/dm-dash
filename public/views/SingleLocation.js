import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import Location from "../components/Location.js";
import Note from "../components/Note.js";
import locationSelect from "../lib/locationSelect.js";
import locationTypeSelect from "../lib/locationTypeSelect.js";

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

    this.render();
  }

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

  getParentLocation = async () => {
    if (!this.location.parent_location_id) return null;
    try {
      const res = await fetch(
        `${window.location.origin}/api/get_location/${this.location.parent_location_id}`
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

  getChildLocations = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/get_sublocations/${this.location.id}`
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

  renderChildLocations = async () => {
    const childLocations = await this.getChildLocations();

    return childLocations.map((location) => {
      const elem = createElement("div", {
        id: `location-component-${location.id}`,
        class: "component",
      });

      new Location({
        domComponent: elem,
        location,
        navigate: this.navigate,
        parentRender: this.render,
      });
      return elem;
    });
  };

  saveLocation = async (e) => {
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
          headers: { "Content-Type": "application/json" },
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
            await this.saveLocation(e);
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
    const projectId = state.currentProject;
    formProps.project_id = projectId;
    formProps.is_sub = true;
    formProps.parent_location_id = this.location.id;
    if (formProps.type === "None") formProps.type = null;

    try {
      const res = await fetch(`${window.location.origin}/api/add_location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      createElement("div", {}, "Type Select (Optional)"),
      locationTypeSelect(null, null),
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
    formProps.project_id = state.currentProject;
    formProps.location_id = this.location.id;
    formProps.character_id = null;

    try {
      const res = await fetch(`${window.location.origin}/api/add_note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        `${window.location.origin}/api/get_notes_by_location/${this.location.id}`
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
        navigate: this.navigate,
      });

      return elem;
    });
  };

  renderParentLocation = async () => {
    const parentLocation = await this.getParentLocation();
    if (parentLocation) {
      return createElement("div", {}, [
        createElement("small", {}, "Sub-Location of: "),
        createElement("a", { class: "small-clickable" }, parentLocation.title, {
          type: "click",
          event: () =>
            this.navigate({
              title: "single-location",
              sidebar: true,
              params: { location: parentLocation },
            }),
        }),
      ]);
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
        { style: "color: var(--light-gray);" },
        this.location.type
      );
    } else return createElement("div", { style: "display: none;" });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

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
      createElement("div", { class: "single-item-title" }, [
        this.location.title,
        await this.renderParentLocation(),
        createElement("img", {
          src: "../assets/location.svg",
          width: 45,
          height: 45,
        }),
      ]),
      this.renderLocationType(),
      createElement("br"),
      createElement("div", {}, [
        createElement("div", { class: "single-item-subheading" }, "Description:"),
        createElement(
          "div",
          { class: "description" },
          `"${this.location.description}"`
        ),
      ]),
      createElement("br"),
      createElement("div", { class: "single-item-subheading" }, [
        "Notes:",
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
    // render sub locations
    this.domComponent.append(
      createElement("div", { class: "single-item-subheading" }, [
        "Sub-Locations:",
        createElement(
          "button",
          { style: "align-self: flex-end;" },
          "+ Sub-Location",
          {
            type: "click",
            event: this.toggleCreatingSubLocation,
          }
        ),
      ]),
      ...(await this.renderChildLocations())
    );
  };
}
