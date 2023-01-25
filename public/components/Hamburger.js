import createElement from "../lib/createElement.js";

export class Hamburger {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.id = "hamburger";
    this.domComponent.className = "hamburger";
    this.sidebar = props.sidebar;

    this.domComponent.addEventListener("click", this.toggle)
  }

  hide = () => {
    this.domComponent.innerHTML = "";
  };

  toggle = () => {
    if (this.sidebar.isVisible) {
      this.sidebar.close();
    } else {
      this.sidebar.open();
    }
  };

  render = () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      createElement(
        "img",
        {
          height: "50px",
          width: "50px",
          src: "./assets/hamburger.svg",
        },
        null
      )
    );
  };
}
