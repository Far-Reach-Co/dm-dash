import createElement from "../createElement.js";
import { deleteThing, getThings, postThing } from "../../lib/apiUtils.js";
import renderLoadingWithMessage from "../loadingWithMessage.js";
import imageFollowingCursor from "../imageFollowingCursor.js";
import detectMob from "../../lib/detectMobile.js";
import modal from "../../components/modal.js";
import renderFolderSelect from "./folderSelect.js";
import renderRecordSelect from "./recordSelect.js";
import parseUrlTextContent from "../../components/parseUrlTextContent.js";

export default class TableSidebarImageComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "table-sidebar-image-component";
    this.tableView = props.tableView;
    this.tableApp = props.tableApp;
    this.getCurrentFolder = props.getCurrentFolder;
    // project
    const searchParams = new URLSearchParams(window.location.search);
    this.projectId = searchParams.get("project");
    // utilities
    this.currentMouseDownImage = null;
    this.imageLoading = false;
    this.downloadedImageSourceList = {};
    this.tableImageSearchQuery = null;
    this.imageDataAndElems = null;
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
  };

  renderImageSettings = async (tableImage, image, imageElem) => {
    const folderSelectElem = await renderFolderSelect(
      tableImage,
      this.projectId,
    );
    folderSelectElem.addEventListener("change", async (e) => {
      const value = e.target.value;
      if (value === 0) {
        // set to null
        tableImage.folder_id = null;
      } else {
        tableImage.folder_id = value;
      }
      postThing(`/api/edit_table_image/${tableImage.id}`, { folder_id: value });

      // re-render
      this.render();
    });

    const associatedRecordsComponent = new AssociatedRecordsComponent({
      domComponent: createElement("div"),
      image: image,
      projectId: this.projectId,
    });

    return createElement("div", { class: "help-content" }, [
      createElement("h1", {}, image.original_name),
      createElement("hr"),
      createElement("h2", {}, "Associated Record"),
      associatedRecordsComponent.domComponent,
      createElement("hr"),
      createElement("h2", {}, "Change Folder"),
      folderSelectElem,
      createElement("hr"),
      createElement("h2", {}, "Notes"),
      createElement(
        "div",
        {
          contenteditable: true,
          class: "image-notes",
          name: "notes",
        },
        image.notes ? parseUrlTextContent(image.notes) : "Placeholder text...",
        {
          type: "focusout",
          event: (e) => {
            e.preventDefault();
            // local
            image.notes = e.target.textContent;
            // db
            postThing(`/api/edit_image_notes/${image.id}`, {
              notes: e.target.textContent,
            });
          },
        },
      ),
      createElement("hr"),
      createElement("button", { class: "btn-red" }, "Delete Image", {
        type: "click",
        event: (e) => {
          this.removeImageFromTableAndSidebar(image, imageElem);
          modal.hide();
        },
      }),
    ]);
  };

  renderImageElems = () => {
    // copy so as not to use state
    let currentImageData = this.imageDataAndElems;
    // filter based on current folder view
    const currentFolder = this.getCurrentFolder();
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
    // sort alpha
    imageElems = imageElems.sort((a, b) => {
      if (
        a.children[0].children[1].value.toLowerCase() <
        b.children[0].children[1].value.toLowerCase()
      )
        return -1;
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
      return [createElement("small", {}, "None...")];
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
    this.updateImagesList();
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

    this.domComponent.append(
      createElement(
        "input",
        {
          placeHolder: "Search Images",
          style:
            "padding: 10px; border-left-width: 0px; border-right-width: 0px",
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
      this.imagesListContainer,
    );
  };
}

class AssociatedRecordsComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.image = props.image;
    this.projectId = props.projectId;

    this.render();
  }

  getRecordHref = (recordId) => {
    const base = `/record?id=${recordId}`;
    return this.projectId ? `${base}&project_id=${this.projectId}` : base;
  };

  getAddRecordEndpoint = () => {
    return this.projectId
      ? `/api/add_record_by_project/${this.projectId}`
      : "/api/add_record_by_user";
  };

  getTitleFromImageName = () => {
    const name = this.image.original_name;
    return name.includes(".") ? name.split(".")[0] : name;
  };

  updateImageRecord = (record) => {
    this.image.record_id = record.id;
    this.image.record_title = record.title;
    this.image.record_desc = record.description;
    this.render();
  };

  linkRecordToImage = async (recordId) => {
    await postThing("/api/add_record_image", {
      record_id: recordId,
      image_id: this.image.id,
    });
  };

  createNewRecord = async () => {
    const data = {
      title: this.getTitleFromImageName(),
      description: this.image.description || "Placeholder text...",
      is_public: false,
    };

    const newRecord = await postThing(this.getAddRecordEndpoint(), data);

    if (newRecord) {
      await this.linkRecordToImage(newRecord.id);
      this.updateImageRecord(newRecord);
    }
  };

  handleRecordSelect = async (e) => {
    const recordId = e.target.value;
    if (recordId == 0) return;

    await this.linkRecordToImage(recordId);
    const record = await getThings(`/api/get_record/${recordId}`);
    this.updateImageRecord(record);
  };

  renderExistingRecord = () => {
    return createElement(
      "a",
      {
        href: this.getRecordHref(this.image.record_id),
        rel: "noopener noreferrer",
        target: "_blank",
      },
      this.image.record_title
    );
  };

  renderCreateOrSelectRecord = async () => {
    const recordSelectElem = await renderRecordSelect(this.projectId);
    recordSelectElem.addEventListener("change", this.handleRecordSelect);

    return createElement("div", {}, [
      createElement("div", {}, "None..."),
      createElement("div", { class: "d-flex flex-row" }, [
        createElement("button", { class: "me-1 btn-green" }, "Create Record", {
          type: "click",
          event: () => this.createNewRecord(),
        }),
        createElement("div", { class: "me-1" }, "Or"),
        recordSelectElem,
      ]),
    ]);
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    const content = this.image.record_id
      ? this.renderExistingRecord()
      : await this.renderCreateOrSelectRecord();

    this.domComponent.append(content);
  };
}
