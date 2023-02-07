import createElement from "../lib/createElement.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import { getThings, postThing } from "../lib/apiUtils.js";

class FiveEPlayerSheet {
  constructor() {
    this.appComponent = document.getElementById("app");
    this.domComponent = createElement("div", { class: "standard-view" });
    this.appComponent.appendChild(this.domComponent);

    this.user = null;

    // stop initial spinner
    document.getElementById("initial-spinner").remove();
    this.generalData = history.state;
    console.log(this.generalData)
    this.render();
  }

  updateGeneralValue = async (name, value) => {

    await postThing(
      `/api/edit_5e_character_general/${this.generalData.id}`,
      {[name]: value}
    );
  }

  render = async () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      createElement("div", {class: "cp-content-container"}, [
        createElement("small", {}, "Name"),
        createElement("input", {class: "cp-input cp-input-large", value: this.generalData.name ? this.generalData.name : ""}),
      ]),
      createElement("br"),
      createElement("div", {class: "cp-content-container"}, [
        createElement("small", {}, "Race"),
        createElement("input", {class: "cp-input cp-input-regular", name: "race", value: this.generalData.race ? this.generalData.race : ""}, null, [
          {
            type: "focusout",
            event: (e) => {
              this.updateGeneralValue(e.target.name, e.target.value)
            }
          },
          {
            type: "input",
            event: (e) => {
              e.target.setAttribute('size', e.target.value.length);
            }
          }
        ]),
      ]),
    );
  };
}

new FiveEPlayerSheet();
