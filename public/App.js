import createElement from "./lib/createElement.js";
import state from "./lib/state.js";
import ProjectsView from "./views/Projects.js";
import ClocksView from "./views/Clocks.js";
import CalendarsView from "./views/Calendars.js";
import Sidebar from "./components/Sidebar.js";
import LocationsView from "./views/Locations.js";
import SingleLocationView from "./views/SingleLocation.js";
import NotesView from "./views/Notes.js";
import CountersView from "./views/Counters.js";
import CharactersView from "./views/Characters.js";
import SingleCharacterView from "./views/SingleCharacter.js";
import ItemsView from "./views/Items.js";
import SingleItemView from "./views/SingleItem.js";
import { Hamburger } from "./components/Hamburger.js";
import navigate from "./lib/Navigate.js";

class App {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "app";

    this.sidebar;
    this.hamburger;
    // begin
    this.init();
  }

  init = async () => {
    this.handleLogout();
    this.handleToProject();
    await this.verifyToken();
    // setup sidebar
    this.instantiateSidebar();
    this.instantiateHamburger();
    // remove initial spinner
    document.getElementById("initial-spinner").remove();
    // navigate to first view
    navigate.navigate({ title: "app", sidebar: false, params: {} });
  };

  instantiateSidebar = () => {
    const sidebarElem = createElement("div", {});
    // SIDEBAR
    const sidebar = new Sidebar({
      domComponent: sidebarElem,
    });
    this.sidebar = sidebar;
  };

  instantiateHamburger = () => {
    const hamburgerElem = createElement("div", {});
    // SIDEBAR
    const hamburger = new Hamburger({
      domComponent: hamburgerElem,
      sidebar: this.sidebar,
    });
    this.hamburger = hamburger;
  };

  handleToProject = () => {
    document.getElementById("to-projects-btn").addEventListener("click", () => {
      // stop all clocks
      Object.values(state.clockComponents).forEach((project) => {
        project.forEach((clock) => {
          if (clock.isRunning) clock.stop();
        });
      });
      // navigate to project select
      navigate.navigate({ title: "app", sidebar: false, params: {} });
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
  };

  renderSingleLocationView = ({ navigate, params }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new SingleLocationView({ domComponent: element, navigate, params });
  };

  renderCharactersView = ({ navigate }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new CharactersView({ domComponent: element, navigate });
  };

  renderSingleCharacterView = ({ navigate, params }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new SingleCharacterView({ domComponent: element, navigate, params });
  };

  renderItemsView = ({ navigate }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new ItemsView({ domComponent: element, navigate });
  };

  renderSingleItemView = ({ navigate, params }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new SingleItemView({ domComponent: element, navigate, params });
  };

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

  renderCountersView = () => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new CountersView({ domComponent: element });
  };

  renderNotesView = ({ navigate }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new NotesView({ domComponent: element, navigate });
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
        createElement(
          "h2",
          { style: "align-self: center;" },
          "Select a module from the sidebar ➔"
        )
      )
    );
    this.sidebar.open();
  };

  renderSidebarAndHamburger = () => {
    this.domComponent.append(
      this.sidebar.domComponent,
      this.hamburger.domComponent
    );
    this.sidebar.render();
    this.hamburger.render();
  };

  hideSidebarAndHamburger = () => {
    this.sidebar.hide();
    this.hamburger.hide();
  };

  render = async () => {
    // clear
    this.domComponent.innerHTML = "";
    // handle sidebar
    if (navigate.currentRoute.sidebar) {
      this.renderSidebarAndHamburger();
      if (this.sidebar.isVisible) {
        this.sidebar.open();
      }
    }
    // routing
    switch (navigate.currentRoute.title) {
      case "clocks":
        return this.renderClocksView();
      case "counters":
        return this.renderCountersView();
      case "notes":
        return this.renderNotesView({ navigate: navigate.navigate });
      case "calendars":
        return this.renderCalendersView();
      case "locations":
        return this.renderLocationsView({ navigate: navigate.navigate });
      case "single-location":
        return this.renderSingleLocationView({
          navigate: navigate.navigate,
          params: navigate.currentRoute.params,
        });
      case "characters":
        return this.renderCharactersView({ navigate: navigate.navigate });
      case "single-character":
        return this.renderSingleCharacterView({
          navigate: navigate.navigate,
          params: navigate.currentRoute.params,
        });
      case "items":
        return this.renderItemsView({ navigate: navigate.navigate });
      case "single-item":
        return this.renderSingleItemView({
          navigate: navigate.navigate,
          params: navigate.currentRoute.params,
        });
      case "modules":
        return this.renderModulesView();
      default:
        return this.renderProjectsView({ navigate: navigate.navigate });
    }
  };
}

const app = new App({ domComponent: document.getElementById("app") });
export default app;
