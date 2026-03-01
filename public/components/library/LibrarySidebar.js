import createElement from "../../lib/salt-lib/createElement.js";
import { apiPost } from "../../lib/apiUtils.js";
import { handleApiFailure } from "../../lib/apiUiFeedback.js";
import renderLoadingWithMessage from "../loadingWithMessage.js";
import modal from "../modal.js";
import { uploadImageWithContext } from "../../lib/imageUtils.js";
import { filterFabricCompatibleImageFiles } from "../shared/fabricUploadUtils.js";
import { dedupeUploadFiles } from "../shared/uploadQueueUtils.js";
import { renderUploadQueueModal } from "../shared/uploadQueueModal.js";
import Component from "../../lib/salt-lib/Component.js";

export default class LibrarySidebar extends Component {
  constructor(props) {
    super({
      domElem: props.domElem,
      autoInit: false,
      autoRender: false,
    });
    this.domElem.className = "library-sidebar";
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
  };

  retryFailedUploads = () => {
    this.uploadState.items = this.uploadState.items.map((item) =>
      item.status === "failed" ? { ...item, status: "queued", error: "" } : item
    );
  };

  renderUploadModal = () => {
    return renderUploadQueueModal({
      state: this.uploadState,
      resetQueue: this.resetQueue,
      addFilesToQueue: this.addFilesToQueue,
      retryFailedUploads: this.retryFailedUploads,
      uploadFile: (file, signal) => this.uploadImage(file, signal),
      onUploadStart: () => {
        this.libraryApp.grid.showLoading();
      },
      onUploadComplete: async ({ stats }) => {
        if (stats.completed > 0) {
          await this.libraryApp.refreshImagesForCurrentScope();
        } else {
          this.libraryApp.grid.hideLoading();
        }
      },
      renderContextNotice: () => {
        const currentFolder = this.libraryApp.currentFolder;
        if (!currentFolder) return createElement("div", { class: "d-none" });
        return createElement(
          "small",
          { class: "modal-subtitle" },
          `Uploading to folder: "${currentFolder.title}"`,
        );
      },
      getMakeImageSmall: () => this.makeImageSmall,
      setMakeImageSmall: (checked) => {
        this.makeImageSmall = checked;
      },
      filesInputId: "library-image-upload-files",
      folderInputId: "library-image-upload-folder",
      resizeOptionTitle: "Resizes image width to 100px while maintaining aspect ratio.",
    });
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
    if (this.folderLoading) {
      return [renderLoadingWithMessage("")];
    }

    if (!this.canUseLibraryPacks && this.activeTab === "packs") {
      this.activeTab = "images";
    }

    const isImagesTab = this.activeTab === "images" || !this.canUseLibraryPacks;
    const isSelectMode = !!this.libraryApp?.grid?.selectMode;
    return [
      this.renderSearchSection({ isImagesTab }),
      this.renderActionsSection({ isImagesTab, isSelectMode }),
    ];
  };
}
