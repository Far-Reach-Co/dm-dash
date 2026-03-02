import createElement from "../lib/salt-lib/createElement.js";
import Component from "../lib/salt-lib/Component.js";

class Modal extends Component {
  constructor() {
    const existingElem = document.getElementById("modal-custom");
    const domElem =
      existingElem ||
      createElement("div", { id: "modal-custom", class: "modal-custom" });

    super({
      domElem,
      autoInit: false,
      autoRender: false,
    });

    this.domContent = null;
    this.closeButton = null;
    this._onCloseClick = () => this.hide();
    this._onBackdropClick = (e) => {
      if (e.target === this.domElem) {
        this.hide();
      }
    };
    this.init();
  }

  init = () => {
    if (!this.domElem.parentNode) {
      document.body.appendChild(this.domElem);
    }

    this.domElem.classList.add("modal-custom");

    this.domContent = this.domElem.querySelector("#modal-custom-content");
    this.closeButton = this.domElem.querySelector("#close-custom-modal");

    if (!this.domContent || !this.closeButton) {
      this.closeButton = createElement(
        "div",
        { id: "close-custom-modal", class: "close-custom-modal" },
        "x",
      );

      this.domContent = createElement("div", {
        id: "modal-custom-content",
        class: "modal-custom-content",
      });

      const modalContainer = createElement(
        "div",
        { class: "modal-custom-container" },
        [this.closeButton, this.domContent],
      );

      this.domElem.replaceChildren(modalContainer);
    }

    this.closeButton.removeEventListener("click", this._onCloseClick);
    this.closeButton.addEventListener("click", this._onCloseClick);

    this.domElem.removeEventListener("click", this._onBackdropClick);
    this.domElem.addEventListener("click", this._onBackdropClick);
  };

  show = (content) => {
    if (!this.domElem) return;
    this.domElem.classList.add("visible");
    this.domContent.replaceChildren();

    if (Array.isArray(content)) {
      this.domContent.append(...content);
      return;
    }

    if (content instanceof Node) {
      this.domContent.append(content);
      return;
    }

    if (content !== null && typeof content !== "undefined") {
      this.domContent.append(String(content));
    }
  };

  hide = () => {
    if (!this.domElem) return;
    this.domElem.classList.remove("visible");
  };
}

const modal = new Modal();
export default modal;
window.modal = modal;
