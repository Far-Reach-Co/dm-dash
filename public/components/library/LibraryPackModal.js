import createElement from "../../lib/salt-lib/createElement.js";
import modal from "../modal.js";
import renderSpinner from "../spinner.js";

export function normalizePackTagsInput(raw) {
  const values = String(raw || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set(values)).slice(0, 20);
}

export function openEditPackModal(grid, pack) {
  if (!grid.isPackEditable(pack)) return;

  const isProjectOwned =
    !!grid.projectId &&
    String(pack.owner_project_id || "") === String(grid.projectId);
  const state = {
    title: pack.title || "",
    description: pack.description || "",
    tagsText: grid.getPackTags(pack).join(", "),
    visibility:
      isProjectOwned && pack.visibility === "private"
        ? "project"
        : pack.visibility,
    is_published: !!pack.is_published,
    saving: false,
  };

  const renderModal = () => {
    const visibilityOptions = isProjectOwned
      ? [
          createElement("option", { value: "project" }, "Wyrld"),
          createElement("option", { value: "public_pro" }, "Public Pro"),
        ]
      : [
          createElement("option", { value: "private" }, "Private"),
          createElement("option", { value: "public_pro" }, "Public Pro"),
        ];

    const visibilitySelect = createElement(
      "select",
      {
        id: `pack-edit-visibility-${pack.id}`,
        name: "visibility",
        class: "library-sort-select",
      },
      visibilityOptions,
      {
        type: "change",
        event: (e) => {
          state.visibility = e.target.value;
        },
      },
    );
    visibilitySelect.value = state.visibility;

    modal.show(
      createElement("div", { class: "help-content library-pack-modal" }, [
        createElement("h1", {}, "Edit Library Pack"),
        createElement(
          "small",
          { class: "modal-subtitle" },
          "Update publish state, visibility, and pack details.",
        ),
        createElement(
          "form",
          { class: "library-pack-form" },
          [
            createElement("div", { class: "input-container" }, [
              createElement(
                "label",
                { for: `pack-edit-title-${pack.id}`, class: "me-1" },
                "Title",
              ),
              createElement(
                "input",
                {
                  id: `pack-edit-title-${pack.id}`,
                  name: "title",
                  value: state.title,
                  required: true,
                },
                null,
                {
                  type: "input",
                  event: (e) => {
                    state.title = e.target.value;
                  },
                },
              ),
            ]),
            createElement("div", { class: "input-container" }, [
              createElement(
                "label",
                { for: `pack-edit-description-${pack.id}`, class: "me-1" },
                "Description",
              ),
              createElement(
                "textarea",
                {
                  id: `pack-edit-description-${pack.id}`,
                  name: "description",
                  rows: "3",
                  placeholder: "What this pack includes...",
                },
                state.description,
                {
                  type: "input",
                  event: (e) => {
                    state.description = e.target.value;
                  },
                },
              ),
            ]),
            createElement("div", { class: "input-container" }, [
              createElement(
                "label",
                { for: `pack-edit-tags-${pack.id}`, class: "me-1" },
                "Tags",
              ),
              createElement(
                "input",
                {
                  id: `pack-edit-tags-${pack.id}`,
                  name: "tags",
                  value: state.tagsText,
                  placeholder: "forest, battlemap, night",
                },
                null,
                {
                  type: "input",
                  event: (e) => {
                    state.tagsText = e.target.value;
                  },
                },
              ),
            ]),
            createElement("div", { class: "input-container" }, [
              createElement(
                "label",
                { for: `pack-edit-visibility-${pack.id}`, class: "me-1" },
                "Visibility",
              ),
              visibilitySelect,
            ]),
            createElement("div", { class: "d-flex align-items-center mt-2 mb-3" }, [
              createElement(
                "label",
                { for: `pack-edit-published-${pack.id}`, class: "me-2" },
                "Published",
              ),
              createElement(
                "input",
                {
                  id: `pack-edit-published-${pack.id}`,
                  name: "is_published",
                  type: "checkbox",
                  ...(state.is_published ? { checked: true } : {}),
                },
                null,
                {
                  type: "change",
                  event: (e) => {
                    state.is_published = !!e.target.checked;
                  },
                },
              ),
            ]),
            createElement(
              "button",
              {
                class: "new-btn me-1",
                type: "submit",
                ...(state.saving ? { disabled: true } : {}),
              },
              state.saving ? "Saving..." : "Save Changes",
            ),
          ],
          {
            type: "submit",
            event: async (e) => {
              e.preventDefault();
              const title = String(state.title || "").trim();
              if (!title) {
                window.customAlertError("Pack title is required");
                return;
              }
              state.saving = true;
              renderModal();

              const payload = {
                title,
                description: String(state.description || ""),
                tags: normalizePackTagsInput(state.tagsText),
                visibility: String(
                  state.visibility || (isProjectOwned ? "project" : "private"),
                ),
                is_published: !!state.is_published,
              };

              const updated = await grid.libraryApp.editPack(pack.id, payload);
              if (!updated) {
                state.saving = false;
                renderModal();
                return;
              }

              modal.hide();
              await grid.libraryApp.discoverPacks(grid.packSearchQuery);
              window.customAlert("Pack updated");
              grid.renderPackImagesModal({ ...pack, ...updated });
            },
          },
        ),
      ]),
    );
  };

  renderModal();
}

