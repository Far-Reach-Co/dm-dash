import createElement from "../../lib/salt-lib/createElement.js";
import Component from "../../lib/salt-lib/Component.js";
import { apiGet, apiPost } from "../../lib/apiUtils.js";
import renderLoadingWithMessage from "../loadingWithMessage.js";
import imageFollowingCursor from "../imageFollowingCursor.js";
import detectMob from "../../lib/detectMobile.js";
import modal from "../../components/modal.js";
import renderImageSettingsModal from "../shared/imageSettingsModal.js";
import {
  getCurrentProjectId,
  getGuestSandboxId,
  getImageCountsEndpoint,
  getImageDeleteEndpoint,
  getLibraryImagesEndpoint,
} from "./tableApi.js";

export default class TableSidebarImageComponent extends Component {
  constructor(props = {}) {
    super({
      domElem: props.domElem || createElement("div"),
      autoRender: false,
      className: "table-sidebar-image-component",
    });

    this.tableView = props.tableView;
    this.tableApp = props.tableApp;
    this.getCurrentFolder = props.getCurrentFolder;
    this.getFolderScope = props.getFolderScope;
    this.onCountsUpdated = props.onCountsUpdated;
    this.capabilities = props.capabilities || {};

    this.currentMouseDownImage = null;
    this.imageLoading = false;
    this.downloadedImageSourceList = {};
    this.tableImageSearchQuery = null;
    this.imageDataAndElems = null;
    this.sortKey = "newest";
    this.pageLimit = 60;
    this.totalAvailable = 0;
    this.loadingPage = false;
    this.activeQueryKey = null;
    this.searchDebounceId = null;
    this.searchDebounceMs = 300;
    this.pendingInitialFetch = false;
  }

  get guestSandboxId() {
    return getGuestSandboxId(this.tableView);
  }

  get projectId() {
    return this.tableView?.project_id || getCurrentProjectId();
  }

  can = (capability) => {
    return !!this.capabilities?.[capability];
  };

  destroy = () => {
    if (this.searchDebounceId) {
      clearTimeout(this.searchDebounceId);
      this.searchDebounceId = null;
    }
    this.imageDataAndElems = null;
    this.imagesListContainer = null;
    this.loadMoreContainer = null;
    this.pendingInitialFetch = false;
    this.clear({ deep: true });
  };

  showLoading = () => {
    this.imageLoading = true;
    this.render();
  };

  hideLoading = () => {
    this.imageLoading = false;
    this.render();
  };

  placeImageOnTable = (image) => {
    if (!this.can("canPlaceImagesFromSidebar")) return;
    if (!image?.src) return;
    this.tableApp?.addImageToCanvas?.(image);
  };

  startDesktopImageDrag = (image) => {
    if (!this.can("canPlaceImagesFromSidebar")) return;
    if (!image?.src) return;
    imageFollowingCursor.setImageSrc(image.src);
    imageFollowingCursor.render();
    this.currentMouseDownImage = image;
  };

  getImagePlacementHint = (isMobile) => {
    if (isMobile) return "Tap image to place on table";
    return "Click to place, click + drag to drop where you want";
  };

  renderImageThumb = async (image) => {
    if (image.src && this.can("canPlaceImagesFromSidebar")) {
      this.downloadedImageSourceList[image.id] = image.src;

      const isMobile = detectMob();
      const handlers = [];

      if (!isMobile) {
        handlers.push({
          type: "mousedown",
          event: () => {
            this.startDesktopImageDrag(image);
          },
        });
      }

      handlers.push({
        type: "click",
        event: (e) => {
          e.preventDefault();
          this.placeImageOnTable(image);
        },
      });

      handlers.push({
        type: "keydown",
        event: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.placeImageOnTable(image);
          }
        },
      });

