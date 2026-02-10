import createElement from "../components/createElement.js";
import { getThings } from "../lib/apiUtils.js";
import LibrarySidebar from "../components/library/LibrarySidebar.js";
import LibraryGrid from "../components/library/LibraryGrid.js";

class Library {
  constructor() {
    this.domComponent = document.getElementById("app");
    this.sidebar = null;
    this.grid = null;
    this.folders = [];
    this.currentFolder = null;

    const searchParams = new URLSearchParams(window.location.search);
    this.projectId =
      searchParams.get("wyrld") ||
      (typeof PROJECTID !== "undefined" ? PROJECTID : null);

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
      this.grid.renderFolderTree();
    }
  };

  setCurrentFolder = (folder) => {
    this.currentFolder = folder;
    if (this.grid) {
      this.grid.filterByFolder(folder);
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
    this.sidebar = new LibrarySidebar({
      domComponent: createElement("div"),
      libraryApp: this,
      projectId: this.projectId,
    });

    this.grid = new LibraryGrid({
      domComponent: createElement("div"),
      libraryApp: this,
      projectId: this.projectId,
    });

    this.render();
    await this.sidebar.render();
    this.grid.render();
    await this.loadFolders();
    await this.loadImages();
    await this.loadImageCounts();
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
