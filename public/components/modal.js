import createElement from "./createElement.js";

class Modal {
  constructor() {
    this.domComponent = null;
    this.domContent = null;
    this.closeButton = null;
    this.init();
  }

  init() {
    // Check if modal already exists
    this.domComponent = document.getElementById("modal-custom");

    if (!this.domComponent) {
      // Create modal elements dynamically
      this.closeButton = createElement(
        "div",
        { id: "close-custom-modal", class: "close-custom-modal" },
        "x"
      );

      this.domContent = createElement("div", {
        id: "modal-custom-content",
        class: "modal-custom-content",
      });

      const modalContainer = createElement(
        "div",
        { class: "modal-custom-container" },
        [this.closeButton, this.domContent]
      );

      this.domComponent = createElement(
        "div",
        { id: "modal-custom", class: "modal-custom" },
        modalContainer
      );

      document.body.appendChild(this.domComponent);
    } else {
      // Use existing elements
      this.domContent = document.getElementById("modal-custom-content");
      this.closeButton = document.getElementById("close-custom-modal");
    }

    // Set up event listeners
    if (this.closeButton) {
      this.closeButton.addEventListener("click", this.hide);
    }

    document.addEventListener("click", (e) => {
      if (e.target.id === "modal-custom") {
        this.hide();
      }
    });
  }

  show = (content) => {
    if (!this.domComponent) this.init();
    this.domComponent.classList.add("visible");
    this.domContent.innerHTML = "";
    this.domContent.append(content);
  };

  hide = () => {
    if (!this.domComponent) return;
    this.domComponent.classList.remove("visible");
  };
}

const modal = new Modal();
export default modal;
window.modal = modal;
