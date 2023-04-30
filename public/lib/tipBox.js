import createElement from "./createElement.js";

export function tipBox(message, imageSrc, orientationVertical) {
  // vertical
  if (orientationVertical) {
    return createElement("div", { class: "tip-box-y" }, [
      createElement("img", {
        src: imageSrc,
        width: 50,
      }),
      createElement("small", { style: "margin-top: 5px;" }, message),
    ]);
  } else {
    // horizontal
    return createElement("div", { class: "tip-box-x" }, [
      createElement("img", {
        src: imageSrc,
        width: 50,
      }),
      createElement("small", { style: "margin-left: 5px;" }, message),
    ]);
  }
}
