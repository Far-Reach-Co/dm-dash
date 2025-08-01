import createElement from "../components/createElement.js";
import { getThings } from "../lib/apiUtils.js";
import { Hamburger } from "../components/Hamburger.js";
import TableSidebar from "../components/table/TableSidebar.js";
import CanvasLayer from "../components/table/CanvasLayer.js";
import socketIntegration from "../components/table/socketIntegration.js";
import TopLayer from "../components/table/TopLayer.js";
import ChatBoxComponent from "../components/table/ChatBox.js";
import imageFollowingCursor from "../components/imageFollowingCursor.js";
import throttle from "../lib/throttle.js";

class Table {
  constructor() {
    this.domComponent = document.getElementById("app");
    this.canvasElem = createElement("canvas", { id: "canvas-layer" });

    this.canvasLayer = null;
    this.sidebar = null;
    this.hamburger = null;
    this.topLayer = null;

    this.currentLayer = "Object";
    this.currentSelectedObject = null;

    // Socket needs to control other components from table
    socketIntegration.tableApp = this;

    this.init();
  }

  init = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    this.tableId = searchParams.get("uuid");

    const tableView = await getThings(
      `/api/get_table_view_by_uuid/${this.tableId}`
    );
    // TODO: error handling no table view by id

    // Handle user or anonymous
    let user = await getThings("/api/get_user");
    if (!user) {
      const randomNumber = Math.floor(100000 + Math.random() * 900000); // random six digit number
      user = { username: `user-${randomNumber}` };
    }
    this.user = user;

    socketIntegration.setupListeners();
    socketIntegration.socketJoined();

    // Init elements
    this.sidebar = new TableSidebar({
      domComponent: createElement("div", {}),
      tableView,
      tableApp: this,
    });
    this.hamburger = new Hamburger({
      domComponent: createElement("div", {}),
      sidebar: this.sidebar,
    });

    this.canvasLayer = new CanvasLayer({
      tableView,
      tableApp: this,
    });
    this.topLayer = new TopLayer({
      domComponent: createElement("div"),
      tableApp: this,
      tableView,
    });
    this.chatBoxComponent = new ChatBoxComponent({
      domComponent: createElement("div"),
    });

    // Rendering
    this.render();
    await this.canvasLayer.init();
    this.setupDocumentEventListeners();
    this.topLayer.render();
    this.chatBoxComponent.render();
    socketIntegration.getMessages();

    // Only render the sidebar for owner or managers
    if (USERID == tableView.user_id || IS_MANAGER_OR_OWNER)
      // USERID and IS_MANAGER_OR_OWNER is injected from template; check vtt.ejs
      this.renderSidebarAndHamburger();
  };

  canvasRenderAll = () => {
    this.canvasLayer.canvas.renderAll();
  };

  setCurrentSelectedObject = (obj) => {
    // canvas obj
    this.currentSelectedObject = obj;

    // display on top layer
    this.topLayer.render();
  };

  getCurrentSelectedObject = () => {
    return this.currentSelectedObject;
  };

  renderSidebarAndHamburger = () => {
    this.domComponent.append(
      this.sidebar.domComponent,
      this.hamburger.domComponent
    );
    this.sidebar.render();
    this.hamburger.render();
  };

  changeLayer = () => {
    switch (this.currentLayer) {
      case "Map":
        this.currentLayer = "Object";
        break;
      case "Object":
        this.currentLayer = "Fog";
        break;
      case "Fog":
        this.currentLayer = "Map";
        break;
    }

    this.canvasLayer.changeLayer();
  };

  addImageToCanvas = (image) => {
    this.canvasLayer.addImageToTable(image);
  };

  setupDocumentEventListeners = () => {
    // KEYS
    document.addEventListener("keydown", (e) => {
      // alt key change cursor
      if (e.altKey) {
        this.canvasLayer.setCursorCrosshair();
      }

      // duplicate
      if (e.ctrlKey && e.key == "d") {
        this.canvasLayer.duplicateObject();
      }
    });

    document.addEventListener("keyup", (e) => {
      var key = e.key;

      if (key === "Backspace" || key === "Delete") {
        this.canvasLayer.removeObjects();
      }
      this.canvasLayer.setCursorDefault();
    });

    // DOCUMENT MOUSE UP HACKS
    // save data in db after mouse up
    document.addEventListener(
      "mouseup",
      throttle(async () => {
        await this.canvasLayer.saveToDatabase();
      }, 3000)
    );
    // save data on touch screen up
    document.addEventListener(
      "touchend",
      throttle(async () => {
        await this.canvasLayer.saveToDatabase();
      }, 3000)
    );

    // Allow for drag image to canvas
    document.addEventListener("mouseup", (e) => {
      // handle adding new image
      if (imageFollowingCursor.isOnPage) {
        if (e.target.nodeName === "CANVAS")
          this.canvasLayer.addImageToTable(
            this.sidebar.tableSidebarImageComponent.currentMouseDownImage
          );
      }
      imageFollowingCursor.remove();
    });
  };

  render = async () => {
    this.domComponent.append(
      this.topLayer.domComponent,
      this.chatBoxComponent.domComponent,
      this.canvasElem
    );
  };
}

const tableApp = new Table();
export default tableApp;
