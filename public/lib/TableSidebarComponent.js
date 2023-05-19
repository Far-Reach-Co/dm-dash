import { getPresignedForImageDownload, uploadImage } from "./imageUtils.js";
import createElement from "./createElement.js";
import state from "./state.js";
import { deleteThing, getThings, postThing } from "./apiUtils.js";
import renderLoadingWithMessage from "./loadingWithMessage.js";
import imageFollowingCursor from "./imageFollowingCursor.js";

export default class TableSidebarComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "table-sidebar-images";

    this.currentMouseDownImage = null;

    this.imageLoading = false;
    this.downloadedImageSourceList = {};
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
      deleteThing(`/api/remove_image/${state.currentProject.id}/${image.id}`);
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

  renderCurrentImages = async () => {
    const tableImages = await getThings(
      `/api/get_table_images/${state.currentProject.id}`
    );
    if (!tableImages.length) return [createElement("small", {}, "None...")];

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
                      console.log(e.target.value);
                      postThing(`/api/edit_image/${image.id}`, {
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
                style:
                  "color: var(--red1); margin-left: var(--main-distance); cursor: pointer;",
                title: "Remove image from wyrld asset library",
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

    imageElems = imageElems.sort((a, b) => {
      if (
        a.children[1].innerText.toUpperCase() <
        b.children[1].innerText.toUpperCase()
      )
        return -1;
    });
    if (imageElems.length) return imageElems;
    else return [createElement("small", {}, "None...")];
  };

  addImageToSidebar = async (e) => {
    const makeImageSmall = window.confirm(
      "Would you like us to resize this image to 100px? Press Cancel to keep the original size."
    );

    const file = e.target.files[0];
    if (file) {
      try {
        this.toggleImageLoading();
        const newImage = await uploadImage(
          file,
          state.currentProject.id,
          null,
          makeImageSmall
        );
        if (newImage) {
          // add new table image
          await postThing(`/api/add_table_image`, {
            project_id: state.currentProject.id,
            image_id: newImage.id,
          });
          // re render
        }
        this.toggleImageLoading();
      } catch (err) {
        this.toggleImageLoading();
      }
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

    this.domComponent.append(
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
        "+ Image"
      ),
      createElement("br"),
      ...(await this.renderCurrentImages())
    );
  };
}
