import { getPresignedForImageDownload, uploadImage } from "./imageUtils.js";
import createElement from "./createElement.js";
import state from "./state.js";
import { deleteThing, getThings, postThing } from "./apiUtils.js";
import renderLoadingWithMessage from "./loadingWithMessage.js";
import TableApp from "../views/TableApp.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid"; // Hopefully we can download this instead
import socketIntegration from "./socketIntegration.js";

export default class TableSidebarComponent {
  constructor(props) {
    this.domComponent = props.domComponent;

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
                const canvasLayer = TableApp.views.table.canvasLayer;
                const imageSource = this.downloadedImageSourceList[image.id];
                if (imageSource) {
                  // create new object
                  fabric.Image.fromURL(imageSource, function (newImg) {
                    // CREATE ************************
                    // assing uuid
                    const id = uuidv4();
                    newImg.set({ id });
                    // assign layer zindex
                    const zIndex =
                      canvasLayer.currentLayer === "Map"
                        ? canvasLayer.BOTTOM_LAYER
                        : canvasLayer.OBJECT_LAYER;
                    newImg.zIndex = zIndex;

                    // HANDLE ************************
                    // add to canvas
                    canvasLayer.canvas.add(newImg);
                    // in center of viewport
                    canvasLayer.canvas.viewportCenterObject(newImg);
                    // event listener
                    // newImg.on("selected", function () {
                    //   console.log("selected an image", newImg);
                    // });
                    // sort by layers and re-render
                    canvasLayer.canvas._objects.sort((a, b) =>
                      a.zIndex > b.zIndex ? 1 : -1
                    );
                    canvasLayer.canvas.renderAll();

                    // EMIT ***************************
                    socketIntegration.imageAdded({ newImg, id, zIndex });
                  });
                }
              },
            }),
            createElement(
              "div",
              { style: "width: 100px; overflow-x: auto" },
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
                event: async () => {
                  if (
                    window.confirm(
                      `Are you sure you want to delete ${image.original_name}`
                    )
                  ) {
                    deleteThing(
                      `/api/remove_image/${state.currentProject.id}/${image.id}`
                    );
                    deleteThing(`/api/remove_table_image/${tableImage.id}`);
                    elem.remove();
                  }
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
