import createElement from "./createElement.js";

class Toast {
  constructor() {
    this.isVisible = false;
    this.message = "";
    this.domComponent = null;
    this.isError = false;
    this.init();
  }

  init() {
    // Check if toast element already exists
    this.domComponent = document.getElementById("toast-custom");

    if (!this.domComponent) {
      // Create toast element dynamically
      this.domComponent = createElement("div", { id: "toast-custom" });
      document.body.appendChild(this.domComponent);
    }

    this.domComponent.classList.remove("visible");
    this.render();
  }

  show = (message) => {
    if (!this.domComponent) this.init();
    this.isVisible = true;
    this.message = message;
    this.render();
    this.domComponent.classList.add("visible");
    const timer = setTimeout(() => {
      this.hide();
    }, 4000);
    this.timer = timer;
  };

  error = (message) => {
    if (!this.domComponent) this.init();
    this.isError = true;
    this.show(message);
  };

  hide = () => {
    if (!this.domComponent) return;
    clearTimeout(this.timer);
    this.isVisible = false;
    this.isError = false;
    this.message = "";
    this.domComponent.classList.remove("visible");
  };

  render = () => {
    if (!this.domComponent) return;
    this.domComponent.innerHTML = "";

    if (this.isError)
      return this.domComponent.append(
        createElement(
          "div",
          { class: "toast-custom toast-error" },
          this.message
        )
      );
    else
      return this.domComponent.append(
        createElement("div", { class: "toast-custom" }, this.message)
      );
  };
}

const toast = new Toast();
export default toast;
