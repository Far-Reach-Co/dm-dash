import createElement from "./createElement.js";
import Note from "../components/Note.js";
import { getThings } from "./apiUtils.js";

async function renderCreateNewNotes(title, toggle, newNote) {
  return [
    createElement(
      "div",
      { class: "component-title" },
      `Create new note for ${title}`
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
          await newNote(e);
          toggle();
        },
      }
    ),
    createElement("br"),
    createElement("button", {}, "Cancel", {
      type: "click",
      event: toggle,
    }),
  ];
}

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

export { renderNoteComponent, renderCreateNewNotes };
