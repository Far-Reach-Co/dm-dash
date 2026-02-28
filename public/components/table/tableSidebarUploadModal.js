import createElement from "../createElement.js";
import modal from "../modal.js";

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
  sidebar.resetUploadQueue();
  const state = sidebar.uploadState;
  let renderVersion = 0;

  const renderModal = () => {
    const version = ++renderVersion;
    const items = state.items;
    const total = items.length;
    const completed = items.filter((item) => item.status === "done").length;
    const failed = items.filter((item) => item.status === "failed").length;
    const cancelled = items.filter((item) => item.status === "cancelled").length;
    const inFlight = items.filter((item) => item.status === "uploading").length;
    const settled = completed + failed + cancelled;
    const pct = total ? Math.round((settled / total) * 100) : 0;

    const queueRows = items.length
      ? items.map((item) =>
          createElement("div", { class: "library-upload-item" }, [
            createElement("div", { class: "library-upload-item-name" }, item.file.name),
            createElement(
              "div",
              { class: `library-upload-item-status status-${item.status}` },
              item.status === "failed"
                ? `failed${item.error ? `: ${item.error}` : ""}`
                : item.status,
            ),
          ]),
        )
      : [
          createElement(
            "div",
            { class: "library-pack-empty" },
            "Add image files or a whole folder to begin.",
          ),
        ];

    const content = createElement("div", { class: "help-content library-upload-modal" }, [
      createElement("h1", {}, "Upload Images"),
      renderCreatingImageInFolderNotice(sidebar),
      createElement(
        "small",
        { class: "modal-subtitle" },
        "Folder upload adds all image files found in that folder tree.",
      ),
      createElement("h2", {}, "Options"),
      createElement(
        "div",
        {
          class: "d-flex align-items-center justify-content-center ms-1",
          title:
            "If image width is larger than 100px this resizes the image width to 100px while maintaining aspect ratio.",
        },
        [
          createElement("small", { class: "me-3" }, "Make image small (100px): "),
          createElement(
            "input",
            { type: "checkbox", ...(sidebar.makeImageSmall ? { checked: true } : {}) },
            null,
            {
              type: "change",
              event: (e) => {
                sidebar.makeImageSmall = e.target.checked;
              },
            },
          ),
        ],
      ),
      createElement("div", { class: "library-upload-actions" }, [
        createElement(
          "input",
          {
            id: "table-image-upload-files",
            name: "image_files",
            type: "file",
            accept: "image/*",
            class: "file-input-hidden",
            multiple: true,
          },
          null,
          {
            type: "change",
            event: async (e) => {
              await sidebar.addFilesToUploadQueue(e.target.files);
              e.target.value = "";
              if (version !== renderVersion) return;
              renderModal();
            },
          },
        ),
        createElement(
          "input",
          {
            id: "table-image-upload-folder",
            name: "image_folder",
            type: "file",
            accept: "image/*",
            class: "file-input-hidden",
            multiple: true,
            webkitdirectory: "true",
            directory: "true",
          },
          null,
          {
            type: "change",
            event: async (e) => {
              await sidebar.addFilesToUploadQueue(e.target.files);
              e.target.value = "";
              if (version !== renderVersion) return;
              renderModal();
            },
          },
        ),
        createElement(
          "label",
          {
            for: "table-image-upload-files",
            class: "label-btn",
            title: "Choose image files",
          },
          "Choose Files",
        ),
        createElement(
          "label",
          {
            for: "table-image-upload-folder",
            class: "label-btn",
            title: "Choose a folder",
          },
          "Choose Folder",
        ),
        createElement(
          "button",
          {
            class: "new-btn",
            type: "button",
            ...(state.running || !items.some((item) => item.status === "queued")
              ? { disabled: true }
              : {}),
          },
          "Start Upload",
          {
            type: "click",
            event: async () => {
              if (state.running) return;
              state.running = true;
              state.cancelling = false;
              renderModal();
              sidebar.tableSidebarImageComponent.showLoading();

              try {
                for (const item of state.items) {
                  if (state.cancelling) break;
                  if (item.status !== "queued") continue;

                  item.status = "uploading";
                  renderModal();

                  const controller = new AbortController();
                  state.activeController = controller;

                  try {
                    const result = await sidebar.uploadTableImage(item.file, controller.signal);
                    if (!result) {
                      item.status = "failed";
                      item.error = "upload failed";
                    } else {
                      item.status = "done";
                      item.result = result;
                      await sidebar.tableSidebarImageComponent.appendImage(
                        result.image,
                        result.tableImage,
                      );
                    }
                  } catch (err) {
                    if (err?.name === "AbortError") {
                      item.status = "cancelled";
                      item.error = "cancelled";
                    } else {
                      item.status = "failed";
                      item.error = "upload failed";
                      console.log(err);
                    }
                  } finally {
                    state.activeController = null;
                    renderModal();
                  }
                }
              } finally {
                state.running = false;
                sidebar.tableSidebarImageComponent.hideLoading();
                renderModal();
              }
            },
          },
        ),
        createElement(
          "button",
          {
            class: "new-btn",
            type: "button",
            ...(!state.running ? { disabled: true } : {}),
          },
          "Cancel",
          {
            type: "click",
            event: () => {
              state.cancelling = true;
              if (state.activeController) {
                state.activeController.abort();
              }
              state.items = state.items.map((item) => {
                if (item.status === "queued") {
                  return { ...item, status: "cancelled", error: "cancelled" };
                }
                return item;
              });
              renderModal();
            },
          },
        ),
        createElement(
          "button",
          {
            class: "new-btn",
            type: "button",
            ...(state.running || !items.some((item) => item.status === "failed")
              ? { disabled: true }
              : {}),
          },
          "Retry Failed",
          {
            type: "click",
            event: () => {
              sidebar.retryFailedUploads();
              renderModal();
            },
          },
        ),
        createElement(
          "button",
          {
            class: "new-btn",
            type: "button",
            ...(state.running || !items.length ? { disabled: true } : {}),
          },
          "Clear Queue",
          {
            type: "click",
            event: () => {
              state.items = [];
              renderModal();
            },
          },
        ),
      ]),
      createElement(
        "small",
        { class: "library-upload-progress-text" },
        total
          ? `${completed} done • ${failed} failed • ${cancelled} cancelled • ${inFlight} uploading • ${total} total`
          : "No files queued",
      ),
      createElement("div", { class: "library-upload-progress-bar" }, [
        createElement("div", {
          class: "library-upload-progress-fill",
          style: `width:${pct}%`,
        }),
      ]),
      createElement("div", { class: "library-upload-queue-wrap" }, [
        createElement("div", { class: "library-upload-queue" }, queueRows),
      ]),
    ]);

    modal.show(content);
  };

  renderModal();
  return createElement("div");
}
