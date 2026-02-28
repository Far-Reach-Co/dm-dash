import createElement from "../createElement.js";
import modal from "../modal.js";
import renderImageSettingsModal from "../shared/imageSettingsModal.js";
import { apiDelete } from "../../lib/apiUtils.js";
import { buildFolderTree } from "../shared/folderTreeUtils.js";
import { renderLibraryBulkToolbar } from "./LibraryBulkToolbar.js";
import { renderLibraryPackList } from "./LibraryPackList.js";
import {
  normalizePackTagsInput as normalizePackTagsInputFromModal,
  openCreatePackModal,
  openDiscoverPacksModal,
  openEditPackModal,
  openPackImagesModal,
} from "./LibraryPackModal.js";
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
    return normalizePackTagsInputFromModal(raw);
  };

  renderEditPackModal = (pack) => {
    openEditPackModal(this, pack);
  };

  renderPackImagesModal = async (pack) => {
    await openPackImagesModal(this, pack);
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
    openCreatePackModal(this);
  };

  renderDiscoverPacksModal = () => {
    openDiscoverPacksModal(this);
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
    return renderLibraryPackList(this);
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
    return renderLibraryBulkToolbar(this);
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
