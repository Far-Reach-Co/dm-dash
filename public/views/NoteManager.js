import createElement from "../lib/createElement.js";
import Note from "../components/Note.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import state from "../lib/state.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import searchElement from "../lib/searchElement.js";

export default class NoteManager {
  constructor(props) {
    this.domComponent = props.domComponent;
    
    // options
    this.standAlone = props.standAlone;
    if (this.standAlone) this.domComponent.className = "standard-view"
    this.altEndpoint = props.altEndpoint;
    this.locationId = props.locationId;
    this.itemId = props.itemId;
    this.characterId = props.characterId;

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
    formProps.location_id = this.locationId ? this.locationId : null;
    formProps.character_id = this.characterId ? this.characterId : null;
    formProps.item_id = this.itemId ? this.itemId : null;

    await postThing("/api/add_note", formProps);
    this.toggleNewNoteLoading();
  };

  renderCreateNewNote = async () => {
    this.domComponent.append(
      createElement("div", { class: "component-title" }, "Create new note"),
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
            this.creatingNewNote = false;
            await this.newNote(e);
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Cancel", {
        type: "click",
        event: this.toggleCreatingNote,
      })
    );
  };

  renderNoteElems = async () => {
    let endpoint = `/api/get_notes/${state.currentProject.id}/${this.limit}/${this.offset}/${this.searchTerm}`;
    if (this.altEndpoint) endpoint = this.altEndpoint;
    
    let notesList = await getThings(endpoint);
    if (!notesList) notesList = [];
    
    return notesList.map((note) => {
      const elem = createElement("div", {
        class: "sub-view-component",
      });
      if (this.standAlone) elem.className = "component";
      
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
      });

      return elem;
    });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.newNoteLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Please wait while we create your note...")
      );
    }

    if (this.creatingNewNote) {
      return this.renderCreateNewNote();
    }

    if (this.standAlone) {
      return this.domComponent.append(
        createElement("div", { class: "view-options-container" }, [
          createElement("button", { class: "new-btn" }, "+ Note", {
            type: "click",
            event: this.toggleCreatingNote,
          }),
          searchElement("Search Notes", this),
        ]),
        createElement("hr"),
        ...(await this.renderNoteElems()),
        createElement("br"),
        createElement("a", { style: "align-self: center;" }, "More", {
          type: "click",
          event: async (e) => {
            this.offset += state.config.queryOffset;
            e.target.before(...(await this.renderNoteElems()));
          },
        })
      );
    }

    this.domComponent.append(
      createElement("div", { class: "single-item-subheading" }, [
        "Personal Notes",
        createElement("button", { style: "align-self: flex-end;" }, "+ Note", {
          type: "click",
          event: () => {
            this.toggleCreatingNote();
          },
        }),
      ]),
      createElement("div", { class: "sub-view" }, [
        ...(await this.renderNoteElems()),
      ]),
      createElement("br")
    );
  };
}
