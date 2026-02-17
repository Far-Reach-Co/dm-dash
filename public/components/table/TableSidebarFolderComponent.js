import createElement from "../createElement.js";
import { deleteThing, getThings } from "../../lib/apiUtils.js";
import renderLoadingWithMessage from "../loadingWithMessage.js";
import { buildFolderTree } from "../shared/folderTreeUtils.js";

export default class TableSidebarFolderComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "table-sidebar-folder-component";
    this.updateImagesList = props.updateImagesList;
    this.refreshImages = props.refreshImages;
    this.tableView = props.tableView;
    this.capabilities = props.capabilities || {};

    // project
    const searchParams = new URLSearchParams(window.location.search);
    this.projectId = searchParams.get("project");

    this.folderLoading = false;
    this.currentFolder = null;
    this.folders = [];
    this.showAllImages = true;
    this.expandedFolderIds = new Set();
    this.imageCountsByFolder = {};
    this.unsortedCount = null;
    this.allImagesTotal = null;

    this.render();
  }

  setCounts = (data) => {
    this.imageCountsByFolder = data.by_folder || {};
    this.unsortedCount =
      typeof data.unsorted === "number" ? data.unsorted : null;
    this.allImagesTotal = typeof data.total === "number" ? data.total : null;
    this.renderFolderTree();
  };

  pruneExpandedFolderIds = (folders) => {
    const validIds = new Set(folders.map((f) => String(f.id)));
    for (const id of Array.from(this.expandedFolderIds)) {
      if (!validIds.has(String(id))) {
        this.expandedFolderIds.delete(id);
      }
    }
  };

  loadFolders = async () => {
    let foldersData;
    if (this.projectId) {
      foldersData = await getThings(
        `/api/get_table_folders_by_project/${this.projectId}`,
      );
    } else {
      foldersData = await getThings("/api/get_table_folders_by_user");
    }
    this.folders = foldersData || [];
    this.pruneExpandedFolderIds(this.folders);
  };

  countImagesInFolder = (folderId) => {
    const key = String(folderId);
    if (Object.prototype.hasOwnProperty.call(this.imageCountsByFolder, key)) {
      return this.imageCountsByFolder[key];
    }
    return 0;
  };

  removeFolder = async (folder) => {
    if (
      !window.confirm(
        `Are you sure you want to remove folder: "${folder.title}"? All the images in this folder and it's sub-folders will be moved to the parent folder.`,
      )
    ) {
      return;
    }

    this.folderLoading = true;
    this.render();

    const suffix = this.tableView?.id
      ? `?table_view_id=${this.tableView.id}`
      : "";
    await deleteThing(`/api/remove_table_folder/${folder.id}${suffix}`);

    if (this.currentFolder && this.currentFolder.id == folder.id) {
      if (folder.parent_folder_id) {
        const parent = this.folders.find(
          (f) => f.id == folder.parent_folder_id,
        );
        this.currentFolder = parent || null;
      } else {
        this.currentFolder = null;
      }
    }

    await this.loadFolders();
    this.folderLoading = false;
    this.render();
    if (this.refreshImages) {
      this.refreshImages();
    } else if (this.updateImagesList) {
      this.updateImagesList();
    }
  };

  renderFolderTreeItem = (folder, depth = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = this.expandedFolderIds.has(folder.id);
    const isActive =
      !this.showAllImages &&
      this.currentFolder &&
      this.currentFolder.id == folder.id;
    const imgCount = this.countImagesInFolder(folder.id);

    const toggle = createElement(
      "span",
      {
        class: "library-folder-toggle" + (isExpanded ? " expanded" : ""),
      },
      hasChildren ? "▶" : "",
    );

    const name = createElement("span", {}, folder.title);

    const count = createElement(
      "span",
      { class: "library-folder-count" },
      imgCount > 0 ? `(${imgCount})` : "",
    );

    const deleteBtn = createElement(
      "span",
      { class: "library-folder-actions", title: "Delete folder" },
      "×",
      {
        type: "click",
        event: (e) => {
          e.stopPropagation();
          this.removeFolder(folder);
        },
      },
    );

    const item = createElement(
      "div",
      {
        class:
          "library-folder-item" +
          (isActive ? " library-folder-item-active" : ""),
        style: `padding-left: ${12 + depth * 18}px`,
      },
      [
        toggle,
        name,
        count,
        ...(this.capabilities.canManageFolders ? [deleteBtn] : []),
      ],
      {
        type: "click",
        event: () => {
          if (hasChildren) {
            if (isExpanded) {
              this.expandedFolderIds.delete(folder.id);
            } else {
              this.expandedFolderIds.add(folder.id);
            }
          }
          this.showAllImages = false;
          this.currentFolder = folder;
          this.renderFolderTree();
          if (this.updateImagesList) {
            this.updateImagesList();
          }
        },
      },
    );

    const items = [item];
    if (hasChildren && isExpanded) {
      const childContainer = createElement("div", {
        class: "library-folder-children",
      });
      for (const child of folder.children) {
        const childItems = this.renderFolderTreeItem(child, depth + 1);
        for (const ci of childItems) {
          childContainer.append(ci);
        }
      }
      items.push(childContainer);
    }

    return items;
  };

  renderFolderTree = () => {
    if (!this.folderTreeContainer) return;

    while (this.folderTreeContainer.firstChild) {
      this.folderTreeContainer.removeChild(this.folderTreeContainer.firstChild);
    }

    const tree = buildFolderTree(this.folders);

    const unsortedCount =
      typeof this.unsortedCount === "number" ? this.unsortedCount : 0;

    const allItem = createElement(
      "div",
      {
        class:
          "library-folder-item" +
          (this.showAllImages ? " library-folder-item-active" : ""),
        style: "padding-left: 12px",
      },
      [
        createElement("span", { class: "library-folder-toggle" }, ""),
        createElement("span", {}, "All Images"),
        createElement(
          "span",
          { class: "library-folder-count" },
          (this.allImagesTotal ?? 0) > 0
            ? `(${this.allImagesTotal ?? 0})`
            : "",
        ),
      ],
      {
        type: "click",
        event: () => {
          this.showAllImages = true;
          this.currentFolder = null;
          this.renderFolderTree();
          if (this.updateImagesList) {
            this.updateImagesList();
          }
        },
      },
    );

    const unsortedActive = !this.showAllImages && !this.currentFolder;
    const unsortedItem = createElement(
      "div",
      {
        class:
          "library-folder-item" +
          (unsortedActive ? " library-folder-item-active" : ""),
        style: "padding-left: 12px",
      },
      [
        createElement("span", { class: "library-folder-toggle" }, ""),
        createElement("span", {}, "Unsorted"),
        createElement(
          "span",
          { class: "library-folder-count" },
          unsortedCount > 0 ? `(${unsortedCount})` : "",
        ),
      ],
      {
        type: "click",
        event: () => {
          this.showAllImages = false;
          this.currentFolder = null;
          this.renderFolderTree();
          if (this.updateImagesList) {
            this.updateImagesList();
          }
        },
      },
    );

    this.folderTreeContainer.append(allItem, unsortedItem);

    for (const root of tree) {
      const items = this.renderFolderTreeItem(root, 0);
      for (const item of items) {
        this.folderTreeContainer.append(item);
      }
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.folderLoading) {
      return this.domComponent.append(renderLoadingWithMessage(""));
    }

    if (!this.folders.length) {
      this.tempLoadingSpinner = renderLoadingWithMessage("");
      this.domComponent.append(this.tempLoadingSpinner);
      await this.loadFolders();
      if (this.tempLoadingSpinner) {
        this.tempLoadingSpinner.remove();
      }
    }

    this.folderTreeContainer = createElement("div", {
      class: "library-folder-tree",
    });
    this.domComponent.append(this.folderTreeContainer);
    this.renderFolderTree();
  };
}
