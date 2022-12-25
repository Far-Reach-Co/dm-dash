import createElement from "../lib/createElement.js";
import Note from "../components/Note.js";
import state from "../lib/state.js";
import locationSelect from "../lib/locationSelect.js";

export default class NotesView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.creatingNewNote = false;

    this.render();
  }

  toggleCreatingNote = () => {
    this.creatingNewNote = !this.creatingNewNote;
    this.render();
  };

  getNotes = async () => {
    const projectId = state.currentProject;

    try {
      const res = await fetch(
        `${window.location.origin}/api/get_notes/${projectId}`
      );
      const data = await res.json();
      if (res.status === 200) {
        state.notes = data;
        return data;
      } else throw new Error();
    } catch (err) {
      console.log(err);
    }
  };

  newNote = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if(formProps.location_id === "0") delete formProps.location_id;
    const projectId = state.currentProject;
    formProps.project_id = projectId;

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
      createElement("div", { class: "component-title" }, "Create new note"),
      createElement(
        "form",
        {},
        [
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            placeholder: "Note Title",
            required: true,
          }),
          createElement("label", { for: "description" }, "Description"),
          createElement("textarea", {
            id: "description",
            name: "description",
            required: true,
            cols: "30",
            rows: "7"
          }),
          createElement("br"),
          createElement("label", { for: "location_id" }, "Location Select (Optional)"),
          await locationSelect(null),
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
    const noteData = await this.getNotes();

    return noteData.map((note) => {
      // create element
      const elem = createElement("div", {
        id: `note-component-${note.id}`,
        class: "component"
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
      });

      return elem;
    });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creatingNewNote) {
      return this.renderCreateNewNote();
    }

    // append
    this.domComponent.append(
      createElement("button", { style: "align-self: flex-end;" }, "+ Note", {
        type: "click",
        event: this.toggleCreatingNote,
      }),
      createElement("h1", {style: "align-self: center;"}, "Notes"),
      createElement("br"),
      ...(await this.renderNoteElems())
    );
  };
}
