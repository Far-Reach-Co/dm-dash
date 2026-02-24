import createElement from "../createElement.js";
import { postThing } from "../../lib/apiUtils.js";
import { uploadProjectImage, uploadUserImage } from "../../lib/imageUtils.js";
import renderLoadingWithMessage from "../loadingWithMessage.js";
import modal from "../modal.js";

export default class LibrarySidebar {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "library-sidebar";
    this.libraryApp = props.libraryApp;
    this.projectId = props.projectId;

    this.makeImageSmall = false;
    this.folderLoading = false;
  }

  getCurrentFolderId = () => {
    return this.libraryApp.currentFolder?.id ?? null;
  };

  postByContext = (projectEndpoint, userEndpoint, data) => {
    if (this.projectId) {
      return postThing(projectEndpoint, { ...data, project_id: this.projectId });
    }
    return postThing(userEndpoint, data);
  };

  uploadImage = async (file) => {
    const newImage = this.projectId
      ? await uploadProjectImage(file, this.projectId, this.makeImageSmall)
      : await uploadUserImage(file, this.makeImageSmall);

    if (!newImage) return null;

    const tableImage = await this.postByContext(
      "/api/add_table_image_by_project",
      "/api/add_table_image_by_user",
      { image_id: newImage.id, folder_id: this.getCurrentFolderId() }
    );

    return { image: newImage, tableImage };
  };

  handleUpload = async (e) => {
    if (!e.target.files.length) return;
    modal.hide();

    try {
      this.libraryApp.grid.showLoading();

      await Promise.all(
        Array.from(e.target.files).map((file) => this.uploadImage(file))
      );

      // Refresh the grid after upload
      await this.libraryApp.refreshImagesForCurrentScope();
    } catch (err) {
      console.log(err);
      window.customAlertError("Something went wrong while uploading your image");
    }
  };

  renderUploadModal = () => {
    const smallImageCheckbox = createElement(
      "input",
      { type: "checkbox" },
      null,
      {
        type: "change",
        event: (e) => {
          this.makeImageSmall = e.target.checked;
        },
      }
    );
    smallImageCheckbox.checked = this.makeImageSmall;

    const currentFolder = this.libraryApp.currentFolder;
    const folderNotice = currentFolder
      ? createElement(
          "small",
          { class: "modal-subtitle" },
          `Uploading to folder: "${currentFolder.title}"`
        )
      : createElement("div", { class: "d-none" });

    return createElement("div", { class: "help-content" }, [
      createElement("h1", {}, "Add new Image"),
      folderNotice,
      createElement("h2", {}, "Options:"),
      createElement(
        "div",
        {
          class: "d-flex align-items-center justify-content-center ms-1",
          title: "Resizes image width to 100px while maintaining aspect ratio.",
        },
        [
          createElement("small", { class: "me-3" }, "Make image small (100px): "),
          smallImageCheckbox,
        ]
      ),
      createElement("br"),
      createElement(
        "input",
        {
          id: "library-image-upload",
          type: "file",
          accept: "image/*",
          class: "file-input-hidden",
          multiple: true,
        },
        null,
        {
          type: "change",
          event: (e) => this.handleUpload(e),
        }
      ),
      createElement(
        "label",
        {
          for: "library-image-upload",
          class: "label-btn",
          title: "Upload images",
        },
        "Choose Images"
      ),
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

    // Search section
    const searchSection = createElement(
      "div",
      { class: "library-sidebar-section" },
      [
        createElement("h3", {}, "Search"),
        createElement(
          "input",
          {
            class: "library-search-input",
            type: "text",
            placeholder: "Search images...",
          },
          null,
          {
            type: "input",
            event: (e) => {
              this.libraryApp.grid.setSearchQuery(e.target.value);
            },
          }
        ),
      ]
    );

    // Actions section
    const actionsSection = createElement(
      "div",
      { class: "library-sidebar-section" },
      [
        createElement("h3", {}, "Actions"),
        createElement("div", { class: "library-sidebar-actions" }, [
          createElement(
            "div",
            { class: "library-sidebar-btn" },
            "+ Upload Image",
            {
              type: "click",
              event: () => modal.show(this.renderUploadModal()),
            }
          ),
          createElement(
            "div",
            { class: "library-sidebar-btn" },
            "+ New Folder",
            {
              type: "click",
              event: () => modal.show(this.renderCreateFolderModal()),
            }
          ),
        ]),
      ]
    );

    this.domComponent.append(searchSection, actionsSection);
  };
}
