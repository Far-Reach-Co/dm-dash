import createElement from "../lib/salt-lib/createElement.js";
import Component from "../lib/salt-lib/Component.js";

class Toast extends Component {
  constructor() {
    const existingElem = document.getElementById("toast-custom");
    const domElem = existingElem || createElement("div", { id: "toast-custom" });
    super({
      domElem,
      autoInit: false,
      autoRender: false,
    });

    this.isVisible = false;
    this.message = "";
    this.isError = false;
    this.timer = null;
    this.init();
  }

  init = () => {
    if (!this.domElem.parentNode) {
      document.body.appendChild(this.domElem);
    }

    this.domElem.classList.remove("visible");
    this.render();
  };

  show = (message) => {
    this.isVisible = true;
    this.message = message;
    this.render();
    this.domElem.classList.add("visible");
    clearTimeout(this.timer);
    const timer = setTimeout(() => {
      this.hide();
    }, 4000);
    this.timer = timer;
  };

  error = (message) => {
    this.isError = true;
    this.show(message);
  };

  hide = () => {
    if (!this.domElem) return;
    clearTimeout(this.timer);
    this.timer = null;
    this.isVisible = false;
    this.isError = false;
    this.message = "";
    this.domElem.classList.remove("visible");
  };

  render = () => {
    if (this.isError)
      return [
        createElement(
          "div",
          { class: "toast-custom toast-error" },
          this.message,
        ),
      ];
    else return [createElement("div", { class: "toast-custom" }, this.message)];
  };
}

const toast = new Toast();
export default toast;
