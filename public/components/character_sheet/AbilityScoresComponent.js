import createElement from "../../components/createElement.js";
import { calculateAbilityScoreModifier } from "./characterCalculations.js";

export default class AbilityScoresComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.generalData = props.generalData;
    this.updateGeneralValue = props.updateGeneralValue;
    this.onUpdate = props.onUpdate;

    this.render();
  }

  render = () => {
    this.domComponent.innerHTML = "";
    this.domComponent.className = "d-flex flex-wrap mb-3";

    const abilityScores = [
      { title: "Strength", key: "strength" },
      { title: "Dexterity", key: "dexterity" },
      { title: "Constitution", key: "constitution" },
      { title: "Intelligence", key: "intelligence" },
      { title: "Wisdom", key: "wisdom" },
      { title: "Charisma", key: "charisma" },
    ];

    const elements = abilityScores.map((ability) => {
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

    elements.forEach((el) => this.domComponent.appendChild(el));
  };
}
