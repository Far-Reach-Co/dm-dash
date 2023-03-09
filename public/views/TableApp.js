import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import ProjectsView from "../views/Projects.js";
import Sidebar from "../components/Sidebar.js";
import { Hamburger } from "../components/Hamburger.js";
import Navigate from "../lib/Navigate.js";
import Table from "./Table.js";

class TableApp {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "app";

    this.views = {
      table: null,
    };

    this.sidebar;
    this.hamburger;
    this.navigate = new Navigate({ appRender: this.render });
    // begin
    this.init();
  }

  init = async () => {
    // top bar routes
    this.handleLogout();
    this.handleToProject();
    this.handleToSheets();
    // verify user
    await this.verifyToken();
    // setup sidebar
    this.instantiateSidebar();
    this.instantiateHamburger();
    // remove initial spinner
    document.getElementById("initial-spinner").remove();
    // navigate to first view or refresh to current view
    if (history.state) {
      this.navigate.navigate(history.state);
    } else
      this.navigate.navigate({ title: "tableapp", sidebar: false, params: {} });
  };

  resetViewsOnProjectChange = () => {
    this.views = {
      table: null,
    };
  };

  instantiateSidebar = () => {
    const sidebarElem = createElement("div", {});
    // SIDEBAR
    const sidebar = new Sidebar({
      domComponent: sidebarElem,
      navigate: this.navigate,
      mainRoutes: [],
      secondRoutes: [],
      tableView: true,
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
    document
      .getElementById("to-projects-btn")
      .addEventListener("click", () =>
        this.navigate.navigate({
          title: "tableapp",
          sidebar: false,
          params: {},
        })
      );
    document
      .getElementById("to-projects-btn-mobile")
      .addEventListener("click", () =>
        this.navigate.navigate({
          title: "tableapp",
          sidebar: false,
          params: {},
        })
      );
  };

  handleToSheets = () => {
    function handle() {
      // navigate to project select
      window.location.pathname = "/sheets.html";
    }
    document
      .getElementById("to-sheets-btn")
      .addEventListener("click", () => handle());
    document
      .getElementById("to-sheets-btn-mobile")
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

  renderTable = ({ navigate, params }) => {
    // if (this.views.table) {
    //   return this.domComponent.appendChild(this.views.table.domComponent);
    // }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new Table({
      domComponent: element,
      navigate,
      params,
    });
    this.views.table = view;
    
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
      case "modules":
        return this.renderTable({
          navigate: this.navigate.navigate,
          params: this.navigate.currentRoute.params,
        });
      default:
        return this.renderProjectsView({ navigate: this.navigate.navigate });
    }
  };
}

const app = new TableApp({ domComponent: document.getElementById("app") });
export default app;
