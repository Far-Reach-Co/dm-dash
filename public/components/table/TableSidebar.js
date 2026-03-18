import createElement from "../../lib/salt-lib/createElement.js";
import Component from "../../lib/salt-lib/Component.js";
import TableSidebarImageComponent from "./TableSidebarImageComponent.js";
import { copyTextToClipboard } from "../../lib/clipboard.js";
import modal from "../modal.js";
import TableSidebarFolderComponent from "./TableSidebarFolderComponent.js";
import { getCurrentProjectId } from "./tableApi.js";
import TableSidebarController, {
  bindTableSidebarControllerMethods,
} from "./tableSidebarController.js";
import TableSidebarPackPanel from "./tableSidebarPackPanel.js";
import { createSvgIconFactoryMap } from "../svgIcon.js";

const SIDEBAR_ICON_MARKUP = {
  close: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  settings: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  link: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
};

const SIDEBAR_ICONS = createSvgIconFactoryMap(SIDEBAR_ICON_MARKUP);

export default class TableSidebar extends Component {
  constructor(props = {}) {
    super({
      domElem: props.domElem || createElement("div"),
      autoRender: false,
      className: "sidebar",
    });

    this.tableView = props.tableView;
    this.isVisible = false;
    this.tableApp = props.tableApp;
    this.capabilities = this.tableApp?.capabilities || {};

    this.makeImageSmall = false;
    this.activeTab = "images";
    this.uploadState = {
      items: [],
      running: false,
      cancelling: false,
      activeController: null,
    };
    this.tableSidebarFolderComponent = null;
    this.tableSidebarImageComponent = null;
    this.packPanel = null;
    this.controller = new TableSidebarController(this);
    bindTableSidebarControllerMethods(this, this.controller);

    this.ensureChildComponents();
  }

  get projectId() {
    return this.tableView?.project_id || getCurrentProjectId();
  }

  get isSandboxMode() {
    return (
      this.tableView?.mode === "sandbox" || !!this.tableView?.is_guest_sandbox
    );
  }

  can = (capability) => {
    return !!this.capabilities?.[capability];
  };

  canUseLibraryPacks = () => {
    return this.can("canUseLibraryPacks");
  };

  createFolderComponent = () => {
    return new TableSidebarFolderComponent({
      domElem: createElement("div"),
      tableView: this.tableView,
      capabilities: this.capabilities,
    });
  };

  createImageComponent = () => {
    return new TableSidebarImageComponent({
      domElem: createElement("div"),
      tableView: this.tableView,
      tableApp: this.tableApp,
      getCurrentFolder: () => {
        return this.tableSidebarFolderComponent?.currentFolder || null;
      },
      getFolderScope: () => {
        return (
          this.tableSidebarFolderComponent?.getScope?.() || {
            showAllImages: false,
            currentFolder: null,
          }
        );
      },
      onCountsUpdated: (data) =>
        this.tableSidebarFolderComponent?.setCounts?.(data),
      capabilities: this.capabilities,
    });
  };

  createPackPanel = () => {
    return new TableSidebarPackPanel({
      domElem: createElement("div"),
      getProjectId: () => this.projectId,
      getIsSandboxMode: () => this.isSandboxMode,
      can: this.can,
      canUseLibraryPacks: this.canUseLibraryPacks,
      tableSidebarImageComponent: this.tableSidebarImageComponent,
    });
  };

  ensureChildComponents = () => {
    const folderComponent = this.useChild(
      "table-sidebar-folder-component",
      this.createFolderComponent,
    );
    const imageComponent = this.useChild(
      "table-sidebar-image-component",
      this.createImageComponent,
    );
    const packPanel = this.useChild(
      "table-sidebar-pack-panel",
      this.createPackPanel,
      (child) => {
        child.tableSidebarImageComponent = imageComponent;
      },
    );

    // Keep folder actions wired to image list refreshers.
    folderComponent.updateImagesList = imageComponent.updateImagesList;
    folderComponent.refreshImages = imageComponent.refreshFromServer;

    // Preserve existing external property access.
    this.tableSidebarFolderComponent = folderComponent;
    this.tableSidebarImageComponent = imageComponent;
    this.packPanel = packPanel;

    return {
      folderComponent,
      imageComponent,
      packPanel,
    };
  };

  renderCloseBtn = () => {
    return createElement(
      "div",
      { class: "sidebar-panel-btn", title: "Close sidebar" },
      SIDEBAR_ICONS.close(),
      { type: "click", event: this.close },
    );
  };

  renderSettingsBtn = () => {
    if (!this.can("canManageTableSettings")) {
      return createElement("div", { class: "d-none" });
    }
    return createElement(
      "div",
      { class: "sidebar-panel-btn", title: "Table Settings" },
      SIDEBAR_ICONS.settings(),
      {
        type: "click",
        event: async () => modal.show(await this.renderTableSettings()),
      },
    );
  };

  close = () => {
    this.isVisible = false;
    if (this.container) this.container.classList.remove("open");
    if (this.domElem) this.domElem.classList.remove("open");
    // Update toolbar button active state
    if (this.tableApp?.topLayer) this.tableApp.topLayer.render();
  };

  open = () => {
    this.isVisible = true;
    if (this.container) this.container.classList.add("open");
    if (this.domElem) this.domElem.classList.add("open");
  };

  hide = () => {
    this.close();
    this.clear({ deep: true });
  };

  destroy = () => {
    this.isVisible = false;
    this.container = null;
    this.tableSidebarImageComponent = null;
    this.tableSidebarFolderComponent = null;
    this.packPanel = null;
    super.destroy();
  };

  getCurrentFolderId = () => {
    return this.tableSidebarFolderComponent?.currentFolder?.id ?? null;
  };

