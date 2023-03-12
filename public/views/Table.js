import state from "../lib/state.js";
import createElement from "../lib/createElement.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import accountManager from "../lib/AccountManager.js"; // dont remove
import { Hamburger } from "../components/Hamburger.js";
import TableSidebar from "../components/TableSidebar.js";
import CanvasLayer from "../components/CanvasLayer.js";
import socketIntegration from "../lib/socketIntegration.js";

class Table {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "app";
    this.params = props.params;

    this.canvasLayer;

    this.init();
    // socketIntegration.socketTest();
  }

  init = async () => {
    // get table views
    this.projectId = history.state;
    const project = await getThings(`/api/get_project/${this.projectId}`);
    state.currentProject = project;
    const tableViews = await getThings(
      `/api/get_table_views/${state.currentProject.id}`
    );
    // create canvas elem and append
    this.canvasElem = createElement("canvas", { id: "canvas-layer" });
    this.canvasLayer = new CanvasLayer({ tableViews });
    // setup socket listeners after canvas instantiation
    socketIntegration.setupListeners(this.canvasLayer);

    this.instantiateSidebar();
    this.instantiateHamburger();

    this.render();
    this.canvasLayer.init();
  };

  instantiateSidebar = () => {
    const sidebarElem = createElement("div", {});
    // SIDEBAR
    const sidebar = new TableSidebar({
      domComponent: sidebarElem,
      canvasLayer: this.canvasLayer,
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

  renderSidebarAndHamburger = () => {
    this.domComponent.append(
      this.sidebar.domComponent,
      this.hamburger.domComponent
    );
    this.sidebar.render();
    this.hamburger.render();
  };

  render = async () => {
    this.renderSidebarAndHamburger();

    // create UI layer above canvas and append
    const topLayerElem = createElement("div");
    new TopLayer({
      domComponent: topLayerElem,
      canvasLayer: this.canvasLayer,
    });

    this.domComponent.append(
      createElement("div", { style: "position: relative;" }, [
        topLayerElem,
        this.canvasElem,
      ])
    );
  };
}

class TopLayer {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.canvasLayer = props.canvasLayer;
    this.render();
  }

  handleChangeCanvasLayer = () => {
    if (this.canvasLayer.currentLayer === "Map") {
      this.canvasLayer.currentLayer = "Object";
      this.canvasLayer.canvas.getObjects().forEach((object) => {
        if (object.zIndex === this.canvasLayer.BOTTOM_LAYER) {
          object.selectable = false;
        }
        if (object.zIndex === this.canvasLayer.OBJECT_LAYER) {
          object.selectable = true;
        }
        this.canvasLayer.canvas.renderAll();
      });
    } else {
      this.canvasLayer.currentLayer = "Map";
      this.canvasLayer.canvas.getObjects().forEach((object) => {
        if (object.zIndex === this.canvasLayer.BOTTOM_LAYER)
          object.selectable = true;
        if (object.zIndex === this.canvasLayer.OBJECT_LAYER) {
          object.selectable = false;
          object.opacity = "0.8";
        }
        this.canvasLayer.canvas.renderAll();
      });
    }
    this.render();
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      createElement("div", { class: "canvas-ui-elem" }, [
        createElement(
          "small",
          {},
          `Current Layer: ${this.canvasLayer.currentLayer}`
        ),
        createElement(
          "button",
          {},
          `View ${
            this.canvasLayer.currentLayer === "Map" ? "Object" : "Map"
          } Layer`,
          {
            type: "click",
            event: () => this.handleChangeCanvasLayer(),
          }
        ),
      ])
    );
  };
}

const tableApp = new Table({ domComponent: document.getElementById("app") });
export default tableApp;
