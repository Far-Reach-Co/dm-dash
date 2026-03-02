import createElement from "../../lib/salt-lib/createElement.js";
import Component from "../../lib/salt-lib/Component.js";
import SkillComponent from "./SkillComponent.js";
import { calculateProficiency } from "./characterCalculations.js";

const SKILLS = [
  { title: "Acrobatics", key: "acrobatics", ability: "dexterity" },
  { title: "Animal Handling", key: "animal_handling", ability: "wisdom" },
  { title: "Arcana", key: "arcana", ability: "intelligence" },
  { title: "Athletics", key: "athletics", ability: "strength" },
  { title: "Deception", key: "deception", ability: "charisma" },
  { title: "History", key: "history", ability: "intelligence" },
  { title: "Insight", key: "insight", ability: "wisdom" },
  { title: "Intimidation", key: "intimidation", ability: "charisma" },
  { title: "Investigation", key: "investigation", ability: "intelligence" },
  { title: "Medicine", key: "medicine", ability: "wisdom" },
  { title: "Nature", key: "nature", ability: "intelligence" },
  { title: "Perception", key: "perception", ability: "wisdom" },
  { title: "Performance", key: "performance", ability: "charisma" },
  { title: "Persuasion", key: "persuasion", ability: "charisma" },
  { title: "Religion", key: "religion", ability: "intelligence" },
  { title: "Sleight of Hand", key: "sleight_of_hand", ability: "dexterity" },
  { title: "Stealth", key: "stealth", ability: "dexterity" },
  { title: "Survival", key: "survival", ability: "wisdom" },
];

export default class SkillsListComponent extends Component {
  constructor(props = {}) {
    super({
      domElem: props.domElem || createElement("div"),
      autoRender: false,
    });

    this.generalData = props.generalData;
    this.updateProficiencyInfo = props.updateProficiencyInfo;

    this.render();
  }

  render = () => {
    this.domElem.className = "cp-info-container-column";

    const skillRows = [
      createElement(
        "div",
        { class: "special-font align-self-center" },
        "Skills"
      ),
    ];

    SKILLS.forEach((skill) => {
      const skillComponent = new SkillComponent({
        domElem: createElement("div"),
        updateProficiencyInfo: this.updateProficiencyInfo,
        calculateProficiency: (ability, isPro, skillMod) =>
          calculateProficiency(ability, isPro, this.generalData.level, skillMod),
        skill: {
          ...skill,
          value: this.generalData.proficiencies[skill.key],
          abilityValue: this.generalData[skill.ability],
          mod: this.generalData.proficiencies[`${skill.key}_mod`],
        },
      });

      skillRows.push(skillComponent.domElem);
    });

    return skillRows;
  };
}
