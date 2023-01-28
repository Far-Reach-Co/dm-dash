import createElement from "../lib/createElement.js";
import Note from "../components/Note.js";
import state from "../lib/state.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import searchElement from "../lib/searchElement.js";
import { renderCreateNewNote } from "../lib/noteUtils.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";

export default class NotesView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";
    this.navigate = props.navigate;

    this.searchTerm = "";
    this.limit = state.config.queryLimit;
    this.offset = 0;

    this.creatingNewNote = false;
    this.newNoteLoading = false;

    this.render();
  }

  resetFilters = () => {
    this.searchTerm = "";
    this.offset = 0;
  };

  toggleNewNoteLoading = () => {
    this.newNoteLoading = !this.newNoteLoading;
    this.render();
  };

  toggleCreatingNote = () => {
    this.resetFilters();
    this.creatingNewNote = !this.creatingNewNote;
    this.render();
  };

  newNote = async (e) => {
    e.preventDefault();
    this.toggleNewNoteLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.user_id = state.user.id;
    formProps.project_id = state.currentProject.id;
    formProps.location_id = null;
    formProps.character_id = null;

    await postThing("/api/add_note", formProps);
    this.toggleNewNoteLoading();
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

    if (this.newNoteLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Please wait while we create your note...")
      );
    }

    if (this.creatingNewNote) {
      return this.domComponent.append(
        ...(await renderCreateNewNote(
          null,
          this.toggleCreatingNote,
          this.newNote
        ))
      );
    }

    // append
    this.domComponent.append(
      createElement("div", { class: "view-options-container" }, [
        createElement("button", { class: "new-btn" }, "+ Note", {
          type: "click",
          event: this.toggleCreatingNote,
        }),
        searchElement("Search Notes", this),
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
