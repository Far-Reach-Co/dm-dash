import createElement from "../lib/salt-lib/createElement.js";
import { apiDelete, apiGet, apiPost } from "../lib/apiUtils.js";
import { handleApiFailure } from "../lib/apiUiFeedback.js";
import { loadFrontendAuthState } from "../lib/frontendAuthState.js";
import LibrarySidebar from "../components/library/LibrarySidebar.js";
import LibraryGrid from "../components/library/LibraryGrid.js";
import Component from "../lib/salt-lib/Component.js";

class Library extends Component {
  constructor() {
    super({
      domElem: document.getElementById("app"),
    });
    this.sidebar = null;
    this.grid = null;
    this.folders = [];
    this.currentFolder = null;
    this.packs = [];
    this.currentSidebarTab = "images";

    const searchParams = new URLSearchParams(window.location.search);
    this.requestedProjectId = searchParams.get("wyrld");
    this.projectId = this.requestedProjectId || null;
    this.canUseLibraryPacks = false;
    this.scopeName = this.projectId ? "Wyrld Library" : "My Library";
    this.scopeType = this.projectId ? "project" : "user";
  }

  ensureSidebar = () => {
    const sidebar = this.useChild(
      "library-sidebar",
      () =>
        new LibrarySidebar({
          domElem: createElement("div"),
          libraryApp: this,
          projectId: this.projectId,
          activeTab: this.currentSidebarTab,
          canUseLibraryPacks: this.canUseLibraryPacks,
        }),
      (child) => {
        child.libraryApp = this;
        child.projectId = this.projectId;
        child.activeTab = this.currentSidebarTab;
        child.canUseLibraryPacks = this.canUseLibraryPacks;
      },
    );

    this.sidebar = sidebar;
    return sidebar;
  };

  ensureGrid = () => {
    const grid = this.useChild(
      "library-grid",
      () =>
        new LibraryGrid({
          domElem: createElement("div"),
          libraryApp: this,
          projectId: this.projectId,
          viewMode: this.currentSidebarTab,
          canUseLibraryPacks: this.canUseLibraryPacks,
          scopeName: this.scopeName,
          scopeType: this.scopeType,
        }),
      (child) => {
        child.libraryApp = this;
        child.projectId = this.projectId;
        child.viewMode = this.currentSidebarTab;
        child.canUseLibraryPacks = this.canUseLibraryPacks;
        child.scopeName = this.scopeName;
        child.scopeType = this.scopeType;
      },
    );

    this.grid = grid;
    return grid;
  };

  getFoldersEndpoint = () => {
    return this.projectId
      ? `/api/get_table_folders_by_project/${this.projectId}`
      : "/api/get_table_folders_by_user";
  };

  loadFolders = async () => {
    const result = await apiGet(this.getFoldersEndpoint());
    this.folders = result.ok && Array.isArray(result.data) ? result.data : [];
    // Reconcile current folder with fresh data (handles deleted/moved folders)
    if (this.currentFolder) {
      const fresh = this.folders.find((f) => f.id == this.currentFolder.id);
      this.currentFolder = fresh || null;
      if (this.grid) {
        this.grid.currentFolder = this.currentFolder;
      }
    }
    if (this.grid) {
      this.grid.pruneExpandedFolderIds(this.folders);
      this.grid.render();
    }
  };

  setCurrentFolder = (folder) => {
    this.currentFolder = folder;
    if (this.grid) {
      this.grid.filterByFolder(folder);
    }
  };

  setSidebarTab = (tab) => {
    this.currentSidebarTab =
      tab === "packs" && this.canUseLibraryPacks ? "packs" : "images";
    if (this.currentSidebarTab === "packs") {
      this.discoverPacks(this.grid?.packLibraryQuery || "");
      this.loadInstalledPacks();
    }
    if (this.grid) {
      this.grid.setViewMode(this.currentSidebarTab);
    }
    if (this.sidebar) {
      this.sidebar.setActiveTab(this.currentSidebarTab);
    }
  };

  getImagesEndpoint = (limit, offset) => {
    const base = this.projectId
      ? `/api/get_library_images_by_project/${this.projectId}`
      : "/api/get_library_images_by_user";
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("offset", String(offset));
    if (this.grid?.searchQuery) {
      params.set("q", this.grid.searchQuery);
    }
    if (this.grid?.sortKey) {
      params.set("sort", this.grid.sortKey);
    }
    return `${base}?${params.toString()}`;
  };

  getFolderImagesEndpoint = (folderId) => {
    const folderPart = folderId === null ? "unsorted" : folderId;
    return this.projectId
      ? `/api/get_library_images_by_project_in_folder/${this.projectId}/${folderPart}`
      : `/api/get_library_images_by_user_in_folder/${folderPart}`;
  };

