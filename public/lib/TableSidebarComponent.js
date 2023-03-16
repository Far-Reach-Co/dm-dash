import { getPresignedForImageDownload, uploadImage } from "./imageUtils.js";
import createElement from "./createElement.js";
import state from "./state.js";
import { deleteThing, getThings, postThing } from "./apiUtils.js";
import renderLoadingWithMessage from "./loadingWithMessage.js";
import socketIntegration from "./socketIntegration.js";

export default class TableSidebarComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "table-sidebar";
    this.canvasLayer = props.canvasLayer;

    this.imageLoading = false;
    this.render();

    this.downloadedImageSourceList = {};
  }

  toggleImageLoading = () => {
    this.imageLoading = !this.imageLoading;
    this.render();
  };

  renderImage = async (imageId) => {
    const imageSource = await getPresignedForImageDownload(imageId);
    if (imageSource) {
      this.downloadedImageSourceList[imageId] = imageSource.url;
      return createElement("img", {
        src: imageSource.url,
        width: 30,
        height: 30,
      });
    }
  };

  addImageToTable = async (image) => {
    let imageSource = this.downloadedImageSourceList[image.id];
    if (!imageSource)
      imageSource = await getPresignedForImageDownload(image.id);
    if (imageSource) {
      // create new object
      fabric.Image.fromURL(imageSource, (newImg) => {
        // CREATE ************************
        const id = uuidv4();
        newImg.set("id", id)
        newImg.set("imageId", image.id)
        newImg.set("layer", this.canvasLayer.currentLayer);

        // HANDLE ************************
        // add to canvas
        if (this.canvasLayer.currentLayer === "Map") {
          const gridObjectIndex = this.canvasLayer.canvas
            .getObjects()
            .indexOf(this.canvasLayer.oGridGroup);
          this.canvasLayer.canvas.add(newImg);
          // in center of viewport
          this.canvasLayer.canvas.viewportCenterObject(newImg);
          newImg.moveTo(gridObjectIndex);
        } else {
          this.canvasLayer.canvas.add(newImg);
          // in center of viewport
          this.canvasLayer.canvas.viewportCenterObject(newImg);
        }

        // event listener
        newImg.on("selected", (options) => {
          this.canvasLayer.moveObjectUp(options.target)
        });

        // EMIT ***************************
        socketIntegration.imageAdded(newImg);
      });
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
      this.canvasLayer.canvas.getObjects().forEach((object) => {
        if (object.imageId === image.id) {
          this.canvasLayer.canvas.remove(object);
          socketIntegration.imageRemoved(object.id);
        }
      });
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
            createElement("a", {}, "+", {
              type: "click",
              event: async () => {
                await this.addImageToTable(image);
              },
            }),
            createElement(
              "div",
              { style: "width: 100px; word-wrap: break-word;" },
              image.original_name
            ),
            await this.renderImage(image.id),
            createElement(
              "div",
              {
                style:
                  "color: var(--red1); margin-left: 10px; cursor: pointer;",
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
    const file = e.target.files[0];
    if (file) {
      this.toggleImageLoading();
      const newImage = await uploadImage(file, state.currentProject.id);
      if (newImage) {
        // add new table image
        await postThing(`/api/add_table_image`, {
          project_id: state.currentProject.id,
          image_id: newImage.id,
        });
        // re render
      }
      this.toggleImageLoading();
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.imageLoading) {
      return this.domComponent.append(renderLoadingWithMessage(""));
    }

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
        },
        "+ Image"
      ),
      createElement("br"),
      ...(await this.renderCurrentImages())
    );
  };
}
