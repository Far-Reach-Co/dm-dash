import createElement from "../lib/salt-lib/createElement.js";
import Component from "../lib/salt-lib/Component.js";

export class Hamburger extends Component {
  constructor(props = {}) {
    super({
      domElem: props.domElem || createElement("div"),
      autoRender: false,
    });

    this.domElem.id = "hamburger";
    this.domElem.className = "hamburger";
    this.sidebar = props.sidebar;

    this.domElem.addEventListener("click", this.toggle);
  }

  hide = () => {
    this.domElem.innerHTML = "";
  };

  destroy = () => {
    this.domElem.removeEventListener("click", this.toggle);
    this.domElem.replaceChildren();
  };

  toggle = () => {
    if (this.sidebar.isVisible) {
      this.sidebar.close();
    } else {
      this.sidebar.open();
    }
  };

  render = () => {
    return [
      createElement(
        "img",
        {
          height: "32px",
          width: "32px",
          src: "/assets/sidebar.svg",
          class: "flipXAxis",
          title: "Toggle sidebar",
        },
        null,
      ),
    ];
  };
}
