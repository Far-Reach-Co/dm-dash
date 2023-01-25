import createElement from "../lib/createElement.js";

export default class SideBar {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "sidebar";
    this.navigate = props.navigate;
    this.isVisible = false;
  }

  renderCloseSidebarElem = () => {
    const elem = createElement("img", {
      id: "close-sidebar",
      class: "close-sidebar",
      src: "/assets/hamburger.svg",
      height: 28,
      width: 28,
    });
    elem.addEventListener("click", this.close);
    return elem;
  };

  close = () => {
    this.isVisible = false;
    if (this.container && this.container.style)
      this.container.style.transform = "translate(200px, 0px)";
    if (this.domComponent && this.domComponent.style)
      this.domComponent.style.zIndex = "1";
  };

  open = () => {
    this.isVisible = true;
    if (this.container && this.container.style)
      this.container.style.transform = "translate(0px, 0px)";
    if (this.domComponent && this.domComponent.style)
      this.domComponent.style.zIndex = "3";
  };

  renderRoutesElems = () => {
    const routes = [
      {
        id: "sidebar-notes",
        title: "notes",
        displayTitle: "Notes",
        params: {},
      },
      {
        id: "sidebar-locations",
        title: "locations",
        displayTitle: "Locations",
        params: {},
      },
      {
        id: "sidebar-items",
        title: "items",
        displayTitle: "Items",
        params: {},
      },
      {
        id: "sidebar-characters",
        title: "characters",
        displayTitle: "Characters",
        params: {},
      },
      {
        id: "sidebar-counters",
        title: "counters",
        displayTitle: "Counters",
        params: {},
      },
      {
        id: "sidebar-clocks",
        title: "clocks",
        displayTitle: "Clocks",
        params: {},
      },
      {
        id: "sidebar-calendars",
        title: "calendars",
        displayTitle: "Calendars",
        params: {},
      },
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
        this.navigate({
          title: route.title,
          sidebar: true,
          params: route.params,
        });
      });
      return elem;
    });
  };

  hide = () => {
    this.close();
    this.domComponent.innerHTML = "";
  };

  render = () => {
    this.domComponent.innerHTML = "";

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
