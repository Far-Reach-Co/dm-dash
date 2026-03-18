import {
  formatPackTags as formatPackTagsShared,
  getPackLockLabel as getPackLockLabelShared,
  getPackLockMessage as getPackLockMessageShared,
  getPackTags as getPackTagsShared,
  getPackVisibilityLabel as getPackVisibilityLabelShared,
  isPackLockedForScope as isPackLockedForScopeShared,
  isPackOwnedByScope,
} from "../shared/libraryPackUtils.js";
import Component from "../../lib/salt-lib/Component.js";
import LibraryGridActionController, {
  bindLibraryGridActionMethods,
} from "./libraryGridActionController.js";
import {
  renderLibraryGridBulkToolbar,
  renderLibraryGridFolderTree,
  renderLibraryGridHeader,
  renderLibraryGridImageCards,
  renderLibraryGridPacksSection,
} from "./libraryGridRenderers.js";

export default class LibraryGrid extends Component {
  constructor(props) {
    super({
      domElem: props.domElem,
      autoInit: false,
      autoRender: false,
    });
    this.domElem.className = "library-content";
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
    this.actionController = new LibraryGridActionController(this);
    bindLibraryGridActionMethods(this, this.actionController);
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
    return this.useMemo(
      "library-grid-filtered-images",
      () => {
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
      },
      () => [
        this.images,
        this.showAllImages,
        this.currentFolder?.id ?? null,
        this.searchQuery,
        this.sortKey,
      ],
    );
  };

  getEditablePacks = () => {
    return this.useMemo(
      "library-grid-editable-packs",
      () => this.packs.filter((pack) => this.isPackOwnedByCurrentScope(pack)),
      () => [this.packs, this.projectId],
    );
  };

  isPackOwnedByCurrentScope = (pack) => {
    return isPackOwnedByScope(pack, { projectId: this.projectId });
  };

  getPacksForPacksView = () => {
    const editablePacks = this.getEditablePacks();
    return this.useMemo(
      "library-grid-packs-view-deduped",
      () => {
        const merged = [...editablePacks, ...this.installedPacks];
        const seen = new Set();
        const deduped = [];
        for (const pack of merged) {
          const key = String(pack.id);
          if (seen.has(key)) continue;
          seen.add(key);
          deduped.push(pack);
        }
        return deduped;
      },
      () => [editablePacks, this.installedPacks],
    );
  };

  getPacksForCurrentFilter = () => {
    const dedupedPacks = this.getPacksForPacksView();
    return this.useMemo(
      "library-grid-filtered-pack-view",
      () => {
        if (this.packViewFilter === "owned") {
          return dedupedPacks.filter((pack) => this.isPackEditable(pack));
        }
        if (this.packViewFilter === "installed") {
          return dedupedPacks.filter((pack) => this.isPackInstalled(pack));
        }
        return dedupedPacks;
      },
      () => [dedupedPacks, this.packViewFilter, this.installedPacks, this.projectId],
    );
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

  countImagesInFolder = (folderId) => {
    const key = String(folderId);
    if (Object.prototype.hasOwnProperty.call(this.imageCountsByFolder, key)) {
      return this.imageCountsByFolder[key];
    }
    return this.images.filter(
      (img) => img.folder_id && img.folder_id == folderId,
    ).length;
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

  render = () => {
    const packsMode = this.viewMode === "packs";
    if (packsMode) {
      return [renderLibraryGridHeader(this), renderLibraryGridPacksSection(this)];
    }

    return [
      renderLibraryGridHeader(this),
      renderLibraryGridBulkToolbar(this),
      renderLibraryGridFolderTree(this),
      renderLibraryGridImageCards(this),
    ];
  };
}
