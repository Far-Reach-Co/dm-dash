import createElement from "../lib/createElement.js";
import Note from "../components/Note.js";
import state from "../lib/state.js";
import { getThings } from "../lib/apiUtils.js";

export default class NotesView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";
    this.navigate = props.navigate;

    this.searchTerm = "";
    this.limit = state.config.queryLimit;
    this.offset = 0;

    this.creatingNewNote = false;

    this.render();
  }

  resetFilters = () => {
    this.searchTerm = "";
    this.offset = 0;
  };

  toggleCreatingNote = () => {
    this.resetFilters();
    this.creatingNewNote = !this.creatingNewNote;
    this.render();
  };

  newNote = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.user_id = state.user.id;
    formProps.project_id = state.currentProject.id;
    formProps.location_id = null;
    formProps.character_id = null;

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
      window.alert("Failed to create new note");
      console.log(err);
    }
  };

  renderCreateNewNote = async () => {
    this.domComponent.append(
      createElement("div", { class: "component-title" }, "Create new note"),
      createElement(
        "form",
        {},
        [
          createElement("label", { for: "title" }, "Title"),
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

  renderNoteElems = async () => {
    const projectId = state.currentProject.id;
    const noteData = await getThings(
      `/api/get_notes/${projectId}/${this.limit}/${this.offset}/${this.searchTerm}`
    );
    if (noteData) state.notes = noteData;

    const noteMap = noteData.map((note) => {
      // create element
      const elem = createElement("div", {
        id: `note-component-${note.id}`,
        class: "component",
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

    if (noteMap.length) return noteMap;
    else return [createElement("div", {}, "None...")];
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creatingNewNote) {
      return this.renderCreateNewNote();
    }

    // append
    this.domComponent.append(
      createElement("div", { class: "view-options-container" }, [
        createElement("button", { class: "new-btn" }, "+ Note", {
          type: "click",
          event: this.toggleCreatingNote,
        }),
        createElement(
          "input",
          {
            placeholder: "Search Notes",
            value: this.searchTerm,
          },
          null,
          {
            type: "change",
            event: (e) => {
              this.offset = 0;
              this.searchTerm = e.target.value.toLowerCase();
              this.render();
            },
          }
        ),
      ]),
      createElement("hr"),
      ...(await this.renderNoteElems()),
      createElement("a", { style: "align-self: center;" }, "More", {
        type: "click",
        event: async (e) => {
          this.offset += state.config.queryOffset;
          e.target.before(...(await this.renderNoteElems()));
        },
      })
    );
  };
}
