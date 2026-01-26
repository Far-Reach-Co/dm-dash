import createElement from "../../components/createElement.js";

export default class DeathSavesComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.generalData = props.generalData;
    this.updateGeneralValue = props.updateGeneralValue;

    this.render();
  }

  handleClick = (key) => {
    const newVal = !this.generalData[key];
    this.updateGeneralValue(key, newVal);
    this.render();
  };

  render = () => {
    this.domComponent.innerHTML = "";
    this.domComponent.className = "cp-info-container-column";

    this.domComponent.append(
      createElement(
        "div",
        { class: "special-font align-self-center" },
        "Death Saves"
      ),
      createElement("div", { class: "d-flex" }, [
        createElement("small", {}, "Successes"),
        createElement("div", { class: "d-flex ms-auto" }, [
          createElement(
            "div",
            {
              class: this.generalData.ds_success_1
                ? "small-boolean-input-checked"
                : "small-boolean-input",
            },
            null,
            { type: "click", event: () => this.handleClick("ds_success_1") }
          ),
          createElement(
            "div",
            {
              class: this.generalData.ds_success_2
                ? "small-boolean-input-checked"
                : "small-boolean-input",
            },
            null,
            { type: "click", event: () => this.handleClick("ds_success_2") }
          ),
          createElement(
            "div",
            {
              class: this.generalData.ds_success_3
                ? "small-boolean-input-checked"
                : "small-boolean-input",
            },
            null,
            { type: "click", event: () => this.handleClick("ds_success_3") }
          ),
        ]),
      ]),
      createElement("div", { class: "d-flex" }, [
        createElement("small", {}, "Failures"),
        createElement("div", { class: "d-flex ms-auto" }, [
          createElement(
            "div",
            {
              class: this.generalData.ds_failure_1
                ? "small-boolean-input-checked-red"
                : "small-boolean-input",
            },
            null,
            { type: "click", event: () => this.handleClick("ds_failure_1") }
          ),
          createElement(
            "div",
            {
              class: this.generalData.ds_failure_2
                ? "small-boolean-input-checked-red"
                : "small-boolean-input",
            },
            null,
            { type: "click", event: () => this.handleClick("ds_failure_2") }
          ),
          createElement(
            "div",
            {
              class: this.generalData.ds_failure_3
                ? "small-boolean-input-checked-red"
                : "small-boolean-input",
            },
            null,
            { type: "click", event: () => this.handleClick("ds_failure_3") }
          ),
        ]),
      ])
    );
  };
}
