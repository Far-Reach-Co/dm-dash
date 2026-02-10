import createElement from "../createElement.js";
import { deleteThing, getThings, postThing } from "../../lib/apiUtils.js";
import modal from "../modal.js";
import renderImageSettingsModal from "../shared/imageSettingsModal.js";
import { buildFolderTree } from "../shared/folderTreeUtils.js";

export default class LibraryGrid {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "library-content";
    this.libraryApp = props.libraryApp;
    this.projectId = props.projectId;

    this.images = [];
    this.total = 0;
    this.limit = 50;
    this.offset = 0;
    this.searchQuery = "";
    this.currentFolder = null;
    this.loading = false;
    this.showAllImages = true;
    this.expandedFolderIds = new Set();
    this.sortKey = "newest";
    this.imageCountsByFolder = {};
    this.unsortedCount = null;
    this.allImagesTotal = null;
  }

  pruneExpandedFolderIds = (folders) => {
    const validIds = new Set(folders.map((f) => String(f.id)));
    for (const id of Array.from(this.expandedFolderIds)) {
      if (!validIds.has(String(id))) {
        this.expandedFolderIds.delete(id);
      }
    }
  };

  showLoading = () => {
    this.loading = true;
    this.renderGrid();
  };

  hideLoading = () => {
    this.loading = false;
    this.renderGrid();
  };

  setImages = (data) => {
    this.loading = false;
    this.images = data.images;
    this.total = data.total;
    this.limit = data.limit;
    this.offset = data.offset;
    this.updateHeaderCount();
    this.renderGrid();
  };

  appendImages = (data) => {
    this.loading = false;
    this.images = [...this.images, ...data.images];
    this.total = data.total;
    this.offset = data.offset;
    this.updateHeaderCount();
    this.renderGrid();
  };

  updateHeaderCount = () => {
    if (this.headerCountElem) {
      this.headerCountElem.textContent =
        this.total > 0 ? `${this.total} images` : "";
    }
  };

  updateHeaderScope = () => {
    if (!this.headerScopeElem) return;
    let scopeLabel = "Unsorted";
    if (this.showAllImages) {
      scopeLabel = "All Images";
    } else if (this.currentFolder) {
      scopeLabel = this.currentFolder.title || "Folder";
    }
    this.headerScopeElem.textContent = scopeLabel;
  };

  setSearchQuery = (query) => {
    this.searchQuery = query;
    this.renderGrid();
  };

  setCounts = (data) => {
    this.imageCountsByFolder = data.by_folder || {};
    this.unsortedCount =
      typeof data.unsorted === "number" ? data.unsorted : null;
    this.allImagesTotal = typeof data.total === "number" ? data.total : null;
    this.renderFolderTree();
  };

  filterByFolder = (folder) => {
    this.currentFolder = folder;
    this.renderGrid();
  };

  getDeleteEndpoint = (imageId) => {
    return this.projectId
      ? `/api/remove_image_by_project/${imageId}/${this.projectId}`
      : `/api/remove_image_by_user/${imageId}`;
  };

  formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  getFilteredImages = () => {
    let filtered = this.images.slice();

    // Filter by folder (skip when showing all images)
    if (!this.showAllImages) {
      if (this.currentFolder) {
        filtered = filtered.filter(
          (img) => img.folder_id && img.folder_id == this.currentFolder.id,
        );
      } else {
        filtered = filtered.filter((img) => !img.folder_id);
      }
    }

    // Filter by search
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter((img) =>
        img.original_name.toLowerCase().includes(q),
      );
    }

    // Sort
    if (this.sortKey === "name") {
      filtered.sort((a, b) =>
        (a.original_name || "").localeCompare(b.original_name || ""),
      );
    } else if (this.sortKey === "size") {
      filtered.sort((a, b) => (b.size || 0) - (a.size || 0));
    } else {
      // Newest first (fallback to image_id)
      filtered.sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (aTime && bTime && aTime !== bTime) return bTime - aTime;
        return (b.image_id || 0) - (a.image_id || 0);
      });
    }

    return filtered;
  };

  removeFolder = async (folder) => {
    if (
      !window.confirm(
        `Are you sure you want to remove folder: "${folder.title}"? Images will be moved to the parent folder.`,
      )
    )
      return;

    await deleteThing(`/api/remove_table_folder/${folder.id}`);

    // If we were viewing this folder, go back to parent or unsorted
    if (this.currentFolder && this.currentFolder.id == folder.id) {
      if (folder.parent_folder_id) {
        const parent = this.libraryApp.folders.find(
          (f) => f.id == folder.parent_folder_id,
        );
        this.libraryApp.setCurrentFolder(parent || null);
      } else {
        this.libraryApp.setCurrentFolder(null);
      }
    }

    await this.libraryApp.loadFolders();
    await this.libraryApp.refreshImagesForCurrentScope();
  };

  countImagesInFolder = (folderId) => {
    const key = String(folderId);
    if (Object.prototype.hasOwnProperty.call(this.imageCountsByFolder, key)) {
      return this.imageCountsByFolder[key];
    }
    return this.images.filter(
      (img) => img.folder_id && img.folder_id == folderId,
    ).length;
  };

  renderFolderTreeItem = (folder, depth = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = this.expandedFolderIds.has(folder.id);
    const isActive =
      !this.showAllImages &&
      this.currentFolder &&
      this.currentFolder.id == folder.id;
    const imgCount = this.countImagesInFolder(folder.id);

    // Toggle arrow
    const toggle = createElement(
      "span",
      {
        class: "library-folder-toggle" + (isExpanded ? " expanded" : ""),
      },
      hasChildren ? "▶" : "",
    );

    // Folder name
    const name = createElement("span", {}, folder.title);

    // Count badge
    const count = createElement(
      "span",
      { class: "library-folder-count" },
      imgCount > 0 ? `(${imgCount})` : "",
    );

    // Delete button
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
      [toggle, name, count, deleteBtn],
      {
        type: "click",
        event: () => {
          // Toggle expand/collapse if has children
          if (hasChildren) {
            if (isExpanded) {
              this.expandedFolderIds.delete(folder.id);
            } else {
              this.expandedFolderIds.add(folder.id);
            }
          }
          // Set as active folder
          this.showAllImages = false;
          this.currentFolder = folder;
          this.libraryApp.currentFolder = folder;
          this.renderFolderTree();
          this.renderGrid();
          this.libraryApp.loadImagesForFolder(folder.id);
        },
      },
    );

    const items = [item];

    // Render children if expanded
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

    const folders = this.libraryApp.folders;
    const tree = buildFolderTree(folders);

    const unsortedCount =
      typeof this.unsortedCount === "number"
        ? this.unsortedCount
        : this.images.filter((img) => !img.folder_id).length;

    // "All Images" item
    const allActive = this.showAllImages;
    const allItem = createElement(
      "div",
      {
        class:
          "library-folder-item" +
          (allActive ? " library-folder-item-active" : ""),
        style: "padding-left: 12px",
      },
      [
        createElement("span", { class: "library-folder-toggle" }, ""),
        createElement("span", {}, "All Images"),
        createElement(
          "span",
          { class: "library-folder-count" },
          (this.allImagesTotal ?? this.images.length) > 0
            ? `(${this.allImagesTotal ?? this.images.length})`
            : "",
        ),
      ],
      {
        type: "click",
        event: () => {
          this.showAllImages = true;
          this.currentFolder = null;
          this.libraryApp.currentFolder = null;
          this.renderFolderTree();
          this.renderGrid();
          this.libraryApp.loadImages(true);
        },
      },
    );

    // "Unsorted" item
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
          this.libraryApp.currentFolder = null;
          this.renderFolderTree();
          this.renderGrid();
          this.libraryApp.loadImagesForFolder(null);
        },
      },
    );

    this.folderTreeContainer.append(allItem, unsortedItem);

    // Render folder tree items
    for (const root of tree) {
      const items = this.renderFolderTreeItem(root, 0);
      for (const item of items) {
        this.folderTreeContainer.append(item);
      }
    }

    this.updateHeaderScope();
  };

  deleteImage = async (image) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${image.original_name}"?`,
      )
    )
      return;

    await deleteThing(this.getDeleteEndpoint(image.image_id));
    this.images = this.images.filter((img) => img.image_id !== image.image_id);
    this.total = Math.max(0, this.total - 1);
    modal.hide();
    this.renderGrid();
  };

  renderImageDetailModal = async (image) => {
    return await renderImageSettingsModal({
      image,
      projectId: this.projectId,
      tableImageId: image.id,
      onDelete: () => this.deleteImage(image),
      onUpdate: () => this.renderGrid(),
    });
  };

  renderCard = (image, index) => {
    const thumbElem = image.src
      ? createElement("img", {
          class: "library-card-thumb",
          src: image.src,
          alt: image.original_name,
          loading: "lazy",
        })
      : createElement("div", { class: "library-card-thumb" });

    const info = createElement("div", { class: "library-card-info" }, [
      createElement("div", { class: "library-card-name" }, image.original_name),
      createElement(
        "div",
        { class: "library-card-size" },
        this.formatFileSize(image.size),
      ),
    ]);

    const card = createElement(
      "div",
      { class: "library-card" },
      [thumbElem, info],
      {
        type: "click",
        event: async () => {
          modal.show(await this.renderImageDetailModal(image));
        },
      },
    );

    // Set stagger index for CSS entrance animation
    card.style.setProperty("--card-index", Math.min(index, 20));

    return card;
  };

  renderGrid = () => {
    if (!this.gridContainer) return;

    // Clear children safely using DOM API
    while (this.gridContainer.firstChild) {
      this.gridContainer.removeChild(this.gridContainer.firstChild);
    }

    if (this.loading) {
      const skeletonCount = 12;
      for (let i = 0; i < skeletonCount; i += 1) {
        const skeleton = createElement(
          "div",
          { class: "library-card library-skeleton" },
          [
            createElement("div", {
              class: "library-card-thumb library-skeleton-thumb",
            }),
            createElement("div", { class: "library-card-info" }, [
              createElement("div", { class: "library-skeleton-line" }),
              createElement("div", { class: "library-skeleton-line short" }),
            ]),
          ],
        );
        this.gridContainer.append(skeleton);
      }
      return;
    }

    this.updateHeaderScope();
    const filtered = this.getFilteredImages();

    if (!filtered.length) {
      this.gridContainer.append(
        createElement(
          "div",
          { class: "library-empty" },
          this.images.length
            ? "No images match your search or folder."
            : "No images yet. Upload some images to get started!",
        ),
      );
      return;
    }

    filtered.forEach((image, index) => {
      this.gridContainer.append(this.renderCard(image, index));
    });

    // Load more button
    if (this.showAllImages && this.images.length < this.total) {
      this.gridContainer.append(
        createElement("div", { class: "library-load-more" }, [
          createElement(
            "button",
            { class: "library-load-more-btn" },
            `Load More (${this.images.length} of ${this.total})`,
            {
              type: "click",
              event: () => this.libraryApp.loadMore(),
            },
          ),
        ]),
      );
    }
  };

  render = () => {
    // Clear children safely using DOM API
    while (this.domComponent.firstChild) {
      this.domComponent.removeChild(this.domComponent.firstChild);
    }

    // Header with count
    const countText =
      this.total > 0
        ? createElement(
            "span",
            { class: "library-breadcrumb" },
            `${this.total} images`,
          )
        : createElement("span", { class: "library-breadcrumb" }, "");
    const header = createElement("div", { class: "library-header" }, [
      createElement("h1", {}, "Image Library"),
      createElement("div", { class: "library-header-meta" }, [
        createElement("span", { class: "library-scope" }, "Unsorted"),
        countText,
      ]),
      createElement(
        "select",
        { class: "library-sort-select", title: "Sort images" },
        [
          createElement("option", { value: "newest" }, "Newest"),
          createElement("option", { value: "name" }, "Name"),
          createElement("option", { value: "size" }, "Size"),
        ],
        {
          type: "change",
          event: (e) => {
            this.sortKey = e.target.value;
            this.renderGrid();
          },
        },
      ),
    ]);
    this.headerCountElem = countText;
    this.headerScopeElem = header.querySelector(".library-scope");

    // Folder tree container
    this.folderTreeContainer = createElement("div", {
      class: "library-folder-tree",
    });

    // Grid container
    this.gridContainer = createElement("div", { class: "library-grid" });

    this.domComponent.append(
      header,
      this.folderTreeContainer,
      this.gridContainer,
    );
    this.renderFolderTree();
    this.renderGrid();
  };
}
