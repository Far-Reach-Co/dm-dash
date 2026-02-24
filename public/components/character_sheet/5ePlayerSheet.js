import createElement from "../../components/createElement.js";
import { postThing } from "../../lib/apiUtils.js";
import HPComponent from "./HPComponent.js";
import OtherProLangComponent from "./OtherProLangComponent.js";
import AttackComponent from "./AttackComponent.js";
import EquipmentComponent from "./EquipmentComponent.js";
import FeatComponent from "./FeatComponent.js";
import SpellsComponent from "./SpellsComponent.js";
import SheetSettings from "./SheetSettings.js";
import PassivePerceptionComponent from "./PassivePerceptionComponent.js";
import ClassesComponent from "./ClassesComponent.js";
import AbilityScoresComponent from "./AbilityScoresComponent.js";
import SavingThrowsComponent from "./SavingThrowsComponent.js";
import DeathSavesComponent from "./DeathSavesComponent.js";
import CurrencyComponent from "./CurrencyComponent.js";
import SkillsListComponent from "./SkillsListComponent.js";
import ResourcesComponent from "./ResourcesComponent.js";
import CombatStatsComponent from "./CombatStatsComponent.js";
import GeneralInfoComponent from "./GeneralInfoComponent.js";
import BackgroundComponent from "./BackgroundComponent.js";
import {
  calculateAbilityScoreModifier,
  calculateProBonus,
  calculatePassivePerception,
  calculateSpellSaveDC,
  calculateSpellAttackBonus,
} from "./characterCalculations.js";

export default class FiveEPlayerSheet {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className =
      "d-flex flex-column align-items-center justify-content-center";
    this.navigate = props.navigate;
    this.generalData = props.params.content;
    // general, background, etc
    this.mainView = "general";

    // settings view
    this.sheetSettings = new SheetSettings({
      domComponent: createElement("div"),
      generalData: this.generalData,
    });

