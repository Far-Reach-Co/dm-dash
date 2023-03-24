import createElement from "../lib/createElement.js";
import TableSidebarComponent from "../lib/TableSidebarComponent.js";

export default class TableSidebar {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "sidebar";
    this.isVisible = false;
    this.navigate = props.navigate;

    // table sidebar component
    this.tableSidebarComponent = new TableSidebarComponent({
      domComponent: createElement("div", {
        style: "display: flex; flex-direction: column;",
      }),
    });
    
    // setup online users component
    this.onlineUsersComponent = new OnlineUsersComponent({
      domComponent: createElement("div"),
    });
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

    const container = createElement(
      "div",
      {
        class: "sidebar-container",
      },
      [
        createElement("div", { class: "sidebar-header" }, "Images"),
        this.tableSidebarComponent.domComponent,
        createElement("div", { class: "sidebar-header" }, "Online Users"),
        this.onlineUsersComponent.domComponent,
        this.renderCloseSidebarElem(),
      ]
    );
    this.container = container;
    this.open();
    return this.domComponent.append(container);
  };
}

class OnlineUsersComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "online-users-container";

    this.usersList = [];

    this.render();
  }

  renderUsersList = () => {
    if (!this.usersList.length) return [createElement("small", {}, "None...")];

    return this.usersList.map((user) => {
      return createElement(
        "div",
        {
          style:
            "display: flex; align-items: center; justify-content: space-between",
        },
        [createElement("div", {class: "online-indicator"}), createElement("div", {}, user.username)]
      );
    });
  };

  render = () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(...this.renderUsersList());
  };
}
