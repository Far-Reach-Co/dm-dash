import Toolbar from "./Toolbar.js";

export default class TopLayer {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.tableApp = props.tableApp;

    this._initialized = false;

    this.toolbar = new Toolbar({
      tableApp: this.tableApp,
    });
  }

  updateObjectSelection = async () => {
    if (!this._initialized) return;
    await this.toolbar.updateObjectSelection();
  };

  render = async () => {
    if (!this._initialized) {
      this._initialized = true;
      this.domComponent.replaceChildren(this.toolbar.build());
    }
    await this.toolbar.render();
  };

  destroy = () => {
    this.toolbar?.destroy?.();
    this._initialized = false;
    this.domComponent.replaceChildren();
  };
}
