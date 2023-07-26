import { getThings } from "../lib/apiUtils.js";
import FiveEPlayerSheet from "../components/5ePlayerSheet.js";

class InitSheet {
  constructor() {
    // stop initial spinner
    document.getElementById("initial-spinner").remove();

    this.appComponent = document.getElementById("app");
    this.elem = document.createElement("div");
    this.appComponent.appendChild(this.elem);
    this.init();
  }

  init = async () => {
    this.generalId = history.state;
    const generalData = await getThings(
      `/api/get_5e_character_general/${this.generalId}`
    );
    new FiveEPlayerSheet({
      domComponent: this.elem,
      params: { content: generalData },
    });
  };
}

new InitSheet();