export async function openPackImagesModal(grid, pack) {
  const state = {
    loading: true,
    images: [],
    addBusy: false,
    rowBusyPackImageId: null,
    uninstallBusy: false,
    deleteBusy: false,
  };
  const isEditable = grid.isPackEditable(pack);
  const isInstalled = grid.isPackInstalled(pack);
  const isLockedForScope = grid.isPackLockedForScope(pack);

  const syncPackLists = async () => {
    await Promise.all([
      grid.libraryApp.discoverPacks(grid.packSearchQuery),
      grid.libraryApp.loadInstalledPacks(),
    ]);
  };

  const loadPackImages = async () => {
    state.loading = true;
    renderModal();
    const images = await grid.libraryApp.getPackImages(pack.id);
    state.images = Array.isArray(images) ? images : [];
    state.loading = false;
    renderModal();
  };

  const getSelectedImageIdsForPackAdd = () => {
    return grid.images
      .filter((img) => grid.selectedImageIds.has(String(img.image_id)))
      .map((img) => Number(img.image_id))
      .filter((id) => Number.isFinite(id) && id > 0);
  };

  const getAddCandidates = () => {
    const selectedIds = getSelectedImageIdsForPackAdd();
    const existing = new Set(
      state.images.map((img) => String(img.image_id ?? img.id)),
    );
    return selectedIds.filter((id) => !existing.has(String(id)));
  };

  const renderModal = () => {
    const addCandidates = getAddCandidates();
    const imageCount = state.loading ? Number(pack.image_count || 0) : state.images.length;
    const canUninstall = !isEditable && isInstalled;
    const list = isLockedForScope
      ? [
          createElement(
            "div",
            { class: "library-pack-empty" },
            grid.getPackLockMessage(pack),
          ),
        ]
      : state.loading
        ? [
            createElement("div", { class: "library-pack-loading" }, [
              renderSpinner(),
              createElement(
                "div",
                { class: "library-pack-empty" },
                "Loading images...",
              ),
            ]),
          ]
        : state.images.length
          ? state.images.map((img) =>
              createElement("div", { class: "library-pack-image-row" }, [
                createElement("img", {
                  class: "library-pack-image-thumb",
                  src: img.src || "",
                  alt: img.original_name || "Image",
                }),
                createElement("div", { class: "library-pack-image-meta" }, [
                  createElement(
                    "div",
                    { class: "library-pack-image-name" },
                    img.original_name || "Untitled",
                  ),
                  createElement(
                    "div",
                    { class: "library-pack-image-size" },
                    grid.formatFileSize(img.size || 0),
                  ),
                ]),
                ...(isEditable
                  ? [
                      createElement("div", { class: "library-pack-image-actions" }, [
                        createElement(
                          "button",
                          {
                            class: "library-pack-action-btn",
                            type: "button",
                          },
                          "Details",
                          {
                            type: "click",
                            event: async () => {
                              modal.show(await grid.renderPackImageDetailModal(img));
                            },
                          },
                        ),
                        createElement(
                          "button",
                          {
                            class: "library-pack-action-btn danger",
                            type: "button",
                            ...(state.rowBusyPackImageId ===
                            String(img.pack_image_id)
                              ? { disabled: true }
                              : {}),
                          },
                          state.rowBusyPackImageId === String(img.pack_image_id)
                            ? "Removing..."
                            : "Remove",
                          {
                            type: "click",
                            event: async () => {
                              if (!img.pack_image_id) {
                                window.customAlertError(
                                  "Could not remove this image from pack",
                                );
                                return;
                              }
                              const confirmed = await window.customConfirm(
                                `Remove "${img.original_name || "image"}" from this pack?`,
                                { confirmText: "Remove", danger: true },
                              );
                              if (!confirmed) return;

                              state.rowBusyPackImageId = String(img.pack_image_id);
                              renderModal();
                              const ok = await grid.libraryApp.removeImageFromPack(
                                img.pack_image_id,
                              );
                              state.rowBusyPackImageId = null;
                              if (!ok) {
                                window.customAlertError(
                                  "Could not remove image from pack",
                                );
                                renderModal();
                                return;
                              }
                              await loadPackImages();
                              await syncPackLists();
                            },
                          },
                        ),
                      ]),
                    ]
                  : []),
              ]),
            )
          : [
              createElement(
                "div",
                { class: "library-pack-empty" },
                "No images in this pack yet.",
              ),
            ];

    const actionButtons = [];
    if (isEditable) {
      actionButtons.push(
        createElement(
          "button",
          { class: "library-pack-action-btn", type: "button" },
          "Edit Pack",
          {
            type: "click",
            event: () => grid.renderEditPackModal(pack),
          },
        ),
      );
      actionButtons.push(
        createElement(
          "button",
          {
            class: "library-pack-action-btn",
            type: "button",
            ...(state.addBusy || !addCandidates.length ? { disabled: true } : {}),
          },
          state.addBusy ? "Adding..." : `Add Selected (${addCandidates.length})`,
          {
            type: "click",
            event: async () => {
              if (!addCandidates.length || state.addBusy) return;
              state.addBusy = true;
              renderModal();
              const result = await grid.libraryApp.addImagesToPack(
                pack.id,
                addCandidates,
              );
              state.addBusy = false;
              await loadPackImages();
              await syncPackLists();
              window.customAlert(
                `Added ${result.success}/${addCandidates.length} selected image${addCandidates.length === 1 ? "" : "s"} to pack`,
              );
            },
          },
        ),
      );
      actionButtons.push(
        createElement(
          "button",
          {
            class: "library-pack-action-btn danger",
            type: "button",
            ...(state.deleteBusy ? { disabled: true } : {}),
          },
          state.deleteBusy ? "Deleting..." : "Delete Pack",
          {
            type: "click",
            event: async () => {
              if (state.deleteBusy) return;
              const confirmed = await window.customConfirm(
                `Delete "${pack.title || "this pack"}"? This removes the pack but keeps images in your library.`,
                { confirmText: "Delete Pack", danger: true },
              );
              if (!confirmed) return;
              state.deleteBusy = true;
              renderModal();
              const removed = await grid.libraryApp.removePack(pack.id);
              state.deleteBusy = false;
              if (!removed) {
                window.customAlertError("Could not delete pack");
                renderModal();
                return;
              }
              modal.hide();
              await syncPackLists();
              grid.requestRender();
              window.customAlert("Pack deleted");
            },
          },
        ),
      );
    }

    if (canUninstall) {
      actionButtons.push(
        createElement(
          "button",
          {
            class: "library-pack-action-btn danger",
            type: "button",
            ...(state.uninstallBusy ? { disabled: true } : {}),
          },
          state.uninstallBusy ? "Uninstalling..." : "Uninstall",
          {
            type: "click",
            event: async () => {
              if (state.uninstallBusy) return;
              const confirmed = await window.customConfirm(
                `Uninstall "${pack.title || "this pack"}" from your library?`,
                { confirmText: "Uninstall", danger: true },
              );
              if (!confirmed) return;
              state.uninstallBusy = true;
              renderModal();
              const ok = await grid.libraryApp.uninstallPack(pack.id);
              state.uninstallBusy = false;
              if (!ok) {
                window.customAlertError("Could not uninstall pack");
                renderModal();
                return;
              }
              modal.hide();
              await syncPackLists();
              grid.requestRender();
              window.customAlert("Pack uninstalled");
            },
          },
        ),
      );
    }

    const actions = actionButtons.length
      ? createElement("div", { class: "library-pack-actions" }, actionButtons)
      : createElement("div");

    modal.show(
      createElement("div", { class: "help-content library-pack-modal" }, [
        createElement("h1", {}, pack.title || "Pack"),
        createElement(
          "small",
          { class: "modal-subtitle" },
          `${grid.getPackOwnershipBadge(pack)} • ${grid.getPackVisibilityLabel(pack)} • ${imageCount} images${isLockedForScope ? ` • ${grid.getPackLockLabel(pack)}` : ""}`,
        ),
        actions,
        createElement(
          "p",
          { class: "library-pack-description" },
          pack.description || "No description",
        ),
        createElement(
          "small",
          { class: "library-pack-tags" },
          `Tags: ${grid.formatPackTags(grid.getPackTags(pack))}`,
        ),
        createElement("div", { class: "library-pack-image-list" }, list),
      ]),
    );
  };

  renderModal();
  if (!isLockedForScope) {
    await loadPackImages();
  }
}

