import state from "../lib/state.js";
import createElement from "../lib/createElement.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import { Hamburger } from "../components/Hamburger.js";
import TableSidebar from "../components/TableSidebar.js";
import CanvasLayer from "../components/CanvasLayer.js";
import socketIntegration from "../lib/socketIntegration.js";
import TopLayer from "../lib/TopLayer.js";

class Table {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "app";
    this.params = props.params;

    this.canvasLayer = null;
    this.sidebar = null;
    this.hamburger = null;

    this.init();
  }

  init = async () => {
    // get table views
    this.projectId = localStorage.getItem("current-table-project-id");
    this.campaignId = localStorage.getItem("current-campaign-id");

    const project = await getThings(`/api/get_project/${this.projectId}`);
    state.currentProject = project;

    const tableView = await getThings(`/api/get_table_view/${this.campaignId}`);
    // sidebar and hamburger inst
    this.instantiateSidebar();
    this.instantiateHamburger();
    // create canvas elem and append
    this.canvasElem = createElement("canvas", { id: "canvas-layer" });
    this.canvasLayer = new CanvasLayer({
      tableView,
      tableSidebarComponent: this.sidebar.tableSidebarComponent,
    });
    // setup top layer
    this.topLayer = new TopLayer({
      domComponent: createElement("div"),
      canvasLayer: this.canvasLayer,
    });
    // provide top layer to socket int
    // provide socket necessary variables
    socketIntegration.campaignId = this.campaignId;
    socketIntegration.user = await getThings("/api/get_user");
    socketIntegration.sidebar = this.sidebar;
    socketIntegration.topLayer = this.topLayer;
    // setup socket listeners after canvas instantiation
    socketIntegration.setupListeners(this.canvasLayer);
    socketIntegration.socketJoined();

    // VERY IMPORTANT RENDERING SYSTEM
    this.render();
    await this.canvasLayer.init();
    this.topLayer.render();
    this.renderSidebarAndHamburger();
  };

  instantiateSidebar = () => {
    const sidebar = new TableSidebar({
      domComponent: createElement("div", {}),
    });
    this.sidebar = sidebar;
  };

  instantiateHamburger = () => {
    const hamburgerElem = createElement("div", {});

    const hamburger = new Hamburger({
      domComponent: hamburgerElem,
      sidebar: this.sidebar,
    });
    this.hamburger = hamburger;
  };

  renderSidebarAndHamburger = () => {
    this.domComponent.append(
      this.sidebar.domComponent,
      this.hamburger.domComponent
    );
    this.sidebar.render();
    this.hamburger.render();
  };

  render = async () => {
    this.domComponent.append(
      createElement("div", { style: "position: relative;" }, [
        this.topLayer.domComponent,
        this.canvasElem,
      ])
    );
  };
}

const tableApp = new Table({ domComponent: document.getElementById("app") });
export default tableApp;