      return createElement(
        "div",
        {
          class: "sidebar-image-container",
          title: this.getImagePlacementHint(isMobile),
          tabindex: "0",
          role: "button",
          "aria-label": `Place image ${image.original_name || image.id} on table`,
        },
        createElement("img", {
          src: image.src,
          height: "38px",
          draggable: "false",
          style: `${isMobile ? "" : "pointer-events: none;"} max-width: 38px;`,
        }),
        handlers,
      );
    }
    return createElement("div", { class: "d-none" });
  };

  getDeleteImageEndpoint = (imageId) => {
    return getImageDeleteEndpoint({
      imageId,
      tableViewId: this.tableView?.id,
      projectId: this.projectId,
      guestSandboxId: this.guestSandboxId,
    });
  };

  removeImageFromTableAndSidebar = async (image, elem) => {
    if (!this.can("canManageImageAssets")) return;
    const confirmed = await window.customConfirm(
      `Are you sure you want to delete ${image.original_name}`,
      { confirmText: "Delete", danger: true },
    );
    if (!confirmed) {
      return;
    }

    const endpoint = this.getDeleteImageEndpoint(image.id);
    if (!endpoint) return;
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.status !== 204) {
        throw new Error(`remove image failed with status ${res.status}`);
      }
    } catch (err) {
      console.log(err);
      window.customAlertError("Failed to delete image.");
      return;
    }

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
      onDelete: async () => {
        await this.removeImageFromTableAndSidebar(image, imageElem);
        modal.hide();
      },
      onUpdate: (update) => {
        if (
          update?.type === "name" &&
          update.imageId &&
          typeof update.originalName === "string"
        ) {
          this.updateImageNameInList(update.imageId, update.originalName);
          return;
        }
        this.updateCountsFromServer();
        this.render();
      },
      tableViewId: this.tableView?.id,
      capabilities: this.capabilities,
    });
  };

  renderPackImageSettings = async (image, onUpdate = null) => {
    const params = new URLSearchParams();
    if (this.tableView?.id) {
      params.set("table_view_id", String(this.tableView.id));
    }
    const endpoint = `/api/get_image/${image.id}${params.toString() ? `?${params.toString()}` : ""}`;
    const fetchedResult = await apiGet(endpoint);
    const fetched = fetchedResult.ok ? fetchedResult.data : null;
    const modalImage = fetched
      ? { ...image, ...fetched, id: image.id }
      : image;

    return await renderImageSettingsModal({
      image: modalImage,
      projectId: this.projectId,
      tableImageId: null,
      onDelete: null,
      onUpdate,
      tableViewId: this.tableView?.id,
      capabilities: {
        ...this.capabilities,
        canEditImageMetadata: false,
        canManageFolders: false,
        canManageImageAssets: false,
      },
      showFolderField: false,
      canLinkRecord: !!this.capabilities?.canEditImageMetadata,
    });
  };

  updateImageNameInList = (imageId, nextName) => {
    if (!this.imageDataAndElems?.length) return;
    const match = this.imageDataAndElems.find(
      (item) => Number(item?.imageData?.id) === Number(imageId),
    );
    if (!match) return;

    match.imageData.original_name = nextName;
    const nameElem = match.elem?.querySelector?.(".image-name");
    if (!nameElem) return;

    if (nameElem.tagName?.toLowerCase() === "input") {
      nameElem.value = nextName;
      nameElem.title = "Click to edit image name";
      return;
    }

    nameElem.textContent = nextName;
    nameElem.title = nextName;
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
    return getImageCountsEndpoint({
      projectId: this.projectId,
      guestSandboxId: this.guestSandboxId,
      tableViewId: this.tableView?.id,
    });
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
      projectId: this.guestSandboxId
        ? `guest:${this.guestSandboxId}`
        : this.projectId || "user",
      sort: this.sortKey,
      q: this.tableImageSearchQuery || "",
      folder: folderKey,
    });
  };

  getPaginatedImagesEndpoint = (offset = 0) => {
    return getLibraryImagesEndpoint({
      projectId: this.projectId,
      guestSandboxId: this.guestSandboxId,
      tableViewId: this.tableView?.id,
      limit: this.pageLimit,
      offset,
      sort: this.sortKey,
      query: this.tableImageSearchQuery || "",
      folderScope: this.getQueryScope(),
    });
  };

  updateCountsFromServer = async () => {
    if (!this.onCountsUpdated) return;
    const countsResult = await apiGet(this.getCountsEndpoint());
    if (countsResult.ok && countsResult.data) {
      this.onCountsUpdated(countsResult.data);
    }
  };

  resetPagination = () => {
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

    const dataResult = await apiGet(this.getPaginatedImagesEndpoint(offset));
    this.loadingPage = false;

    if (!dataResult.ok || !dataResult.data || this.activeQueryKey !== requestKey) {
      return;
    }
    const data = dataResult.data;

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
    this.totalAvailable = data.total || 0;
    this.pageLimit = data.limit || this.pageLimit;
    this.renderListContents();
  };

  renderCurrentImages = async () => {
    this.pendingInitialFetch = true;
    try {
      await Promise.all([this.updateCountsFromServer(), this.fetchImagesPage()]);
    } finally {
      this.pendingInitialFetch = false;
    }
  };

  createImageListItem = async (tableImage, image) => {
    const focusNameInputWithoutSelection = (input) => {
      if (!(input instanceof HTMLInputElement)) return;
      input.focus();
      const end = input.value.length;
      requestAnimationFrame(() => {
        input.setSelectionRange(end, end);
      });
    };

    const editableNameInput = this.can("canEditImageMetadata")
      ? createElement(
          "input",
          {
            class: "image-name",
            value: image.original_name,
            title: "Click to edit image name",
          },
          null,
          [
            {
              type: "mousedown",
              event: (e) => {
                if (document.activeElement === e.currentTarget) return;
                e.preventDefault();
                focusNameInputWithoutSelection(e.currentTarget);
              },
            },
            {
              type: "focusout",
              event: async (e) => {
                const nextName = e.target.value;
                const prevName = image.original_name;
                const response = await apiPost(`/api/edit_image_name/${image.id}`, {
                  original_name: e.target.value,
                  table_view_id: this.tableView?.id,
                });
                if (!response.ok) {
                  image.original_name = prevName;
                  e.target.value = prevName;
                  return;
                }
                image.original_name = nextName;
                e.target.title = "Click to edit image name";
              },
            },
          ],
        )
      : createElement(
          "small",
          {
            class: "image-name image-name-readonly",
            title: image.original_name,
          },
          image.original_name,
        );

    let elem = null;

    const placeImageBtn = this.can("canPlaceImagesFromSidebar")
      ? createElement(
          "button",
          {
            class: "sidebar-image-place-btn",
            title: "Add image to table center",
            type: "button",
          },
          "+",
          {
            type: "click",
            event: (e) => {
              e.preventDefault();
              e.stopPropagation();
              this.placeImageOnTable(image);
            },
          },
        )
      : createElement("div");

    const settingsBtn = createElement(
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
    );

    elem = createElement("div", { class: "sidebar-image-item" }, [
      createElement(
        "div",
        {
          class: "d-flex align-items-center cursor-pointer flex-1",
        },
        [
          await this.renderImageThumb(image),
          editableNameInput,
        ],
      ),
      createElement("div", { class: "sidebar-image-actions" }, [
        placeImageBtn,
        settingsBtn,
      ]),
    ]);
    return { elem, tableData: tableImage, imageData: image };
  };

  appendImage = async () => {
    this.refreshFromServer();
  };

  refreshFromServer = () => {
    this.imageDataAndElems = null;
    this.resetPagination();
    this.pendingInitialFetch = false;
    this.render();
  };

  updateImagesList = () => {
    this.imageDataAndElems = null;
    this.resetPagination();
    if (this.imagesListContainer) {
      this.imagesListContainer.innerHTML = "";
      const spinner = renderLoadingWithMessage("");
      this.imagesListContainer.append(spinner);
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
    if (this.imageLoading) {
      return [renderLoadingWithMessage("")];
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

    if (this.imageDataAndElems) {
      this.renderListContents();
      return [filters, this.imagesListContainer, this.loadMoreContainer];
    }

    const spinner = renderLoadingWithMessage("");
    this.imagesListContainer.append(spinner);
    if (!this.pendingInitialFetch) {
      queueMicrotask(async () => {
        await this.renderCurrentImages();
      });
    }
    return [filters, this.imagesListContainer, this.loadMoreContainer];
  };
}
