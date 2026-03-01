import createElement from "../../lib/salt-lib/createElement.js";
import Component from "../../lib/salt-lib/Component.js";
import { calculateAbilityScoreModifier } from "./characterCalculations.js";

export default class AbilityScoresComponent extends Component {
  constructor(props = {}) {
    super({
      domElem: props.domElem || createElement("div"),
      autoRender: false,
    });

    this.generalData = props.generalData;
    this.updateGeneralValue = props.updateGeneralValue;
    this.onUpdate = props.onUpdate;

    this.render();
  }

  render = () => {
    this.domElem.className = "d-flex flex-wrap mb-3";

    const abilityScores = [
      { title: "Strength", key: "strength" },
      { title: "Dexterity", key: "dexterity" },
      { title: "Constitution", key: "constitution" },
      { title: "Intelligence", key: "intelligence" },
      { title: "Wisdom", key: "wisdom" },
      { title: "Charisma", key: "charisma" },
    ];

    return abilityScores.map((ability) => {
      return createElement(
        "div",
        { class: "cp-content-container-center border-rounded" },
        [
          createElement("small", {}, ability.title),
          createElement(
            "input",
            {
              class: "cp-input-no-border cp-input-large",
              type: "number",
              name: ability.key,
              value: this.generalData[ability.key]
                ? this.generalData[ability.key]
                : 0,
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                this.updateGeneralValue(e.target.name, e.target.valueAsNumber);
                if (this.onUpdate) this.onUpdate();
              },
            }
          ),
          createElement(
            "div",
            { class: "ability-score-modifier" },
            calculateAbilityScoreModifier(this.generalData[ability.key])
          ),
        ]
      );
    });
  };
}
