import createElement from "../createElement.js";
import TableSidebarImageComponent from "./TableSidebarImageComponent.js";
import { copyTextToClipboard } from "../../lib/clipboard.js";
import modal from "../modal.js";
import { postThing } from "../../lib/apiUtils.js";
import TableSidebarFolderComponent from "./TableSidebarFolderComponent.js";
import { getCurrentProjectId } from "./tableApi.js";
import { renderUploadImageModal } from "./tableSidebarUploadModal.js";
import { renderCreateFolderModal } from "./tableSidebarFolderModal.js";
import { renderTableSettingsModal } from "./tableSidebarSettingsModal.js";
import { uploadImageWithContext } from "../../lib/imageUtils.js";
import { filterFabricCompatibleImageFiles } from "../shared/fabricUploadUtils.js";
import { dedupeUploadFiles } from "../shared/uploadQueueUtils.js";
import TableSidebarPackPanel from "./tableSidebarPackPanel.js";
import { createSvgIconFactoryMap } from "../svgIcon.js";

const SIDEBAR_ICON_MARKUP = {
  close: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  settings: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  link: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
};

const SIDEBAR_ICONS = createSvgIconFactoryMap(SIDEBAR_ICON_MARKUP);

export default class TableSidebar {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "sidebar";
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

    // table folders component
    this.tableSidebarFolderComponent = new TableSidebarFolderComponent({
      domComponent: createElement("div"),
      tableView: this.tableView,
      capabilities: this.capabilities,
    });

    // table sidebar component
    this.tableSidebarImageComponent = new TableSidebarImageComponent({
      domComponent: createElement("div"),
      tableView: this.tableView,
      tableApp: this.tableApp,
      getCurrentFolder: () => {
        return this.tableSidebarFolderComponent.currentFolder;
      },
      getFolderScope: () => {
        return this.tableSidebarFolderComponent.getScope();
      },
      onCountsUpdated: (data) =>
        this.tableSidebarFolderComponent.setCounts(data),
      capabilities: this.capabilities,
    });

    this.packPanel = new TableSidebarPackPanel({
      getProjectId: () => this.projectId,
      getIsSandboxMode: () => this.isSandboxMode,
      can: this.can,
      canUseLibraryPacks: this.canUseLibraryPacks,
      tableSidebarImageComponent: this.tableSidebarImageComponent,
    });

    // setup functions to allow folder component to call render on images
    this.tableSidebarFolderComponent.updateImagesList =
      this.tableSidebarImageComponent.updateImagesList;
    this.tableSidebarFolderComponent.refreshImages =
      this.tableSidebarImageComponent.refreshFromServer;
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

  setActiveTab = async (tab) => {
    if (tab === "installed_packs" && !this.canUseLibraryPacks()) {
      this.activeTab = "images";
      await this.render();
      return;
    }
    this.activeTab = tab === "installed_packs" ? "installed_packs" : "images";
    if (this.activeTab === "installed_packs") {
      await this.packPanel.refreshData({
        includeDiscover: this.packPanel.mode === "discover",
      });
    }
    await this.render();
  };

  setPackPanelMode = async (mode) => {
    this.packPanel.setMode(mode);
    if (this.activeTab !== "installed_packs") return;
    await this.packPanel.refreshData({
      includeDiscover: this.packPanel.mode === "discover",
    });
    await this.render();
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
    if (this.domComponent) this.domComponent.classList.remove("open");
    // Update toolbar button active state
    if (this.tableApp?.topLayer) this.tableApp.topLayer.render();
  };

  open = () => {
    this.isVisible = true;
    if (this.container) this.container.classList.add("open");
    if (this.domComponent) this.domComponent.classList.add("open");
  };

  hide = () => {
    this.close();
    this.domComponent.innerHTML = "";
  };

  destroy = () => {
    this.tableSidebarImageComponent?.destroy?.();
    this.tableSidebarFolderComponent?.destroy?.();
    this.packPanel?.destroy?.();
    this.isVisible = false;
    this.container = null;
    this.domComponent.replaceChildren();
  };

  getCurrentFolderId = () => {
    return this.tableSidebarFolderComponent.currentFolder?.id ?? null;
  };

  // Helper to handle project vs user API routing
  postByContext = (projectEndpoint, userEndpoint, data) => {
    if (this.projectId) {
      return postThing(projectEndpoint, {
        ...data,
        project_id: this.projectId,
      });
    }
    return postThing(userEndpoint, data);
  };

