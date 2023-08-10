import createElement from "./createElement.js";
import { deleteThing, getThings } from "./apiUtils.js";
import renderLoadingWithMessage from "./loadingWithMessage.js";

export default class TableSidebarFolderComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "table-sidebar-folder-component";
    this.updateImagesList = props.updateImagesList;
    this.imagesRender = props.imagesRender;
    // project
    const searchParams = new URLSearchParams(window.location.search);
    this.projectId = searchParams.get("project");

    this.folderLoading = false;
    this.currentFolder = null;
    this.folders = [];

    this.render();
  }

  toggleFolderLoading = () => {
    this.folderLoading = !this.folderLoading;
    this.render();
  };

  clearFolders = () => {
    this.folders = [];
  };

  renderFolders = async () => {
    // get folders data if we don't have it
    if (!this.folders.length) {
      let foldersData;
      if (this.projectId) {
        foldersData = await getThings(
          `/api/get_table_folders_by_project/${this.projectId}`
        );
      } else {
        foldersData = await getThings("/api/get_table_folders_by_user");
      }
      // remove temp loading spinner
      this.tempLoadingSpinner.remove();

      // save all folders to local state
      this.folders = foldersData;
    }

    // don't interfere with state
    let folders = this.folders;
    // filter by sub folders of current
    folders = folders.filter((folder) => {
      if (this.currentFolder) {
        return folder.parent_folder_id == this.currentFolder.id;
      } else return !folder.parent_folder_id;
    });
    // if none
    if (!folders.length) {
      return [createElement("small", {}, "No sub folders...")];
    }
    // map to create elem
    return folders.map((folder) => {
      let folderClass = "folder-item";
      if (this.currentFolder && this.currentFolder.id == folder.id) {
        folderClass = "folder-item-selected";
      }

      return createElement("a", { class: folderClass }, folder.title, {
        type: "click",
        event: (e) => {
          e.preventDefault();
          this.currentFolder = folder;
          this.render();
          this.updateImagesList();
        },
      });
    });
  };

  renderCurrentFolderBackButton = async () => {
    if (this.currentFolder) {
      if (this.currentFolder.parent_folder_id) {
        // get parent index
        const parentFolder = this.folders.filter(
          (folder) => folder.id == this.currentFolder.parent_folder_id
        )[0];
        const parentFolderIndex = this.folders.indexOf(parentFolder);
        return createElement(
          "a",
          { class: "folder-item" },
          `..${parentFolder.title}`,
          {
            type: "click",
            event: (e) => {
              e.preventDefault();
              // set new current folder
              this.currentFolder = this.folders[parentFolderIndex];
              this.render();
              this.updateImagesList();
            },
          }
        );
      } else {
        return createElement("a", { class: "folder-item" }, "..", {
          type: "click",
          event: (e) => {
            e.preventDefault();
            // return to home
            this.currentFolder = null;
            this.render();
            this.updateImagesList();
          },
        });
      }
    } else return createElement("div", { style: "display: none;" });
  };

  renderRemoveFolder = () => {
    if (this.currentFolder) {
      return createElement(
        "div",
        { style: "color: var(--red1)", class: "folder-item" },
        `Remove ${this.currentFolder.title}`,
        {
          type: "click",
          event: async (e) => {
            e.preventDefault();
            if (
              window.confirm(
                `Are you sure you want to remove folder: "${this.currentFolder.title}"? All the images in this folder and it's sub-folders will be moved to the parent folder.`
              )
            ) {
              // run loading
              this.toggleFolderLoading();
              // remove
              await deleteThing(
                `/api/remove_table_folder/${this.currentFolder.id}`
              );
              // handle UI
              if (this.currentFolder.parent_folder_id) {
                // get parent index
                const parentFolder = this.folders.filter(
                  (folder) => folder.id == this.currentFolder.parent_folder_id
                )[0];
                const parentFolderIndex = this.folders.indexOf(parentFolder);
                // set new current folder
                this.currentFolder = this.folders[parentFolderIndex];
              } else {
                this.currentFolder = null;
              }
              // clear state
              this.clearFolders();
              // stop loading
              this.folderLoading = !this.folderLoading;
              await this.render();
              // completely refresh images and image state
              this.imagesRender();
            }
          },
        }
      );
    } else {
      return createElement("div", { style: "display: none;" });
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.folderLoading) {
      return this.domComponent.append(renderLoadingWithMessage(""));
    }

    // temp spinner while loading folders
    if (!this.folders.length) {
      this.tempLoadingSpinner = renderLoadingWithMessage("");
      this.domComponent.append(this.tempLoadingSpinner);
    }

    this.domComponent.append(
      await this.renderCurrentFolderBackButton(),
      ...(await this.renderFolders()),
      this.renderRemoveFolder()
    );
  };
}
