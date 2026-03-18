import { apiPost } from "../../lib/apiUtils.js";
import { handleApiFailure } from "../../lib/apiUiFeedback.js";
import { renderUploadImageModal } from "./tableSidebarUploadModal.js";
import { renderCreateFolderModal } from "./tableSidebarFolderModal.js";
import { renderTableSettingsModal } from "./tableSidebarSettingsModal.js";
import { uploadImageWithContext } from "../../lib/imageUtils.js";
import { filterFabricCompatibleImageFiles } from "../shared/fabricUploadUtils.js";
import { dedupeUploadFiles } from "../shared/uploadQueueUtils.js";

export const TABLE_SIDEBAR_CONTROLLER_METHODS = [
  "setActiveTab",
  "setPackPanelMode",
  "postByContext",
  "uploadTableImage",
  "resetUploadQueue",
  "retryFailedUploads",
  "addFilesToUploadQueue",
  "renderUploadImage",
  "renderCreateFolder",
  "renderTableSettings",
];

export function bindTableSidebarControllerMethods(sidebar, controller) {
  for (const methodName of TABLE_SIDEBAR_CONTROLLER_METHODS) {
    sidebar[methodName] = controller[methodName].bind(controller);
  }
}

export default class TableSidebarController {
  constructor(sidebar) {
    this.sidebar = sidebar;
  }

  setActiveTab = async (tab) => {
    const { packPanel } = this.sidebar.ensureChildComponents();
    if (tab === "installed_packs" && !this.sidebar.canUseLibraryPacks()) {
      this.sidebar.activeTab = "images";
      await this.sidebar.render();
      return;
    }
    this.sidebar.activeTab =
      tab === "installed_packs" ? "installed_packs" : "images";
    if (this.sidebar.activeTab === "installed_packs") {
      await packPanel.refreshData({
        includeDiscover: packPanel.mode === "discover",
      });
    }
    await this.sidebar.render();
  };

  setPackPanelMode = async (mode) => {
    const { packPanel } = this.sidebar.ensureChildComponents();
    packPanel.setMode(mode);
    if (this.sidebar.activeTab !== "installed_packs") return;
    await packPanel.refreshData({
      includeDiscover: packPanel.mode === "discover",
    });
    await this.sidebar.render();
  };

  postByContext = (projectEndpoint, userEndpoint, data) => {
    if (this.sidebar.projectId) {
      return apiPost(projectEndpoint, {
        ...data,
        project_id: this.sidebar.projectId,
      });
    }
    return apiPost(userEndpoint, data);
  };

  uploadTableImage = async (file, signal = null) => {
    if (!this.sidebar.can("canManageImageAssets")) return null;

    const newImage = await uploadImageWithContext({
      image: file,
      projectId: this.sidebar.projectId,
      tableViewId: this.sidebar.tableView?.id,
      makeImageSmall: this.sidebar.makeImageSmall,
      signal,
    });

    if (!newImage) return null;

    const tableImageResult = await this.postByContext(
      "/api/add_table_image_by_project",
      "/api/add_table_image_by_user",
      {
        image_id: newImage.id,
        folder_id: this.sidebar.getCurrentFolderId(),
        table_view_id: this.sidebar.tableView?.id,
      },
    );

    if (!tableImageResult.ok) {
      handleApiFailure(tableImageResult, { includeResultMessage: true });
      return null;
    }
    return { image: newImage, tableImage: tableImageResult.data };
  };

  resetUploadQueue = () => {
    this.sidebar.uploadState.items = [];
    this.sidebar.uploadState.running = false;
    this.sidebar.uploadState.cancelling = false;
    this.sidebar.uploadState.activeController = null;
  };

  retryFailedUploads = () => {
    this.sidebar.uploadState.items = this.sidebar.uploadState.items.map((item) =>
      item.status === "failed"
        ? { ...item, status: "queued", error: "" }
        : item,
    );
  };

  addFilesToUploadQueue = async (files) => {
    const { accepted, skipped } = await filterFabricCompatibleImageFiles(files);
    const { uniqueFiles, duplicateCount } = dedupeUploadFiles(
      accepted,
      this.sidebar.uploadState.items,
    );

    const queued = uniqueFiles.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${file.name}`,
      file,
      status: "queued",
      error: "",
      result: null,
    }));
    this.sidebar.uploadState.items = [...this.sidebar.uploadState.items, ...queued];

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

  renderUploadImage = () => {
    return renderUploadImageModal(this.sidebar);
  };

  renderCreateFolder = () => {
    return renderCreateFolderModal(this.sidebar);
  };

  renderTableSettings = async () => {
    return renderTableSettingsModal(this.sidebar);
  };
}
