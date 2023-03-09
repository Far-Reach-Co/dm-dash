import canvasLayer from "../components/CanvasLayer.js";
import createElement from "../lib/createElement.js";


export default class Table {
  constructor(props) {
    this.domComponent = props.domComponent;
    // this.domComponent.className = "standard-view"
    this.navigate = props.navigate;
    this.params = props.params;

    this.render();
  }

  render = () => {
    this.domComponent.innerHTML = "";

    const canvasElem = createElement("canvas", {id: "canvas-layer"})
    
    this.domComponent.append(
      canvasElem,
    )
    // instantiate
    canvasLayer()
  }
}