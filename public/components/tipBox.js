import createElement from "./createElement.js";

export function tipBox(message, imageSrc, orientationVertical) {
  // vertical
  if (orientationVertical) {
    return createElement("div", { class: "tip-box-y" }, [
      createElement("img", {
        src: imageSrc,
        width: 50,
      }),
      createElement(
        "div",
        { class: "tipbox-text text-pink mt-1" },
        message
      ),
    ]);
  } else {
    // horizontal
    return createElement("div", { class: "tip-box-x" }, [
      createElement("img", {
        src: imageSrc,
        width: 50,
      }),
      createElement(
        "div",
        {
          class: "tipbox-text text-pink ms-1",
        },
        message
      ),
    ]);
  }
}
