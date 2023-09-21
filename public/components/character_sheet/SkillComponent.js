import createElement from "../createElement";
import calculateColorMod from "./calculateColorMod";

export default class SkillComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "proficiency-item";
    this.updateProficiencyInfo = props.updateProficiencyInfo;
    this.calculateProficiency = props.calculateProficiency;

    this.skill = props.skill;

    this.modView = false;

    this.render();
  }

  toggleModView = () => {
    this.modView = !this.modView;
    this.render();
  };

  renderModView = () => {
    this.domComponent.append(
      createElement(
        "div",
        {
          class: this.skill.value
            ? "proficiency-item-radio-checked"
            : "proficiency-item-radio",
        },
        null,
        {
          type: "click",
          event: (e) => {
            this.skill.value = !this.skill.value;
            this.updateProficiencyInfo(this.skill.key, this.skill.value);
            this.render();
          },
        }
      ),
      createElement("div", { style: "display: flex; margin-left: -5px;" }, [
        createElement(
          "input",
          {
            class: "cp-content-short-number",
            type: "number",
            name: `${this.skill.key}_mod`,
            value: this.skill.mod ? this.skill.mod : 0,
          },
          null,
          {
            type: "focusout",
            event: (e) => {
              if (e.target.value === "") e.target.value = 0;
              this.skill.mod = e.target.valueAsNumber;
              this.updateProficiencyInfo(
                `${this.skill.key}_mod`,
                e.target.valueAsNumber
              );
            },
          }
        ),
        createElement(
          "img",
          {
            width: 12,
            class: "gear-gen",
            style: "margin-left: 3px; padding-bottom: 10px;",
            src: "/assets/gears.svg",
            title: "Toggle modifier view",
          },
          null,
          {
            type: "click",
            event: () => {
              this.toggleModView();
            },
          }
        ),
      ]),
      createElement(
        "small",
        { class: "proficiency-item-title", style: "color: var(--pink)" },
        [
          this.skill.title,
          createElement("small", { style: "font-size: smaller;" }, ` (mod)`),
        ]
      )
    );
  };

  render = () => {
    this.domComponent.innerHTML = "";

    if (this.modView) {
      return this.renderModView();
    }

    this.domComponent.append(
      createElement(
        "div",
        {
          class: this.skill.value
            ? "proficiency-item-radio-checked"
            : "proficiency-item-radio",
        },
        null,
        {
          type: "click",
          event: (e) => {
            this.skill.value = !this.skill.value;
            this.updateProficiencyInfo(this.skill.key, this.skill.value);
            this.render();
          },
        }
      ),
      createElement("div", { style: "display: flex;" }, [
        createElement(
          "div",
          {
            class: "proficiency-item-number",
            style: `color: ${calculateColorMod(
              this.calculateProficiency(
                this.skill.abilityValue,
                this.skill.value,
                this.skill.mod
              ),
              this.skill.mod,
              "var(--blue6)"
            )}`,
          },
          this.calculateProficiency(
            this.skill.abilityValue,
            this.skill.value,
            this.skill.mod
          )
        ),
        createElement(
          "img",
          {
            width: 12,
            class: "gear-gen",
            style: "margin-left: 3px; padding-bottom: 10px;",
            src: "/assets/gears.svg",
            title: "Toggle modifier view",
          },
          null,
          {
            type: "click",
            event: () => {
              this.toggleModView();
            },
          }
        ),
      ]),
      createElement("small", { class: "proficiency-item-title" }, [
        this.skill.title,
        createElement(
          "small",
          { style: "font-size: smaller; color: var(--light-gray)" },
          ` (${this.skill.ability.substring(0, 3)})`
        ),
      ])
    );
  };
}
