import createElement from "../createElement.js";
import modal from "../modal.js";
import renderImageSettingsModal from "../shared/imageSettingsModal.js";
import renderSpinner from "../spinner.js";
import { apiDelete } from "../../lib/apiUtils.js";
import { buildFolderTree } from "../shared/folderTreeUtils.js";
import {
  formatPackTags as formatPackTagsShared,
  getPackLockLabel as getPackLockLabelShared,
  getPackLockMessage as getPackLockMessageShared,
  getPackTags as getPackTagsShared,
  getPackVisibilityLabel as getPackVisibilityLabelShared,
  isPackLockedForScope as isPackLockedForScopeShared,
  isPackOwnedByScope,
} from "../shared/libraryPackUtils.js";

export default class LibraryGrid {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "library-content";
    this.libraryApp = props.libraryApp;
    this.projectId = props.projectId;
    this.scopeName =
      typeof props.scopeName === "string" && props.scopeName.trim()
        ? props.scopeName.trim()
        : this.projectId
          ? "Wyrld Library"
          : "My Library";
    this.scopeType = props.scopeType === "project" ? "project" : "user";
    this.viewMode = props.viewMode || "images";
    this.canUseLibraryPacks =
      typeof props.canUseLibraryPacks === "boolean"
        ? props.canUseLibraryPacks
        : !!this.libraryApp?.canUseLibraryPacks;
    if (!this.canUseLibraryPacks && this.viewMode === "packs") {
      this.viewMode = "images";
    }

