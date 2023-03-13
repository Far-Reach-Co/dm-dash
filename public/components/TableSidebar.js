import createElement from "../lib/createElement.js";
import TableSidebarComponent from "../lib/TableSidebarComponent.js";

export default class TableSidebar {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "sidebar";
    this.canvasLayer = props.canvasLayer;
    this.isVisible = false;
    this.navigate = props.navigate;
  }

  renderCloseSidebarElem = () => {
    const elem = createElement("img", {
      id: "close-sidebar",
      class: "close-sidebar",
      src: "/assets/sidebar.svg",
      height: 32,
      width: 32,
    });
    elem.addEventListener("click", this.close);
    return elem;
  };

  close = () => {
    this.isVisible = false;
    if (this.container && this.container.style)
      this.container.style.transform = "translate(200px, 0px)";
    if (this.domComponent && this.domComponent.style)
      this.domComponent.style.zIndex = "2";
  };

  open = () => {
    this.isVisible = true;
    if (this.container && this.container.style)
      this.container.style.transform = "translate(0px, 0px)";
    if (this.domComponent && this.domComponent.style)
      this.domComponent.style.zIndex = "4";
  };

  hide = () => {
    this.close();
    this.domComponent.innerHTML = "";
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    const tableSidebarComponentElem = createElement("div", {
      style: "display: flex; flex-direction: column;",
    });
    new TableSidebarComponent({
      domComponent: tableSidebarComponentElem,
      canvasLayer: this.canvasLayer,
    });
    const container = createElement(
      "div",
      {
        class: "sidebar-container",
      },
      [
        createElement("div", { class: "sidebar-header" }, "Images"),
        tableSidebarComponentElem,
        this.renderCloseSidebarElem(),
      ]
    );
    this.container = container;
    this.open();
    return this.domComponent.append(container);
  };
}
