import createElement from "../createElement.js";
import { deleteThing, getThings, postThing } from "../../lib/apiUtils.js";
import renderLoadingWithMessage from "../loadingWithMessage.js";
import imageFollowingCursor from "../imageFollowingCursor.js";
import detectMob from "../../lib/detectMobile.js";
import modal from "../../components/modal.js";
import renderImageSettingsModal from "../shared/imageSettingsModal.js";
import { buildCountsFromImages } from "../shared/folderTreeUtils.js";

export default class TableSidebarImageComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "table-sidebar-image-component";
    this.tableView = props.tableView;
    this.tableApp = props.tableApp;
    this.getCurrentFolder = props.getCurrentFolder;
    this.getFolderScope = props.getFolderScope;
    this.onCountsUpdated = props.onCountsUpdated;
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
    return this.projectId
      ? `/api/remove_image_by_project/${imageId}/${this.projectId}`
      : `/api/remove_image_by_table_user/${imageId}/${this.tableView.id}`;
  };

  removeImageFromTableAndSidebar = (image, elem) => {
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
    this.updateCountsFromCache();
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
        this.updateCountsFromCache();
        this.render();
      },
    });
  };

  renderImageElems = () => {
    // copy so as not to use state
    let currentImageData = this.imageDataAndElems;
    // filter based on current folder view
    const scope = this.getFolderScope
      ? this.getFolderScope()
      : { showAllImages: false, currentFolder: this.getCurrentFolder() };
    const currentFolder = scope.currentFolder;
    if (!scope.showAllImages) {
      currentImageData = currentImageData.filter((obj) => {
        if (currentFolder) {
          if (
            obj.tableData.folder_id &&
            obj.tableData.folder_id == currentFolder.id
          ) {
            return obj;
          }
        } else {
          if (!obj.tableData.folder_id) return obj;
        }
      });
    }
    // extract just the elems
    let imageElems = currentImageData.map((image) => {
      return image.elem;
    });
    // filter by search query
    imageElems = imageElems.filter((elem) => {
      if (this.tableImageSearchQuery && this.tableImageSearchQuery !== "") {
        return elem.children[0].children[1].value
          .toLowerCase()
          .includes(this.tableImageSearchQuery.toLowerCase());
      } else return elem;
    });
    // sort
    imageElems = imageElems.sort((a, b) => {
      const aItem = this.imageDataAndElems.find((i) => i.elem === a);
      const bItem = this.imageDataAndElems.find((i) => i.elem === b);
      if (this.sortKey === "size") {
        return (bItem?.imageData.size || 0) - (aItem?.imageData.size || 0);
      }
      if (this.sortKey === "name") {
        const aName = a.children[0].children[1].value.toLowerCase();
        const bName = b.children[0].children[1].value.toLowerCase();
        return aName.localeCompare(bName);
      }
      const aTime = aItem?.tableData?.created_at
        ? new Date(aItem.tableData.created_at).getTime()
        : 0;
      const bTime = bItem?.tableData?.created_at
        ? new Date(bItem.tableData.created_at).getTime()
        : 0;
      if (aTime && bTime && aTime !== bTime) return bTime - aTime;
      return (bItem?.imageData.id || 0) - (aItem?.imageData.id || 0);
    });
    if (imageElems.length) return imageElems;
    else return [createElement("small", {}, "No images in this folder yet...")];
  };

  getTableImagesEndpoint = () => {
    const base = this.projectId
      ? "/api/get_table_images_with_urls_by_table_project"
      : "/api/get_table_images_with_urls_by_table_user";
    return `${base}/${this.tableView.id}`;
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

  renderCurrentImages = async () => {
    const tableImages = await getThings(this.getTableImagesEndpoint());

    this.tempLoadingSpinner.remove();

    if (!tableImages.length) {
      if (this.onCountsUpdated) {
        this.onCountsUpdated({ total: 0, unsorted: 0, by_folder: {} });
      }
      return [createElement("small", {}, "None...")];
    }

    if (this.onCountsUpdated) {
      this.onCountsUpdated(buildCountsFromImages(tableImages));
    }

    const imageList = await Promise.all(
      tableImages.map(async (tableImage) => {
        const image = this.extractImageFromTableImage(tableImage);
        return this.createImageListItem(tableImage, image);
      })
    );

    this.imageDataAndElems = imageList;
    return this.renderImageElems();
  };

  createImageListItem = async (tableImage, image) => {
    const elem = createElement("div", { class: "sidebar-image-item" }, [
      createElement(
        "div",
        {
          class: "d-flex align-items-center cursor-pointer flex-1",
        },
        [
          await this.renderImage(image),
          createElement(
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
                });
              },
            },
          ),
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
    const image = {
      id: imageData.id,
      original_name: imageData.original_name,
      size: imageData.size,
      file_name: imageData.file_name,
      notes: imageData.notes || null,
      src: imageData.src,
      record_id: tableImageData.record_id,
      record_title: tableImageData.record_title,
      record_desc: tableImageData.record_desc,
    };
    const tableImage = {
      ...tableImageData,
      image_id: imageData.id,
      original_name: imageData.original_name,
      size: imageData.size,
      file_name: imageData.file_name,
      notes: imageData.notes || null,
      src: imageData.src,
    };

    const item = await this.createImageListItem(tableImage, image);

    if (!this.imageDataAndElems) {
      this.imageDataAndElems = [];
    }
    this.imageDataAndElems.push(item);
    this.updateCountsFromCache();
    this.updateImagesList();
  };

  updateCountsFromCache = () => {
    if (!this.onCountsUpdated || !this.imageDataAndElems) return;
    const tableImages = this.imageDataAndElems.map((item) => item.tableData);
    this.onCountsUpdated(buildCountsFromImages(tableImages));
  };

  refreshFromServer = () => {
    this.imageDataAndElems = null;
    this.render();
  };

  updateImagesList = () => {
    this.imagesListContainer.innerHTML = "";
    const elems = this.renderImageElems();
    for (var elem of elems) {
      this.imagesListContainer.appendChild(elem);
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.imageLoading) {
      return this.domComponent.append(renderLoadingWithMessage(""));
    }

    // Determine what to render
    let imageElems;
    if (this.imageDataAndElems) {
      // Render from memory
      imageElems = this.renderImageElems();
    } else {
      // Fetch and populate memory
      this.tempLoadingSpinner = renderLoadingWithMessage("");
      this.domComponent.append(this.tempLoadingSpinner);
      imageElems = await this.renderCurrentImages();
    }

    // create and save imagesListContainer
    this.imagesListContainer = createElement(
      "div",
      { id: "table-sidebar-images", style: "padding: 3px;" },
      [...imageElems],
    );

    const filters = createElement("div", { class: "table-sidebar-filters" }, [
      createElement(
        "input",
        {
          placeholder: "Search Images",
          class: "table-sidebar-search",
        },
        null,
        {
          type: "input",
          event: (e) => {
            e.preventDefault();
            this.tableImageSearchQuery = e.target.value;
            this.updateImagesList();
          },
        },
      ),
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
            this.updateImagesList();
          },
        },
      ),
    ]);

    this.domComponent.append(filters, this.imagesListContainer);
  };
}
