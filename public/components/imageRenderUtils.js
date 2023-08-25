import modal from "./modal.js";
import createElement from "./createElement.js";
// import { getPresignedForImageDownload } from "./imageUtils.js";

async function handleImageClick(imageSource) {
  modal.show(
    createElement("img", { src: imageSource.url, class: "modal-image" })
  );
}

export async function renderImageLarge(imageId) {
  if (imageId) {
    const imageSource = await getPresignedForImageDownload(imageId); // deprecated
    if (imageSource) {
      return createElement(
        "img",
        {
          class: "clickable-image",
          src: imageSource.url,
          width: "50%",
          height: "auto",
        },
        null,
        {
          type: "click",
          event: () => handleImageClick(imageSource),
        }
      );
    } else return createElement("div", { style: "visibility: hidden;" });
  } else return createElement("div", { style: "visibility: hidden;" });
}

export async function renderImageSmallOrPlaceholder(
  imageId,
  placeholderImageLocation
) {
  if (imageId) {
    const imageSource = await getPresignedForImageDownload(imageId); // deprecated
    if (imageSource) {
      return createElement("img", {
        src: imageSource.url,
        width: 30,
        height: 30,
      });
    } else {
      if (placeholderImageLocation) {
        return createElement("img", {
          src: placeholderImageLocation,
          width: 30,
          height: 30,
        });
      }
    }
  } else {
    if (placeholderImageLocation) {
      return createElement("img", {
        src: placeholderImageLocation,
        width: 30,
        height: 30,
      });
    }
  }
}
