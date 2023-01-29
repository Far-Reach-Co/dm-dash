import createElement from "../lib/createElement.js";

class Toast {
  constructor() {
    this.isVisible = false;
    this.message = "";
    this.domComponent = document.getElementById("toast");
    this.domComponent.style.visibility = "hidden";

    this.isError = false;

    this.render();
  }

  show = (message) => {
    this.isVisible = true;
    this.message = message;
    this.render();
    this.domComponent.style.visibility = "visible";
    const timer = setTimeout(() => {
      this.hide();
    }, 2000);
    this.timer = timer;
  };

  error = (message) => {
    this.isError = true;
    this.show(message);
  };

  hide = () => {
    clearTimeout(this.timer);
    this.isVisible = false;
    this.isError = false;
    this.message = "";
    this.render();
    this.domComponent.style.visibility = "hidden";
  };

  render = () => {
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
