import createElement from "../../lib/salt-lib/createElement.js";
import { apiGet, apiPost } from "../../lib/apiUtils.js";
import { handleApiFailure } from "../../lib/apiUiFeedback.js";
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
  onPackUpdate = null,
  tableViewId = null,
  capabilities = null,
  packOptions = null,
  onAddToPack = null,
  currentPackMemberships = null,
  onRemoveFromPack = null,
  showFolderField = true,
  canLinkRecord = null,
}) {
  const imageId = image.image_id ?? image.id;
  const canEditImageMetadata = capabilities
    ? !!capabilities.canEditImageMetadata
    : true;
  const canManageFolders = capabilities ? !!capabilities.canManageFolders : true;
  const canManageImageAssets = capabilities
    ? !!capabilities.canManageImageAssets
    : true;
  const canLinkRecordToImage =
    typeof canLinkRecord === "boolean"
      ? canLinkRecord
      : canEditImageMetadata;

  const state = {
    image: {
      ...image,
      id: imageId,
      image_id: imageId,
    },
    renderToken: 0,
  };

  const modalContent = createElement("div", {
    class: "help-content library-detail-modal",
  });

  const notifyNameUpdate = (name) => {
    if (!onUpdate) return;
    onUpdate({
      type: "name",
      imageId,
      originalName: name,
    });
  };

  const notifyGeneralUpdate = () => {
    if (onUpdate) onUpdate();
  };

  const renderThumb = () => {
    if (!state.image.src) return createElement("div");
    return createElement("div", { class: "library-detail-thumb-frame" }, [
      createElement("img", {
        class: "library-detail-thumb",
        src: state.image.src,
        alt: state.image.original_name,
      }),
    ]);
  };

  const renderRenameField = () => {
    const nameInput = createElement("input", {
      value: state.image.original_name,
      class: "library-search-input",
      ...(canEditImageMetadata ? {} : { disabled: true }),
    });

    const saveBtn = canEditImageMetadata
      ? [
          createElement("button", { class: "new-btn mt-1" }, "Save Name", {
            type: "click",
            event: async () => {
              const nextName = String(nameInput.value || "");
              const prevName = state.image.original_name;
              const response = await apiPost(`/api/edit_image_name/${imageId}`, {
                original_name: nextName,
                ...(tableViewId ? { table_view_id: tableViewId } : {}),
              });
              if (!response.ok) {
                handleApiFailure(response, { includeResultMessage: true });
                state.image.original_name = prevName;
                requestRender();
                return;
              }
              state.image.original_name = nextName;
              notifyNameUpdate(nextName);
              requestRender();
            },
          }),
        ]
      : [];

    return createElement("div", { class: "library-detail-field" }, [
      createElement("h3", {}, "Name"),
      nameInput,
      ...saveBtn,
    ]);
  };

  const renderNotesField = () => {
    const notesElem = createElement(
      "div",
      {
        contenteditable: canEditImageMetadata ? "true" : "false",
        class: "image-notes",
      },
      state.image.notes
        ? parseUrlTextContent(state.image.notes)
        : "Placeholder text...",
      ...(canEditImageMetadata
        ? [
            {
              type: "focusout",
              event: async (e) => {
                state.image.notes = e.target.textContent;
                const result = await apiPost(`/api/edit_image_notes/${imageId}`, {
                  notes: e.target.textContent,
                  ...(tableViewId ? { table_view_id: tableViewId } : {}),
                });
                if (!result.ok) {
                  handleApiFailure(result, { includeResultMessage: true });
                  return;
                }
                notifyGeneralUpdate();
              },
            },
          ]
        : []),
    );

    return createElement("div", { class: "library-detail-field" }, [
      createElement("h3", {}, "Notes"),
      notesElem,
    ]);
  };

  const renderFolderField = async () => {
    if (!showFolderField || !tableImageId) return null;

    const folderSelectElem = await renderFolderSelect(
      { id: tableImageId, folder_id: state.image.folder_id },
      projectId,
    );

    if (canManageFolders) {
      folderSelectElem.addEventListener("change", async (e) => {
        const value = e.target.value;
        state.image.folder_id = value == 0 ? null : value;
        const result = await apiPost(`/api/edit_table_image/${tableImageId}`, {
          folder_id: value,
          ...(tableViewId ? { table_view_id: tableViewId } : {}),
        });
        if (!result.ok) {
          handleApiFailure(result, { includeResultMessage: true });
          return;
        }
        notifyGeneralUpdate();
      });
    } else {
      folderSelectElem.disabled = true;
    }

    return createElement("div", { class: "library-detail-field" }, [
      createElement("h3", {}, "Folder"),
      folderSelectElem,
    ]);
  };

  const linkImageToRecord = async (recordId) => {
    const linkResult = await apiPost("/api/add_record_image", {
      record_id: recordId,
      image_id: imageId,
    });
    if (!linkResult.ok) {
      handleApiFailure(linkResult, { includeResultMessage: true });
      return;
    }
    const recordResult = await apiGet(`/api/get_record/${recordId}`);
    if (!recordResult.ok || !recordResult.data) return;
    const record = recordResult.data;

    state.image.record_id = record.id;
    state.image.record_title = record.title;
    state.image.record_desc = record.description;
    notifyGeneralUpdate();
    requestRender();
  };

  const createAndLinkRecord = async () => {
    const data = {
      title: getTitleFromImageName(state.image.original_name || "New Record"),
      description: state.image.description || "Placeholder text...",
      is_public: false,
    };
    const newRecordResult = await apiPost(getAddRecordEndpoint(projectId), data);
    if (!newRecordResult.ok || !newRecordResult.data) {
      if (!newRecordResult.ok) {
        handleApiFailure(newRecordResult, { includeResultMessage: true });
      }
      return;
    }
    const newRecord = newRecordResult.data;

    await linkImageToRecord(newRecord.id);
  };

  const renderRecordField = async () => {
    const hasRecord = !!state.image.record_id;
    const children = [createElement("h3", {}, "Linked Record")];

    if (hasRecord || !canLinkRecordToImage) {
      children.push(
        hasRecord
          ? createElement(
              "a",
              {
                href: buildRecordHref(state.image.record_id, projectId),
                target: "_blank",
                rel: "noopener noreferrer",
              },
              state.image.record_title || "View Record",
            )
          : createElement("small", {}, "None"),
      );
      return createElement("div", { class: "library-detail-field" }, children);
    }

    const recordSelectElem = await renderRecordSelect(projectId);
    recordSelectElem.addEventListener("change", async (e) => {
      const recordId = e.target.value;
      if (recordId == 0) return;
      await linkImageToRecord(recordId);
    });

    const createRecordBtn = createElement(
      "button",
      { class: "new-btn mt-1" },
      "Create New Record",
      {
        type: "click",
        event: async () => {
          await createAndLinkRecord();
        },
      },
    );

    children.push(
      createElement("small", {}, "None"),
      createElement("br"),
      createElement("div", { class: "modal-record-actions" }, [
        createRecordBtn,
        recordSelectElem,
      ]),
    );

    return createElement("div", { class: "library-detail-field" }, children);
  };

  const renderSizeField = () => {
    return createElement("div", { class: "library-detail-field" }, [
      createElement("h3", {}, "File Size"),
      createElement("small", {}, formatFileSize(state.image.size)),
    ]);
  };

  const renderPackField = () => {
    if (!Array.isArray(packOptions) || !onAddToPack) return null;

    const selectablePacks = packOptions.filter((pack) => pack && pack.id);
    const memberships = Array.isArray(currentPackMemberships)
      ? currentPackMemberships.filter((m) => m && m.pack_image_id)
      : [];
    const inPackIds = new Set(memberships.map((m) => String(m.pack_id)));
    const addablePacks = selectablePacks.filter(
      (pack) => !inPackIds.has(String(pack.id)),
    );

    const select = createElement(
      "select",
      {
        class: "library-sort-select",
        ...(addablePacks.length ? {} : { disabled: true }),
      },
      [
        createElement("option", { value: "" }, "Select pack..."),
        ...addablePacks.map((pack) =>
          createElement(
            "option",
            { value: String(pack.id) },
            pack.title || `Pack ${pack.id}`,
          ),
        ),
      ],
    );

    const addBtn = createElement(
      "button",
      {
        class: "new-btn mt-1",
        ...(addablePacks.length ? {} : { disabled: true }),
      },
      "Add to Pack",
      {
        type: "click",
        event: async () => {
          const value = select.value;
          if (!value) {
            window.customAlertError("Choose a pack first");
            return;
          }
          const didAdd = await onAddToPack(value, imageId);
          if (didAdd && onPackUpdate) onPackUpdate();
        },
      },
    );

    const membershipRows = memberships.length
      ? memberships.map((membership) =>
          createElement("div", { class: "library-pack-membership-row" }, [
            createElement(
              "div",
              { class: "library-pack-membership-title" },
              membership.pack_title || `Pack ${membership.pack_id}`,
            ),
            createElement(
              "button",
              { class: "btn-red", type: "button" },
              "Remove",
              {
                type: "click",
                event: async () => {
                  if (!onRemoveFromPack) return;
                  const didRemove = await onRemoveFromPack(
                    membership.pack_image_id,
                  );
                  if (didRemove && onPackUpdate) onPackUpdate();
                },
              },
            ),
          ]),
        )
      : [
          createElement(
            "small",
            {},
            "This image is not in any editable packs yet.",
          ),
        ];

    return createElement("div", { class: "library-detail-field" }, [
      createElement("h3", {}, "Library Packs"),
      select,
      addBtn,
      createElement("div", { class: "library-pack-membership-list mt-2" }, [
        createElement("small", {}, "Currently in packs:"),
        ...membershipRows,
      ]),
      addablePacks.length
        ? createElement(
            "small",
            {},
            "Only packs you can edit are listed here.",
          )
        : createElement(
            "small",
            {},
            "No editable packs found. Create one in Library Packs first.",
          ),
    ]);
  };

  const renderDeleteButton = () => {
    if (!canManageImageAssets) return createElement("div");
    return createElement("button", { class: "btn-red" }, "Delete Image", {
      type: "click",
      event: () => {
        if (onDelete) onDelete();
      },
    });
  };

  const buildSections = async () => {
    const sections = [
      renderThumb(),
      renderRenameField(),
      createElement("div", { class: "modal-divider" }),
      renderNotesField(),
    ];

    const folderField = await renderFolderField();
    if (folderField) {
      sections.push(createElement("div", { class: "modal-divider" }), folderField);
    }

    sections.push(
      createElement("div", { class: "modal-divider" }),
      await renderRecordField(),
      createElement("div", { class: "modal-divider" }),
      renderSizeField(),
    );

    const packField = renderPackField();
    if (packField) {
      sections.push(createElement("div", { class: "modal-divider" }), packField);
    }

    sections.push(
      createElement("div", { class: "modal-divider" }),
      renderDeleteButton(),
    );

    return sections;
  };

  const requestRender = async () => {
    const token = ++state.renderToken;
    const sections = await buildSections();
    if (token !== state.renderToken) return;
    modalContent.replaceChildren(...sections);
  };

  await requestRender();
  return modalContent;
}
