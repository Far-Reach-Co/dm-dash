import { getPresignedForImageDownload, uploadUserImage } from "./imageUtils.js";
import createElement from "./createElement.js";
import { deleteThing, getThings, postThing } from "./apiUtils.js";
import renderLoadingWithMessage from "./loadingWithMessage.js";
import imageFollowingCursor from "./imageFollowingCursor.js";
import modal from "../components/modal.js";

export default class TableSidebarComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "table-sidebar-images";
    this.tableView = props.tableView;
    // project
    const searchParams = new URLSearchParams(window.location.search);
    this.projectId = searchParams.get("project");
    // utilities
    this.currentMouseDownImage = null;
    this.imageLoading = false;
    this.downloadedImageSourceList = {};
    this.makeImageSmall = false;
    this.tableImageSearchQuery = null;
  }

  toggleImageLoading = () => {
    this.imageLoading = !this.imageLoading;
    this.render();
  };

  renderImage = async (image) => {
    const imageSource = await getPresignedForImageDownload(image.id);
    if (imageSource) {
      this.downloadedImageSourceList[image.id] = imageSource.url;
      return createElement(
        "div",
        {
          class: "sidebar-image-container",
          title: "Click and drag image to the table",
        },
        createElement("img", {
          src: imageSource.url,
          width: "38px",
          height: "38px",
          style: "pointer-events: none;",
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
    let imageElems = this.originalImageElems;

    imageElems = imageElems.filter((elem) => {
      if (this.tableImageSearchQuery && this.tableImageSearchQuery !== "") {
        return elem.children[0].children[0].value
          .toLowerCase()
          .includes(this.tableImageSearchQuery.toLowerCase());
      } else return elem;
    });

    imageElems = imageElems.sort((a, b) => {
      if (
        a.children[0].children[0].value.toLowerCase() <
        b.children[0].children[0].value.toLowerCase()
      )
        return -1;
    });
    if (imageElems.length) return imageElems;
    else return [createElement("small", {}, "None...")];
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
    if (!tableImages.length) {
      // remove temp loading spinner
      this.tempLoadingSpinner.remove();
      return [createElement("small", {}, "None...")];
    }

    let imageElems = [];
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
                await this.renderImage(image),
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
          imageElems.push(elem);
        }
      })
    );
    // remove temp loading spinner
    this.tempLoadingSpinner.remove();

    // create a state of the image elems
    this.originalImageElems = imageElems;

    return this.renderImageElems();
  };

  addImageToSidebar = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        this.toggleImageLoading();
        const newImage = await uploadUserImage(file, this.makeImageSmall);
        if (newImage) {
          // add new table image
          if (this.projectId) {
            await postThing(`/api/add_table_image_by_project`, {
              project_id: this.projectId,
              image_id: newImage.id,
            });
          } else {
            await postThing(`/api/add_table_image_by_user`, {
              image_id: newImage.id,
            });
          }
        }
        this.toggleImageLoading();
      } catch (err) {
        this.toggleImageLoading();
      }
    }
  };

  updateImagesList = () => {
    const imageContainer = document.getElementById("table-sidebar-images");
    imageContainer.innerHTML = "";
    const elems = this.renderImageElems();
    for (var elem of elems) {
      imageContainer.appendChild(elem);
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

    const smallImageCheckboxComponent = createElement(
      "input",
      { type: "checkbox" },
      null,
      {
        type: "change",
        event: (e) => {
          this.makeImageSmall = e.target.value;
        },
      }
    );
    smallImageCheckboxComponent.checked = this.makeImageSmall;

    this.domComponent.append(
      createElement(
        "a",
        {
          title: "Upload image to be used on virtual table",
          style: "margin-left: 10px",
        },
        "+ Image",
        {
          type: "click",
          event: (e) => {
            modal.show(
              createElement(
                "div",
                { class: "help-content", style: "min-width: 250px;" },
                [
                  createElement("h1", {}, "Add new Image"),
                  createElement("br"),
                  createElement("h2", {}, "Options:"),
                  createElement(
                    "div",
                    {
                      style:
                        "display: flex; align-items: center; justify-content: center;",
                      title:
                        "If image width is larger than 100px this resizes the image width to 100px while maintaining the aspect ratio. It also will prevent long loading time as the image size will be reduced.",
                    },
                    [
                      createElement(
                        "small",
                        { style: "margin-right: var(--main-distance)" },
                        "Make image small (100px): "
                      ),
                      smallImageCheckboxComponent,
                    ]
                  ),
                  createElement("br"),
                  createElement(
                    "input",
                    {
                      id: "image",
                      name: "image",
                      type: "file",
                      accept: "image/*",
                      style: "display: none",
                    },
                    null,
                    {
                      type: "change",
                      event: async (e) => {
                        await this.addImageToSidebar(e);
                      },
                    }
                  ),
                  createElement(
                    "label",
                    {
                      for: "image",
                      class: "label-btn",
                      title: "Upload image to be used on virtual table",
                    },
                    "Choose Image"
                  ),
                ]
              )
            );
          },
        }
      ),
      createElement("br"),
      createElement("input", { placeHolder: "Search Images" }, null, {
        type: "input",
        event: (e) => {
          e.preventDefault();
          this.tableImageSearchQuery = e.target.value;
          this.updateImagesList();
        },
      }),
      createElement("div", { id: "table-sidebar-images" }, [
        ...(await this.renderCurrentImages()),
      ])
    );
  };
}
