import createElement from "../lib/createElement.js";

export default class Location {
  constructor(props) {
    this.domComponent = props.domComponent;

    this.location = props.location;
    this.navigate = props.navigate;

    this.render();
  }

  render = () => {
    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        this.location.title,
        createElement("img", {
          src: "../assets/location.svg",
          width: 40,
          height: 40,
        }),
      ]),
      createElement("div", { class: "description" }, this.location.description),
      createElement("br"),
      createElement("button", {}, "Open", {
        type: "click",
        event: () =>
          this.navigate({
            title: "single-location",
            sidebar: true,
            params: { location: this.location },
          }),
      })
    );
  };
}
