import createElement from "./lib/createElement.js";
import state from "./lib/state.js";
import ProjectsView from "./views/Projects.js";
import ClocksView from "./views/Clocks.js";
import CalendarsView from "./views/Calendars.js";
import Sidebar from "./components/Sidebar.js";
import LocationsView from "./views/Locations.js"
import SingleLocationsView from "./views/SingleLocation.js";
import NotesView from "./views/Notes.js";

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
      // stop all clocks
      Object.values(state.clockComponents).forEach((project) => {
        project.forEach((clock) => {
          clock.stop();
        });
      });
      // navigate to project select
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

  renderLocationsView = ({ navigate }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new LocationsView({ domComponent: element, navigate });
  }

  renderSingleLocationView = ({ navigate, params }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new SingleLocationsView({ domComponent: element, navigate, params });
  }

  renderCalendersView = () => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new CalendarsView({ domComponent: element });
  };

  renderClocksView = () => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new ClocksView({ domComponent: element });
  };

  renderNotesView = () => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new NotesView({ domComponent: element });
  };

  renderProjectsView = ({ navigate }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new ProjectsView({ domComponent: element, navigate });
  };

  renderModulesView = () => {
    this.domComponent.appendChild(
      createElement(
        "div",
        { class: "standard-view" },
        createElement("h1", {}, "<--- Select a module from the sidebar")
      )
    );
  };

  renderSidebarAndHamburger = (props) => {
    // ELEMENTS
    const sidebarElem = createElement("div", { class: "sidebar" });
    // hamburger
    const hamburgerElem = createElement(
      "img",
      {
        id: "hamburger",
        style: "z-index: 2; position: absolute; cursor: pointer;",
        height: "50px",
        width: "50px",
        src: "./assets/hamburger.svg",
      },
      null,
      {
        type: "click",
        event: () => {
          if (sidebar.isVisible) {
            sidebar.isVisible = false;
            sidebar.container.style.transform = "translate(-200px, 0px)";
            sidebar.domComponent.style.zIndex = "1";
          } else {
            sidebar.isVisible = true;
            sidebar.container.style.transform = "translate(0px, 0px)";
            sidebar.domComponent.style.zIndex = "3";
          }
        },
      }
    );

    this.domComponent.append(sidebarElem, hamburgerElem);

    // SIDEBAR
    const sidebar = new Sidebar({
      domComponent: sidebarElem,
      navigate: props.navigate,
    });
  };

  navigate = ({ title, sidebar, params }) => {
    // clear
    this.domComponent.innerHTML = "";
    // handle sidebar
    if (sidebar) this.renderSidebarAndHamburger({ navigate: this.navigate });
    // routing
    switch (title) {
      case "clocks":
        return this.renderClocksView();
      case "notes":
        return this.renderNotesView();
      case "calendars":
        return this.renderCalendersView();
      case "locations":
        return this.renderLocationsView({navigate: this.navigate});
      case "single-location":
        return this.renderSingleLocationView({navigate: this.navigate, params})
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
