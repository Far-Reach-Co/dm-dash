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
    this.params = props.params;

    this.canvasLayer = null;
    this.sidebar = null;
    this.hamburger = null;

    this.init();
  }

  init = async () => {
    // get table views
    const searchParams = new URLSearchParams(window.location.search);
    const tableId = searchParams.get("uuid");

    const tableView = await getThings(`/api/get_table_view_by_uuid/${tableId}`);
    // sidebar and hamburger inst
    this.instantiateSidebar(tableView);
    this.instantiateHamburger();

    // create canvas elem and append
    this.canvasElem = createElement("canvas", { id: "canvas-layer" });
    this.canvasLayer = new CanvasLayer({
      tableView,
      tableSidebarImageComponent: this.sidebar.tableSidebarImageComponent,
    });
    // setup top layer
    this.topLayer = new TopLayer({
      domComponent: createElement("div"),
      canvasLayer: this.canvasLayer,
      tableView,
    });
    // provide top layer to socket int
    // provide socket necessary variables
    socketIntegration.tableId = tableId;
    socketIntegration.sidebar = this.sidebar;
    socketIntegration.topLayer = this.topLayer;
    // handle user or anonymous
    let user = await getThings("/api/get_user");
    if (!user) {
      const randomNumber = Math.floor(100000 + Math.random() * 900000); // random six digit number
      user = { username: `user-${randomNumber}` };
    }
    socketIntegration.user = user;
    // setup socket listeners after canvas instantiation
    socketIntegration.setupListeners(this.canvasLayer);
    socketIntegration.socketJoined();

    // VERY IMPORTANT RENDERING SYSTEM
    this.render();
    await this.canvasLayer.init();
    this.topLayer.render();

    // only render the sidebar for owner or managers
    if (USERID == tableView.user_id || IS_MANAGER_OR_OWNER)
      this.renderSidebarAndHamburger();
  };

  instantiateSidebar = (tableView) => {
    const sidebar = new TableSidebar({
      domComponent: createElement("div", {}),
      tableView,
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
