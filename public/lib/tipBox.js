import createElement from "./createElement.js";

export function tipBoxHor(message) {
  return createElement("div", { class: "tip-box-x" }, [
    createElement("img", {
      src: "/assets/peli_question_small.png",
      width: 50,
    }),
    createElement("small", { style: "margin-left: 5px;" }, message),
  ]);
}

export function tipBoxVert(message) {
  return createElement("div", { class: "tip-box-y" }, [
    createElement("img", {
      src: "/assets/peli_note_small.png",
      width: 50,
    }),
    createElement("small", { style: "margin-top: 5px;" }, message),
  ]);
}
