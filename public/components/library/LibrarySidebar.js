import createElement from "../createElement.js";
import { apiPost } from "../../lib/apiUtils.js";
import { handleApiFailure } from "../../lib/apiUiFeedback.js";
import renderLoadingWithMessage from "../loadingWithMessage.js";
import modal from "../modal.js";
import { uploadImageWithContext } from "../../lib/imageUtils.js";
import { filterFabricCompatibleImageFiles } from "../shared/fabricUploadUtils.js";
import { dedupeUploadFiles } from "../shared/uploadQueueUtils.js";

export default class LibrarySidebar {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "library-sidebar";
    this.libraryApp = props.libraryApp;
    this.projectId = props.projectId;
    this.activeTab = props.activeTab || "images";
    this.canUseLibraryPacks =
      typeof props.canUseLibraryPacks === "boolean"
        ? props.canUseLibraryPacks
        : !!this.libraryApp?.canUseLibraryPacks;
    if (!this.canUseLibraryPacks && this.activeTab === "packs") {
      this.activeTab = "images";
    }

    this.makeImageSmall = false;
    this.folderLoading = false;
    this.uploadState = {
      items: [],
      running: false,
      cancelling: false,
      activeController: null,
      completed: 0,
    };
  }

  getCurrentFolderId = () => {
    return this.libraryApp.currentFolder?.id ?? null;
  };

  setActiveTab = (tab) => {
    this.activeTab =
      tab === "packs" && this.canUseLibraryPacks ? "packs" : "images";
    this.render();
  };

  postByContext = (projectEndpoint, userEndpoint, data) => {
    if (this.projectId) {
      return apiPost(projectEndpoint, { ...data, project_id: this.projectId });
    }
    return apiPost(userEndpoint, data);
  };

  uploadImage = async (file, signal = null) => {
    const newImage = await uploadImageWithContext({
      image: file,
      projectId: this.projectId,
      makeImageSmall: this.makeImageSmall,
      signal,
    });

    if (!newImage) return null;

    const tableImageResult = await this.postByContext(
      "/api/add_table_image_by_project",
      "/api/add_table_image_by_user",
      { image_id: newImage.id, folder_id: this.getCurrentFolderId() }
    );

    if (!tableImageResult.ok) {
      handleApiFailure(tableImageResult, { includeResultMessage: true });
      return null;
    }
    return tableImageResult.ok
      ? { image: newImage, tableImage: tableImageResult.data }
      : null;
  };

  addFilesToQueue = (files) => {
    const addFilesAsync = async () => {
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
        window.customAlertError(
          `Skipped ${skippedParts.join(" and ")}.`,
        );
      }
    };

    return addFilesAsync();
  };

  resetQueue = () => {
    this.uploadState.items = [];
    this.uploadState.running = false;
    this.uploadState.cancelling = false;
    this.uploadState.activeController = null;
    this.uploadState.completed = 0;
  };

  retryFailedUploads = () => {
    this.uploadState.items = this.uploadState.items.map((item) =>
      item.status === "failed" ? { ...item, status: "queued", error: "" } : item
    );
  };

  renderUploadModal = () => {
    this.resetQueue();
    const state = this.uploadState;
    let renderVersion = 0;

    const renderModal = () => {
      const version = ++renderVersion;
      const currentFolder = this.libraryApp.currentFolder;
      const folderNotice = currentFolder
        ? createElement(
            "small",
            { class: "modal-subtitle" },
            `Uploading to folder: "${currentFolder.title}"`,
          )
        : createElement("div", { class: "d-none" });

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
        folderNotice,
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
            title: "Resizes image width to 100px while maintaining aspect ratio.",
          },
          [
            createElement("small", { class: "me-3" }, "Make image small (100px): "),
            createElement(
              "input",
              { type: "checkbox", ...(this.makeImageSmall ? { checked: true } : {}) },
              null,
              {
                type: "change",
                event: (e) => {
                  this.makeImageSmall = e.target.checked;
                },
              },
            ),
          ],
        ),
        createElement("div", { class: "library-upload-actions" }, [
          createElement(
            "input",
            {
              id: "library-image-upload-files",
              type: "file",
              accept: "image/*",
              class: "file-input-hidden",
              multiple: true,
            },
            null,
            {
              type: "change",
              event: async (e) => {
                await this.addFilesToQueue(e.target.files);
                e.target.value = "";
                if (version !== renderVersion) return;
                renderModal();
              },
            },
          ),
          createElement(
            "input",
            {
              id: "library-image-upload-folder",
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
                await this.addFilesToQueue(e.target.files);
                e.target.value = "";
                if (version !== renderVersion) return;
                renderModal();
              },
            },
          ),
          createElement(
            "label",
            {
              for: "library-image-upload-files",
              class: "label-btn",
              title: "Choose image files",
            },
            "Choose Files",
          ),
          createElement(
            "label",
            {
              for: "library-image-upload-folder",
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
                this.libraryApp.grid.showLoading();

                try {
                  for (const item of state.items) {
                    if (state.cancelling) break;
                    if (item.status !== "queued") continue;

                    item.status = "uploading";
                    renderModal();

                    const controller = new AbortController();
                    state.activeController = controller;
                    try {
                      const result = await this.uploadImage(item.file, controller.signal);
                      if (!result) {
                        item.status = "failed";
                        item.error = "upload failed";
                      } else {
                        item.status = "done";
                        item.result = result;
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
                  const finished = state.items.filter((item) => item.status === "done").length;
                  if (finished > 0) {
                    await this.libraryApp.refreshImagesForCurrentScope();
                  } else {
                    this.libraryApp.grid.hideLoading();
                  }
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
                if (state.activeController) state.activeController.abort();
                state.items = state.items.map((item) =>
                  item.status === "queued"
                    ? { ...item, status: "cancelled", error: "cancelled" }
                    : item,
                );
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
                this.retryFailedUploads();
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
  };

  renderSearchSection = ({ isImagesTab }) => {
    return createElement("div", { class: "library-sidebar-section" }, [
      createElement("div", { class: "library-sidebar-tabs" }, [
        createElement(
          "button",
          {
            class: `library-sidebar-tab-btn${isImagesTab ? " active" : ""}`,
            type: "button",
          },
          "Images",
          {
            type: "click",
            event: () => this.libraryApp.setSidebarTab("images"),
          },
        ),
        ...(this.canUseLibraryPacks
          ? [
              createElement(
                "button",
                {
                  class: `library-sidebar-tab-btn${!isImagesTab ? " active" : ""}`,
                  type: "button",
                },
                "Packs",
                {
                  type: "click",
                  event: () => this.libraryApp.setSidebarTab("packs"),
                },
              ),
            ]
          : [
              createElement(
                "button",
                {
                  class: "library-sidebar-tab-btn library-sidebar-tab-btn-pro",
                  type: "button",
                  disabled: true,
                  title:
                    "Library packs require Pro User (personal) or Pro Wyrld (project)",
                },
                "Packs (Pro)",
              ),
            ]),
      ]),
      ...(!this.canUseLibraryPacks
        ? [
            createElement(
              "small",
              { class: "library-pro-hint" },
              "Library Packs require Pro User (personal) or Pro Wyrld (project).",
            ),
          ]
        : []),
      createElement("h3", {}, "Search"),
      createElement(
        "input",
        {
          class: "library-search-input",
          type: "text",
          placeholder: isImagesTab ? "Search images..." : "Search packs...",
        },
        null,
        {
          type: "input",
          event: (e) => {
            if (isImagesTab || !this.canUseLibraryPacks) {
              this.libraryApp.grid.setSearchQuery(e.target.value);
            } else {
              this.libraryApp.grid.setPackLibraryQuery(e.target.value);
            }
          },
        },
      ),
    ]);
  };

  renderActionsSection = ({ isImagesTab, isSelectMode }) => {
    return createElement("div", { class: "library-sidebar-section" }, [
      createElement("h3", {}, "Actions"),
      createElement("div", { class: "library-sidebar-actions" }, [
        ...(isImagesTab
          ? [
              createElement(
                "div",
                { class: "library-sidebar-btn" },
                "+ Upload Image",
                {
                  type: "click",
                  event: () => this.renderUploadModal(),
                },
              ),
              createElement(
                "div",
                { class: "library-sidebar-btn" },
                "+ New Folder",
                {
                  type: "click",
                  event: () => modal.show(this.renderCreateFolderModal()),
                },
              ),
              createElement(
                "div",
                { class: "library-sidebar-btn" },
                isSelectMode ? "Done Selecting" : "Select Multiple",
                {
                  type: "click",
                  event: () => {
                    this.libraryApp?.grid?.toggleSelectMode?.();
                    this.render();
                  },
                },
              ),
            ]
          : [
              createElement(
                "div",
                { class: "library-sidebar-btn" },
                "+ Create Pack",
                {
                  type: "click",
                  event: () => this.libraryApp.grid.renderCreatePackModal(),
                },
              ),
              createElement(
                "div",
                { class: "library-sidebar-btn" },
                "Discover Packs",
                {
                  type: "click",
                  event: () => this.libraryApp.grid.renderDiscoverPacksModal(),
                },
              ),
            ]),
      ]),
    ]);
  };

  renderCreateFolderModal = () => {
    const currentFolder = this.libraryApp.currentFolder;
    const subFolderNotice = currentFolder
      ? createElement(
          "small",
          { class: "modal-subtitle" },
          `Creating sub-folder in: "${currentFolder.title}"`
        )
      : createElement("div", { class: "d-none" });

    return createElement("div", { class: "help-content" }, [
      createElement("h1", {}, "Create Folder"),
      subFolderNotice,
      createElement(
        "form",
        {},
        [
          createElement("div", { class: "input-container" }, [
            createElement("label", { for: "title", class: "me-1" }, "Title"),
            createElement("input", {
              placeholder: "New Folder",
              name: "title",
              id: "title",
              required: true,
            }),
          ]),
          createElement("br"),
          createElement("button", { class: "new-btn me-1" }, "Create"),
        ],
        {
          type: "submit",
          event: async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const formProps = Object.fromEntries(formData);
            const parentFolderId = this.getCurrentFolderId();

            modal.hide();
            this.folderLoading = true;
            this.render();

            try {
              await this.postByContext(
                "/api/add_table_folder_by_project",
                "/api/add_table_folder_by_user",
                {
                  title: formProps.title,
                  is_sub: Boolean(parentFolderId),
                  parent_folder_id: parentFolderId,
                }
              );
              await this.libraryApp.loadFolders();
            } catch (err) {
              console.log(err);
              window.customAlertError("Something went wrong when creating a new folder");
            } finally {
              this.folderLoading = false;
              this.render();
            }
          },
        }
      ),
    ]);
  };

  render = async () => {
    // Clear children safely using DOM API
    while (this.domComponent.firstChild) {
      this.domComponent.removeChild(this.domComponent.firstChild);
    }

    if (this.folderLoading) {
      this.domComponent.append(renderLoadingWithMessage(""));
      return;
    }

    if (!this.canUseLibraryPacks && this.activeTab === "packs") {
      this.activeTab = "images";
    }

    const isImagesTab = this.activeTab === "images" || !this.canUseLibraryPacks;
    const isSelectMode = !!this.libraryApp?.grid?.selectMode;
    this.domComponent.append(
      this.renderSearchSection({ isImagesTab }),
      this.renderActionsSection({ isImagesTab, isSelectMode }),
    );
  };
}