  renderShareBtn = () => {
    return createElement(
      "div",
      { class: "sidebar-action-btn", title: "Copy share link to clipboard" },
      SIDEBAR_ICONS.link(),
      { type: "click", event: () => copyTextToClipboard(window.location) },
    );
  };

  renderSidebarHeader = () => {
    return createElement("div", { class: "sidebar-panel-header" }, [
      createElement(
        "div",
        { class: "sidebar-panel-title", id: "table-display-title" },
        this.tableView.title,
      ),
      this.renderSettingsBtn(),
      this.renderCloseBtn(),
    ]);
  };

  renderSidebarTabs = () => {
    return createElement("div", { class: "sidebar-tabs" }, [
      createElement(
        "button",
        {
          class: `sidebar-tab-btn${this.activeTab === "images" ? " active" : ""}`,
          type: "button",
        },
        "Images",
        { type: "click", event: () => this.setActiveTab("images") },
      ),
      ...(this.canUseLibraryPacks()
        ? [
            createElement(
              "button",
              {
                class: `sidebar-tab-btn${this.activeTab === "installed_packs" ? " active" : ""}`,
                type: "button",
              },
              "Installed Packs",
              {
                type: "click",
                event: () => this.setActiveTab("installed_packs"),
              },
            ),
          ]
        : [
            createElement(
              "button",
              {
                class: "sidebar-tab-btn sidebar-tab-btn-pro",
                type: "button",
                disabled: "true",
                title:
                  "Library packs require Pro User (personal) or Pro Wyrld (project)",
              },
              "Packs (Pro)",
            ),
          ]),
    ]);
  };

  renderSidebarActions = ({ isPackTab, canShowDiscoverMode }) => {
    return createElement(
      "div",
      {
        class: `sidebar-actions${isPackTab ? " sidebar-actions-packs" : ""}`,
      },
      [
        ...(!isPackTab && this.can("canManageImageAssets")
          ? [
              createElement(
                "div",
                {
                  class: "sidebar-action-btn",
                  title: "Upload image to be used on virtual table",
                },
                "+ Image",
                {
                  type: "click",
                  event: () => {
                    if (this.tableSidebarImageComponent.imageLoading) return;
                    this.renderUploadImage();
                  },
                },
              ),
            ]
          : []),
        ...(!isPackTab && this.can("canManageFolders")
          ? [
              createElement(
                "div",
                {
                  class: "sidebar-action-btn",
                  title: "Create a new folder space for your images",
                },
                "+ Folder",
                {
                  type: "click",
                  event: () => {
                    if (this.tableSidebarFolderComponent.folderLoading) return;
                    modal.show(this.renderCreateFolder());
                  },
                },
              ),
            ]
          : []),
        ...(isPackTab
          ? [
              createElement(
                "div",
                {
                  class: "sidebar-pack-mode-toggle",
                },
                [
                  createElement(
                    "button",
                    {
                      class: `sidebar-pack-mode-btn${this.packPanel.mode === "use" ? " active" : ""}`,
                      type: "button",
                    },
                    "Use Installed",
                    {
                      type: "click",
                      event: () => this.setPackPanelMode("use"),
                    },
                  ),
                  ...(canShowDiscoverMode
                    ? [
                        createElement(
                          "button",
                          {
                            class: `sidebar-pack-mode-btn${this.packPanel.mode === "discover" ? " active" : ""}`,
                            type: "button",
                            title: "Discover and install shared packs",
                          },
                          "Discover",
                          {
                            type: "click",
                            event: () => this.setPackPanelMode("discover"),
                          },
                        ),
                      ]
                    : []),
                ],
              ),
              ...(this.packPanel.mode === "discover" && canShowDiscoverMode
                ? [
                    createElement(
                      "input",
                      {
                        class: "table-sidebar-search",
                        type: "text",
                        placeholder: "Search packs...",
                        value: this.packPanel.searchQuery,
                      },
                      null,
                      {
                        type: "input",
                        event: (e) => {
                          this.packPanel.setSearchQuery(e.target.value || "");
                          this.packPanel.scheduleSearch();
                        },
                      },
                    ),
                  ]
                : []),
              createElement(
                "div",
                {
                  class: "sidebar-action-btn",
                  title:
                    this.packPanel.mode === "discover" && !canShowDiscoverMode
                      ? "Discovery unavailable in this table mode"
                      : "Refresh packs",
                },
                "Refresh",
                {
                  type: "click",
                  event: () =>
                    this.packPanel.refreshData({
                      includeDiscover: this.packPanel.mode === "discover",
                    }),
                },
              ),
            ]
          : []),
        this.renderShareBtn(),
      ],
    );
  };

  render = async () => {
    const { folderComponent, imageComponent, packPanel } =
      this.ensureChildComponents();

    if (this.activeTab === "installed_packs" && !this.canUseLibraryPacks()) {
      this.activeTab = "images";
    }

    packPanel.setMode(packPanel.mode);
    const isPackTab = this.activeTab === "installed_packs";
    const canShowDiscoverMode = !this.isSandboxMode && packPanel.canDiscover();

    if (!isPackTab) {
      await imageComponent.render();
      await folderComponent.render();
    } else {
      await packPanel.render();
    }

    const container = createElement("div", { class: "sidebar-container" }, [
      this.renderSidebarHeader(),
      this.renderSidebarTabs(),
      this.renderSidebarActions({ isPackTab, canShowDiscoverMode }),
      ...(this.activeTab === "images"
        ? [folderComponent.domElem, imageComponent.domElem]
        : [packPanel.domElem]),
    ]);

    this.container = container;
    this.open();
    return [container];
  };
}
