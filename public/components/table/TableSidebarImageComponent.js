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

  removeImageFromTableAndSidebar = (image, elem) => {
    if (
      window.confirm(`Are you sure you want to delete ${image.original_name}`)
    ) {
      // remove image in db
      if (this.projectId) {
        deleteThing(
          `/api/remove_image_by_project/${image.id}/${this.projectId}`,
        );
      } else {
        deleteThing(
          `/api/remove_image_by_table_user/${image.id}/${this.tableView.id}`,
        );
      }

      // remove from cache
      if (this.imageDataAndElems) {
        this.imageDataAndElems = this.imageDataAndElems.filter(
          (item) => item.imageData.id !== image.id
        );
      }
      // remove from downloaded sources cache
      delete this.downloadedImageSourceList[image.id];

      // remove elem in sidebar
      elem.remove();
      // remove all from screens and sockets and state
      // this.canvasLayer.canvas.getObjects().forEach((object) => {
      //   if (object.imageId === image.id) {
      //     this.canvasLayer.canvas.remove(object);
      //     socketIntegration.imageRemoved(object.id);
      //   }
      // });
    }
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

  renderCurrentImages = async () => {
    // get images with signed URLs in one batched request
    let tableImages = [];
    if (this.projectId) {
      tableImages = await getThings(
        `/api/get_table_images_with_urls_by_table_project/${this.tableView.id}`,
      );
    } else {
      tableImages = await getThings(
        `/api/get_table_images_with_urls_by_table_user/${this.tableView.id}`,
      );
    }

    // if none
    if (!tableImages.length) {
      // remove temp loading spinner
      this.tempLoadingSpinner.remove();
      return [createElement("small", {}, "None...")];
    }
    // render all
    let imageList = [];
    await Promise.all(
      tableImages.map(async (tableImage) => {
        // Extract image data from the joined response
        const image = {
          id: tableImage.image_id,
          original_name: tableImage.original_name,
          size: tableImage.size,
          file_name: tableImage.file_name,
          notes: tableImage.notes,
          src: tableImage.src,
          record_id: tableImage.record_id,
          record_title: tableImage.record_title,
          record_desc: tableImage.record_desc,
        };
        if (image) {
          const item = await this.createImageListItem(tableImage, image);
          imageList.push(item);
        }
      }),
    );
    // remove temp loading spinner
    this.tempLoadingSpinner.remove();

    // create a state of the image elems
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

  createNewRecord = async () => {
    const title = this.image.original_name.includes(".")
      ? this.image.original_name.split(".")[0]
      : this.image.original_name;

    const data = {
      title: title,
      description: this.image.description
        ? this.image.description
        : "Placeholder text...",
      is_public: false,
    };

    let newRecord = null;

    if (this.projectId) {
      newRecord = await postThing(
        `/api/add_record_by_project/${this.projectId}`,
        data,
      );
    } else {
      newRecord = await postThing("/api/add_record_by_user", data);
    }

    if (newRecord) {
      // make recordimage with this.image
      await postThing("/api/add_record_image", {
        record_id: newRecord.id,
        image_id: this.image.id,
      });

      // update data and render
      this.image.records.push(newRecord);
      this.render();
    }
  };

  renderListOrCreateNew = async () => {
    console.log(this.image);
    if (this.image.record_id) {
      const href = this.projectId
        ? `/record?id=${this.image.record_id}&project_id=${this.projectId}`
        : `/record?id=${this.image.record_id}`;
      return createElement(
        "a",
        { href: href, rel: "noopener noreferrer", target: "_blank" },
        this.image.record_title,
      );
    } else {
      const recordSelectElem = await renderRecordSelect(this.projectId);
      recordSelectElem.addEventListener("change", async (e) => {
        const recordId = e.target.value;
        if (e.target.value != 0) {
          await postThing("/api/add_record_image", {
            record_id: recordId,
            image_id: this.image.id,
          });

          const record = await getThings(`/api/get_record/${recordId}`);

          // update data and render
          this.image.record_id = record.id;
          this.image.record_title = record.title;
          this.image.record_desc = record.description;
          // re-render
          this.render();
        }
      });

      return createElement("div", {}, [
        createElement("div", {}, "None..."),
        createElement("div", { class: "d-flex flex-row" }, [
          createElement(
            "button",
            { class: "me-1 btn-green" },
            "Create Record",
            {
              type: "click",
              event: () => this.createNewRecord(),
            },
          ),
          createElement("div", { class: "me-1" }, "Or"),
          recordSelectElem,
        ]),
      ]);
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(await this.renderListOrCreateNew());
  };
}
