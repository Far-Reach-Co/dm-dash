import createElement from "../lib/createElement.js";
import TableSidebarImageComponent from "../lib/TableSidebarImageComponent.js";
import {
  fallbackCopyTextToClipboard,
  copyTextToClipboard,
} from "../lib/clipboard.js";
import modal from "./modal.js";
import { deleteThing, postThing } from "../lib/apiUtils.js";
import tableSelect from "../lib/tableSelect.js";
import socketIntegration from "../lib/socketIntegration.js";
import { uploadUserImage } from "../lib/imageUtils.js";
import TableSidebarFolderComponent from "../lib/TableSidebarFolderComponent.js";

export default class TableSidebar {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "sidebar";
    this.tableView = props.tableView;
    this.isVisible = false;
    this.navigate = props.navigate;

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

  renderCloseSidebarElem = () => {
    const elem = createElement("img", {
      id: "close-sidebar",
      class: "close-sidebar",
      src: "/assets/sidebar.svg",
      title: "Toggle sidebar",
      height: 32,
      width: 32,
    });
    elem.addEventListener("click", this.close);
    return elem;
  };

  close = () => {
    this.isVisible = false;
    if (this.container && this.container.style)
      this.container.style.transform = "translate(200px, 0px)";
    if (this.domComponent && this.domComponent.style)
      this.domComponent.style.zIndex = "2";
  };

  open = () => {
    this.isVisible = true;
    if (this.container && this.container.style)
      this.container.style.transform = "translate(0px, 0px)";
    if (this.domComponent && this.domComponent.style)
      this.domComponent.style.zIndex = "4";
  };

  hide = () => {
    this.close();
    this.domComponent.innerHTML = "";
  };

  uploadTableImage = async (file) => {
    const newImage = await uploadUserImage(file, this.makeImageSmall);
    if (newImage) {
      // add new table image
      if (this.projectId) {
        await postThing(`/api/add_table_image_by_project`, {
          project_id: this.projectId,
          image_id: newImage.id,
          folder_id: this.tableSidebarFolderComponent.currentFolder
            ? this.tableSidebarFolderComponent.currentFolder.id
            : null,
        });
      } else {
        await postThing(`/api/add_table_image_by_user`, {
          image_id: newImage.id,
          folder_id: this.tableSidebarFolderComponent.currentFolder
            ? this.tableSidebarFolderComponent.currentFolder.id
            : null,
        });
      }
    }
  };

  addImageToSidebar = async (e) => {
    if (e.target.files.length) {
      modal.hide();
      try {
        this.tableSidebarImageComponent.toggleImageLoading();
        if (e.target.files.length > 1) {
          // multiple
          await Promise.all(
            Array.from(e.target.files).map(async (file) => {
              await this.uploadTableImage(file);
            })
          );
        } else {
          await this.uploadTableImage(e.target.files[0]);
        }
        // upload table imge

        this.tableSidebarImageComponent.toggleImageLoading();
      } catch (err) {
        console.log(err);
        this.tableSidebarImageComponent.toggleImageLoading();
        window.alert("Something went wrong while uploading your image");
      }
    }
  };

