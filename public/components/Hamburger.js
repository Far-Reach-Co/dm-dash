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
      this.sidebar.isVisible = false;
      this.sidebar.container.style.transform = "translate(-200px, 0px)";
      this.sidebar.domComponent.style.zIndex = "1";
    } else {
      this.sidebar.isVisible = true;
      this.sidebar.container.style.transform = "translate(0px, 0px)";
      this.sidebar.domComponent.style.zIndex = "3";
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
