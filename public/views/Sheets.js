import createElement from "../lib/createElement.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import { getThings, postThing } from "../lib/apiUtils.js";

class Sheets {
  constructor() {
    this.appComponent = document.getElementById("app");
    this.domComponent = createElement("div", { class: "standard-view" });
    this.appComponent.appendChild(this.domComponent);

    this.newLoading = false;
    this.creating = false;

    // stop initial spinner
    document.getElementById("initial-spinner").remove();
    this.render();
  }

  toggleLoadingNew = () => {
    this.newLoading = !this.newLoading;
    this.render();
  };

  toggleCreating = () => {
    this.creating = !this.creating;
    this.render();
  };

  renderCreateNew = async () => {
    if (this.newLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Please wait while we prepare your player...")
      );
    }

    this.domComponent.append(
      createElement("div", {}, "creating")
    )

  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creating) {
      return this.renderCreateNew();
    }

    this.domComponent.append(
      createElement("button", { class: "new-btn" }, "+ Player", {
        type: "click",
        event: this.toggleCreating,
      }),
      createElement("hr")
    );
  };
}

new Sheets();