  renderCreatingImageInFolderNotice = () => {
    if (this.tableSidebarFolderComponent.currentFolder) {
      return createElement(
        "small",
        {},
        `Creating image in folder: "${this.tableSidebarFolderComponent.currentFolder.title}"`
      );
    } else return createElement("div", { style: "display: none;" });
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
      }
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
          style:
            "display: flex; align-items: center; justify-content: center; margin-left: 5px;",
          title:
            "If image width is larger than 100px this resizes the image width to 100px while maintaining the aspect ratio. It also will prevent long loading time as the image size will be reduced.",
        },
        [
          createElement(
            "small",
            { style: "margin-right: var(--main-distance)" },
            "Make image small (100px): "
          ),
          smallImageCheckboxComponent,
        ]
      ),
      createElement("br"),
      createElement(
        "input",
        {
          id: "image",
          name: "image",
          type: "file",
          accept: "image/*",
          style: "display: none",
          multiple: true,
        },
        null,
        {
          type: "change",
          event: async (e) => {
            await this.addImageToSidebar(e);
          },
        }
      ),
      createElement(
        "label",
        {
          for: "image",
          class: "label-btn",
          title: "Upload image to be used on virtual table",
        },
        "Choose Image"
      ),
    ]);
  };

  renderCreatingSubFolderNotice = () => {
    if (this.tableSidebarFolderComponent.currentFolder) {
      return createElement(
        "small",
        {},
        `Creating sub-folder in: "${this.tableSidebarFolderComponent.currentFolder.title}"`
      );
    } else return createElement("div", { style: "display: none;" });
  };

  renderCreateFolder = () => {
    return createElement("div", { class: "help-content" }, [
      createElement("h1", {}, "Create Folder"),
      this.renderCreatingSubFolderNotice(),
      createElement(
        "form",
        {},
        [
          createElement(
            "label",
            {
              for: "title",
              class: "me-1",
            },
            "Title"
          ),
          createElement("input", {
            placeholder: "New Folder",
            name: "title",
            id: "title",
            required: true,
          }),
          createElement("br"),
          createElement("button", { class: "new-btn me-1" }, "Create"),
        ],
        {
          type: "submit",
          event: async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const formProps = Object.fromEntries(formData);
            const parentFolderId =
              this.tableSidebarFolderComponent.currentFolder &&
              this.tableSidebarFolderComponent.currentFolder.id
                ? this.tableSidebarFolderComponent.currentFolder.id
                : null;
            const isSub = parentFolderId ? true : false;

            // close the modal
            modal.hide();
            // show folder loading
            this.tableSidebarFolderComponent.toggleFolderLoading();
            try {
              if (this.projectId) {
                const newFolder = await postThing(
                  "/api/add_table_folder_by_project",
                  {
                    title: formProps.title,
                    project_id: this.projectId,
                    is_sub: isSub,
                    parent_folder_id: parentFolderId,
                  }
                );
                // on success clean folders so render gets fresh data
                this.tableSidebarFolderComponent.clearFolders();
                // set current folder as new folder
                this.tableSidebarFolderComponent.currentFolder = newFolder;
              } else {
                const newFolder = await postThing(
                  "/api/add_table_folder_by_user",
                  {
                    title: formProps.title,
                    is_sub: isSub,
                    parent_folder_id: parentFolderId,
                  }
                );
                // on success clean folders so render gets fresh data
                this.tableSidebarFolderComponent.clearFolders();
                // set current folder as new folder
                this.tableSidebarFolderComponent.currentFolder = newFolder;
              }
              // stop loading
              this.tableSidebarFolderComponent.toggleFolderLoading();
              // refresh images
              this.tableSidebarImageComponent.updateImagesList();
            } catch (err) {
              console.log(err);
              this.tableSidebarFolderComponent.toggleFolderLoading();
              window.alert("Something went wrong when creating a new folder");
            }
          },
        }
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
        "This will move everyone viewing this table to another table"
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

              window.history.replaceState(null, null, newUrl);

              // Reload the page
              window.location.reload();
            }
          },
        }
      ),
      createElement("hr"),
      createElement("h2", {}, "Details"),
      createElement("div", {}, [
        createElement(
          "form",
          {},
          [
            createElement(
              "label",
              {
                for: "title",
                class: "me-1",
              },
              "Edit Title"
            ),
            createElement("input", {
              value: this.tableView.title,
              name: "title",
              id: "title",
              required: true,
            }),
            createElement("br"),
            createElement("button", { class: "new-btn me-1" }, "Save"),
            createElement("small", {
              class: "success-message",
              id: "title-update-success",
            }),
          ],
          {
            type: "submit",
            event: (e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const formProps = Object.fromEntries(formData);
              const res = postThing(
                `/api/edit_table_view_title/${this.tableView.id}`,
                {
                  title: formProps.title,
                }
              );
              if (res) {
                // update success message
                const titleUpdateMessageElem = document.querySelector(
                  "#title-update-success"
                );
                titleUpdateMessageElem.innerText = "Saved!";
                // remove after 3 seconds
                setTimeout(() => {
                  titleUpdateMessageElem.innerText = "";
                }, 3000); // 10seconds
                // update table title on sidebar
                document.querySelector("#table-display-title").innerText =
                  formProps.title;
                // update local tableState just in case
                this.tableView.title = formProps.title;
              }
            },
          }
        ),
        createElement("hr"),
        createElement("button", { class: "btn-red" }, "Delete Table", {
          type: "click",
          event: (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (
              window.confirm(
                `Are you sure you want to delete ${this.tableView.title}`
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

  render = async () => {
    this.domComponent.innerHTML = "";

    this.tableSidebarImageComponent.render();
    this.onlineUsersComponent.render();

    const container = createElement(
      "div",
      {
        class: "sidebar-container",
      },
      [
        createElement(
          "div",
          {
            class:
              "d-flex align-items-center justify-content-between px-4 py-2",
          },
          [
            createElement(
              "div",
              { id: "table-display-title" },
              this.tableView.title
            ),
            createElement(
              "img",
              {
                class: "icon gear",
                src: "/assets/gears.svg",
                title: "Open Table Settings",
              },
              null,
              {
                type: "click",
                event: async () => {
                  modal.show(await this.renderTableSettings());
                },
              }
            ),
          ]
        ),
        createElement("button", {}, "Copy Share Link", {
          type: "click",
          event: () => {
            copyTextToClipboard(window.location);
          },
        }),
        createElement("br"),
        createElement(
          "div",
          {
            style: "display: flex; justify-content: space-around",
          },
          [
            createElement(
              "a",
              {
                title: "Upload image to be used on virtual table",
              },
              "+ Image",
              {
                type: "click",
                event: (e) => {
                  // dont allow more images while loading
                  if (this.tableSidebarImageComponent.imageLoading) return;
                  modal.show(this.renderUploadImage());
                },
              }
            ),
            createElement(
              "a",
              {
                title: "Create a new folder space for your images",
              },
              "+ Folder",
              {
                type: "click",
                event: (e) => {
                  // dont allow more folders while loading
                  if (this.tableSidebarFolderComponent.folderLoading) return;
                  modal.show(this.renderCreateFolder());
                },
              }
            ),
          ]
        ),
        createElement("br"),
        this.tableSidebarFolderComponent.domComponent,
        createElement("br"),
        this.tableSidebarImageComponent.domComponent,
        createElement("div", { class: "sidebar-header" }, "Online Users"),
        this.onlineUsersComponent.domComponent,
        this.renderCloseSidebarElem(),
      ]
    );
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
        ]
      );
    });
  };

  render = () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(...this.renderUsersList());
  };
}