export function openCreatePackModal(grid) {
  const isProject = !!grid.projectId;
  const state = {
    title: "",
    description: "",
    tagsText: "",
    visibility: isProject ? "project" : "private",
    is_published: false,
    saving: false,
  };

  const renderModal = () => {
    const visibilityOptions = isProject
      ? [
          createElement("option", { value: "project" }, "Wyrld"),
          createElement("option", { value: "public_pro" }, "Public Pro"),
        ]
      : [
          createElement("option", { value: "private" }, "Private"),
          createElement("option", { value: "public_pro" }, "Public Pro"),
        ];

    const visibilitySelect = createElement(
      "select",
      {
        id: "pack-visibility",
        name: "visibility",
        class: "library-sort-select",
      },
      visibilityOptions,
      {
        type: "change",
        event: (e) => {
          state.visibility = e.target.value;
        },
      },
    );
    visibilitySelect.value = state.visibility;

    modal.show(
      createElement("div", { class: "help-content library-pack-modal" }, [
        createElement("h1", {}, "Create Library Pack"),
        createElement(
          "small",
          { class: "modal-subtitle" },
          "Packs let you bundle and share curated image sets.",
        ),
        createElement(
          "form",
          { class: "library-pack-form" },
          [
            createElement("div", { class: "input-container" }, [
              createElement(
                "label",
                { for: "pack-title", class: "me-1" },
                "Title",
              ),
              createElement(
                "input",
                {
                  id: "pack-title",
                  name: "title",
                  placeholder: "Forest Battle Maps",
                  value: state.title,
                  required: true,
                },
                null,
                {
                  type: "input",
                  event: (e) => {
                    state.title = e.target.value;
                  },
                },
              ),
            ]),
            createElement("div", { class: "input-container" }, [
              createElement(
                "label",
                { for: "pack-description", class: "me-1" },
                "Description",
              ),
              createElement(
                "textarea",
                {
                  id: "pack-description",
                  name: "description",
                  rows: "3",
                  placeholder: "What this pack includes...",
                },
                state.description,
                {
                  type: "input",
                  event: (e) => {
                    state.description = e.target.value;
                  },
                },
              ),
            ]),
            createElement("div", { class: "input-container" }, [
              createElement("label", { for: "pack-tags", class: "me-1" }, "Tags"),
              createElement(
                "input",
                {
                  id: "pack-tags",
                  name: "tags",
                  placeholder: "forest, battlemap, night",
                  value: state.tagsText,
                },
                null,
                {
                  type: "input",
                  event: (e) => {
                    state.tagsText = e.target.value;
                  },
                },
              ),
            ]),
            createElement("div", { class: "input-container" }, [
              createElement(
                "label",
                { for: "pack-visibility", class: "me-1" },
                "Visibility",
              ),
              visibilitySelect,
            ]),
            createElement("div", { class: "d-flex align-items-center mt-2 mb-3" }, [
              createElement(
                "label",
                { for: "pack-published", class: "me-2" },
                "Published",
              ),
              createElement(
                "input",
                {
                  id: "pack-published",
                  name: "is_published",
                  type: "checkbox",
                  ...(state.is_published ? { checked: true } : {}),
                },
                null,
                {
                  type: "change",
                  event: (e) => {
                    state.is_published = !!e.target.checked;
                  },
                },
              ),
            ]),
            createElement(
              "button",
              {
                class: "new-btn me-1",
                type: "submit",
                ...(state.saving ? { disabled: true } : {}),
              },
              state.saving ? "Creating..." : "Create Pack",
            ),
          ],
          {
            type: "submit",
            event: async (e) => {
              e.preventDefault();
              const title = String(state.title || "").trim();
              if (!title) {
                window.customAlertError("Pack title is required");
                return;
              }
              state.saving = true;
              renderModal();

              const payload = {
                title,
                description: String(state.description || ""),
                tags: normalizePackTagsInput(state.tagsText),
                visibility: String(
                  state.visibility || (isProject ? "project" : "private"),
                ),
                is_published: !!state.is_published,
              };

              const created = await grid.libraryApp.createPack(payload);
              if (!created) {
                state.saving = false;
                renderModal();
                return;
              }

              modal.hide();
              await grid.libraryApp.discoverPacks(grid.packSearchQuery);
              window.customAlert("Pack created");
            },
          },
        ),
      ]),
    );
  };

  renderModal();
}

