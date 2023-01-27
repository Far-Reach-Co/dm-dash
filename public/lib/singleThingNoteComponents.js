import createElement from "./createElement.js";
import Note from "../components/Note.js";
import { getThings } from "./apiUtils.js";

async function renderNotes(endpoint, render, navigate) {
  let notesList = await getThings(endpoint);
  if (!notesList) notesList = [];

  return notesList.map((note) => {
    const elem = createElement("div", {
      id: `note-component-${note.id}`,
      class: "sub-view-component",
    });

    new Note({
      domComponent: elem,
      parentRender: render,
      id: note.id,
      projectId: note.project_id,
      title: note.title,
      description: note.description,
      dateCreated: note.date_created,
      locationId: note.location_id,
      characterId: note.character_id,
      itemId: note.item_id,
      navigate: navigate,
    });

    return elem;
  });
}

async function renderNoteComponent(
  toggleCreatingNote,
  endpoint,
  render,
  navigate
) {
  return [
    createElement("div", { class: "single-item-subheading" }, [
      "Notes",
      createElement("button", { style: "align-self: flex-end;" }, "+ Note", {
        type: "click",
        event: () => {
          toggleCreatingNote();
        },
      }),
    ]),
    createElement("div", { class: "sub-view" }, [
      ...(await renderNotes(endpoint, render, navigate)),
    ]),
    createElement("br"),
  ];
}

export { renderNoteComponent };
