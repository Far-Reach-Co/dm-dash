import createElement from "../lib/createElement.js";

class SideBar {
  constructor() {
    this.isVisible = true
  }
  render = (parentComponent) => {
    
    const elem = createElement(
      "div",
      { id: "sidebar-elem" },
      createElement(
        "div",
        { class: "sidebar", id: "sidbar" },
        createElement("div", { class: "sidebar-items", id: "sidebar-items" }, [
          createElement(
            "a",
            { class: "sidebar-items-item", id: "sidebar-clocks" },
            "Clocks"
          ),
          createElement("hr"),
          createElement("a", { class: "sidebar-items-item" }, "Something"),
          createElement("hr"),
          createElement("a", { class: "sidebar-items-item" }, "Testing"),
        ])
      )
    );
    parentComponent.appendChild(elem);
    // get and set items
    this.items = document.getElementById("sidebar-items");

    const hamburgerElem = createElement("img", {
      id: "hamburger",
      style: 'z-index: 1; position: absolute;',
      height: "50px",
      width: "50px",
      src: "./assets/hamburger.svg",
    });
    hamburgerElem.addEventListener("mousedown", (event) => {
      event.stopPropagation();
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    });
    parentComponent.appendChild(hamburgerElem);

    // hide if click anywhere else
    document.addEventListener("mousedown", () => {
      this.hide();
    });
    // handle routes
    document
      .getElementById("sidebar-clocks")
      .addEventListener("mousedown", () => {
        const searchParams = new URLSearchParams(window.location.search);
        // searchParams.set('project', this.id)
        searchParams.set("view", "clocks");
        window.location.search = searchParams.toString();
      });
  };

  // hide sidebar
  hide = () => {
    this.isVisible = false;
    this.items.style.transform = "translate(-200px, 0px)";
    document.getElementById("hamburger").style.zIndex = "3";
  };
  // show sidebar
  show = () => {
    this.isVisible = true;
    this.items.style.transform = "translate(0px, 0px)";
    document.getElementById("hamburger").style.zIndex = "1";
  };
}

export default new SideBar();
