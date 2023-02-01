import createElement from "./lib/createElement.js";
import state from "./lib/state.js";
import ProjectsView from "./views/Projects.js";
import ClocksView from "./views/Clocks.js";
import CalendarsView from "./views/Calendars.js";
import Sidebar from "./components/Sidebar.js";
import LocationsView from "./views/Locations.js";
import SingleLocationView from "./views/SingleLocation.js";
import CountersView from "./views/Counters.js";
import CharactersView from "./views/Characters.js";
import SingleCharacterView from "./views/SingleCharacter.js";
import ItemsView from "./views/Items.js";
import SingleItemView from "./views/SingleItem.js";
import { Hamburger } from "./components/Hamburger.js";
import navigate from "./lib/Navigate.js";
import NoteManager from "./views/NoteManager.js";

class App {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "app";

    // save view instantiations
    this.views = {
      projects: null,
      notes: null,
      counters: null,
      clocks: null,
      calendars: null,
      items: null,
      characters: null,
      locations: null,
    };

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

  resetViewsOnProjectChange = () => {
    this.views = {
      projects: null,
      notes: null,
      counters: null,
      clocks: null,
      calendars: null,
      items: null,
      characters: null,
      locations: null,
    };
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
    function handle() {
      // stop all clocks
      Object.values(state.clockComponents).forEach((project) => {
        project.forEach((clock) => {
          if (clock.isRunning) clock.stop();
        });
      });
      // navigate to project select
      navigate.navigate({ title: "app", sidebar: false, params: {} });
    }
    document
      .getElementById("to-projects-btn")
      .addEventListener("click", () => handle());
    document
      .getElementById("to-projects-btn-mobile")
      .addEventListener("click", () => handle());
  };

  handleLogout = () => {
    function handle() {
      localStorage.removeItem("token");
      window.location.pathname = "/";
    }
    document
      .getElementById("logout-btn")
      .addEventListener("click", () => handle());
    document
      .getElementById("logout-btn-mobile")
      .addEventListener("click", () => handle());
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
    if (this.views.locations) {
      return this.domComponent.appendChild(this.views.locations.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new LocationsView({ domComponent: element, navigate });
    this.views.locations = view;
  };

  renderSingleLocationView = ({ navigate, params }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new SingleLocationView({ domComponent: element, navigate, params });
  };

  renderCharactersView = ({ navigate }) => {
    if (this.views.characters) {
      return this.domComponent.appendChild(this.views.characters.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new CharactersView({ domComponent: element, navigate });
    this.views.characters = view;
  };

  renderSingleCharacterView = ({ navigate, params }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new SingleCharacterView({ domComponent: element, navigate, params });
  };

  renderItemsView = ({ navigate }) => {
    if (this.views.items) {
      return this.domComponent.appendChild(this.views.items.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new ItemsView({ domComponent: element, navigate });
    this.views.items = view;
  };

  renderSingleItemView = ({ navigate, params }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new SingleItemView({ domComponent: element, navigate, params });
  };

  renderCalendersView = () => {
    if (this.views.calendars) {
      return this.domComponent.appendChild(this.views.calendars.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new CalendarsView({ domComponent: element });
    this.views.calendars = view;
  };

  renderClocksView = () => {
    if (this.views.clocks) {
      return this.domComponent.appendChild(this.views.clocks.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new ClocksView({ domComponent: element });
    this.views.clocks = view;
  };

  renderCountersView = () => {
    if (this.views.counters) {
      return this.domComponent.appendChild(this.views.counters.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new CountersView({ domComponent: element });
    this.views.counters = view;
  };

  renderNotesView = () => {
    if (this.views.notes) {
      return this.domComponent.appendChild(this.views.notes.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new NoteManager({
      domComponent: element,
      standAlone: true,
    });
    this.views.notes = view;
  };

  renderProjectsView = ({ navigate }) => {
    if (this.views.projects) {
      return this.domComponent.appendChild(this.views.projects.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new ProjectsView({
      domComponent: element,
      navigate,
      resetViewsOnProjectChange: this.resetViewsOnProjectChange,
    });
    this.views.projects = view;
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
        return this.renderNotesView();
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
