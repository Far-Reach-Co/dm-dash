import createElement from "../../lib/salt-lib/createElement.js";
import Component from "../../lib/salt-lib/Component.js";
import {
  calculateAbilityScoreModifier,
  calculateProBonus,
} from "./characterCalculations.js";

export default class SavingThrowsComponent extends Component {
  constructor(props = {}) {
    super({
      domElem: props.domElem || createElement("div"),
      autoRender: false,
    });

    this.generalData = props.generalData;
    this.updateProficiencyInfo = props.updateProficiencyInfo;
    this.onUpdate = props.onUpdate;

    this.render();
  }

  calculateProficiency = (ability, isPro) => {
    let abilityMod = calculateAbilityScoreModifier(ability);
    if (abilityMod === "0") abilityMod = 0;
    let pro = abilityMod;
    if (isPro) {
      pro += calculateProBonus(this.generalData.level);
    }
    if (pro === 0) pro = "0";
    return pro;
  };

  render = () => {
    this.domElem.className = "cp-info-container-column";

    const savingThrows = [
      { title: "Strength", key: "sv_str", ability: "strength" },
      { title: "Dexterity", key: "sv_dex", ability: "dexterity" },
      { title: "Constitution", key: "sv_con", ability: "constitution" },
      { title: "Intelligence", key: "sv_int", ability: "intelligence" },
      { title: "Wisdom", key: "sv_wis", ability: "wisdom" },
      { title: "Charisma", key: "sv_cha", ability: "charisma" },
    ];

    const rows = [
      createElement(
        "div",
        { class: "special-font align-self-center" },
        "Saving Throws"
      )
    ];

    savingThrows.forEach((save) => {
      const elem = createElement("div", { class: "proficiency-item" }, [
        createElement(
          "div",
          {
            class: this.generalData.proficiencies[save.key]
              ? "proficiency-item-radio-checked"
              : "proficiency-item-radio",
          },
          null,
          {
            type: "click",
            event: () => {
              let newVal = !this.generalData.proficiencies[save.key];
              this.updateProficiencyInfo(save.key, newVal);
              if (this.onUpdate) this.onUpdate();
            },
          }
        ),
        createElement(
          "div",
          { class: "proficiency-item-number" },
          this.calculateProficiency(
            this.generalData[save.ability],
            this.generalData.proficiencies[save.key]
          )
        ),
        createElement("small", { class: "proficiency-item-title" }, save.title),
      ]);
      rows.push(elem);
    });

    return rows;
  };
}