  getImageCountsEndpoint = () => {
    return this.projectId
      ? `/api/get_library_image_counts_by_project/${this.projectId}`
      : "/api/get_library_image_counts_by_user";
  };

  loadImages = async (reset = false) => {
    if (reset) {
      this.grid.showLoading();
    }

    const result = await apiGet(this.getImagesEndpoint(50, 0));
    if (result.ok && result.data) {
      this.grid.setImages(result.data);
    } else {
      this.grid.hideLoading();
    }
  };

  loadImagesForFolder = async (folderId) => {
    this.grid.showLoading();
    const result = await apiGet(this.getFolderImagesEndpoint(folderId));
    if (result.ok && result.data) {
      this.grid.setImages(result.data);
    } else {
      this.grid.hideLoading();
    }
  };

  loadImageCounts = async () => {
    const result = await apiGet(this.getImageCountsEndpoint());
    if (result.ok && result.data && this.grid) {
      this.grid.setCounts(result.data);
    }
  };

  loadMore = async () => {
    const nextOffset = this.grid.images.length;
    const result = await apiGet(this.getImagesEndpoint(50, nextOffset));
    if (result.ok && result.data) {
      this.grid.appendImages(result.data);
    }
  };

  getCreatePackEndpoint = () => {
    return this.projectId
      ? `/api/add_library_pack_by_project/${this.projectId}`
      : "/api/add_library_pack_by_user";
  };

  createPack = async (payload) => {
    const result = await apiPost(this.getCreatePackEndpoint(), payload);
    if (!result.ok) {
      handleApiFailure(result, { includeResultMessage: true });
      return null;
    }
    return result.ok ? result.data : null;
  };

  editPack = async (packId, payload) => {
    const result = await apiPost(`/api/edit_library_pack/${packId}`, payload);
    if (!result.ok) {
      handleApiFailure(result, { includeResultMessage: true });
      return null;
    }
    return result.ok ? result.data : null;
  };

  getDiscoverPacksEndpoint = (
    query = "",
    limit = 50,
    offset = 0,
    options = {},
  ) => {
    const { publishedOnly = false } = options || {};
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("offset", String(offset));
    if (publishedOnly) {
      params.set("published", "true");
    }
    if (this.projectId) {
      params.set("project_id", String(this.projectId));
    }
    if (query.trim()) {
      params.set("q", query.trim());
    }
    return `/api/discover_library_packs?${params.toString()}`;
  };

  discoverPacks = async (query = "", options = {}) => {
    if (!this.canUseLibraryPacks) {
      this.packs = [];
      if (this.grid) {
        this.grid.setPacks([]);
      }
      return [];
    }
    const result = await apiGet(
      this.getDiscoverPacksEndpoint(query, 100, 0, options),
    );
    this.packs = result.ok && Array.isArray(result.data) ? result.data : [];
    if (this.grid) {
      this.grid.setPacks(this.packs);
    }
    return this.packs;
  };

  getInstalledPacksEndpoint = () => {
    return this.projectId
      ? `/api/get_installed_library_packs_by_project/${this.projectId}`
      : "/api/get_installed_library_packs_by_user";
  };

  loadInstalledPacks = async () => {
    if (!this.canUseLibraryPacks) {
      if (this.grid) {
        this.grid.setInstalledPacks([]);
      }
      return [];
    }
    const result = await apiGet(this.getInstalledPacksEndpoint());
    const installed =
      result.ok && Array.isArray(result.data) ? result.data : [];
    if (this.grid) {
      this.grid.setInstalledPacks(installed);
    }
    return installed;
  };

  installPack = async (packId) => {
    if (this.projectId) {
      const result = await apiPost(
        `/api/install_library_pack_by_project/${this.projectId}/${packId}`,
        {},
      );
      if (!result.ok) {
        handleApiFailure(result, { includeResultMessage: true });
        return null;
      }
      return result.ok ? result.data : null;
    }
    const result = await apiPost(`/api/install_library_pack_by_user/${packId}`, {});
    if (!result.ok) {
      handleApiFailure(result, { includeResultMessage: true });
      return null;
    }
    return result.ok ? result.data : null;
  };

  uninstallPack = async (packId) => {
    const endpoint = this.projectId
      ? `/api/uninstall_library_pack_by_project/${this.projectId}/${packId}`
      : `/api/uninstall_library_pack_by_user/${packId}`;
    const result = await apiDelete(endpoint);
    if (!result.ok) {
      handleApiFailure(result, { includeResultMessage: true });
      return false;
    }
    return result.ok && result.status === 200;
  };

