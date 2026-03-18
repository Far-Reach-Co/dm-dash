import createElement from "../lib/salt-lib/createElement.js";
import { loadFrontendAuthState } from "../lib/frontendAuthState.js";
import LibrarySidebar from "../components/library/LibrarySidebar.js";
import LibraryGrid from "../components/library/LibraryGrid.js";
import Component from "../lib/salt-lib/Component.js";
import LibraryDataController, {
  bindLibraryDataMethods,
} from "./library/dataController.js";

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
    this.dataController = new LibraryDataController(this);
    bindLibraryDataMethods(this, this.dataController);
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