    this.render();
  }

  updateGeneralValue = async (name, value) => {
    this.generalData[name] = value;
    postThing(`/api/edit_5e_character_general/${this.generalData.id}`, {
      [name]: value,
    });

    // Run an update on attack - bonus component element magic words
    this.attemptUpdateAttackComponentMagicWords(name);
  };

  attemptUpdateAttackComponentMagicWords(name) {
    if (this.attackComponent) {
      const mappings = this.attackComponent.getMagicWordMappings();
      const filteredMappings = mappings.filter(({ _value, key }) => {
        return name === key;
      });
      // level updates proficiency bonus
      if (!filteredMappings.length) {
        if (name === "level") {
          this.attackComponent.updateBonusElementsMagicCalcValue();
        }
      } else {
        filteredMappings.forEach(() => {
          this.attackComponent.updateBonusElementsMagicCalcValue();
        });
      }
    }
  }

  updateBackgroundValue = async (name, value) => {
    this.generalData.background[name] = value;
    postThing(`/api/edit_5e_character_background/${this.generalData.id}`, {
      [name]: value,
    });
  };

  updateSpellSlotValue = async (name, value) => {
    this.generalData.spell_slots[name] = value;
    const generalId =
      this.generalData.spell_slots?.general_id || this.generalData.id;
    if (!generalId) return;
    postThing(
      `/api/edit_5e_character_spell_slots/${generalId}`,
      {
        [name]: value,
      },
    );
  };

  updateProficiencyInfo = async (name, value) => {
    this.generalData.proficiencies[name] = value;
    postThing(
      `/api/edit_5e_character_proficiencies/${this.generalData.id}`,
      {
        [name]: value,
      },
    );
  };

  renderPassivePerceptionComponent = () => {
    const elem = createElement("div");
    new PassivePerceptionComponent({
      domComponent: elem,
      calculatePassivePerception: () =>
        calculatePassivePerception(this.generalData),
      wisdom: this.generalData.wisdom,
      wisdomMod: this.generalData.wisdom_mod,
      updateGeneralValue: this.updateGeneralValue,
    });

    return elem;
  };

  renderGeneralView = async () => {
    if (!this.hpComponent) {
      const HPComponentElem = createElement("div");
      this.hpComponent = new HPComponent({
        domComponent: HPComponentElem,
        updateGeneralValue: this.updateGeneralValue,
        max_hp: this.generalData.max_hp,
        temp_hp: this.generalData.temp_hp,
        current_hp: this.generalData.current_hp,
      });
    }

    if (!this.classesComponent) {
      const classesComponentElem = createElement("div");
      this.classesComponent = new ClassesComponent({
        domComponent: classesComponentElem,
        general_id: this.generalData.id,
      });
    }

    if (!this.otherProLangComponent) {
      const otherProLangComponentElem = createElement("div");
      this.otherProLangComponent = new OtherProLangComponent({
        domComponent: otherProLangComponentElem,
        general_id: this.generalData.id,
      });
    }

    if (!this.attackComponent) {
      const attackComponentElem = createElement("div");
      this.attackComponent = new AttackComponent({
        domComponent: attackComponentElem,
        generalData: this.generalData,
        calculateAbilityScoreModifier,
        calculateProBonus: () => calculateProBonus(this.generalData.level),
      });
    }

    if (!this.equipmentComponent) {
      const equipmentComponentElem = createElement("div");
      this.equipmentComponent = new EquipmentComponent({
        domComponent: equipmentComponentElem,
        general_id: this.generalData.id,
      });
    }

    if (!this.featComponent) {
      const featComponentElem = createElement("div");
      this.featComponent = new FeatComponent({
        domComponent: featComponentElem,
        general_id: this.generalData.id,
      });
    }

    // These components depend on ability scores/level and must refresh each render
    const abilityScoresElem = createElement("div");
    this.abilityScoresComponent = new AbilityScoresComponent({
      domComponent: abilityScoresElem,
      generalData: this.generalData,
      updateGeneralValue: this.updateGeneralValue,
      onUpdate: () => this.render(),
    });

    const savingThrowsElem = createElement("div");
    this.savingThrowsComponent = new SavingThrowsComponent({
      domComponent: savingThrowsElem,
      generalData: this.generalData,
      updateProficiencyInfo: this.updateProficiencyInfo,
      onUpdate: () => this.render(),
    });

    if (!this.deathSavesComponent) {
      const deathSavesElem = createElement("div");
      this.deathSavesComponent = new DeathSavesComponent({
        domComponent: deathSavesElem,
        generalData: this.generalData,
        updateGeneralValue: this.updateGeneralValue,
      });
    }

    if (!this.currencyComponent) {
      const currencyElem = createElement("div");
      this.currencyComponent = new CurrencyComponent({
        domComponent: currencyElem,
        generalData: this.generalData,
        updateGeneralValue: this.updateGeneralValue,
      });
    }

    // Skills depend on ability scores and level (proficiency bonus)
    const skillsListElem = createElement("div");
    this.skillsListComponent = new SkillsListComponent({
      domComponent: skillsListElem,
      generalData: this.generalData,
      updateProficiencyInfo: this.updateProficiencyInfo,
    });

    if (!this.resourcesComponent) {
      const resourcesElem = createElement("div");
      this.resourcesComponent = new ResourcesComponent({
        domComponent: resourcesElem,
        generalData: this.generalData,
        updateGeneralValue: this.updateGeneralValue,
      });
    }

    if (!this.combatStatsComponent) {
      const combatStatsElem = createElement("div");
      this.combatStatsComponent = new CombatStatsComponent({
        domComponent: combatStatsElem,
        generalData: this.generalData,
        updateGeneralValue: this.updateGeneralValue,
        hpComponent: this.hpComponent,
      });
    }

    if (!this.generalInfoComponent) {
      const generalInfoElem = createElement("div");
      this.generalInfoComponent = new GeneralInfoComponent({
        domComponent: generalInfoElem,
        generalData: this.generalData,
        updateGeneralValue: this.updateGeneralValue,
        onLevelChange: () => this.render(),
      });
    }

    this.domComponent.append(
      createElement(
        "div",
        {
          class: "d-flex flex-wrap",
          style: "flex: 1;",
        },
        [
          createElement("div", { class: "d-flex flex-column" }, [
            createElement("div", { class: "cp-info-container-column" }, [
              createElement(
                "div",
                { class: "special-font align-self-center" },
                "General Info",
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
                  },
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
                        value: this.generalData.race
                          ? this.generalData.race
                          : "",
                      },
                      null,
                      {
                        type: "focusout",
                        event: (e) => {
                          this.updateGeneralValue(
                            e.target.name,
                            e.target.value,
                          );
                        },
                      },
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
                          this.updateGeneralValue(
                            e.target.name,
                            e.target.valueAsNumber,
                          );
                        },
                      },
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
                      value: this.generalData.level
                        ? this.generalData.level
                        : 0,
                    },
                    null,
                    {
                      type: "focusout",
                      event: (e) => {
                        this.updateGeneralValue(
                          e.target.name,
                          e.target.valueAsNumber,
                        );
                        this.render();
                      },
                    },
                  ),
                ]),
              ]),
            ]),
            this.classesComponent.domComponent,
          ]),
          createElement("div", { class: "d-flex flex-column" }, [
            createElement("div", { class: "cp-info-container-column" }, [
              createElement(
                "div",
                {
                  class: "d-flex flex-wrap justify-content-center",
                },
                [
                  createElement(
                    "div",
                    { class: "cp-content-container-center" },
                    [
                      createElement(
                        "input",
                        {
                          class: "cp-input-no-border cp-input-large",
                          type: "number",
                          name: "armor_class",
                          value: this.generalData.armor_class
                            ? this.generalData.armor_class
                            : 0,
                        },
                        null,
                        {
                          type: "focusout",
                          event: (e) => {
                            this.updateGeneralValue(
                              e.target.name,
                              e.target.valueAsNumber,
                            );
                          },
                        },
                      ),
                      createElement("small", {}, "Armor Class"),
                    ],
                  ),
                  createElement(
                    "div",
                    { class: "cp-content-container-center" },
                    [
                      createElement(
                        "input",
                        {
                          class: "cp-input-no-border cp-input-large",
                          type: "number",
                          name: "initiative",
                          value: this.generalData.initiative
                            ? this.generalData.initiative
                            : 0,
                        },
                        null,
                        {
                          type: "focusout",
                          event: (e) => {
                            this.updateGeneralValue(
                              e.target.name,
                              e.target.valueAsNumber,
                            );
                          },
                        },
                      ),
                      createElement("small", {}, "Initiative"),
                    ],
                  ),
                  createElement(
                    "div",
                    { class: "cp-content-container-center" },
                    [
                      createElement(
                        "input",
                        {
                          class: "cp-input-no-border cp-input-large",
                          type: "number",
                          name: "speed",
                          value: this.generalData.speed
                            ? this.generalData.speed
                            : 0,
                        },
                        null,
                        {
                          type: "focusout",
                          event: (e) => {
                            this.updateGeneralValue(
                              e.target.name,
                              e.target.valueAsNumber,
                            );
                          },
                        },
                      ),
                      createElement("small", {}, "Speed"),
                    ],
                  ),
                ],
              ),
              createElement(
                "div",
                {
                  class: "d-flex flex-wrap justify-content-center",
                },
                [
                  createElement(
                    "div",
                    { class: "cp-content-container-center" },
                    [
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
                            this.generalData.inspiration =
                              !this.generalData.inspiration;
                            this.updateGeneralValue(
                              "inspiration",
                              this.generalData.inspiration,
                            );
                          },
                        },
                      ),
                      createElement("small", {}, "Inspiration"),
                    ],
                  ),
                  createElement(
                    "div",
                    { class: "cp-content-container-center" },
                    [
                      createElement(
                        "div",
                        {
                          class:
                            "d-flex align-items-center justify-content-center",
                        },
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
                                this.updateGeneralValue(
                                  e.target.name,
                                  e.target.value,
                                );
                              },
                            },
                          ),
                        ],
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
                            this.updateGeneralValue(
                              e.target.name,
                              e.target.valueAsNumber,
                            );
                          },
                        },
                      ),
                      createElement("small", {}, "Hit Dice"),
                    ],
                  ),
                  this.hpComponent.domComponent,
                ],
              ),
            ]),
            createElement("div", { class: "d-flex flex-wrap" }, [
              createElement("div", { class: "d-flex flex-column" }, [
                createElement("div", { class: "cp-content-container-long" }, [
                  createElement(
                    "div",
                    {
                      class: "cp-content-long-number",
                    },
                    `+${calculateProBonus(this.generalData.level)}`,
                  ),
                  createElement(
                    "div",
                    { class: "cp-content-long-title" },
                    createElement("small", {}, "Proficiency Bonus"),
                  ),
                ]),
                this.renderPassivePerceptionComponent(),
              ]),
              createElement("div", { class: "d-flex flex-column" }, [
                createElement("div", { class: "cp-content-container-long" }, [
                  createElement(
                    "div",
                    {
                      class: "cp-content-long-number",
                    },
                    calculateSpellSaveDC(this.generalData),
                  ),
                  createElement(
                    "div",
                    { class: "cp-content-long-title" },
                    createElement("small", {}, "Spell Save DC"),
                  ),
                ]),
                createElement("div", { class: "cp-content-container-long" }, [
                  createElement(
                    "div",
                    {
                      class: "cp-content-long-number",
                    },
                    `+${calculateSpellAttackBonus(this.generalData)}`,
                  ),
                  createElement(
                    "div",
                    { class: "cp-content-long-title" },
                    createElement("small", {}, "Spell Attack Bonus"),
                  ),
                ]),
              ]),
            ]),
          ]),
        ],
      ),
      this.abilityScoresComponent.domComponent,
      createElement("div", { class: "d-flex flex-wrap" }, [
        createElement("div", { class: "d-flex flex-column" }, [
          this.savingThrowsComponent.domComponent,
          this.otherProLangComponent.domComponent,
          this.resourcesComponent.domComponent,
          this.deathSavesComponent.domComponent,
          this.equipmentComponent.domComponent,
        ]),
        createElement("div", { class: "d-flex flex-column" }, [
          this.skillsListComponent.domComponent,
          this.currencyComponent.domComponent,
        ]),
        createElement("div", { class: "d-flex flex-column" }, [
          this.attackComponent.domComponent,
          this.featComponent.domComponent,
        ]),
      ]),
    );
  };

  renderBackgroundView = async () => {
    if (!this.backgroundComponent) {
      const backgroundElem = createElement("div");
      this.backgroundComponent = new BackgroundComponent({
        domComponent: backgroundElem,
        generalData: this.generalData,
        updateBackgroundValue: this.updateBackgroundValue,
        onUpdate: () => this.render(),
      });
    }
    this.domComponent.append(this.backgroundComponent.domComponent);
  };

  renderSpellsView = async () => {
    if (!this.spellsComponent) {
      const spellsComponentElem = createElement("div");
      this.spellsComponent = new SpellsComponent({
        domComponent: spellsComponentElem,
        general_id: this.generalData.id,
        generalData: this.generalData,
        updateSpellSlotValue: this.updateSpellSlotValue,
        calculateAbilityScoreModifier,
        calculateProBonus: () => calculateProBonus(this.generalData.level),
        calculateSpellSaveDC: () => calculateSpellSaveDC(this.generalData),
        calculateSpellAttackBonus: () =>
          calculateSpellAttackBonus(this.generalData),
      });
    }
    this.spellsComponent.generalData = this.generalData;
    this.spellsComponent.render(); // This ensures we are updating the Spell Save DC and Attack Bonus when changed by level
    this.domComponent.append(this.spellsComponent.domComponent);
  };

  renderSettingsOrNot = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const project = searchParams.get("project");
    if (!project || USERID == this.generalData.user_id) {
      return createElement(
        "div",
        {
          class:
            this.mainView === "settings" ? "cp-nav-item-active" : "cp-nav-item",
        },
        "Settings",
        {
          type: "click",
          event: () => {
            this.mainView = "settings";
            this.render();
          },
        },
      );
    } else return createElement("div", { class: "d-none" });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    // char nav
    this.domComponent.append(
      createElement("div", { class: "cp-nav" }, [
        createElement(
          "div",
          {
            class:
              this.mainView === "general"
                ? "cp-nav-item-active"
                : "cp-nav-item",
          },
          "General",
          {
            type: "click",
            event: () => {
              this.mainView = "general";
              this.render();
            },
          },
        ),
        createElement(
          "div",
          {
            class:
              this.mainView === "background"
                ? "cp-nav-item-active"
                : "cp-nav-item",
          },
          "Background",
          {
            type: "click",
            event: () => {
              this.mainView = "background";
              this.render();
            },
          },
        ),
        createElement(
          "div",
          {
            class:
              this.mainView === "spells" ? "cp-nav-item-active" : "cp-nav-item",
          },
          "Spells",
          {
            type: "click",
            event: () => {
              this.mainView = "spells";
              this.render();
            },
          },
        ),
        this.renderSettingsOrNot(),
      ]),
    );

    if (this.mainView === "general") {
      return this.renderGeneralView();
    }

    if (this.mainView === "background") {
      return this.renderBackgroundView();
    }

    if (this.mainView === "spells") {
      return this.renderSpellsView();
    }

    if (this.mainView === "settings") {
      return this.domComponent.append(this.sheetSettings.domComponent);
    }
  };
}