export function openDiscoverPacksModal(grid) {
  grid.packSearchQuery = "";
  let searchDebounce = null;
  const state = {
    query: "",
    packs: [],
    installedIds: new Set(grid.installedPacks.map((pack) => String(pack.id))),
    loading: true,
    requestId: 0,
    installBusyPackId: null,
    selectedPack: null,
    selectedImages: [],
    selectedLoading: false,
    selectedRequestId: 0,
  };

  const listContainer = createElement("div", {
    class: "library-pack-modal-list",
  });

  const renderListOnly = () => {
    while (listContainer.firstChild) {
      listContainer.removeChild(listContainer.firstChild);
    }

    if (state.selectedPack) {
      const packKey = String(state.selectedPack.id);
      const isOwnedPack = grid.isPackEditable(state.selectedPack);
      const isLockedPack = grid.isPackLockedForScope(state.selectedPack);
      const isInstalledPack = state.installedIds.has(packKey);
      const canInstallPack = state.selectedPack?.can_install !== false;
      const actions = createElement("div", { class: "library-pack-actions mb-2" }, [
        createElement(
          "button",
          { class: "library-pack-action-btn", type: "button" },
          "Back",
          {
            type: "click",
            event: () => {
              state.selectedPack = null;
              state.selectedImages = [];
              state.selectedLoading = false;
              renderListOnly();
            },
          },
        ),
        ...(isOwnedPack
          ? [
              createElement(
                "div",
                { class: "library-pack-item-meta", style: "align-self:center;" },
                "Owned pack",
              ),
            ]
          : [
              createElement(
                "button",
                {
                  class: "library-pack-action-btn",
                  type: "button",
                  ...((state.installBusyPackId === packKey ||
                  (!isInstalledPack && (isLockedPack || !canInstallPack)))
                    ? { disabled: true }
                    : {}),
                },
                isInstalledPack
                  ? "Uninstall"
                  : isLockedPack
                    ? grid.getPackLockLabel(state.selectedPack)
                    : !canInstallPack
                      ? "Unavailable"
                      : "Install",
                {
                  type: "click",
                  event: async () => {
                    state.installBusyPackId = packKey;
                    renderListOnly();
                    if (isInstalledPack) {
                      const ok = await grid.libraryApp.uninstallPack(state.selectedPack.id);
                      if (!ok) {
                        state.installBusyPackId = null;
                        renderListOnly();
                        window.customAlertError("Could not uninstall pack");
                        return;
                      }
                      state.installedIds.delete(packKey);
                    } else {
                      const installed = await grid.libraryApp.installPack(
                        state.selectedPack.id,
                      );
                      if (!installed) {
                        state.installBusyPackId = null;
                        renderListOnly();
                        return;
                      }
                      state.installedIds.add(packKey);
                    }
                    await grid.libraryApp.loadInstalledPacks();
                    state.installBusyPackId = null;
                    renderListOnly();
                  },
                },
              ),
            ]),
      ]);

      const previewRows = isLockedPack
        ? [
            createElement(
              "div",
              { class: "library-pack-empty" },
              grid.getPackLockMessage(state.selectedPack),
            ),
          ]
        : state.selectedLoading
          ? [
              createElement("div", { class: "library-pack-loading" }, [
                renderSpinner(),
                createElement(
                  "div",
                  { class: "library-pack-empty" },
                  "Loading images...",
                ),
              ]),
            ]
          : state.selectedImages.length
            ? state.selectedImages.map((img) =>
                createElement("div", { class: "library-pack-image-row" }, [
                  createElement("img", {
                    class: "library-pack-image-thumb",
                    src: img.src || "",
                    alt: img.original_name || "Image",
                  }),
                  createElement("div", { class: "library-pack-image-meta" }, [
                    createElement(
                      "div",
                      { class: "library-pack-image-name" },
                      img.original_name || "Untitled",
                    ),
                    createElement(
                      "div",
                      { class: "library-pack-image-size" },
                      grid.formatFileSize(img.size || 0),
                    ),
                  ]),
                ]),
              )
            : [
                createElement(
                  "div",
                  { class: "library-pack-empty" },
                  "No images in this pack yet.",
                ),
              ];

      listContainer.append(
        createElement("div", { class: "library-pack-item" }, [
          createElement("div", { class: "library-pack-item-head" }, [
            createElement("div", { class: "library-pack-item-main" }, [
              createElement(
                "div",
                { class: "library-pack-item-title" },
                state.selectedPack.title || "Untitled",
              ),
              createElement(
                "div",
                { class: "library-pack-item-meta" },
                `${grid.getPackOwnershipBadge(state.selectedPack)} • ${grid.getPackVisibilityLabel(state.selectedPack)} • ${state.selectedPack.image_count || 0} images`,
              ),
            ]),
            createElement("div", { class: "library-pack-item-actions" }, [actions]),
          ]),
          createElement(
            "div",
            { class: "library-pack-item-description" },
            state.selectedPack.description || "No description",
          ),
          createElement(
            "small",
            { class: "library-pack-tags" },
            `Tags: ${grid.formatPackTags(grid.getPackTags(state.selectedPack))}`,
          ),
          ...(isLockedPack
            ? [
                createElement(
                  "div",
                  { class: "library-pack-lock-note" },
                  grid.getPackLockMessage(state.selectedPack),
                ),
              ]
            : []),
          createElement("div", { class: "library-pack-image-list" }, previewRows),
        ]),
      );
      return;
    }

    const rows = state.loading
      ? [
          createElement("div", { class: "library-pack-loading" }, [
            renderSpinner(),
            createElement("div", { class: "library-pack-empty" }, "Loading packs..."),
          ]),
        ]
      : state.packs.length
        ? state.packs.map((pack) =>
            createElement("div", { class: "library-pack-item" }, [
              createElement("div", { class: "library-pack-item-head" }, [
                createElement("div", { class: "library-pack-item-main" }, [
                  createElement(
                    "div",
                    { class: "library-pack-item-title" },
                    pack.title || "Untitled",
                  ),
                  createElement(
                    "div",
                    { class: "library-pack-item-meta" },
                    `${grid.getPackOwnershipBadge(pack)} • ${grid.getPackVisibilityLabel(pack)} • ${pack.image_count || 0} images`,
                  ),
                ]),
                createElement("div", { class: "library-pack-item-actions" }, [
                  createElement(
                    "button",
                    {
                      class: "library-pack-action-btn",
                      type: "button",
                      ...(grid.isPackLockedForScope(pack) ? { disabled: true } : {}),
                    },
                    "Preview",
                    {
                      type: "click",
                      event: async () => {
                        state.selectedPack = pack;
                        state.selectedImages = [];
                        if (grid.isPackLockedForScope(pack)) {
                          state.selectedLoading = false;
                          renderListOnly();
                          return;
                        }
                        state.selectedLoading = true;
                        renderListOnly();
                        const selectedRequestId = ++state.selectedRequestId;
                        const images = await grid.libraryApp.getPackImages(pack.id);
                        if (selectedRequestId !== state.selectedRequestId) return;
                        if (
                          !state.selectedPack ||
                          String(state.selectedPack.id) !== String(pack.id)
                        ) {
                          return;
                        }
                        state.selectedImages = Array.isArray(images) ? images : [];
                        state.selectedLoading = false;
                        renderListOnly();
                      },
                    },
                  ),
                ]),
              ]),
              createElement(
                "div",
                { class: "library-pack-item-description" },
                pack.description || "No description",
              ),
              createElement(
                "small",
                { class: "library-pack-tags" },
                `Tags: ${grid.formatPackTags(grid.getPackTags(pack))}`,
              ),
              createElement("div", { class: "library-pack-card-badges" }, [
                ...(grid.isPackEditable(pack)
                  ? [createElement("span", { class: "library-pack-pill owned" }, "Owned")]
                  : [createElement("span", { class: "library-pack-pill shared" }, "Shared")]),
                ...(grid.isPackLockedForScope(pack)
                  ? [
                      createElement(
                        "span",
                        { class: "library-pack-pill locked" },
                        grid.getPackLockLabel(pack),
                      ),
                    ]
                  : []),
                ...(state.installedIds.has(String(pack.id))
                  ? [
                      createElement(
                        "span",
                        { class: "library-pack-pill installed" },
                        "Installed",
                      ),
                    ]
                  : []),
              ]),
            ]),
          )
        : [
            createElement(
              "div",
              { class: "library-pack-empty" },
              "No packs found for this query.",
            ),
          ];

    rows.forEach((row) => listContainer.append(row));
  };

  const fetchPacks = async () => {
    const requestId = ++state.requestId;
    state.loading = true;
    renderListOnly();
    const packs = await grid.libraryApp.discoverPacks(state.query, {
      publishedOnly: true,
    });
    if (requestId !== state.requestId) return;
    state.packs = Array.isArray(packs) ? packs : [];
    state.loading = false;
    grid.packsLoading = false;
    grid.requestRender();
    renderListOnly();
  };

  const searchInput = createElement(
    "input",
    {
      class: "library-search-input",
      placeholder: "Search packs...",
      value: state.query,
    },
    null,
    {
      type: "input",
      event: (e) => {
        state.query = e.target.value;
        if (searchDebounce) clearTimeout(searchDebounce);
        searchDebounce = setTimeout(fetchPacks, 250);
      },
    },
  );

  modal.show(
    createElement("div", { class: "help-content library-pack-modal" }, [
      createElement("h1", {}, "Discover Shared Packs"),
      createElement(
        "small",
        { class: "modal-subtitle" },
        "Browse installable community resource packs published for other tables and teams to use.",
      ),
      createElement("small", { class: "library-pack-modal-help" }, [
        "Preview any pack before install. ",
        createElement(
          "a",
          {
            href: "/library-guide",
            target: "_blank",
            rel: "noopener noreferrer",
            class: "library-pack-inline-link",
          },
          "Open Library Packs Guide",
        ),
      ]),
      searchInput,
      createElement("div", { class: "library-pack-modal-list-wrap" }, [listContainer]),
    ]),
  );

  renderListOnly();
  fetchPacks();
}
