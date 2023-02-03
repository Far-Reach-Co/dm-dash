import createElement from "./createElement.js";
import state from "./state.js";
import { postThing } from "./apiUtils.js";
import { getThings } from "./apiUtils.js";
import locationSelect from "./locationSelect.js";

export default class CurrentLocationComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "current-location-component";
    this.module = props.module;
    this.moduleType = props.moduleType;
    this.navigate = props.navigate;
    this.editingCurrentLocation = false;

    this.render();
  }

  toggleEditingCurrentLocation = () => {
    this.editingCurrentLocation = !this.editingCurrentLocation;
    this.render();
  };

  renderEditCurrentLocationButtonOrNull = () => {
    // dont render if user is not an editor
    if (state.currentProject.isEditor === false)
      return createElement("div", { style: "invisibility: hidden;" });

    if (!this.editingCurrentLocation) {
      return createElement(
        "a",
        {
          class: "small-clickable",
          style: "align-self: flex-end;",
        },
        "Edit",
        {
          type: "click",
          event: this.toggleEditingCurrentLocation,
        }
      );
    } else return createElement("div", { style: "invisibility: hidden;" });
  };

  updateCurrentLocation = (newLocationId) => {
    postThing(`/api/edit_${this.moduleType}/${this.module.id}`, {
      location_id: newLocationId,
    });
  };

  renderCurrentLocation = async () => {
    let location = null;
    console.log(this.module.location_id)
    if (this.module.location_id) {
      location = await getThings(
        `/api/get_location/${this.module.location_id}`
      );
    }

    if (this.editingCurrentLocation) {
      return createElement(
        "div",
        { style: "display: flex; flex-direction: column;" },
        await locationSelect(
          this.module.location_id,
          null,
          (newLocationId) => {
            this.module.location_id = newLocationId;
            this.toggleEditingCurrentLocation();
            this.updateCurrentLocation(newLocationId);
          }
        )
      );
    }

    if (!location) {
      return createElement("small", {}, "None...");
    } else {
      return createElement(
        "a",
        { class: "small-clickable", style: "margin: 3px;" },
        location.title,
        {
          type: "click",
          event: () =>
            this.navigate({
              title: "single-location",
              sidebar: true,
              params: { content: location },
            }),
        }
      );
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      createElement("div", { class: "single-info-box-subheading" }, [
        "Current Location",
        this.renderEditCurrentLocationButtonOrNull(),
      ]),
      await this.renderCurrentLocation()
    );
  };
}