    this.images = [];
    this.total = 0;
    this.limit = 50;
    this.offset = 0;
    this.searchQuery = "";
    this.currentFolder = null;
    this.loading = false;
    this.showAllImages = true;
    this.expandedFolderIds = new Set();
    this.sortKey = "newest";
    this.imageCountsByFolder = {};
    this.unsortedCount = null;
    this.allImagesTotal = null;
    this.packs = [];
    this.installedPacks = [];
    this.packSearchQuery = "";
    this.packLibraryQuery = "";
    this.packViewFilter = "all";
    this.packsLoading = false;
    this.selectMode = false;
    this.selectedImageIds = new Set();
    this.bulkBusy = false;
    this.renderQueued = false;
  }

  pruneExpandedFolderIds = (folders) => {
    const validIds = new Set(folders.map((f) => String(f.id)));
    for (const id of Array.from(this.expandedFolderIds)) {
      if (!validIds.has(String(id))) {
        this.expandedFolderIds.delete(id);
      }
    }
  };

  requestRender = () => {
    if (this.renderQueued) return;
    this.renderQueued = true;
    Promise.resolve().then(() => {
      this.renderQueued = false;
      this.render();
    });
  };

  showLoading = () => {
    this.loading = true;
    this.requestRender();
  };

  hideLoading = () => {
    this.loading = false;
    this.requestRender();
  };

  setImages = (data) => {
    this.loading = false;
    this.images = data.images;
    this.total = data.total;
    this.limit = data.limit;
    this.offset = data.offset;
    const validIds = new Set(this.images.map((img) => String(img.image_id)));
    this.selectedImageIds = new Set(
      Array.from(this.selectedImageIds).filter((id) => validIds.has(String(id))),
    );
    this.requestRender();
  };

  appendImages = (data) => {
    this.loading = false;
    this.images = [...this.images, ...data.images];
    this.total = data.total;
    this.offset = data.offset;
    this.requestRender();
  };

  setSearchQuery = (query) => {
    this.searchQuery = query;
    if (this.showAllImages) {
      if (this.searchDebounce) clearTimeout(this.searchDebounce);
      this.searchDebounce = setTimeout(() => {
        this.libraryApp.loadImages(true);
      }, 250);
    } else {
      this.requestRender();
    }
  };

  setCounts = (data) => {
    this.imageCountsByFolder = data.by_folder || {};
    this.unsortedCount =
      typeof data.unsorted === "number" ? data.unsorted : null;
    this.allImagesTotal = typeof data.total === "number" ? data.total : null;
    this.requestRender();
  };

  setPacks = (packs) => {
    this.packs = Array.isArray(packs) ? packs : [];
    this.requestRender();
  };

  setInstalledPacks = (packs) => {
    this.installedPacks = Array.isArray(packs) ? packs : [];
    this.requestRender();
  };

  setViewMode = (mode) => {
    this.viewMode =
      mode === "packs" && this.canUseLibraryPacks ? "packs" : "images";
    this.requestRender();
  };

  setPackLibraryQuery = (query) => {
    this.packLibraryQuery = query || "";
    this.requestRender();
  };

  setPackViewFilter = (filter) => {
    this.packViewFilter =
      filter === "owned" || filter === "installed" ? filter : "all";
    this.requestRender();
  };

  filterByFolder = (folder) => {
    this.currentFolder = folder;
    this.clearSelection();
  };

  formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  getFilteredImages = () => {
    let filtered = this.images.slice();

    if (!this.showAllImages) {
      if (this.currentFolder) {
        filtered = filtered.filter(
          (img) => img.folder_id && img.folder_id == this.currentFolder.id,
        );
      } else {
        filtered = filtered.filter((img) => !img.folder_id);
      }
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter((img) => {
        const name = (img.original_name || "").toLowerCase();
        const notes = (img.notes || "").toLowerCase();
        return name.includes(q) || notes.includes(q);
      });
    }

    if (this.sortKey === "name") {
      filtered.sort((a, b) =>
        (a.original_name || "").localeCompare(b.original_name || ""),
      );
    } else if (this.sortKey === "size") {
      filtered.sort((a, b) => (b.size || 0) - (a.size || 0));
    } else {
      filtered.sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (aTime && bTime && aTime !== bTime) return bTime - aTime;
        return (b.image_id || 0) - (a.image_id || 0);
      });
    }

    return filtered;
  };

  getEditablePacks = () => {
    return this.packs.filter((pack) => this.isPackOwnedByCurrentScope(pack));
  };

  isPackOwnedByCurrentScope = (pack) => {
    return isPackOwnedByScope(pack, { projectId: this.projectId });
  };

  getPacksForPacksView = () => {
    const merged = [...this.getEditablePacks(), ...this.installedPacks];
    const seen = new Set();
    const deduped = [];
    for (const pack of merged) {
      const key = String(pack.id);
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(pack);
    }
    return deduped;
  };

  getPacksForCurrentFilter = () => {
    let packs = this.getPacksForPacksView();
    if (this.packViewFilter === "owned") {
      packs = packs.filter((pack) => this.isPackEditable(pack));
    } else if (this.packViewFilter === "installed") {
      packs = packs.filter((pack) => this.isPackInstalled(pack));
    }
    return packs;
  };

  isPackInstalled = (pack) => {
    const key = String(pack.id);
    return this.installedPacks.some((installedPack) => String(installedPack.id) === key);
  };

  isImageSelected = (image) => {
    return this.selectedImageIds.has(String(image.image_id));
  };

  toggleImageSelection = (image) => {
    const key = String(image.image_id);
    if (this.selectedImageIds.has(key)) {
      this.selectedImageIds.delete(key);
    } else {
      this.selectedImageIds.add(key);
    }
    this.requestRender();
  };

  clearSelection = () => {
    this.selectedImageIds.clear();
    this.requestRender();
  };

  toggleSelectMode = (enabled = null) => {
    this.selectMode = typeof enabled === "boolean" ? enabled : !this.selectMode;
    if (!this.selectMode) {
      this.selectedImageIds.clear();
    }
    this.requestRender();
  };

  removeFolder = async (folder) => {
    const confirmed = await window.customConfirm(
      `Are you sure you want to remove folder: "${folder.title}"? Images will be moved to the parent folder.`,
      { confirmText: "Remove", danger: true },
    );
    if (!confirmed) return;

    const result = await apiDelete(`/api/remove_table_folder/${folder.id}`);
    if (!(result.ok && result.status === 204)) {
      window.customAlertError("Could not remove folder.");
      return;
    }

    if (this.currentFolder && this.currentFolder.id == folder.id) {
      if (folder.parent_folder_id) {
        const parent = this.libraryApp.folders.find(
          (f) => f.id == folder.parent_folder_id,
        );
        this.libraryApp.setCurrentFolder(parent || null);
      } else {
        this.libraryApp.setCurrentFolder(null);
      }
    }

    await this.libraryApp.loadFolders();
    await this.libraryApp.refreshImagesForCurrentScope();
  };

  countImagesInFolder = (folderId) => {
    const key = String(folderId);
    if (Object.prototype.hasOwnProperty.call(this.imageCountsByFolder, key)) {
      return this.imageCountsByFolder[key];
    }
    return this.images.filter(
      (img) => img.folder_id && img.folder_id == folderId,
    ).length;
  };

  renderFolderTreeItem = (folder, depth = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = this.expandedFolderIds.has(folder.id);
    const isActive =
      !this.showAllImages &&
      this.currentFolder &&
      this.currentFolder.id == folder.id;
    const imgCount = this.countImagesInFolder(folder.id);

    const toggle = createElement(
      "span",
      {
        class: "library-folder-toggle" + (isExpanded ? " expanded" : ""),
      },
      hasChildren ? "▶" : "",
    );

    const name = createElement("span", {}, folder.title);

    const count = createElement(
      "span",
      { class: "library-folder-count" },
      imgCount > 0 ? `(${imgCount})` : "",
    );

    const deleteBtn = createElement(
      "span",
      { class: "library-folder-actions", title: "Delete folder" },
      "×",
      {
        type: "click",
        event: (e) => {
          e.stopPropagation();
          this.removeFolder(folder);
        },
      },
    );

    const item = createElement(
      "div",
      {
        class:
          "library-folder-item" +
          (isActive ? " library-folder-item-active" : ""),
        style: `padding-left: ${12 + depth * 18}px`,
      },
      [toggle, name, count, deleteBtn],
      {
        type: "click",
        event: () => {
          if (hasChildren) {
            if (isExpanded) {
              this.expandedFolderIds.delete(folder.id);
            } else {
              this.expandedFolderIds.add(folder.id);
            }
          }
          this.showAllImages = false;
          this.currentFolder = folder;
          this.libraryApp.currentFolder = folder;
          this.requestRender();
          this.libraryApp.loadImagesForFolder(folder.id);
        },
      },
    );

    const items = [item];

    if (hasChildren && isExpanded) {
      const childContainer = createElement("div", {
        class: "library-folder-children",
      });
      for (const child of folder.children) {
        const childItems = this.renderFolderTreeItem(child, depth + 1);
        for (const ci of childItems) {
          childContainer.append(ci);
        }
      }
      items.push(childContainer);
    }

    return items;
  };

  getPackVisibilityLabel = (pack) => {
    return getPackVisibilityLabelShared(pack);
  };

  getPackOwnerLabel = (pack) => {
    if (pack.owner_project_id) return "Wyrld pack";
    if (pack.owner_user_id) return "User pack";
    return "Pack";
  };

  getPackOwnershipBadge = (pack) => {
    return this.isPackEditable(pack) ? "Owned" : "Shared";
  };

  isPackEditable = (pack) => {
    return this.isPackOwnedByCurrentScope(pack);
  };

  isPackLockedForScope = (pack) => {
    return isPackLockedForScopeShared(pack);
  };

  getPackLockLabel = (pack) => {
    return getPackLockLabelShared(pack);
  };

  getPackLockMessage = (pack) => {
    return getPackLockMessageShared(pack);
  };

  getPackTags = (pack) => {
    return getPackTagsShared(pack);
  };

  formatPackTags = (tags) => {
    return formatPackTagsShared(tags);
  };

  normalizePackTagsInput = (raw) => {
    const values = String(raw || "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    return Array.from(new Set(values)).slice(0, 20);
  };

  renderEditPackModal = (pack) => {
    if (!this.isPackEditable(pack)) return;

    const isProjectOwned =
      !!this.projectId &&
      String(pack.owner_project_id || "") === String(this.projectId);
    const state = {
      title: pack.title || "",
      description: pack.description || "",
      tagsText: this.getPackTags(pack).join(", "),
      visibility:
        isProjectOwned && pack.visibility === "private" ? "project" : pack.visibility,
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
                createElement("label", { for: `pack-edit-title-${pack.id}`, class: "me-1" }, "Title"),
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
                createElement("label", { for: `pack-edit-description-${pack.id}`, class: "me-1" }, "Description"),
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
                createElement("label", { for: `pack-edit-tags-${pack.id}`, class: "me-1" }, "Tags"),
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
                createElement("label", { for: `pack-edit-visibility-${pack.id}`, class: "me-1" }, "Visibility"),
                visibilitySelect,
              ]),
              createElement("div", { class: "d-flex align-items-center mt-2 mb-3" }, [
                createElement("label", { for: `pack-edit-published-${pack.id}`, class: "me-2" }, "Published"),
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
                  tags: this.normalizePackTagsInput(state.tagsText),
                  visibility: String(state.visibility || (isProjectOwned ? "project" : "private")),
                  is_published: !!state.is_published,
                };

                const updated = await this.libraryApp.editPack(pack.id, payload);
                if (!updated) {
                  state.saving = false;
                  renderModal();
                  return;
                }

                modal.hide();
                await this.libraryApp.discoverPacks(this.packSearchQuery);
                window.customAlert("Pack updated");
                this.renderPackImagesModal({ ...pack, ...updated });
              },
            },
          ),
        ]),
      );
    };

    renderModal();
  };

  renderPackImagesModal = async (pack) => {
    const state = {
      loading: true,
      images: [],
      addBusy: false,
      rowBusyPackImageId: null,
      uninstallBusy: false,
      deleteBusy: false,
    };
    const isEditable = this.isPackEditable(pack);
    const isInstalled = this.isPackInstalled(pack);
    const isLockedForScope = this.isPackLockedForScope(pack);

    const syncPackLists = async () => {
      await Promise.all([
        this.libraryApp.discoverPacks(this.packSearchQuery),
        this.libraryApp.loadInstalledPacks(),
      ]);
    };

    const loadPackImages = async () => {
      state.loading = true;
      renderModal();
      const images = await this.libraryApp.getPackImages(pack.id);
      state.images = Array.isArray(images) ? images : [];
      state.loading = false;
      renderModal();
    };

    const getSelectedImageIdsForPackAdd = () => {
      return this.images
        .filter((img) => this.selectedImageIds.has(String(img.image_id)))
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
      const imageCount = state.loading
        ? Number(pack.image_count || 0)
        : state.images.length;
      const canUninstall = !isEditable && isInstalled;
      const list =
        isLockedForScope
          ? [
              createElement(
                "div",
                { class: "library-pack-empty" },
                this.getPackLockMessage(pack),
              ),
            ]
          : state.loading
          ? [
              createElement("div", { class: "library-pack-loading" }, [
                renderSpinner(),
                createElement("div", { class: "library-pack-empty" }, "Loading images..."),
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
                      this.formatFileSize(img.size || 0),
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
                                modal.show(await this.renderPackImageDetailModal(img));
                              },
                            },
                          ),
                          createElement(
                            "button",
                            {
                              class: "library-pack-action-btn danger",
                              type: "button",
                              ...(state.rowBusyPackImageId === String(img.pack_image_id)
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
                                  window.customAlertError("Could not remove this image from pack");
                                  return;
                                }
                                const confirmed = await window.customConfirm(
                                  `Remove "${img.original_name || "image"}" from this pack?`,
                                  { confirmText: "Remove", danger: true },
                                );
                                if (!confirmed) return;

                                state.rowBusyPackImageId = String(img.pack_image_id);
                                renderModal();
                                const ok = await this.libraryApp.removeImageFromPack(
                                  img.pack_image_id,
                                );
                                state.rowBusyPackImageId = null;
                                if (!ok) {
                                  window.customAlertError("Could not remove image from pack");
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
              event: () => this.renderEditPackModal(pack),
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
            state.addBusy
              ? "Adding..."
              : `Add Selected (${addCandidates.length})`,
            {
              type: "click",
              event: async () => {
                if (!addCandidates.length || state.addBusy) return;
                state.addBusy = true;
                renderModal();
                const result = await this.libraryApp.addImagesToPack(
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
                const removed = await this.libraryApp.removePack(pack.id);
                state.deleteBusy = false;
                if (!removed) {
                  window.customAlertError("Could not delete pack");
                  renderModal();
                  return;
                }
                modal.hide();
                await syncPackLists();
                this.requestRender();
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
                const ok = await this.libraryApp.uninstallPack(pack.id);
                state.uninstallBusy = false;
                if (!ok) {
                  window.customAlertError("Could not uninstall pack");
                  renderModal();
                  return;
                }
                modal.hide();
                await syncPackLists();
                this.requestRender();
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
            `${this.getPackOwnershipBadge(pack)} • ${this.getPackVisibilityLabel(pack)} • ${imageCount} images${isLockedForScope ? ` • ${this.getPackLockLabel(pack)}` : ""}`,
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
            `Tags: ${this.formatPackTags(this.getPackTags(pack))}`,
          ),
          createElement("div", { class: "library-pack-image-list" }, list),
        ]),
      );
    };

    renderModal();
    if (!isLockedForScope) {
      await loadPackImages();
    }
  };

  renderPackImageDetailModal = async (image) => {
    const editablePacks = this.getEditablePacks();
    const imageId = String(image.image_id ?? image.id);
    const currentPackMemberships = await this.libraryApp.getImagePackMemberships(imageId);

    return await renderImageSettingsModal({
      image,
      projectId: this.projectId,
      tableImageId: null,
      onDelete: null,
      onUpdate: () => {},
      onPackUpdate: async () => {
        await this.libraryApp.discoverPacks(this.packSearchQuery);
        modal.show(await this.renderPackImageDetailModal(image));
      },
      capabilities: {
        canEditImageMetadata: true,
        canManageFolders: false,
        canManageImageAssets: false,
      },
      showFolderField: false,
      packOptions: editablePacks,
      currentPackMemberships,
      onAddToPack: async (packId, targetImageId) => {
        const result = await this.libraryApp.addImageToPack(packId, targetImageId);
        if (!result) return false;
        window.customAlert("Image added to pack");
        await this.libraryApp.discoverPacks(this.packSearchQuery);
        return true;
      },
      onRemoveFromPack: async (packImageId) => {
        const ok = await this.libraryApp.removeImageFromPack(packImageId);
        if (!ok) {
          window.customAlertError("Could not remove image from pack");
          return false;
        }
        window.customAlert("Image removed from pack");
        await this.libraryApp.discoverPacks(this.packSearchQuery);
        return true;
      },
    });
  };

  renderCreatePackModal = () => {
    const isProject = !!this.projectId;
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
                createElement("label", { for: "pack-title", class: "me-1" }, "Title"),
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
                createElement("label", { for: "pack-description", class: "me-1" }, "Description"),
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
                createElement("label", { for: "pack-visibility", class: "me-1" }, "Visibility"),
                visibilitySelect,
              ]),
              createElement("div", { class: "d-flex align-items-center mt-2 mb-3" }, [
                createElement("label", { for: "pack-published", class: "me-2" }, "Published"),
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
                  tags: this.normalizePackTagsInput(state.tagsText),
                  visibility: String(state.visibility || (isProject ? "project" : "private")),
                  is_published: !!state.is_published,
                };

                const created = await this.libraryApp.createPack(payload);
                if (!created) {
                  state.saving = false;
                  renderModal();
                  return;
                }

                modal.hide();
                await this.libraryApp.discoverPacks(this.packSearchQuery);
                window.customAlert("Pack created");
              },
            },
          ),
        ]),
      );
    };

    renderModal();
  };

  renderDiscoverPacksModal = () => {
    this.packSearchQuery = "";
    let searchDebounce = null;
    const state = {
      query: "",
      packs: [],
      installedIds: new Set(this.installedPacks.map((pack) => String(pack.id))),
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
        const isOwnedPack = this.isPackEditable(state.selectedPack);
        const isLockedPack = this.isPackLockedForScope(state.selectedPack);
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
                      ? this.getPackLockLabel(state.selectedPack)
                      : !canInstallPack
                        ? "Unavailable"
                        : "Install",
                  {
                    type: "click",
                    event: async () => {
                      state.installBusyPackId = packKey;
                      renderListOnly();
                      if (isInstalledPack) {
                        const ok = await this.libraryApp.uninstallPack(state.selectedPack.id);
                        if (!ok) {
                          state.installBusyPackId = null;
                          renderListOnly();
                          window.customAlertError("Could not uninstall pack");
                          return;
                        }
                        state.installedIds.delete(packKey);
                      } else {
                        const installed = await this.libraryApp.installPack(state.selectedPack.id);
                        if (!installed) {
                          state.installBusyPackId = null;
                          renderListOnly();
                          return;
                        }
                        state.installedIds.add(packKey);
                      }
                      await this.libraryApp.loadInstalledPacks();
                      state.installBusyPackId = null;
                      renderListOnly();
                    },
                  },
                ),
              ]),
        ]);

        const previewRows = isLockedPack
          ? [createElement("div", { class: "library-pack-empty" }, this.getPackLockMessage(state.selectedPack))]
          : state.selectedLoading
          ? [
              createElement("div", { class: "library-pack-loading" }, [
                renderSpinner(),
                createElement("div", { class: "library-pack-empty" }, "Loading images..."),
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
                      this.formatFileSize(img.size || 0),
                    ),
                  ]),
                ]),
              )
            : [createElement("div", { class: "library-pack-empty" }, "No images in this pack yet.")];

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
                  `${this.getPackOwnershipBadge(state.selectedPack)} • ${this.getPackVisibilityLabel(state.selectedPack)} • ${state.selectedPack.image_count || 0} images`,
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
              `Tags: ${this.formatPackTags(this.getPackTags(state.selectedPack))}`,
            ),
            ...(isLockedPack
              ? [
                  createElement(
                    "div",
                    { class: "library-pack-lock-note" },
                    this.getPackLockMessage(state.selectedPack),
                  ),
                ]
              : []),
            createElement("div", { class: "library-pack-image-list" }, previewRows),
          ]),
        );
        return;
      }

      const rows =
        state.loading
          ? [
              createElement("div", { class: "library-pack-loading" }, [
                renderSpinner(),
                createElement("div", { class: "library-pack-empty" }, "Loading packs..."),
              ]),
            ]
          : state.packs.length
            ? state.packs.map((pack) =>
                createElement(
                  "div",
                  { class: "library-pack-item" },
                  [
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
                          `${this.getPackOwnershipBadge(pack)} • ${this.getPackVisibilityLabel(pack)} • ${pack.image_count || 0} images`,
                        ),
                      ]),
                      createElement("div", { class: "library-pack-item-actions" }, [
                        createElement(
                          "button",
                          {
                            class: "library-pack-action-btn",
                            type: "button",
                            ...(this.isPackLockedForScope(pack) ? { disabled: true } : {}),
                          },
                          "Preview",
                          {
                            type: "click",
                            event: async () => {
                              state.selectedPack = pack;
                              state.selectedImages = [];
                              if (this.isPackLockedForScope(pack)) {
                                state.selectedLoading = false;
                                renderListOnly();
                                return;
                              }
                              state.selectedLoading = true;
                              renderListOnly();
                              const selectedRequestId = ++state.selectedRequestId;
                              const images = await this.libraryApp.getPackImages(pack.id);
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
                      `Tags: ${this.formatPackTags(this.getPackTags(pack))}`,
                    ),
                    createElement("div", { class: "library-pack-card-badges" }, [
                      ...(this.isPackEditable(pack)
                        ? [createElement("span", { class: "library-pack-pill owned" }, "Owned")]
                        : [createElement("span", { class: "library-pack-pill shared" }, "Shared")]),
                      ...(this.isPackLockedForScope(pack)
                        ? [
                            createElement(
                              "span",
                              { class: "library-pack-pill locked" },
                              this.getPackLockLabel(pack),
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
                  ],
                ),
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
      const packs = await this.libraryApp.discoverPacks(state.query, {
        publishedOnly: true,
      });
      if (requestId !== state.requestId) return;
      state.packs = Array.isArray(packs) ? packs : [];
      state.loading = false;
      this.packsLoading = false;
      this.requestRender();
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
        createElement(
          "small",
          { class: "library-pack-modal-help" },
          [
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
          ],
        ),
        searchInput,
        createElement("div", { class: "library-pack-modal-list-wrap" }, [listContainer]),
      ]),
    );

    renderListOnly();
    fetchPacks();
  };

  getHeaderScopeLabel = () => {
    if (this.viewMode === "packs") return "Packs";
    if (this.showAllImages) return "All Images";
    if (this.currentFolder) return this.currentFolder.title || "Folder";
    return "Unsorted";
  };

  getHeaderCountLabel = () => {
    if (this.viewMode === "packs") {
      const count = this.getPacksForCurrentFilter().length;
      return `${count} pack${count === 1 ? "" : "s"}`;
    }
    return this.total > 0 ? `${this.total} images` : "";
  };

  renderHeader = () => {
    const packsMode = this.viewMode === "packs";
    const title = packsMode
      ? `Packs · ${this.scopeName}`
      : `Image Library · ${this.scopeName}`;
    const selectBtn = createElement(
      "button",
      {
        class: "library-pack-action-btn",
        type: "button",
        title: "Toggle multi-select mode",
        ...(packsMode ? { style: "display:none" } : {}),
      },
      this.selectMode ? "Done Selecting" : "Select",
      {
        type: "click",
        event: () => this.toggleSelectMode(),
      },
    );

    const sortSelect = createElement(
      "select",
      {
        class: "library-sort-select",
        title: "Sort images",
        ...(packsMode ? { style: "display:none" } : {}),
      },
      [
        createElement("option", { value: "newest" }, "Newest"),
        createElement("option", { value: "name" }, "Name"),
        createElement("option", { value: "size" }, "Size"),
      ],
      {
        type: "change",
        event: (e) => {
          this.sortKey = e.target.value;
          if (this.showAllImages) {
            this.libraryApp.loadImages(true);
          } else {
            this.requestRender();
          }
        },
      },
    );
    sortSelect.value = this.sortKey;

    return createElement("div", { class: "library-header" }, [
      createElement("h1", {}, title),
      createElement("div", { class: "library-header-meta" }, [
        createElement("span", { class: "library-scope" }, this.getHeaderScopeLabel()),
        createElement("span", { class: "library-breadcrumb" }, this.getHeaderCountLabel()),
      ]),
      selectBtn,
      sortSelect,
    ]);
  };

  renderPacksSectionElement = () => {
    const q = this.packLibraryQuery.trim().toLowerCase();
    const basePacks =
      this.viewMode === "packs" ? this.getPacksForCurrentFilter() : this.getEditablePacks();
    const filteredPacks = q
      ? basePacks.filter((pack) => {
          const title = String(pack.title || "").toLowerCase();
          const desc = String(pack.description || "").toLowerCase();
          return title.includes(q) || desc.includes(q);
        })
      : basePacks;
    const visiblePacks =
      this.viewMode === "packs"
        ? filteredPacks
        : filteredPacks.slice(0, 6);
    const countLabel =
      this.viewMode === "packs"
        ? `${filteredPacks.length} pack${filteredPacks.length === 1 ? "" : "s"}`
        : `${this.packs.length} pack${this.packs.length === 1 ? "" : "s"}`;
    const cards =
      visiblePacks.length > 0
        ? visiblePacks.map((pack) =>
            createElement(
              "div",
              { class: "library-pack-card" },
              [
                createElement("div", { class: "library-pack-card-title" }, pack.title || "Untitled"),
                createElement(
                  "div",
                  { class: "library-pack-card-meta" },
                  `${this.getPackVisibilityLabel(pack)} • ${pack.image_count || 0} images`,
                ),
                createElement(
                  "small",
                  { class: "library-pack-tags" },
                  `Tags: ${this.formatPackTags(this.getPackTags(pack))}`,
                ),
                createElement("div", { class: "library-pack-card-badges" }, [
                  ...(this.isPackEditable(pack)
                    ? [createElement("span", { class: "library-pack-pill owned" }, "Owned")]
                    : []),
                  ...(this.isPackLockedForScope(pack)
                    ? [
                        createElement(
                          "span",
                          { class: "library-pack-pill locked" },
                          this.getPackLockLabel(pack),
                        ),
                      ]
                    : []),
                  ...(this.isPackInstalled(pack)
                    ? [createElement("span", { class: "library-pack-pill installed" }, "Installed")]
                    : [createElement("span", { class: "library-pack-pill shared" }, "Shared")]),
                ]),
              ],
              {
                type: "click",
                event: () => this.renderPackImagesModal(pack),
              },
            ),
          )
        : [
            createElement(
              "div",
              { class: "library-pack-empty" },
              this.viewMode === "packs"
                ? "No packs for this filter yet. Create or discover packs."
                : "No packs yet. Create your first pack.",
            ),
          ];

    return createElement("div", { class: "library-pack-section" }, [
      createElement("div", { class: "library-pack-section-header" }, [
        createElement("div", { class: "library-pack-section-title" }, "Library Packs"),
        createElement("div", { class: "library-pack-section-count" }, countLabel),
      ]),
      createElement("div", { class: "library-pack-explainer" }, [
        createElement("p", { class: "library-pack-explainer-line" }, "Packs are installable image bundles designed for publishing and sharing reusable resources."),
        createElement("p", { class: "library-pack-explainer-line" }, [
          "Use ",
          createElement("strong", {}, "Discover"),
          " to browse community-shared published packs, then preview and install them into this library.",
        ]),
      ]),
      ...(this.viewMode === "packs"
        ? [
            createElement("div", { class: "library-pack-filters" }, [
              createElement(
                "button",
                {
                  class: `library-pack-action-btn${this.packViewFilter === "all" ? " active" : ""}`,
                  type: "button",
                },
                "All",
                { type: "click", event: () => this.setPackViewFilter("all") },
              ),
              createElement(
                "button",
                {
                  class: `library-pack-action-btn${this.packViewFilter === "owned" ? " active" : ""}`,
                  type: "button",
                },
                "Owned",
                { type: "click", event: () => this.setPackViewFilter("owned") },
              ),
              createElement(
                "button",
                {
                  class: `library-pack-action-btn${this.packViewFilter === "installed" ? " active" : ""}`,
                  type: "button",
                },
                "Installed",
                { type: "click", event: () => this.setPackViewFilter("installed") },
              ),
            ]),
          ]
        : []),
      createElement("div", { class: "library-pack-actions" }, [
        createElement(
          "button",
          { class: "library-pack-action-btn", type: "button" },
          "Create Pack",
          { type: "click", event: () => this.renderCreatePackModal() },
        ),
        createElement(
          "button",
          { class: "library-pack-action-btn", type: "button" },
          "Discover",
          { type: "click", event: () => this.renderDiscoverPacksModal() },
        ),
        createElement(
          "a",
          {
            class: "library-pack-action-btn library-pack-action-link",
            href: "/library-guide",
            target: "_blank",
            rel: "noopener noreferrer",
          },
          "Guide",
        ),
      ]),
      createElement("div", { class: "library-pack-cards" }, cards),
    ]);
  };

  renderFolderTreeElement = () => {
    const folders = this.libraryApp.folders;
    const tree = buildFolderTree(folders);

    const unsortedCount =
      typeof this.unsortedCount === "number"
        ? this.unsortedCount
        : this.images.filter((img) => !img.folder_id).length;

    const allActive = this.showAllImages;
    const allItem = createElement(
      "div",
      {
        class:
          "library-folder-item" +
          (allActive ? " library-folder-item-active" : ""),
        style: "padding-left: 12px",
      },
      [
        createElement("span", { class: "library-folder-toggle" }, ""),
        createElement("span", {}, "All Images"),
        createElement(
          "span",
          { class: "library-folder-count" },
          (this.allImagesTotal ?? this.images.length) > 0
            ? `(${this.allImagesTotal ?? this.images.length})`
            : "",
        ),
      ],
      {
        type: "click",
        event: () => {
          this.showAllImages = true;
          this.currentFolder = null;
          this.libraryApp.currentFolder = null;
          this.requestRender();
          this.libraryApp.loadImages(true);
        },
      },
    );

    const unsortedActive = !this.showAllImages && !this.currentFolder;
    const unsortedItem = createElement(
      "div",
      {
        class:
          "library-folder-item" +
          (unsortedActive ? " library-folder-item-active" : ""),
        style: "padding-left: 12px",
      },
      [
        createElement("span", { class: "library-folder-toggle" }, ""),
        createElement("span", {}, "Unsorted"),
        createElement(
          "span",
          { class: "library-folder-count" },
          unsortedCount > 0 ? `(${unsortedCount})` : "",
        ),
      ],
      {
        type: "click",
        event: () => {
          this.showAllImages = false;
          this.currentFolder = null;
          this.libraryApp.currentFolder = null;
          this.requestRender();
          this.libraryApp.loadImagesForFolder(null);
        },
      },
    );

    const folderElems = [];
    for (const root of tree) {
      const items = this.renderFolderTreeItem(root, 0);
      for (const item of items) {
        folderElems.push(item);
      }
    }

    return createElement("div", { class: "library-folder-tree" }, [
      allItem,
      unsortedItem,
      ...folderElems,
    ]);
  };

  renderBulkToolbarElement = () => {
    if (this.viewMode === "packs" || !this.selectMode) {
      return createElement("div", {
        class: "library-bulk-toolbar",
        style: "display:none",
      });
    }

    const filteredImages = this.getFilteredImages();
    const selectedCount = this.selectedImageIds.size;
    const editablePacks = this.getEditablePacks();

    const packSelect = createElement(
      "select",
      {
        class: "library-sort-select",
        ...(editablePacks.length ? {} : { disabled: true }),
      },
      [
        createElement("option", { value: "" }, "Add to pack..."),
        ...editablePacks.map((pack) =>
          createElement("option", { value: String(pack.id) }, pack.title || `Pack ${pack.id}`),
        ),
      ],
    );

    const folderOptions = this.libraryApp.folders || [];
    const folderSelect = createElement(
      "select",
      { class: "library-sort-select" },
      [
        createElement("option", { value: "__unset__" }, "Move to folder..."),
        createElement("option", { value: "__unsorted__" }, "Unsorted"),
        ...folderOptions.map((folder) =>
          createElement(
            "option",
            { value: String(folder.id) },
            folder.title || `Folder ${folder.id}`,
          ),
        ),
      ],
    );

    const doBulkAddToPack = async () => {
      if (this.bulkBusy) return;
      const packId = packSelect.value;
      if (!packId) return;

      const imageIds = this.images
        .filter((img) => this.selectedImageIds.has(String(img.image_id)))
        .map((img) => img.image_id);
      if (!imageIds.length) {
        window.customAlertError("Select at least one image");
        return;
      }

      this.bulkBusy = true;
      this.requestRender();
      const result = await this.libraryApp.addImagesToPack(packId, imageIds);
      this.bulkBusy = false;
      await this.libraryApp.discoverPacks(this.packSearchQuery);
      this.requestRender();
      window.customAlert(`Added ${result.success}/${result.total} images to pack`);
    };

    const doBulkMoveFolder = async () => {
      if (this.bulkBusy) return;
      const value = folderSelect.value;
      if (!value || value === "__unset__") return;
      const folderId = value === "__unsorted__" ? null : Number(value);
      const tableImageIds = this.images
        .filter((img) => this.selectedImageIds.has(String(img.image_id)))
        .map((img) => img.id);
      if (!tableImageIds.length) {
        window.customAlertError("Select at least one image");
        return;
      }

      this.bulkBusy = true;
      this.requestRender();
      const result = await this.libraryApp.moveImagesToFolder(tableImageIds, folderId);
      this.bulkBusy = false;
      this.selectedImageIds.clear();
      await this.libraryApp.loadImageCounts();
      await this.libraryApp.refreshImagesForCurrentScope();
      this.requestRender();
      window.customAlert(`Moved ${result.success}/${result.total} images`);
    };

    const doBulkDelete = async () => {
      if (this.bulkBusy) return;
      const imageIds = this.images
        .filter((img) => this.selectedImageIds.has(String(img.image_id)))
        .map((img) => img.image_id);
      if (!imageIds.length) {
        window.customAlertError("Select at least one image");
        return;
      }

      const confirmed = await window.customConfirm(
        `Delete ${imageIds.length} selected image${imageIds.length === 1 ? "" : "s"}?`,
        { confirmText: "Delete", danger: true },
      );
      if (!confirmed) return;

      this.bulkBusy = true;
      this.requestRender();
      const result = await this.libraryApp.removeImages(imageIds);
      this.bulkBusy = false;
      this.selectedImageIds.clear();
      await this.libraryApp.loadImageCounts();
      await this.libraryApp.refreshImagesForCurrentScope();
      this.requestRender();
      window.customAlert(`Deleted ${result.success}/${result.total} images`);
    };

    return createElement("div", { class: "library-bulk-toolbar visible" }, [
      createElement("div", { class: "library-bulk-summary" }, `${selectedCount} selected`),
      createElement(
        "button",
        {
          class: "library-pack-action-btn",
          type: "button",
          ...(this.bulkBusy ? { disabled: true } : {}),
        },
        `Select All Filtered (${filteredImages.length})`,
        {
          type: "click",
          event: () => {
            filteredImages.forEach((img) =>
              this.selectedImageIds.add(String(img.image_id)),
            );
            this.requestRender();
          },
        },
      ),
      createElement(
        "button",
        {
          class: "library-pack-action-btn",
          type: "button",
          ...(this.bulkBusy ? { disabled: true } : {}),
        },
        "Clear",
        { type: "click", event: () => this.clearSelection() },
      ),
      packSelect,
      createElement(
        "button",
        {
          class: "library-pack-action-btn",
          type: "button",
          ...(!selectedCount || this.bulkBusy ? { disabled: true } : {}),
        },
        "Apply",
        { type: "click", event: doBulkAddToPack },
      ),
      folderSelect,
      createElement(
        "button",
        {
          class: "library-pack-action-btn",
          type: "button",
          ...(!selectedCount || this.bulkBusy ? { disabled: true } : {}),
        },
        "Move",
        { type: "click", event: doBulkMoveFolder },
      ),
      createElement(
        "button",
        {
          class: "library-pack-action-btn danger",
          type: "button",
          ...(!selectedCount || this.bulkBusy ? { disabled: true } : {}),
        },
        "Delete Selected",
        { type: "click", event: doBulkDelete },
      ),
    ]);
  };

  deleteImage = async (image) => {
    const confirmed = await window.customConfirm(
      `Are you sure you want to delete "${image.original_name}"?`,
      { confirmText: "Delete", danger: true },
    );
    if (!confirmed) return;

    const ok = await this.libraryApp.removeImageById(image.image_id);
    if (!ok) {
      window.customAlertError("Could not delete image");
      return;
    }
    this.selectedImageIds.delete(String(image.image_id));
    modal.hide();
    await this.libraryApp.loadImageCounts();
    await this.libraryApp.refreshImagesForCurrentScope();
  };

  renderImageDetailModal = async (image) => {
    const editablePacks = this.getEditablePacks();
    const imageId = String(image.image_id ?? image.id);
    const currentPackMemberships = await this.libraryApp.getImagePackMemberships(imageId);

    return await renderImageSettingsModal({
      image,
      projectId: this.projectId,
      tableImageId: image.id,
      onDelete: () => this.deleteImage(image),
      onUpdate: () => this.requestRender(),
      onPackUpdate: async () => {
        this.requestRender();
        modal.show(await this.renderImageDetailModal(image));
      },
      packOptions: editablePacks,
      currentPackMemberships,
      onAddToPack: async (packId, targetImageId) => {
        const result = await this.libraryApp.addImageToPack(packId, targetImageId);
        if (!result) return false;
        window.customAlert("Image added to pack");
        await this.libraryApp.discoverPacks(this.packSearchQuery);
        return true;
      },
      onRemoveFromPack: async (packImageId) => {
        const ok = await this.libraryApp.removeImageFromPack(packImageId);
        if (!ok) {
          window.customAlertError("Could not remove image from pack");
          return false;
        }
        window.customAlert("Image removed from pack");
        await this.libraryApp.discoverPacks(this.packSearchQuery);
        return true;
      },
    });
  };

  renderCard = (image, index) => {
    const isSelected = this.isImageSelected(image);
    const thumbElem = image.src
      ? createElement("img", {
          class: "library-card-thumb",
          src: image.src,
          alt: image.original_name,
          loading: "lazy",
        })
      : createElement("div", { class: "library-card-thumb" });

    const info = createElement("div", { class: "library-card-info" }, [
      createElement("div", { class: "library-card-name" }, image.original_name),
      createElement(
        "div",
        { class: "library-card-size" },
        this.formatFileSize(image.size),
      ),
    ]);

    const card = createElement(
      "div",
      { class: `library-card${isSelected ? " library-card-selected" : ""}` },
      [thumbElem, info],
      {
        type: "click",
        event: async () => {
          if (this.selectMode) {
            this.toggleImageSelection(image);
            return;
          }
          modal.show(await this.renderImageDetailModal(image));
        },
      },
    );

    if (this.selectMode) {
      const checkbox = createElement("input", {
        type: "checkbox",
        class: "library-card-checkbox",
        ...(isSelected ? { checked: true } : {}),
      });
      checkbox.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleImageSelection(image);
      });
      card.append(checkbox);
    }

    card.style.setProperty("--card-index", Math.min(index, 20));

    return card;
  };

  renderGridElement = () => {
    if (this.loading) {
      const skeletons = [];
      const skeletonCount = 12;
      for (let i = 0; i < skeletonCount; i += 1) {
        skeletons.push(
          createElement(
            "div",
            { class: "library-card library-skeleton" },
            [
              createElement("div", {
                class: "library-card-thumb library-skeleton-thumb",
              }),
              createElement("div", { class: "library-card-info" }, [
                createElement("div", { class: "library-skeleton-line" }),
                createElement("div", { class: "library-skeleton-line short" }),
              ]),
            ],
          ),
        );
      }
      return createElement("div", { class: "library-grid" }, skeletons);
    }

    const filtered = this.getFilteredImages();
    if (!filtered.length) {
      return createElement("div", { class: "library-grid" }, [
        createElement(
          "div",
          { class: "library-empty" },
          this.images.length
            ? "No images match your search or folder."
            : "No images yet. Upload some images to get started!",
        ),
      ]);
    }

    const cards = filtered.map((image, index) => this.renderCard(image, index));
    if (this.showAllImages && this.images.length < this.total) {
      cards.push(
        createElement("div", { class: "library-load-more" }, [
          createElement(
            "button",
            { class: "library-load-more-btn" },
            `Load More (${this.images.length} of ${this.total})`,
            {
              type: "click",
              event: () => this.libraryApp.loadMore(),
            },
          ),
        ]),
      );
    }

    return createElement("div", { class: "library-grid" }, cards);
  };

  render = () => {
    while (this.domComponent.firstChild) {
      this.domComponent.removeChild(this.domComponent.firstChild);
    }

    const packsMode = this.viewMode === "packs";
    this.domComponent.append(this.renderHeader());

    if (packsMode) {
      this.domComponent.append(this.renderPacksSectionElement());
      return;
    }

    this.domComponent.append(
      this.renderBulkToolbarElement(),
      this.renderFolderTreeElement(),
      this.renderGridElement(),
    );
  };
}
