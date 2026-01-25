import createElement from "./createElement.js";

class Toast {
  constructor() {
    this.isVisible = false;
    this.message = "";
    this.domComponent = document.getElementById("toast-custom");
    if (!this.domComponent) return;
    this.domComponent.classList.remove("visible");

    this.isError = false;

    this.render();
  }

  show = (message) => {
    if (!this.domComponent) return;
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
    if (!this.domComponent) return;
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