  removePack = async (packId) => {
    const result = await apiDelete(`/api/remove_library_pack/${packId}`);
    if (!result.ok) {
      handleApiFailure(result, { includeResultMessage: true });
      return false;
    }
    return result.ok && result.status === 200;
  };

  getPackImages = async (packId) => {
    const params = new URLSearchParams();
    if (this.projectId) {
      params.set("project_id", String(this.projectId));
    }
    const endpoint = `/api/get_library_pack_images/${packId}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const result = await apiGet(endpoint);
    return result.ok && Array.isArray(result.data) ? result.data : [];
  };

  getImagePackMemberships = async (imageId) => {
    const params = new URLSearchParams();
    if (this.projectId) {
      params.set("project_id", String(this.projectId));
    }
    const qs = params.toString();
    const endpoint = `/api/get_library_pack_memberships_by_image/${imageId}${
      qs ? `?${qs}` : ""
    }`;
    const result = await apiGet(endpoint);
    return result.ok && Array.isArray(result.data) ? result.data : [];
  };

  addImageToPack = async (packId, imageId, options = {}) => {
    const payload = {
      pack_id: packId,
      image_id: imageId,
    };
    if (typeof options.sort_order === "number") {
      payload.sort_order = options.sort_order;
    }
    const result = await apiPost("/api/add_library_pack_image", payload);
    return result.ok ? result.data : null;
  };

  removeImageFromPack = async (packImageId) => {
    const result = await apiDelete(`/api/remove_library_pack_image/${packImageId}`);
    if (!result.ok) {
      handleApiFailure(result, { includeResultMessage: true });
      return false;
    }
    return result.ok && result.status === 200;
  };

  getRemoveImageEndpoint = (imageId) => {
    return this.projectId
      ? `/api/remove_image_by_project/${imageId}/${this.projectId}`
      : `/api/remove_image_by_user/${imageId}`;
  };

  removeImageById = async (imageId) => {
    const result = await apiDelete(this.getRemoveImageEndpoint(imageId));
    return result.ok && result.status === 204;
  };

  setImageFolder = async (tableImageId, folderId) => {
    const payload = {
      folder_id: folderId === null ? 0 : folderId,
    };
    const result = await apiPost(`/api/edit_table_image/${tableImageId}`, payload);
    return result.ok;
  };

  addImagesToPack = async (packId, imageIds) => {
    const results = await Promise.all(
      imageIds.map((imageId) => this.addImageToPack(packId, imageId)),
    );
    return {
      success: results.filter(Boolean).length,
      total: imageIds.length,
    };
  };

  moveImagesToFolder = async (tableImageIds, folderId) => {
    const results = await Promise.all(
      tableImageIds.map((tableImageId) => this.setImageFolder(tableImageId, folderId)),
    );
    return {
      success: results.filter(Boolean).length,
      total: tableImageIds.length,
    };
  };

  removeImages = async (imageIds) => {
    const results = await Promise.all(
      imageIds.map((imageId) => this.removeImageById(imageId)),
    );
    return {
      success: results.filter(Boolean).length,
      total: imageIds.length,
    };
  };

  refreshImagesForCurrentScope = async () => {
    if (this.grid.showAllImages) {
      await this.loadImages(true);
      await this.loadImageCounts();
      return;
    }
    if (this.currentFolder) {
      await this.loadImagesForFolder(this.currentFolder.id);
      await this.loadImageCounts();
      return;
    }
    await this.loadImagesForFolder(null);
    await this.loadImageCounts();
  };

  init = async () => {
    const authState = await loadFrontendAuthState({
      projectId: this.requestedProjectId,
    });
    this.projectId = authState.projectId || this.requestedProjectId || null;
    this.canUseLibraryPacks = !!authState.canUseLibraryPacks;
    this.scopeName =
      authState.scopeName ||
      (this.projectId ? "Wyrld Library" : "My Library");
    this.scopeType =
      authState.scopeType || (this.projectId ? "project" : "user");
    document.title = `Image Library · ${this.scopeName} | Far Reach Co.`;

    this.ensureSidebar();
    this.ensureGrid();
    await this.render();
    await this.loadFolders();
    await this.loadImages();
    await this.loadImageCounts();
    if (this.canUseLibraryPacks) {
      await this.discoverPacks();
      await this.loadInstalledPacks();
    } else {
      this.packs = [];
      this.grid.setPacks([]);
      this.grid.setInstalledPacks([]);
    }
  };

  render = async () => {
    const sidebar = this.ensureSidebar();
    const grid = this.ensureGrid();

    await sidebar.render();
    await grid.render();

    const layout = createElement("div", { class: "library-layout" }, [
      sidebar.domElem,
      grid.domElem,
    ]);

    return [layout];
  };
}

const libraryApp = new Library();
export default libraryApp;
