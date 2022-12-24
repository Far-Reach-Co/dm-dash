import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import Location from '../components/Location.js'

export default class SingleLocationsView {
  constructor(props) {
    this.navigate = props.navigate;
    this.params = props.params;
    this.location = this.params.location;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.render();
  }

  getParentLocation = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/get_location/${this.location.parent_location_id}`
      );
      const data = await res.json();
      if (res.status === 200) {
        return data;
      } else throw new Error();
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  getChildLocations = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/get_sublocations/${this.location.id}`
      );
      const data = await res.json();
      if (res.status === 200) {
        return data;
      } else throw new Error();
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  renderParentLocation = (parentLocation) => {
    const elem = createElement("div", {
      id: `location-component-${parentLocation.id}`,
      class: "component",
      style: "max-width: 400px;",
    })

    new Location({
      domComponent: elem,
      location: parentLocation,
      navigate: this.navigate
    })
    return elem
  };

  renderChildLocations = (childLocations) => {
    return childLocations.map((location) => {
      const elem = createElement("div", {
        id: `location-component-${location.id}`,
        class: "component",
        style: "max-width: 400px;",
      })
  
      new Location({
        domComponent: elem,
        location,
        navigate: this.navigate
      })
      return elem
    });
  };

  render = async () => {
    this.domComponent.innerHTML = "";
    // append
    this.domComponent.append(
      createElement("a", {class: "back-button"}, "← Locations", {type: "click", event: () => this.navigate({title: "locations", sidebar: true})}),
      createElement("div", { class: "single-location-title" }, [
        this.location.title,
        createElement("img", {
          src: "../assets/location.svg",
          width: 40,
          height: 40,
        }),
      ]),
      createElement("div", { class: "description" }, this.location.description),
      createElement("br")
    );

    if (this.location.is_sub) {
      const parentLocation = await this.getParentLocation();
      if (parentLocation)
        this.domComponent.append(
          createElement("div", {}, "Parent-Location:"),
          this.renderParentLocation(parentLocation)
        );
    }
    const childLocations = await this.getChildLocations();
    if (childLocations && childLocations.length) {
      this.domComponent.append(
        createElement("div", {}, "Sub-Locations:"),
        ...this.renderChildLocations(childLocations)
      );
    }
  };
}
