import createElement from "../createElement.js";
import TableSidebarImageComponent from "./TableSidebarImageComponent.js";
import {
  fallbackCopyTextToClipboard,
  copyTextToClipboard,
} from "../../lib/clipboard.js";
import modal from "../modal.js";
import { deleteThing, postThing } from "../../lib/apiUtils.js";
import tableSelect from "./tableSelect.js";
import socketIntegration from "./socketIntegration.js";
import { uploadProjectImage, uploadUserImage } from "../../lib/imageUtils.js";
import TableSidebarFolderComponent from "./TableSidebarFolderComponent.js";

export default class TableSidebar {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "sidebar";
    this.tableView = props.tableView;
    this.isVisible = false;
    this.navigate = props.navigate;
    this.tableApp = props.tableApp;

    // project
    const searchParams = new URLSearchParams(window.location.search);
    this.projectId = searchParams.get("project");

    this.makeImageSmall = false;

    // table folders component
    this.tableSidebarFolderComponent = new TableSidebarFolderComponent({
      domComponent: createElement("div"),
    });

    // table sidebar component
    this.tableSidebarImageComponent = new TableSidebarImageComponent({
      domComponent: createElement("div"),
      tableView: this.tableView,
      tableApp: this.tableApp,
      getCurrentFolder: () => {
        return this.tableSidebarFolderComponent.currentFolder;
      },
    });

    // setup functions to allow folder component to call render on images
    this.tableSidebarFolderComponent.updateImagesList =
      this.tableSidebarImageComponent.updateImagesList;
    this.tableSidebarFolderComponent.imagesRender =
      this.tableSidebarImageComponent.render;

