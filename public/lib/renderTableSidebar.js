import { getPresignedForImageDownload, uploadImage } from "./imageUtils.js";
import createElement from "./createElement.js";
import state from "./state.js";
import { getThings, postThing } from "./apiUtils.js";
import renderLoadingWithMessage from "./loadingWithMessage.js";
import TableApp from "../views/TableApp.js";

export default class TableSidebarComponent {
  constructor(props) {
    this.domComponent = props.domComponent;

    this.imageLoading = false;
    this.render();
  }

  toggleImageLoading = () => {
    this.imageLoading = !this.imageLoading;
    this.render();
  };

  renderImage = async (imageId) => {
    const imageSource = await getPresignedForImageDownload(imageId);
    if (imageSource) {
      return createElement("img", {
        src: imageSource.url,
        width: 30,
        height: 30,
      });
    }
  }

  renderCurrentImages = async () => {
    const tableImages = await getThings(
      `/api/get_table_images/${state.currentProject.id}`
    );
    if (!tableImages.length) return [createElement("small", {}, "None...")];

    const imageElems = [];
    await Promise.all(
      tableImages.map(async (tableImage) => {
        const image = await getThings(`/api/get_image/${tableImage.image_id}`);
        if (image) {
          const elem = createElement("div", { class: "sidebar-image-item" }, [
            createElement("a", {}, "+", {
              type: "click",
              event: async () => {
                const canvas = TableApp.views.table.canvas;
                const imageSource = await getPresignedForImageDownload(image.id);
                if (imageSource) {
                  const myImg = fabric.Image.fromURL(imageSource.url, function (oImg) {
                    canvas.add(oImg);
                    oImg.on("selected", function () {
                      console.log("selected an image");
                    });
                  });
                }
              }
            }),
            createElement("div", {}, image.original_name),
            await this.renderImage(image.id)
          ]);
          imageElems.push(elem);
        }
      })
    );
    if (imageElems.length) return imageElems;
    else return [createElement("small", {}, "None...")];
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.imageLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Uploading your image...")
      );
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
