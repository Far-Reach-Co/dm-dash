import createElement from "../lib/createElement.js";
import accountManager from "../lib/AccountManager.js"; // dont remove
import ProjectsView from "../views/Projects.js";
import TableSidebar from "../components/TableSidebar.js";
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
    // setup sidebar
    this.instantiateSidebar();
    this.instantiateHamburger();
    // navigate to first view or refresh to current view
    if (history.state) {
      this.navigate.navigate(history.state);
    } else
      this.navigate.navigate({ title: "tableapp", sidebar: false, params: {} });
  };

  instantiateSidebar = () => {
    const sidebarElem = createElement("div", {});
    // SIDEBAR
    const sidebar = new TableSidebar({
      domComponent: sidebarElem,
      navigate: this.navigate,
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
      case "main":
        return this.renderTable({
          navigate: this.navigate.navigate,
          params: this.navigate.currentRoute.params,
        });
      default:
        return this.renderProjectsView({ navigate: this.navigate.navigate });
    }
  };
}

const tableApp = new TableApp({ domComponent: document.getElementById("app") });
export default tableApp;
