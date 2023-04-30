import createElement from "./lib/createElement.js";
import accountManager from "./lib/AccountManager.js"; // dont remove
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
import Navigate from "./lib/Navigate.js";
import NoteManager from "./views/NoteManager.js";
import SingleLoreView from "./views/SingleLore.js";
import LoresView from "./views/lores.js";
import EventsView from "./views/Events.js";
import PlayersView from "./views/Players.js";
import FiveEPlayerSheet from "./components/5ePlayerSheet.js";
import LandingView from "./views/Landing.js";
import CampaignsView from "./views/Campaigns.js";

class App {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "app";

    // save view instantiations
    this.views = {
      landing: null,
      campaigns: null,
      projects: null,
      notes: null,
      counters: null,
      clocks: null,
      calendars: null,
      items: null,
      characters: null,
      locations: null,
      lores: null,
      players: null,
    };

    this.sidebar;
    this.hamburger;
    this.navigate = new Navigate({ appRender: this.render });
    // begin
    this.init();
  }

  init = async () => {
    // setup sidebar
    this.instantiateSidebar();
    this.instantiateHamburger();
    // navigate to first view or refresh to current view
    const searchParams = new URLSearchParams(window.location.search);
    const currentView = searchParams.get("view");
    const viewId = searchParams.get("id");
    if (history.state) {
      return this.navigate.navigate(history.state);
    }
    if (currentView && currentView != "app" && currentView != "landing") {
      if (viewId) {
        return this.navigate.navigate({
          title: currentView,
          sidebar: true,
          id: viewId,
        });
      }
      return this.navigate.navigate({ title: currentView, sidebar: true });
    }
    this.navigate.navigate({ title: "app", sidebar: false, params: {} });
  };

  instantiateSidebar = () => {
    const sidebarElem = createElement("div", {});
    // SIDEBAR
    const sidebar = new Sidebar({
      domComponent: sidebarElem,
      navigate: this.navigate,
      mainRoutes: [
        {
          id: "sidebar-landing",
          title: "landing",
          displayTitle: "About",
          params: {},
        },
        // {
        //   id: "sidebar-notes",
        //   title: "notes",
        //   displayTitle: "Notes",
        //   params: {},
        // },
        {
          id: "sidebar-campaigns",
          title: "campaigns",
          displayTitle: "Campaigns",
          params: {},
        },
        {
          id: "sidebar-players",
          title: "players",
          displayTitle: "Players Characters",
          params: {},
        },
        {
          id: "sidebar-characters",
          title: "characters",
          displayTitle: "NPCs",
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
          id: "sidebar-lore",
          title: "lore",
          displayTitle: "Lore",
          params: {},
        },
        {
          id: "sidebar-events",
          title: "events",
          displayTitle: "Events",
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
      ],
      secondRoutes: [
        // {
        //   id: "sidebar-counters",
        //   title: "counters",
        //   displayTitle: "Counters",
        //   params: {},
        // },
      ],
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

  renderPlayersView = ({ navigate }) => {
    if (this.views.players) {
      return this.domComponent.appendChild(this.views.players.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new PlayersView({ domComponent: element, navigate });
    this.views.players = view;
  };

  renderSinglePlayerView = ({ navigate, params }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new FiveEPlayerSheet({ domComponent: element, navigate, params });
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

  renderLoresView = ({ navigate }) => {
    if (this.views.lores) {
      return this.domComponent.appendChild(this.views.lores.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new LoresView({ domComponent: element, navigate });
    this.views.lores = view;
  };

  renderSingleLoreView = ({ navigate, params }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new SingleLoreView({ domComponent: element, navigate, params });
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

  renderEventsView = () => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new EventsView({
      domComponent: element,
      standAlone: true,
    });
  };

  renderCampaignsView = ({ navigate }) => {
    if (this.views.campaigns) {
      return this.domComponent.appendChild(this.views.campaigns.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new CampaignsView({
      domComponent: element,
      navigate,
    });
    this.views.campaigns = view;
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
    });
    this.views.projects = view;
  };

  renderLandingView = ({ navigate }) => {
    if (this.views.landing) {
      return this.domComponent.appendChild(this.views.landing.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new LandingView({
      domComponent: element,
      navigate,
    });
    this.views.landing = view;

    // open sidebar for first time
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
    if (this.navigate.currentRoute.sidebar) {
      this.renderSidebarAndHamburger();
      if (this.sidebar.isVisible) {
        this.sidebar.open();
      }
    }
    // routing
    switch (this.navigate.currentRoute.title) {
      case "players":
        return this.renderPlayersView({ navigate: this.navigate.navigate });
      case "single-player":
        return this.renderSinglePlayerView({
          navigate: this.navigate.navigate,
          params: this.navigate.currentRoute.params,
        });
      case "clocks":
        return this.renderClocksView();
      case "counters":
        return this.renderCountersView();
      case "notes":
        return this.renderNotesView();
      case "events":
        return this.renderEventsView();
      case "calendars":
        return this.renderCalendersView();
      case "locations":
        return this.renderLocationsView({ navigate: this.navigate.navigate });
      case "single-location":
        return this.renderSingleLocationView({
          navigate: this.navigate.navigate,
          params: this.navigate.currentRoute.params,
        });
      case "characters":
        return this.renderCharactersView({ navigate: this.navigate.navigate });
      case "single-character":
        return this.renderSingleCharacterView({
          navigate: this.navigate.navigate,
          params: this.navigate.currentRoute.params,
        });
      case "items":
        return this.renderItemsView({ navigate: this.navigate.navigate });
      case "single-item":
        return this.renderSingleItemView({
          navigate: this.navigate.navigate,
          params: this.navigate.currentRoute.params,
        });
      case "lore":
        return this.renderLoresView({ navigate: this.navigate.navigate });
      case "single-lore":
        return this.renderSingleLoreView({
          navigate: this.navigate.navigate,
          params: this.navigate.currentRoute.params,
        });
      case "campaigns":
        return this.renderCampaignsView({ navigate: this.navigate.navigate });
      case "landing":
        return this.renderLandingView({ navigate: this.navigate.navigate });
      default:
        return this.renderProjectsView({ navigate: this.navigate.navigate });
    }
  };
}

const app = new App({ domComponent: document.getElementById("app") });
export default app;
