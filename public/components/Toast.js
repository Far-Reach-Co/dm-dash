import createElement from "../lib/createElement.js";

class Toast {
  constructor() {
    this.isVisible = false;
    this.message = "";
    this.domComponent = document.getElementById("toast");
    if (!this.domComponent) return;
    this.domComponent.style.visibility = "hidden";

    this.isError = false;

    this.render();
  }

  show = (message) => {
    if (!this.domComponent) return;
    this.isVisible = true;
    this.message = message;
    this.render();
    this.domComponent.style.visibility = "visible";
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
    this.domComponent.style.visibility = "hidden";
  };

  render = () => {
    if (!this.domComponent) return;
    this.domComponent.innerHTML = "";

    if (this.isError)
      return this.domComponent.append(
        createElement("div", { class: "toast toast-error" }, this.message)
      );
    else
      return this.domComponent.append(
        createElement("div", { class: "toast" }, this.message)
      );
  };
}

const toast = new Toast();
export default toast;
