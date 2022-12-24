import createElement from "../lib/createElement.js";

export default class SideBar {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.navigate = props.navigate;
    this.isVisible = false;

    this.render();
  }

  renderCloseSidebarElem = () => {
    const elem = createElement("img", {
      id: "close-sidebar",
      class: "close-sidebar",
      src: "../assets/hide.svg",
      height: 28,
      width: 28,
    });
    elem.addEventListener("click", () => {
      this.isVisible = false;
      this.container.style.transform = "translate(-200px, 0px)";
      this.domComponent.style.zIndex = "1";
    });
    return elem;
  };

  renderRoutesElems = () => {
    const routes = [
      {
        id: "sidebar-notes",
        title: "notes",
        displayTitle: "Notes",
      },
      {
        id: "sidebar-locations",
        title: "locations",
        displayTitle: "Locations",
      },
      { id: "sidebar-clocks", title: "clocks", displayTitle: "Clocks" },
      {
        id: "sidebar-calendars",
        title: "calendars",
        displayTitle: "Calendars",
      }
    ];
    return routes.map((route) => {
      const elem = createElement(
        "a",
        {
          class: "sidebar-item",
          id: route.id,
        },
        route.displayTitle
      );
      // event listener
      elem.addEventListener("click", () => {
        this.navigate({ title: route.title, sidebar: true });
      });
      return elem;
    });
  };

  render = () => {
    const container = createElement(
      "div",
      {
        class: "sidebar-container",
      },
      [
        createElement("div", { class: "sidebar-header" }, "Modules"),
        this.renderCloseSidebarElem(),
        ...this.renderRoutesElems(),
      ]
    );
    this.container = container;
    this.domComponent.appendChild(container);
  };
}
