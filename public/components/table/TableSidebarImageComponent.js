import createElement from "../createElement.js";
import { deleteThing, getThings, postThing } from "../../lib/apiUtils.js";
import renderLoadingWithMessage from "../loadingWithMessage.js";
import imageFollowingCursor from "../imageFollowingCursor.js";
import detectMob from "../../lib/detectMobile.js";
import modal from "../../components/modal.js";
import renderImageSettingsModal from "../shared/imageSettingsModal.js";

export default class TableSidebarImageComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "table-sidebar-image-component";
    this.tableView = props.tableView;
    this.tableApp = props.tableApp;
    this.getCurrentFolder = props.getCurrentFolder;
    this.getFolderScope = props.getFolderScope;
    this.onCountsUpdated = props.onCountsUpdated;
    this.capabilities = props.capabilities || {};
    // project
    const searchParams = new URLSearchParams(window.location.search);
    this.projectId = searchParams.get("project");
    // utilities
    this.currentMouseDownImage = null;
    this.imageLoading = false;
    this.downloadedImageSourceList = {};
    this.tableImageSearchQuery = null;
    this.imageDataAndElems = null;
    this.sortKey = "newest";
    this.pageLimit = 60;
    this.pageOffset = 0;
    this.totalAvailable = 0;
    this.loadingPage = false;
    this.activeQueryKey = null;
    this.searchDebounceId = null;
    this.searchDebounceMs = 300;
    // Set From Canvas Layer
  }

  showLoading = () => {
    this.imageLoading = true;
    this.domComponent.innerHTML = "";
    this.domComponent.append(renderLoadingWithMessage(""));
  };

  hideLoading = () => {
    this.imageLoading = false;
    this.render();
  };

  renderImage = async (image) => {
    if (image.src) {
      this.downloadedImageSourceList[image.id] = image.src;

      const isMobile = detectMob();

      const handlers = [];

      if (!isMobile) {
        // Desktop: drag to place
        handlers.push({
          type: "mousedown",
          event: () => {
            imageFollowingCursor.setImageSrc(image.src);
            imageFollowingCursor.render();
            this.currentMouseDownImage = image;
          },
        });
      } else {
        // Mobile: tap to place
        handlers.push({
          type: "click",
          event: () => {
            this.tableApp.addImageToCanvas(image);
          },
        });
      }

      return createElement(
        "div",
        {
          class: "sidebar-image-container",
          title: "Click + drag or tap to place image on table",
        },
        createElement("img", {
          src: image.src,
          height: "38px",
          style: `${isMobile ? "" : "pointer-events: none;"} max-width: 38px;`, // ✨ Only apply pointer-events:none if NOT mobile
        }),
        ...handlers,
      );
    }
  };

  getDeleteImageEndpoint = (imageId) => {
    if (this.projectId) {
      const suffix = this.tableView?.id
        ? `?table_view_id=${this.tableView.id}`
        : "";
      return `/api/remove_image_by_project/${imageId}/${this.projectId}${suffix}`;
    }
    return `/api/remove_image_by_table_user/${imageId}/${this.tableView.id}`;
  };

  removeImageFromTableAndSidebar = (image, elem) => {
    if (!this.capabilities.canManageImageAssets) return;
    if (!window.confirm(`Are you sure you want to delete ${image.original_name}`)) {
      return;
    }

    deleteThing(this.getDeleteImageEndpoint(image.id));

    // Remove from local caches
    if (this.imageDataAndElems) {
      this.imageDataAndElems = this.imageDataAndElems.filter(
        (item) => item.imageData.id !== image.id
      );
    }
    delete this.downloadedImageSourceList[image.id];
    elem.remove();
    if (this.totalAvailable > 0) {
      this.totalAvailable = Math.max(0, this.totalAvailable - 1);
    }
    this.updateCountsFromServer();
    this.renderListContents();
  };

  renderImageSettings = async (tableImage, image, imageElem) => {
    return await renderImageSettingsModal({
      image,
      projectId: this.projectId,
      tableImageId: tableImage.id,
      onDelete: () => {
        this.removeImageFromTableAndSidebar(image, imageElem);
        modal.hide();
      },
      onUpdate: () => {
        this.updateCountsFromServer();
        this.render();
      },
      tableViewId: this.tableView?.id,
      capabilities: this.capabilities,
    });
  };

  renderImageElems = () => {
    if (this.imageDataAndElems && this.imageDataAndElems.length) {
      return this.imageDataAndElems.map((image) => image.elem);
    }
    return [createElement("small", {}, "No images found.")];
  };

  extractImageFromTableImage = (tableImage) => ({
    id: tableImage.image_id,
    original_name: tableImage.original_name,
    size: tableImage.size,
    file_name: tableImage.file_name,
    notes: tableImage.notes,
    src: tableImage.src,
    record_id: tableImage.record_id,
    record_title: tableImage.record_title,
    record_desc: tableImage.record_desc,
  });

  getCountsEndpoint = () => {
    return this.projectId
      ? `/api/get_library_image_counts_by_project/${this.projectId}`
      : "/api/get_library_image_counts_by_user";
  };

  getQueryScope = () => {
    return this.getFolderScope
      ? this.getFolderScope()
      : { showAllImages: false, currentFolder: this.getCurrentFolder() };
  };

  getQueryKey = () => {
    const scope = this.getQueryScope();
    const folderKey = scope.showAllImages
      ? "all"
      : scope.currentFolder
        ? `folder:${scope.currentFolder.id}`
        : "unsorted";
    return JSON.stringify({
      projectId: this.projectId || "user",
      sort: this.sortKey,
      q: this.tableImageSearchQuery || "",
      folder: folderKey,
    });
  };

  getPaginatedImagesEndpoint = (offset = 0) => {
    const base = this.projectId
      ? `/api/get_library_images_by_project/${this.projectId}`
      : "/api/get_library_images_by_user";
    const params = new URLSearchParams();
    params.set("limit", String(this.pageLimit));
    params.set("offset", String(offset));
    params.set("sort", this.sortKey);
    if (this.tableImageSearchQuery) {
      params.set("q", this.tableImageSearchQuery);
    }
    const scope = this.getQueryScope();
    if (!scope.showAllImages) {
      if (scope.currentFolder) {
        params.set("folder_id", String(scope.currentFolder.id));
      } else {
        params.set("folder_id", "unsorted");
      }
    }
    return `${base}?${params.toString()}`;
  };

  updateCountsFromServer = async () => {
    if (!this.onCountsUpdated) return;
    const counts = await getThings(this.getCountsEndpoint());
    if (counts) {
      this.onCountsUpdated(counts);
    }
  };

  resetPagination = () => {
    this.pageOffset = 0;
    this.totalAvailable = 0;
  };

  shouldShowLoadMore = () => {
    return (
      this.totalAvailable > 0 &&
      (this.imageDataAndElems?.length || 0) < this.totalAvailable
    );
  };

  renderLoadMore = () => {
    if (!this.loadMoreContainer) return;
    this.loadMoreContainer.innerHTML = "";

    const loadedCount = this.imageDataAndElems?.length || 0;
    const total = this.totalAvailable || 0;
    const countLabel = createElement(
      "small",
      { class: "table-sidebar-load-more-count" },
      total > 0 ? `Showing ${loadedCount} of ${total}` : "",
    );

    if (!this.shouldShowLoadMore()) {
      this.loadMoreContainer.append(countLabel);
      return;
    }

    const attrs = { class: "table-sidebar-load-more" };
    if (this.loadingPage) {
      attrs.disabled = "true";
    }
    const btn = createElement(
      "button",
      attrs,
      this.loadingPage ? "Loading..." : "Load more",
      {
        type: "click",
        event: (e) => {
          e.preventDefault();
          this.loadMoreImages();
        },
      },
    );
    this.loadMoreContainer.append(countLabel, btn);
  };

  renderListContents = () => {
    if (!this.imagesListContainer) return;
    this.imagesListContainer.innerHTML = "";
    const elems = this.renderImageElems();
    for (const elem of elems) {
      this.imagesListContainer.appendChild(elem);
    }
    this.renderLoadMore();
  };

  fetchImagesPage = async ({ offset = 0, append = false } = {}) => {
    if (this.loadingPage) return;
    this.loadingPage = true;

    const requestKey = this.getQueryKey();
    if (!append) {
      this.activeQueryKey = requestKey;
    }

    const data = await getThings(this.getPaginatedImagesEndpoint(offset));
    this.loadingPage = false;

    if (!data || this.activeQueryKey !== requestKey) {
      return;
    }

    const imageList = await Promise.all(
      (data.images || []).map(async (tableImage) => {
        const image = this.extractImageFromTableImage(tableImage);
        return this.createImageListItem(tableImage, image);
      }),
    );

    if (append && this.imageDataAndElems) {
      this.imageDataAndElems = [...this.imageDataAndElems, ...imageList];
    } else {
      this.imageDataAndElems = imageList;
    }
    this.pageOffset = data.offset || 0;
    this.totalAvailable = data.total || 0;
    this.pageLimit = data.limit || this.pageLimit;
    this.renderListContents();
  };

  renderCurrentImages = async () => {
    await Promise.all([this.updateCountsFromServer(), this.fetchImagesPage()]);
  };

  createImageListItem = async (tableImage, image) => {
    const editableNameInput = this.capabilities.canEditImageMetadata
      ? createElement(
          "input",
          {
            class: "image-name",
            value: image.original_name,
            title: "Click to edit image name",
          },
          null,
          {
            type: "focusout",
            event: (e) => {
              postThing(`/api/edit_image_name/${image.id}`, {
                original_name: e.target.value,
                table_view_id: this.tableView?.id,
              });
            },
          },
        )
      : createElement(
          "small",
          {
            class: "image-name image-name-readonly",
            title: image.original_name,
          },
          image.original_name,
        );

    const elem = createElement("div", { class: "sidebar-image-item" }, [
      createElement(
        "div",
        {
          class: "d-flex align-items-center cursor-pointer flex-1",
        },
        [
          await this.renderImage(image),
          editableNameInput,
        ],
      ),
      createElement(
        "img",
        {
          class: "icon gear",
          src: "/assets/gears.svg",
          title: "Open Image Settings",
        },
        null,
        {
          type: "click",
          event: async () => {
            modal.show(await this.renderImageSettings(tableImage, image, elem));
          },
        },
      ),
    ]);
    return { elem, tableData: tableImage, imageData: image };
  };

  appendImage = async (imageData, tableImageData) => {
    this.refreshFromServer();
  };

  refreshFromServer = () => {
    this.imageDataAndElems = null;
    this.resetPagination();
    this.render();
  };

  updateImagesList = () => {
    this.imageDataAndElems = null;
    this.resetPagination();
    if (this.imagesListContainer) {
      this.imagesListContainer.innerHTML = "";
      this.tempLoadingSpinner = renderLoadingWithMessage("");
      this.imagesListContainer.append(this.tempLoadingSpinner);
      this.renderCurrentImages();
      return;
    }
    this.render();
  };

  loadMoreImages = async () => {
    const offset = this.imageDataAndElems?.length || 0;
    await this.fetchImagesPage({ offset, append: true });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.imageLoading) {
      return this.domComponent.append(renderLoadingWithMessage(""));
    }

    this.imagesListContainer = createElement("div", {
      id: "table-sidebar-images",
      style: "padding: 3px;",
    });
    this.loadMoreContainer = createElement("div", {
      class: "table-sidebar-load-more-wrap",
    });

    const searchInput = createElement(
      "input",
      {
        placeholder: "Search Images",
        class: "table-sidebar-search",
        value: this.tableImageSearchQuery || "",
      },
      null,
      {
        type: "input",
        event: (e) => {
          e.preventDefault();
          this.tableImageSearchQuery = e.target.value;
          if (this.searchDebounceId) {
            clearTimeout(this.searchDebounceId);
          }
          this.searchDebounceId = setTimeout(() => {
            this.updateImagesList();
          }, this.searchDebounceMs);
        },
      },
    );

    const sortSelect = createElement(
      "select",
      {
        class: "library-sort-select",
        title: "Sort images",
      },
      [
        createElement("option", { value: "newest" }, "Newest"),
        createElement("option", { value: "name" }, "Name"),
        createElement("option", { value: "size" }, "Size"),
      ],
      {
        type: "change",
        event: (e) => {
          this.sortKey = e.target.value;
          this.updateImagesList();
        },
      },
    );
    sortSelect.value = this.sortKey;

    const filters = createElement("div", { class: "table-sidebar-filters" }, [
      searchInput,
      sortSelect,
    ]);

    this.domComponent.append(filters, this.imagesListContainer, this.loadMoreContainer);

    if (this.imageDataAndElems) {
      this.renderListContents();
      return;
    }

    this.tempLoadingSpinner = renderLoadingWithMessage("");
    this.imagesListContainer.append(this.tempLoadingSpinner);
    await this.renderCurrentImages();
  };
}
