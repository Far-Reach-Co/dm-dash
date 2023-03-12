import createElement from "../lib/createElement.js";

export default class SideBar {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "sidebar";
    this.isVisible = false;
    this.navigate = props.navigate;
    this.mainRoutes = props.mainRoutes;
    this.secondRoutes = props.secondRoutes;
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

  renderMainRoutesElems = () => {
    return this.mainRoutes.map((route) => {
      let className = "sidebar-item";
      if (
        this.navigate.currentRoute &&
        this.navigate.currentRoute.title === route.title
      )
        className += " sidebar-selected-item";
      const elem = createElement(
        "a",
        {
          class: className,
          id: route.id,
        },
        route.displayTitle
      );
      // event listener
      elem.addEventListener("click", () => {
        this.navigate.navigate({
          title: route.title,
          sidebar: true,
          params: route.params,
        });
      });
      return elem;
    });
  };

  renderToolRoutesElems = () => {
    return this.secondRoutes.map((route) => {
      let className = "sidebar-item";
      if (
        this.navigate.currentRoute &&
        this.navigate.currentRoute.title === route.title
      )
        className += " sidebar-selected-item";
      const elem = createElement(
        "a",
        {
          class: className,
          id: route.id,
        },
        route.displayTitle
      );
      // event listener
      elem.addEventListener("click", () => {
        this.navigate.navigate({
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

  render = async () => {
    this.domComponent.innerHTML = "";

    const container = createElement(
      "div",
      {
        class: "sidebar-container",
      },
      [
        createElement("div", { class: "sidebar-header" }, "Main Modules"),
        ...this.renderMainRoutesElems(),
        createElement("div", { class: "sidebar-header" }, "Personal Tools"),
        ...this.renderToolRoutesElems(),
        this.renderCloseSidebarElem(),
      ]
    );
    this.container = container;
    this.domComponent.append(container);
  };
}
