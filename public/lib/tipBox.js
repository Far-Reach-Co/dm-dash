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
        { class: "tipbox-text", style: "margin-top: 5px; color: var(--pink);" },
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
          class: "tipbox-text",
          style: "margin-left: 5px; color: var(--pink);",
        },
        message
      ),
    ]);
  }
}
