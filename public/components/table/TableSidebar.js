import createElement from "../createElement.js";
import TableSidebarImageComponent from "./TableSidebarImageComponent.js";
import { copyTextToClipboard } from "../../lib/clipboard.js";
import modal from "../modal.js";
import { postThing } from "../../lib/apiUtils.js";
import { uploadProjectImage, uploadUserImage } from "../../lib/imageUtils.js";
import TableSidebarFolderComponent from "./TableSidebarFolderComponent.js";
import { getCurrentProjectId } from "./tableApi.js";
import { renderUploadImageModal } from "./tableSidebarUploadModal.js";
import { renderCreateFolderModal } from "./tableSidebarFolderModal.js";
import { renderTableSettingsModal } from "./tableSidebarSettingsModal.js";

export default class TableSidebar {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "sidebar";
    this.tableView = props.tableView;
    this.isVisible = false;
    this.tableApp = props.tableApp;
    this.capabilities = this.tableApp?.capabilities || {};

    this.makeImageSmall = false;

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
      onCountsUpdated: (data) => this.tableSidebarFolderComponent.setCounts(data),
      capabilities: this.capabilities,
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

  can = (capability) => {
    return !!this.capabilities?.[capability];
  };

  renderCloseBtn = () => {
    return createElement(
      "div",
      { class: "sidebar-panel-btn", title: "Close sidebar" },
      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
      { type: "click", event: this.close }
    );
  };

  renderSettingsBtn = () => {
    if (!this.can("canManageTableSettings")) {
      return createElement("div", { class: "d-none" });
    }
    return createElement(
      "div",
      { class: "sidebar-panel-btn", title: "Table Settings" },
      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
      { type: "click", event: async () => modal.show(await this.renderTableSettings()) }
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
      return postThing(projectEndpoint, { ...data, project_id: this.projectId });
    }
    return postThing(userEndpoint, data);
  };

  uploadTableImage = async (file) => {
    if (!this.can("canManageImageAssets")) return null;

    const newImage = this.projectId
      ? await uploadProjectImage(
          file,
          this.projectId,
          this.makeImageSmall,
          this.tableView?.id,
        )
      : await uploadUserImage(file, this.makeImageSmall, this.tableView?.id);

    if (!newImage) return null;

    const tableImage = await this.postByContext(
      "/api/add_table_image_by_project",
      "/api/add_table_image_by_user",
      {
        image_id: newImage.id,
        folder_id: this.getCurrentFolderId(),
        table_view_id: this.tableView?.id,
      }
    );

    return { image: newImage, tableImage };
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
        window.customAlertError("Something went wrong while uploading your image");
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
    // Static SVG string — safe, no user input
    const linkIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
    return createElement(
      "div",
      { class: "sidebar-action-btn", title: "Copy share link to clipboard" },
      linkIcon,
      { type: "click", event: () => copyTextToClipboard(window.location) },
    );
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    this.tableSidebarImageComponent.render();

    // Header: title + settings gear + close X
    const header = createElement("div", { class: "sidebar-panel-header" }, [
      createElement(
        "div",
        { class: "sidebar-panel-title", id: "table-display-title" },
        this.tableView.title,
      ),
      this.renderSettingsBtn(),
      this.renderCloseBtn(),
    ]);

    // Action buttons
    const actions = createElement("div", { class: "sidebar-actions" }, [
      ...(this.can("canManageImageAssets")
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
                  modal.show(this.renderUploadImage());
                },
              },
            ),
          ]
        : []),
      ...(this.can("canManageFolders")
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
      this.renderShareBtn(),
    ]);

    const container = createElement("div", { class: "sidebar-container" }, [
      header,
      actions,
      this.tableSidebarFolderComponent.domComponent,
      this.tableSidebarImageComponent.domComponent,
    ]);

    this.container = container;
    this.open();
    return this.domComponent.append(container);
  };
}
