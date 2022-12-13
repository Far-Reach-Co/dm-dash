import createElement from "./lib/createElement.js";
import state from "./lib/state.js";
import ProjectsView from "./views/Projects.js";
import ClocksView from "./views/Clocks.js";
import CalendarsView from "./views/Calendars.js";
import Sidebar from "./components/Sidebar.js";

class App {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "app";
    // begin
    this.init();
  }

  init = async () => {
    this.handleLogout();
    this.handleToProject();
    await this.verifyToken();
    this.render();
  };

  handleToProject = () => {
    document.getElementById("to-projects-btn").addEventListener("click", () => {
      this.navigate({});
    });
  };

  handleLogout = () => {
    document.getElementById("logout-btn").addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.pathname = "/";
    });
  };

  verifyToken = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await fetch(`${window.location.origin}/api/verify_jwt`, {
          headers: { "x-access-token": `Bearer ${token}` },
        });
        const resData = await res.json();
        if (res.status === 200) {
          state.user = resData;
        } else if (res.status === 400) {
          window.location.pathname = "/login.html";
        } else throw resData.error;
      } catch (err) {
        console.log(err);
        window.location.pathname = "/login.html";
      }
    } else window.location.pathname = "/login.html";
  };

  renderCalendersView = async () => {
    const element = createElement("div");
    new CalendarsView({ domComponent: element });
    this.domComponent.appendChild(element);
  };

  renderClocksView = async () => {
    const element = createElement("div");
    new ClocksView({ domComponent: element });
    this.domComponent.appendChild(element);
  };

  renderProjectsView = ({ navigate }) => {
    const element = createElement("div");
    new ProjectsView({ domComponent: element, navigate });
    this.domComponent.appendChild(element);
  };

  renderModulesView = () => {
    const element = createElement("div");
    element.className = "standard-view";
    const title = createElement(
      "h1",
      {},
      "<--- Select a module from the sidebar"
    );
    element.appendChild(title);
    this.domComponent.appendChild(element);
  };

  renderSidebarAndHamburger = (props) => {
    // ELEMENTS
    const element = createElement("div", { class: "sidebar" });
    const hamburgerElem = createElement("img", {
      id: "hamburger",
      style: "z-index: 2; position: absolute; cursor: pointer;",
      height: "50px",
      width: "50px",
      src: "./assets/hamburger.svg",
    });
    // SIDEBAR
    const sidebar = new Sidebar({
      domComponent: element,
      navigate: props.navigate,
    });
    this.domComponent.appendChild(element);
    // HAMBURGER
    hamburgerElem.addEventListener("mousedown", () => {
      if (sidebar.isVisible) {
        sidebar.isVisible = false;
        sidebar.container.style.transform = "translate(-200px, 0px)";
        sidebar.domComponent.style.zIndex = "1";
      } else {
        sidebar.isVisible = true;
        sidebar.container.style.transform = "translate(0px, 0px)";
        sidebar.domComponent.style.zIndex = "3";
      }
    });
    this.domComponent.appendChild(hamburgerElem);
  };

  navigate = ({ title, sidebar }) => {
    // clear
    this.domComponent.innerHTML = "";
    // handle sidebar
    if (sidebar) this.renderSidebarAndHamburger({ navigate: this.navigate });
    // routing
    switch (title) {
      case "clocks":
        return this.renderClocksView();
      case "calendars":
        return this.renderCalendersView();
      case "modules":
        return this.renderModulesView();
      default:
        return this.renderProjectsView({ navigate: this.navigate });
    }
  };

  render = async () => {
    this.navigate({});
  };
}

new App({ domComponent: document.getElementById("app") });
