import createElement from "../../components/createElement.js";

export default class CombatStatsComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.generalData = props.generalData;
    this.updateGeneralValue = props.updateGeneralValue;
    this.hpComponent = props.hpComponent;

    this.render();
  }

  renderStatInput = (name, label, defaultValue = 0) => {
    return createElement("div", { class: "cp-content-container-center" }, [
      createElement(
        "input",
        {
          class: "cp-input-no-border cp-input-large",
          type: "number",
          name: name,
          value: this.generalData[name] ? this.generalData[name] : defaultValue,
        },
        null,
        {
          type: "focusout",
          event: (e) => {
            this.updateGeneralValue(e.target.name, e.target.valueAsNumber);
          },
        }
      ),
      createElement("small", {}, label),
    ]);
  };

  render = () => {
    this.domComponent.innerHTML = "";
    this.domComponent.className = "cp-info-container-column";

    this.domComponent.append(
      createElement(
        "div",
        { class: "d-flex flex-wrap justify-content-center" },
        [
          this.renderStatInput("armor_class", "Armor Class"),
          this.renderStatInput("initiative", "Initiative"),
          this.renderStatInput("speed", "Speed"),
        ]
      ),
      createElement(
        "div",
        { class: "d-flex flex-wrap justify-content-center" },
        [
          createElement("div", { class: "cp-content-container-center" }, [
            createElement(
              "div",
              {
                class: this.generalData.inspiration
                  ? "boolean-input-active"
                  : "boolean-input",
                name: "inspiration",
              },
              null,
              {
                type: "click",
                event: (e) => {
                  if (e.target.className === "boolean-input")
                    e.target.className = "boolean-input-active";
                  else e.target.className = "boolean-input";
                  this.generalData.inspiration = !this.generalData.inspiration;
                  this.updateGeneralValue(
                    "inspiration",
                    this.generalData.inspiration
                  );
                },
              }
            ),
            createElement("small", {}, "Inspiration"),
          ]),
          createElement("div", { class: "cp-content-container-center" }, [
            createElement(
              "div",
              { class: "d-flex align-items-center justify-content-center" },
              [
                createElement("small", {}, "Total"),
                createElement(
                  "input",
                  {
                    class: "cp-input-no-border-small",
                    name: "hit_dice_total",
                    value: this.generalData.hit_dice_total
                      ? this.generalData.hit_dice_total
                      : "",
                  },
                  null,
                  {
                    type: "focusout",
                    event: (e) => {
                      this.updateGeneralValue(e.target.name, e.target.value);
                    },
                  }
                ),
              ]
            ),
            createElement(
              "input",
              {
                class: "cp-input-no-border cp-input-large",
                name: "hit_dice",
                type: "number",
                value: this.generalData.hit_dice
                  ? this.generalData.hit_dice
                  : 0,
              },
              null,
              {
                type: "focusout",
                event: (e) => {
                  this.updateGeneralValue(e.target.name, e.target.valueAsNumber);
                },
              }
            ),
            createElement("small", {}, "Hit Dice"),
          ]),
          this.hpComponent.domComponent,
        ]
      )
    );
  };
}