  uploadTableImage = async (file, signal = null) => {
    if (!this.can("canManageImageAssets")) return null;

    const newImage = await uploadImageWithContext({
      image: file,
      projectId: this.projectId,
      tableViewId: this.tableView?.id,
      makeImageSmall: this.makeImageSmall,
      signal,
    });

    if (!newImage) return null;

    const tableImage = await this.postByContext(
      "/api/add_table_image_by_project",
      "/api/add_table_image_by_user",
      {
        image_id: newImage.id,
        folder_id: this.getCurrentFolderId(),
        table_view_id: this.tableView?.id,
      },
    );

    return { image: newImage, tableImage };
  };

  resetUploadQueue = () => {
    this.uploadState.items = [];
    this.uploadState.running = false;
    this.uploadState.cancelling = false;
    this.uploadState.activeController = null;
  };

  retryFailedUploads = () => {
    this.uploadState.items = this.uploadState.items.map((item) =>
      item.status === "failed"
        ? { ...item, status: "queued", error: "" }
        : item,
    );
  };

  addFilesToUploadQueue = async (files) => {
    const { accepted, skipped } = await filterFabricCompatibleImageFiles(files);
    const { uniqueFiles, duplicateCount } = dedupeUploadFiles(
      accepted,
      this.uploadState.items,
    );

    const queued = uniqueFiles.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${file.name}`,
      file,
      status: "queued",
      error: "",
      result: null,
    }));
    this.uploadState.items = [...this.uploadState.items, ...queued];

    if (skipped > 0 || duplicateCount > 0) {
      const skippedParts = [];
      if (skipped > 0) {
        skippedParts.push(
          `${skipped} incompatible file${skipped === 1 ? "" : "s"}`,
        );
      }
      if (duplicateCount > 0) {
        skippedParts.push(
          `${duplicateCount} duplicate file${duplicateCount === 1 ? "" : "s"}`,
        );
      }
      window.customAlertError(`Skipped ${skippedParts.join(" and ")}.`);
    }
  };

  addImageToSidebar = async (e) => {
    if (!this.can("canManageImageAssets")) return;
    if (e.target.files.length) {
      modal.hide();
      try {
        this.tableSidebarImageComponent.showLoading();

        if (e.target.files.length > 1) {
          // multiple uploads
          const results = await Promise.all(
            Array.from(e.target.files).map(async (file) => {
              return await this.uploadTableImage(file);
            }),
          );
          // append each uploaded image to memory
          for (const result of results) {
            if (result) {
              await this.tableSidebarImageComponent.appendImage(
                result.image,
                result.tableImage,
              );
            }
          }
        } else {
          const result = await this.uploadTableImage(e.target.files[0]);
          if (result) {
            await this.tableSidebarImageComponent.appendImage(
              result.image,
              result.tableImage,
            );
          }
        }

        // Render from memory (no refetch)
        this.tableSidebarImageComponent.hideLoading();
      } catch (err) {
        console.log(err);
        this.tableSidebarImageComponent.hideLoading();
        window.customAlertError(
          "Something went wrong while uploading your image",
        );
      }
    }
  };

  renderUploadImage = () => {
    return renderUploadImageModal(this);
  };

  renderCreateFolder = () => {
    return renderCreateFolderModal(this);
  };

  renderTableSettings = async () => {
    return renderTableSettingsModal(this);
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
    this.domComponent.innerHTML = "";

    if (this.activeTab === "installed_packs" && !this.canUseLibraryPacks()) {
      this.activeTab = "images";
    }

    this.packPanel.setMode(this.packPanel.mode);
    const isPackTab = this.activeTab === "installed_packs";
    const canShowDiscoverMode =
      !this.isSandboxMode && this.packPanel.canDiscover();

    if (!isPackTab) {
      this.tableSidebarImageComponent.render();
      this.tableSidebarFolderComponent.render();
    } else {
      if (!this.packPanelElem) this.packPanelElem = createElement("div");
      this.packPanel.mount(this.packPanelElem);
      this.packPanel.render();
    }

    const container = createElement("div", { class: "sidebar-container" }, [
      this.renderSidebarHeader(),
      this.renderSidebarTabs(),
      this.renderSidebarActions({ isPackTab, canShowDiscoverMode }),
      ...(this.activeTab === "images"
        ? [
            this.tableSidebarFolderComponent.domComponent,
            this.tableSidebarImageComponent.domComponent,
          ]
        : [this.packPanelElem]),
    ]);

    this.container = container;
    this.open();
    return this.domComponent.append(container);
  };
}
