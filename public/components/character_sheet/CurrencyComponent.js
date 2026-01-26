import createElement from "../../components/createElement.js";

export default class CurrencyComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.generalData = props.generalData;
    this.updateGeneralValue = props.updateGeneralValue;

    this.render();
  }

  renderCurrencyRow = (label, name) => {
    return createElement(
      "div",
      {
        class: "d-flex justify-content-between align-items-center mb-1",
      },
      [
        createElement("small", {}, label),
        createElement(
          "input",
          {
            class: "cp-input-gen-short",
            name: name,
            type: "number",
            value: this.generalData[name] ? this.generalData[name] : 0,
          },
          null,
          {
            type: "focusout",
            event: (e) => {
              this.updateGeneralValue(e.target.name, e.target.valueAsNumber);
            },
          }
        ),
      ]
    );
  };

  render = () => {
    this.domComponent.innerHTML = "";
    this.domComponent.className = "cp-info-container-column";

    this.domComponent.append(
      createElement(
        "div",
        { class: "special-font align-self-center" },
        "Currency"
      ),
      this.renderCurrencyRow("Copper", "copper"),
      this.renderCurrencyRow("Silver", "silver"),
      this.renderCurrencyRow("Electrum", "electrum"),
      this.renderCurrencyRow("Gold", "gold"),
      this.renderCurrencyRow("Platinum", "platinum")
    );
  };
}
