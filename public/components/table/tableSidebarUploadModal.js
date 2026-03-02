import createElement from "../../lib/salt-lib/createElement.js";
import { renderUploadQueueModal } from "../shared/uploadQueueModal.js";

function renderCreatingImageInFolderNotice(sidebar) {
  if (
    !sidebar.tableSidebarFolderComponent.showAllImages &&
    sidebar.tableSidebarFolderComponent.currentFolder
  ) {
    return createElement(
      "small",
      { class: "modal-subtitle" },
      `Creating image in folder: "${sidebar.tableSidebarFolderComponent.currentFolder.title}"`,
    );
  }
  return createElement("div", { class: "d-none" });
}

export function renderUploadImageModal(sidebar) {
  return renderUploadQueueModal({
    state: sidebar.uploadState,
    resetQueue: sidebar.resetUploadQueue,
    addFilesToQueue: sidebar.addFilesToUploadQueue,
    retryFailedUploads: sidebar.retryFailedUploads,
    uploadFile: (file, signal) => sidebar.uploadTableImage(file, signal),
    onUploadStart: () => {
      sidebar.tableSidebarImageComponent.showLoading();
    },
    onUploadSuccess: async (result) => {
      await sidebar.tableSidebarImageComponent.appendImage(
        result.image,
        result.tableImage,
      );
    },
    onUploadComplete: () => {
      sidebar.tableSidebarImageComponent.hideLoading();
    },
    renderContextNotice: () => renderCreatingImageInFolderNotice(sidebar),
    getMakeImageSmall: () => sidebar.makeImageSmall,
    setMakeImageSmall: (checked) => {
      sidebar.makeImageSmall = checked;
    },
    filesInputId: "table-image-upload-files",
    folderInputId: "table-image-upload-folder",
    filesInputName: "image_files",
    folderInputName: "image_folder",
  });
}
