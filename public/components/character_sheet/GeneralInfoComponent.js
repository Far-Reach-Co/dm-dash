import createElement from "../../lib/salt-lib/createElement.js";
import Component from "../../lib/salt-lib/Component.js";

export default class GeneralInfoComponent extends Component {
  constructor(props = {}) {
    super({
      domElem: props.domElem || createElement("div"),
      autoRender: false,
    });

    this.generalData = props.generalData;
    this.updateGeneralValue = props.updateGeneralValue;
    this.onLevelChange = props.onLevelChange;

    this.render();
  }

  render = () => {
    this.domElem.className = "cp-info-container-column";

    return [
      createElement(
        "div",
        { class: "special-font align-self-center" },
        "General Info"
      ),
      createElement("div", { class: "cp-content-container" }, [
        createElement("small", {}, "Character Name"),
        createElement(
          "input",
          {
            class: "cp-input-gen cp-input-large",
            name: "name",
            value: this.generalData.name ? this.generalData.name : "",
          },
          null,
          {
            type: "focusout",
            event: (e) => {
              this.updateGeneralValue(e.target.name, e.target.value);
            },
          }
        ),
      ]),
      createElement("div", { class: "d-flex flex-wrap" }, [
        createElement("div", {}, [
          createElement("div", { class: "cp-content-container" }, [
            createElement("small", {}, "Race"),
            createElement(
              "input",
              {
                class: "cp-input-gen cp-input-regular",
                name: "race",
                value: this.generalData.race ? this.generalData.race : "",
              },
              null,
              {
                type: "focusout",
                event: (e) => {
                  this.updateGeneralValue(e.target.name, e.target.value);
                },
              }
            ),
          ]),
        ]),
        createElement("div", {}, [
          createElement("div", { class: "cp-content-container" }, [
            createElement("small", {}, "EXP"),
            createElement(
              "input",
              {
                class: "cp-input-gen cp-input-regular",
                type: "number",
                name: "exp",
                value: this.generalData.exp ? this.generalData.exp : 0,
              },
              null,
              {
                type: "focusout",
                event: (e) => {
                  this.updateGeneralValue(e.target.name, e.target.valueAsNumber);
                },
              }
            ),
          ]),
        ]),
        createElement("div", { class: "cp-content-container" }, [
          createElement("small", {}, "Total Level"),
          createElement(
            "input",
            {
              class: "cp-input-gen cp-input-regular",
              type: "number",
              name: "level",
              value: this.generalData.level ? this.generalData.level : 0,
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                this.updateGeneralValue(e.target.name, e.target.valueAsNumber);
                if (this.onLevelChange) this.onLevelChange();
              },
            }
          ),
        ]),
      ])
    ];
  };
}
