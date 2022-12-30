import createElement from "../lib/createElement.js";
import Note from "../components/Note.js";
import state from "../lib/state.js";

export default class NotesView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";
    this.navigate = props.navigate;

    this.searchTerm = "";

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
    formProps.project_id = state.currentProject;
    formProps.location_id = null;
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
            rows: "7"
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
    let noteData = await this.getNotes();
    // filter by search
    if (this.searchTerm !== "") {
      noteData = noteData.filter((note) => {
        return note.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      });
    }

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
        characterId: note.character_id,
        itemId: note.item_id,
        navigate: this.navigate,
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
      createElement("div", {style: "display: flex; flex-direction: column;"}, [
        createElement("button", { style: "align-self: flex-end; margin-bottom: 10px;" }, "+ Note", {
          type: "click",
          event: this.toggleCreatingNote,
        }),
        createElement(
          "input",
          { placeholder: "Search Notes", value: this.searchTerm, style: "align-self: flex-end;" },
          null,
          {
            type: "change",
            event: (e) => {
              (this.searchTerm = e.target.value), this.render();
            },
          }
        ),
      ]),
      createElement("h1", {style: "align-self: center;"}, "Notes"),
      createElement("br"),
      ...(await this.renderNoteElems())
    );
  };
}
