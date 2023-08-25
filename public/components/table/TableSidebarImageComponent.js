import createElement from "../createElement.js";
import { deleteThing, getThings, postThing } from "../../lib/apiUtils.js";
import renderLoadingWithMessage from "../loadingWithMessage.js";
import imageFollowingCursor from "../imageFollowingCursor.js";

export default class TableSidebarImageComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "table-sidebar-image-component";
    this.tableView = props.tableView;
    this.getCurrentFolder = props.getCurrentFolder;
    // project
    const searchParams = new URLSearchParams(window.location.search);
    this.projectId = searchParams.get("project");
    // utilities
    this.currentMouseDownImage = null;
    this.imageLoading = false;
    this.downloadedImageSourceList = {};
    this.tableImageSearchQuery = null;
  }

  toggleImageLoading = () => {
    this.imageLoading = !this.imageLoading;
    this.render();
  };

  renderImage = async (image) => {
    if (image.src) {
      this.downloadedImageSourceList[image.id] = image.src;
      return createElement(
        "div",
        {
          class: "sidebar-image-container",
          title: "Click and drag image to the table",
        },
        createElement("img", {
          src: image.src,
          height: "38px",
          style: "pointer-events: none; max-width: 38px",
        }),
        {
          type: "mousedown",
          event: () => {
            imageFollowingCursor.setImageSrc(
              this.downloadedImageSourceList[image.id]
            );
            imageFollowingCursor.render();
            this.currentMouseDownImage = image;
          },
        }
      );
    }
  };

  removeImageFromTableAndSidebar = (image, tableImage, elem) => {
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

      // remove table image in db
      deleteThing(`/api/remove_table_image/${tableImage.id}`);
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
              "div",
              {
                class: "red-x",
                title: "Remove image",
              },
              "ⓧ",
              {
                type: "click",
                event: () => {
                  this.removeImageFromTableAndSidebar(image, tableImage, elem);
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