    // setup online users component
    this.onlineUsersComponent = new OnlineUsersComponent({
      domComponent: createElement("div"),
    });
  }

  renderCloseBtn = () => {
    return createElement(
      "div",
      { class: "sidebar-panel-btn", title: "Close sidebar" },
      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
      { type: "click", event: this.close }
    );
  };

  renderSettingsBtn = () => {
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

  addImageToSidebar = async (e) => {
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
        window.alert("Something went wrong while uploading your image");
      }
    }
  };

  renderCreatingImageInFolderNotice = () => {
    if (this.tableSidebarFolderComponent.currentFolder) {
      return createElement(
        "small",
        {},
        `Creating image in folder: "${this.tableSidebarFolderComponent.currentFolder.title}"`,
      );
    } else return createElement("div", { class: "d-none" });
  };

  renderUploadImage = () => {
    const smallImageCheckboxComponent = createElement(
      "input",
      { type: "checkbox" },
      null,
      {
        type: "change",
        event: (e) => {
          this.makeImageSmall = e.target.value;
        },
      },
    );
    smallImageCheckboxComponent.checked = this.makeImageSmall;

    return createElement("div", { class: "help-content" }, [
      createElement("h1", {}, "Add new Image"),
      this.renderCreatingImageInFolderNotice(),
      createElement("br"),
      createElement("h2", {}, "Options:"),
      createElement(
        "div",
        {
          class: "d-flex align-items-center justify-content-center ms-1",
          title:
            "If image width is larger than 100px this resizes the image width to 100px while maintaining the aspect ratio. It also will prevent long loading time as the image size will be reduced.",
        },
        [
          createElement(
            "small",
            { class: "me-3" },
            "Make image small (100px): ",
          ),
          smallImageCheckboxComponent,
        ],
      ),
      createElement("br"),
      createElement(
        "input",
        {
          id: "image",
          name: "image",
          type: "file",
          accept: "image/*",
          class: "d-none",
          style: "display: none;", // Override because class is not working here
          multiple: true,
        },
        null,
        {
          type: "change",
          event: async (e) => {
            await this.addImageToSidebar(e);
          },
        },
      ),
      createElement(
        "label",
        {
          for: "image",
          class: "label-btn",
          title: "Upload image to be used on virtual table",
        },
        "Choose Images",
      ),
    ]);
  };

  renderCreatingSubFolderNotice = () => {
    if (this.tableSidebarFolderComponent.currentFolder) {
      return createElement(
        "small",
        {},
        `Creating sub-folder in: "${this.tableSidebarFolderComponent.currentFolder.title}"`,
      );
    } else return createElement("div", { class: "d-none" });
  };

  renderCreateFolder = () => {
    return createElement("div", { class: "help-content" }, [
      createElement("h1", {}, "Create Folder"),
      this.renderCreatingSubFolderNotice(),
      createElement(
        "form",
        {},
        [
          createElement("div", { class: "input-container" }, [
            createElement(
              "label",
              {
                for: "title",
                class: "me-1",
              },
              "Title",
            ),
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
            this.tableSidebarFolderComponent.toggleFolderLoading();

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
              this.tableSidebarFolderComponent.clearFolders();
            } catch (err) {
              console.log(err);
              window.alert("Something went wrong when creating a new folder");
            } finally {
              this.tableSidebarFolderComponent.toggleFolderLoading();
            }
          },
        },
      ),
    ]);
  };

  renderTableSettings = async () => {
    return createElement("div", { class: "help-content" }, [
      createElement("h1", {}, "Table Settings"),
      createElement("hr"),
      createElement("h2", {}, "Change Table"),
      createElement(
        "small",
        {},
        "This will move everyone viewing this table to another table",
      ),
      createElement(
        "form",
        {},
        [await tableSelect(), createElement("Button", { class: "ms-2" }, "Go")],
        {
          type: "submit",
          event: (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const formProps = Object.fromEntries(formData);
            const tableUUID = formProps.table_uuid;
            if (tableUUID != 0) {
              // push all viewers
              socketIntegration.tableChanged(tableUUID);
              // push current user
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set("uuid", tableUUID);
              const newSearchParamsString = searchParams.toString();

              const newUrl =
                window.location.pathname + "?" + newSearchParamsString;

              window.location.href = newUrl;
            }
          },
        },
      ),
      createElement("hr"),
      createElement("h2", {}, "Details"),
      createElement("div", {}, [
        createElement("div", { class: "input-container" }, [
          createElement(
            "label",
            {
              for: "title",
              class: "me-1",
            },
            "Edit Title",
          ),
          createElement("input", {
            value: this.tableView.title,
            name: "title",
            id: "title-input",
          }),
        ]),
        createElement("br"),
        createElement("div", { class: "d-flex align-items-center" }, [
          createElement(
            "small",
            {
              class: "text-orange me-1",
              class: "font-bold",
            },
            "Make Public",
          ),
          this.tableView.is_public
            ? createElement("input", {
                type: "checkbox",
                name: "is_public",
                id: "is_public-input",
                checked: true,
              })
            : createElement("input", {
                type: "checkbox",
                name: "is_public",
                id: "is_public-input",
              }),
        ]),
        createElement("br"),
        createElement("button", { class: "new-btn me-1" }, "Save", {
          type: "click",
          event: (e) => {
            e.preventDefault();
            const titleInput = document.getElementById("title-input");
            const is_publicInput = document.getElementById("is_public-input");

            const res = postThing(`/api/edit_table_view/${this.tableView.id}`, {
              title: titleInput.value,
              is_public: is_publicInput.checked,
            });
            if (res) {
              // update success message
              const titleUpdateMessageElem = document.querySelector(
                "#title-update-success",
              );
              titleUpdateMessageElem.innerText = "Saved!";
              // remove after 3 seconds
              setTimeout(() => {
                titleUpdateMessageElem.innerText = "";
              }, 3000); // 10seconds
              // update table title on sidebar
              document.querySelector("#table-display-title").innerText =
                titleInput.value;
              // update local tableState just in case
              this.tableView.title = titleInput.value;
              this.tableView.is_public = is_publicInput.checked;
            }
          },
        }),
        createElement("small", {
          class: "success-message",
          id: "title-update-success",
        }),

        createElement("hr"),
        createElement("button", { class: "btn-red" }, "Delete Table", {
          type: "click",
          event: (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (
              window.confirm(
                `Are you sure you want to delete ${this.tableView.title}`,
              )
            ) {
              deleteThing(`/api/remove_table_view/${this.tableView.id}`);
              window.location.pathname = "/dash";
            }
          },
        }),
      ]),
    ]);
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
    this.onlineUsersComponent.render();

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
      createElement(
        "div",
        { class: "sidebar-action-btn", title: "Upload image to be used on virtual table" },
        "+ Image",
        {
          type: "click",
          event: () => {
            if (this.tableSidebarImageComponent.imageLoading) return;
            modal.show(this.renderUploadImage());
          },
        },
      ),
      createElement(
        "div",
        { class: "sidebar-action-btn", title: "Create a new folder space for your images" },
        "+ Folder",
        {
          type: "click",
          event: () => {
            if (this.tableSidebarFolderComponent.folderLoading) return;
            modal.show(this.renderCreateFolder());
          },
        },
      ),
      this.renderShareBtn(),
    ]);

    const container = createElement("div", { class: "sidebar-container" }, [
      header,
      actions,
      this.tableSidebarFolderComponent.domComponent,
      this.tableSidebarImageComponent.domComponent,
      createElement("div", { class: "sidebar-header" }, "Online"),
      this.onlineUsersComponent.domComponent,
    ]);

    this.container = container;
    this.open();
    return this.domComponent.append(container);
  };
}

class OnlineUsersComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "online-users-container";

    this.usersList = [];
  }

  renderUsersList = () => {
    if (!this.usersList.length) return [createElement("small", {}, "None...")];

    return this.usersList.map((user) => {
      return createElement(
        "div",
        {
          class: "online-user-item",
        },
        [
          createElement("div", { class: "online-indicator" }),
          createElement("div", {}, user.username),
          createElement("br"),
        ],
      );
    });
  };

  render = () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(...this.renderUsersList());
  };
}
