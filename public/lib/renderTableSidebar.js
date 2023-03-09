import { uploadImage } from "./imageUtils.js";
import createElement from "./createElement.js";
import state from "./state.js";

export default async function renderTableSidebar() {
  return [
    createElement("div", { class: "sidebar-header" }, "Images"),
    createElement("input", {
      id: "image",
      name: "image",
      type: "file",
      accept: "image/*",
      style: "display: none"
    }, null, {
      type: "change",
      event: async (e) => {
        const file = e.target.files[0]
        if (file) {
          const newImage = await uploadImage(file, state.currentProject.id)
          if (newImage) {
            // add new table image
          }
        }
      }
    }),
    createElement("label", {
      for: "image",
      class: "label-btn",
    }, "+ Image")
  ]
}