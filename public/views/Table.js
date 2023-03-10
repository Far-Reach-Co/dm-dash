import CanvasLayer from "../components/CanvasLayer.js";
import createElement from "../lib/createElement.js";

import socketIntegration from "../lib/socketIntegration.js";

export default class Table {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.style.position = "relative";
    this.navigate = props.navigate;
    this.params = props.params;

    this.canvasLayer;

    this.render();
    socketIntegration.socketTest();
  }

  render = () => {
    // refresh
    this.domComponent.innerHTML = "";
    // create canvas elem and append
    const canvasElem = createElement("canvas", { id: "canvas-layer" });
    this.domComponent.append(canvasElem);
    this.canvasLayer = new CanvasLayer();
    // setup socket listeners after canvas instantiation
    socketIntegration.setupListeners(this.canvasLayer);

    // create UI layer above canvas and append
    const topLayerElem = createElement("div");
    new TopLayer({
      domComponent: topLayerElem,
      canvasLayer: this.canvasLayer,
    });
    this.domComponent.prepend(topLayerElem);
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
      this.canvasLayer.canvas._objects.forEach((object) => {
        if (object.zIndex === this.canvasLayer.BOTTOM_LAYER)
          object.selectable = false;
        if (object.zIndex === this.canvasLayer.OBJECT_LAYER)
          object.selectable = true;
      });
    } else {
      this.canvasLayer.currentLayer = "Map";
      this.canvasLayer.canvas._objects.forEach((object) => {
        if (object.zIndex === this.canvasLayer.BOTTOM_LAYER)
          object.selectable = true;
        if (object.zIndex === this.canvasLayer.OBJECT_LAYER)
          object.selectable = false;
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
