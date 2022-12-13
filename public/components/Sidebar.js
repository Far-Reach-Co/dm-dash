import createElement from "../lib/createElement.js";

export default class SideBar {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.navigate = props.navigate;
    this.isVisible = false;

    this.render();
  }

  render = () => {
    const routes = [
      { id: "sidebar-clocks", title: "clocks", displayTitle: "Clocks" },
      { id: "sidebar-calendars", title: "calendars", displayTitle: "Calendars" },
    ];

    const container = createElement("div", {
      class: "sidebar-container",
    });
    const header = createElement("div", { class: "sidebar-header" }, "Modules");
    const hideButton = createElement("img", {
      class: "close-sidebar",
      src: "../assets/hide.svg",
      height: 28,
      width: 28,
    });
    hideButton.addEventListener("mousedown", () => {
      this.isVisible = false;
      this.container.style.transform = "translate(-200px, 0px)";
      this.domComponent.style.zIndex = "1";
    });
    header.appendChild(hideButton);
    container.appendChild(header);

    routes.forEach((route) => {
      const elem = createElement(
        "a",
        {
          class: "sidebar-item",
          id: route.id,
        },
        route.displayTitle
      );
      elem.addEventListener("click", () => {
        this.navigate({ title: route.title, sidebar: true });
      });
      container.appendChild(elem)
    });

    this.container = container;
    this.domComponent.appendChild(container);
  };
}
