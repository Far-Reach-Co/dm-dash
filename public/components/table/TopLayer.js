import Toolbar from "./Toolbar.js";
import createElement from "../../lib/salt-lib/createElement.js";
import Component from "../../lib/salt-lib/Component.js";

export default class TopLayer extends Component {
  constructor(props = {}) {
    super({
      domElem: props.domElem || createElement("div"),
      autoRender: false,
    });

    this.tableApp = props.tableApp;
    this.toolbar = null;
  }

  createToolbar = () => {
    return new Toolbar({
      tableApp: this.tableApp,
      domElem: createElement("div"),
    });
  };

  getToolbar = () => {
    const toolbar = this.useChild("top-layer-toolbar", this.createToolbar);
    this.toolbar = toolbar;
    return toolbar;
  };

  updateObjectSelection = async () => {
    await this.getToolbar().updateObjectSelection();
  };

  render = async () => {
    const toolbarElem = await this.childElem(
      "top-layer-toolbar",
      this.createToolbar,
      (toolbar) => {
        this.toolbar = toolbar;
      },
    );
    return [toolbarElem];
  };

  destroy = () => {
    this.toolbar = null;
    super.destroy();
  };
}
