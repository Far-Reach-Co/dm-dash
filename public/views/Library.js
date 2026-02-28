import createElement from "../components/createElement.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import { loadFrontendAuthState } from "../lib/frontendAuthState.js";
import LibrarySidebar from "../components/library/LibrarySidebar.js";
import LibraryGrid from "../components/library/LibraryGrid.js";

class Library {
  constructor() {
    this.domComponent = document.getElementById("app");
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

    this.init();
  }

  getFoldersEndpoint = () => {
    return this.projectId
      ? `/api/get_table_folders_by_project/${this.projectId}`
      : "/api/get_table_folders_by_user";
  };

  loadFolders = async () => {
    const data = await getThings(this.getFoldersEndpoint());
    this.folders = data || [];
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

    const data = await getThings(this.getImagesEndpoint(50, 0));
    if (data) {
      this.grid.setImages(data);
    } else {
      this.grid.hideLoading();
    }
  };

  loadImagesForFolder = async (folderId) => {
    this.grid.showLoading();
    const data = await getThings(this.getFolderImagesEndpoint(folderId));
    if (data) {
      this.grid.setImages(data);
    } else {
      this.grid.hideLoading();
    }
  };

  loadImageCounts = async () => {
    const data = await getThings(this.getImageCountsEndpoint());
    if (data && this.grid) {
      this.grid.setCounts(data);
    }
  };

  loadMore = async () => {
    const nextOffset = this.grid.images.length;
    const data = await getThings(this.getImagesEndpoint(50, nextOffset));
    if (data) {
      this.grid.appendImages(data);
    }
  };

  getCreatePackEndpoint = () => {
    return this.projectId
      ? `/api/add_library_pack_by_project/${this.projectId}`
      : "/api/add_library_pack_by_user";
  };

  createPack = async (payload) => {
    return await postThing(this.getCreatePackEndpoint(), payload);
  };

  editPack = async (packId, payload) => {
    return await postThing(`/api/edit_library_pack/${packId}`, payload);
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
    const data = await getThings(
      this.getDiscoverPacksEndpoint(query, 100, 0, options),
    );
    this.packs = Array.isArray(data) ? data : [];
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
    const data = await getThings(this.getInstalledPacksEndpoint());
    const installed = Array.isArray(data) ? data : [];
    if (this.grid) {
      this.grid.setInstalledPacks(installed);
    }
    return installed;
  };

  installPack = async (packId) => {
    if (this.projectId) {
      return await postThing(
        `/api/install_library_pack_by_project/${this.projectId}/${packId}`,
        {},
      );
    }
    return await postThing(`/api/install_library_pack_by_user/${packId}`, {});
  };

  uninstallPack = async (packId) => {
    try {
      const endpoint = this.projectId
        ? `/api/uninstall_library_pack_by_project/${this.projectId}/${packId}`
        : `/api/uninstall_library_pack_by_user/${packId}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      return res.status === 200;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  removePack = async (packId) => {
    try {
      const res = await fetch(`/api/remove_library_pack/${packId}`, {
        method: "DELETE",
      });
      return res.status === 200;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  getPackImages = async (packId) => {
    const params = new URLSearchParams();
    if (this.projectId) {
      params.set("project_id", String(this.projectId));
    }
    const endpoint = `/api/get_library_pack_images/${packId}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const data = await getThings(endpoint);
    return Array.isArray(data) ? data : [];
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
    const data = await getThings(endpoint);
    return Array.isArray(data) ? data : [];
  };

  addImageToPack = async (packId, imageId, options = {}) => {
    const payload = {
      pack_id: packId,
      image_id: imageId,
    };
    if (typeof options.sort_order === "number") {
      payload.sort_order = options.sort_order;
    }
    return await postThing("/api/add_library_pack_image", payload);
  };

  removeImageFromPack = async (packImageId) => {
    try {
      const res = await fetch(`/api/remove_library_pack_image/${packImageId}`, {
        method: "DELETE",
      });
      return res.status === 200;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  getRemoveImageEndpoint = (imageId) => {
    return this.projectId
      ? `/api/remove_image_by_project/${imageId}/${this.projectId}`
      : `/api/remove_image_by_user/${imageId}`;
  };

  removeImageById = async (imageId) => {
    try {
      const res = await fetch(this.getRemoveImageEndpoint(imageId), {
        method: "DELETE",
      });
      return res.status === 204;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  setImageFolder = async (tableImageId, folderId) => {
    const payload = {
      folder_id: folderId === null ? 0 : folderId,
    };
    const res = await postThing(`/api/edit_table_image/${tableImageId}`, payload);
    return !!res;
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

    this.sidebar = new LibrarySidebar({
      domComponent: createElement("div"),
      libraryApp: this,
      projectId: this.projectId,
      activeTab: this.currentSidebarTab,
      canUseLibraryPacks: this.canUseLibraryPacks,
    });

    this.grid = new LibraryGrid({
      domComponent: createElement("div"),
      libraryApp: this,
      projectId: this.projectId,
      viewMode: this.currentSidebarTab,
      canUseLibraryPacks: this.canUseLibraryPacks,
      scopeName: this.scopeName,
      scopeType: this.scopeType,
    });

    this.render();
    await this.sidebar.render();
    this.grid.render();
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

  render = () => {
    // Clear children safely using DOM API
    while (this.domComponent.firstChild) {
      this.domComponent.removeChild(this.domComponent.firstChild);
    }

    const layout = createElement("div", { class: "library-layout" }, [
      this.sidebar.domComponent,
      this.grid.domComponent,
    ]);

    this.domComponent.append(layout);
  };
}

const libraryApp = new Library();
export default libraryApp;
