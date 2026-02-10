import createElement from "../createElement.js";
import { getThings, postThing } from "../../lib/apiUtils.js";
import renderFolderSelect from "../table/folderSelect.js";
import renderRecordSelect from "../table/recordSelect.js";
import parseUrlTextContent from "../parseUrlTextContent.js";

const buildRecordHref = (recordId, projectId) => {
  const base = `/record?id=${recordId}`;
  return projectId ? `${base}&project_id=${projectId}` : base;
};

const getAddRecordEndpoint = (projectId) => {
  return projectId
    ? `/api/add_record_by_project/${projectId}`
    : "/api/add_record_by_user";
};

const getTitleFromImageName = (name) => {
  return name.includes(".") ? name.split(".")[0] : name;
};

const formatFileSize = (value) => {
  if (typeof value !== "number") return value || "";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

export default async function renderImageSettingsModal({
  image,
  projectId,
  tableImageId,
  onDelete,
  onUpdate,
}) {
  const imageId = image.image_id ?? image.id;

  const thumb = image.src
    ? createElement("img", {
        class: "library-detail-thumb",
        src: image.src,
        alt: image.original_name,
      })
    : createElement("div");

  const nameInput = createElement("input", {
    value: image.original_name,
    class: "library-search-input",
  });
  const renameField = createElement("div", { class: "library-detail-field" }, [
    createElement("h3", {}, "Name"),
    nameInput,
    createElement("button", { class: "new-btn mt-1" }, "Save Name", {
      type: "click",
      event: () => {
        image.original_name = nameInput.value;
        postThing(`/api/edit_image_name/${imageId}`, {
          original_name: nameInput.value,
        });
        if (onUpdate) onUpdate();
      },
    }),
  ]);

  const notesElem = createElement(
    "div",
    {
      contenteditable: true,
      class: "image-notes",
    },
    image.notes ? parseUrlTextContent(image.notes) : "Placeholder text...",
    {
      type: "focusout",
      event: (e) => {
        image.notes = e.target.textContent;
        postThing(`/api/edit_image_notes/${imageId}`, {
          notes: e.target.textContent,
        });
        if (onUpdate) onUpdate();
      },
    },
  );
  const notesField = createElement("div", { class: "library-detail-field" }, [
    createElement("h3", {}, "Notes"),
    notesElem,
  ]);

  const folderSelectElem = await renderFolderSelect(
    { id: tableImageId, folder_id: image.folder_id },
    projectId,
  );
  folderSelectElem.addEventListener("change", async (e) => {
    const value = e.target.value;
    image.folder_id = value == 0 ? null : value;
    await postThing(`/api/edit_table_image/${tableImageId}`, {
      folder_id: value,
    });
    if (onUpdate) onUpdate();
  });
  const folderField = createElement("div", { class: "library-detail-field" }, [
    createElement("h3", {}, "Folder"),
    folderSelectElem,
  ]);

  const recordContent = createElement("div");
  if (image.record_id) {
    recordContent.append(
      createElement(
        "a",
        {
          href: buildRecordHref(image.record_id, projectId),
          target: "_blank",
          rel: "noopener noreferrer",
        },
        image.record_title || "View Record",
      ),
    );
  } else {
    const recordSelectElem = await renderRecordSelect(projectId);
    recordSelectElem.addEventListener("change", async (e) => {
      const recordId = e.target.value;
      if (recordId == 0) return;
      await postThing("/api/add_record_image", {
        record_id: recordId,
        image_id: imageId,
      });
      const record = await getThings(`/api/get_record/${recordId}`);
      if (record) {
        image.record_id = record.id;
        image.record_title = record.title;
        image.record_desc = record.description;
        recordContent.innerHTML = "";
        recordContent.append(
          createElement(
            "a",
            {
              href: buildRecordHref(image.record_id, projectId),
              target: "_blank",
              rel: "noopener noreferrer",
            },
            image.record_title || "View Record",
          ),
        );
        if (onUpdate) onUpdate();
      }
    });
    const createRecordBtn = createElement(
      "button",
      { class: "new-btn mt-1" },
      "Create New Record",
      {
        type: "click",
        event: async () => {
          const data = {
            title: getTitleFromImageName(image.original_name || "New Record"),
            description: image.description || "Placeholder text...",
            is_public: false,
          };
          const newRecord = await postThing(
            getAddRecordEndpoint(projectId),
            data,
          );
          if (newRecord) {
            await postThing("/api/add_record_image", {
              record_id: newRecord.id,
              image_id: imageId,
            });
            image.record_id = newRecord.id;
            image.record_title = newRecord.title;
            image.record_desc = newRecord.description;
            recordContent.innerHTML = "";
            recordContent.append(
              createElement(
                "a",
                {
                  href: buildRecordHref(image.record_id, projectId),
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                image.record_title || "View Record",
              ),
            );
            if (onUpdate) onUpdate();
          }
        },
      },
    );
    recordContent.append(
      createElement("small", {}, "None"),
      createElement("br"),
      createElement("div", { class: "modal-record-actions" }, [
        createRecordBtn,
        recordSelectElem,
      ]),
    );
  }
  const recordField = createElement(
    "div",
    { class: "library-detail-field" },
    [createElement("h3", {}, "Linked Record"), recordContent],
  );

  const sizeField = createElement("div", { class: "library-detail-field" }, [
    createElement("h3", {}, "File Size"),
    createElement("small", {}, formatFileSize(image.size)),
  ]);

  const deleteBtn = createElement("button", { class: "btn-red" }, "Delete Image", {
    type: "click",
    event: () => {
      if (onDelete) onDelete();
    },
  });

  return createElement("div", { class: "help-content library-detail-modal" }, [
    thumb,
    renameField,
    createElement("div", { class: "modal-divider" }),
    notesField,
    createElement("div", { class: "modal-divider" }),
    folderField,
    createElement("div", { class: "modal-divider" }),
    recordField,
    createElement("div", { class: "modal-divider" }),
    sizeField,
    createElement("div", { class: "modal-divider" }),
    deleteBtn,
  ]);
}
