import createElement from "../createElement.js";
import { deleteThing, getThings, postThing } from "../../lib/apiUtils.js";
import renderLoadingWithMessage from "../loadingWithMessage.js";
import imageFollowingCursor from "../imageFollowingCursor.js";
import detectMob from "../../lib/detectMobile.js";
import modal from "../../components/modal.js";
import renderFolderSelect from "./folderSelect.js";
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

  toggleImageLoading = () => {
    this.imageLoading = !this.imageLoading;
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
        ...handlers
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
          `/api/remove_image_by_project/${image.id}/${this.projectId}`
        );
      } else {
        deleteThing(
          `/api/remove_image_by_table_user/${image.id}/${this.tableView.id}`
        );
      }

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
      this.projectId
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
      createElement("h2", {}, "Associated Records"),
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
        }
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
    // get images for project or for user
    let tableImages = [];
    if (this.projectId) {
      tableImages = await getThings(
        `/api/get_table_images_by_table_project/${this.tableView.id}`
      );
    } else {
      tableImages = await getThings(
        `/api/get_table_images_by_table_user/${this.tableView.id}`
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
        const image = await getThings(`/api/get_image/${tableImage.image_id}`);
        if (image) {
          const elem = createElement("div", { class: "sidebar-image-item" }, [
            createElement(
              "div",
              {
                style:
                  "display: flex; align-items: center; flex: 1; cursor: pointer;",
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
                  }
                ),
              ]
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
                  modal.show(
                    await this.renderImageSettings(tableImage, image, elem)
                  );
                },
              }
            ),
          ]);
          imageList.push({ elem, tableData: tableImage, imageData: image });
        }
      })
    );
    // remove temp loading spinner
    this.tempLoadingSpinner.remove();

    // create a state of the image elems
    this.imageDataAndElems = imageList;

    return this.renderImageElems();
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

    // temp spinner while loading image assets
    this.tempLoadingSpinner = renderLoadingWithMessage("");
    this.domComponent.append(this.tempLoadingSpinner);

    // create and save imagesListContainer
    this.imagesListContainer = createElement(
      "div",
      { id: "table-sidebar-images", style: "padding: 3px;" },
      [...(await this.renderCurrentImages())]
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
        }
      ),
      this.imagesListContainer
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
        data
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

  renderListOrCreateNew = () => {
    if (this.image.records.length) {
      return createElement("div", {}, [
        ...this.image.records.map((rec) => {
          const href = this.projectId
            ? `/record?id=${rec.id}&project_id=${this.projectId}`
            : `/record?id=${rec.id}`;
          return createElement(
            "a",
            { href: href, rel: "noopener noreferrer", target: "_blank" },
            rec.title
          );
        }),
      ]);
    } else {
      return createElement("div", {}, [
        createElement("div", {}, "None..."),
        createElement("button", {}, "Create Record", {
          type: "click",
          event: () => this.createNewRecord(),
        }),
      ]);
    }
  };

  render = () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(this.renderListOrCreateNew());
  };
}
