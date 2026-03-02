import createElement from "../../lib/salt-lib/createElement.js";
import Component from "../../lib/salt-lib/Component.js";
import { patchSheetObject } from "../../lib/sheetApi.js";
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

export default class FiveEPlayerSheet extends Component {
  constructor(props = {}) {
    super({
      domElem: props.domElem || createElement("div"),
      className: "d-flex flex-column align-items-center justify-content-center",
    });

    this.navigate = props.navigate;
    this.generalData = props.params?.content || props.generalData || {};
    this.currentUserId = props.currentUserId || null;
    // general, background, etc
    this.mainView = "general";
    this.generalPatchQueue = Promise.resolve();
    this.spellSlotPatchQueue = Promise.resolve();
    this.sheetSettings = null;
  }

  init = async () => {
    this.ensureSheetSettings();
  };

  ensureSheetSettings = () => {
    const sheetSettings = this.useChild(
      "sheet-settings",
      () =>
        new SheetSettings({
          domElem: createElement("div"),
          generalData: this.generalData,
          currentUserId: this.currentUserId,
        }),
      (child) => {
        child.generalData = this.generalData;
        child.currentUserId = this.currentUserId;
      },
    );

    this.sheetSettings = sheetSettings;
    return sheetSettings;
  };

  updateGeneralValue = async (name, value) => {
    this.generalData[name] = value;
    this.generalPatchQueue = this.generalPatchQueue
      .then(() => patchSheetObject(this.generalData.id, "general", { [name]: value }))
      .catch(() => null);

    // Run an update on attack - bonus component element magic words
    this.attemptUpdateAttackComponentMagicWords(name);
    return this.generalPatchQueue;
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
    patchSheetObject(this.generalData.id, "background", {
      [name]: value,
    });
  };

  updateSpellSlotValue = async (name, value) => {
    if (!this.generalData.spell_slots) {
      this.generalData.spell_slots = {};
    }
    this.generalData.spell_slots[name] = value;
    const patch = { [name]: value };
    this.enqueueSpellSlotPatch(patch);
  };

  enqueueSpellSlotPatch = (patch) => {
    const normalizedPatch = { ...patch };

    // Maintain compatibility with legacy typo keys that still exist on some sheets.
    if (Object.prototype.hasOwnProperty.call(normalizedPatch, "eighth_total")) {
      normalizedPatch.eigth_total = normalizedPatch.eighth_total;
    }
    if (
      Object.prototype.hasOwnProperty.call(normalizedPatch, "eighth_expended")
    ) {
      normalizedPatch.eigth_expended = normalizedPatch.eighth_expended;
    }

    this.spellSlotPatchQueue = this.spellSlotPatchQueue
      .then(() => patchSheetObject(this.generalData.id, "spellSlots", normalizedPatch))
      .catch(() => null);
    return this.spellSlotPatchQueue;
  };

  updateSpellSlotValues = async (patch) => {
    if (!this.generalData.spell_slots) {
      this.generalData.spell_slots = {};
    }
    Object.entries(patch || {}).forEach(([key, value]) => {
      this.generalData.spell_slots[key] = value;
    });
    this.enqueueSpellSlotPatch(patch || {});
  };

  updateProficiencyInfo = async (name, value) => {
    this.generalData.proficiencies[name] = value;
    patchSheetObject(this.generalData.id, "proficiencies", {
      [name]: value,
    });
  };

  renderPassivePerceptionComponent = () => {
    const elem = createElement("div");
    new PassivePerceptionComponent({
      domElem: elem,
      calculatePassivePerception: () =>
        calculatePassivePerception(this.generalData),
      wisdom: this.generalData.wisdom,
      wisdomMod: this.generalData.wisdom_mod,
      updateGeneralValue: this.updateGeneralValue,
    });

    return elem;
  };

  renderGeneralView = async () => {
    this.hpComponent = this.useChild(
      "hp-component",
      () =>
        new HPComponent({
          domElem: createElement("div"),
          updateGeneralValue: this.updateGeneralValue,
          max_hp: this.generalData.max_hp,
          temp_hp: this.generalData.temp_hp,
          current_hp: this.generalData.current_hp,
        }),
      (child) => {
        child.updateGeneralValue = this.updateGeneralValue;
      },
    );

    this.classesComponent = this.useChild(
      "classes-component",
      () =>
        new ClassesComponent({
          domElem: createElement("div"),
          general_id: this.generalData.id,
        }),
      (child) => {
        child.general_id = this.generalData.id;
      },
    );

    this.otherProLangComponent = this.useChild(
      "other-pro-lang-component",
      () =>
        new OtherProLangComponent({
          domElem: createElement("div"),
          general_id: this.generalData.id,
        }),
      (child) => {
        child.general_id = this.generalData.id;
      },
    );

    this.attackComponent = this.useChild(
      "attack-component",
      () =>
        new AttackComponent({
          domElem: createElement("div"),
          generalData: this.generalData,
          calculateAbilityScoreModifier,
          calculateProBonus: () => calculateProBonus(this.generalData.level),
        }),
      (child) => {
        child.generalData = this.generalData;
      },
    );

    this.equipmentComponent = this.useChild(
      "equipment-component",
      () =>
        new EquipmentComponent({
          domElem: createElement("div"),
          general_id: this.generalData.id,
        }),
      (child) => {
        child.general_id = this.generalData.id;
      },
    );

    this.featComponent = this.useChild(
      "feat-component",
      () =>
        new FeatComponent({
          domElem: createElement("div"),
          general_id: this.generalData.id,
        }),
      (child) => {
        child.general_id = this.generalData.id;
      },
    );

    // These components depend on ability scores/level and must refresh each render
    const abilityScoresElem = createElement("div");
    this.abilityScoresComponent = new AbilityScoresComponent({
      domElem: abilityScoresElem,
      generalData: this.generalData,
      updateGeneralValue: this.updateGeneralValue,
      onUpdate: () => this.render(),
    });

    const savingThrowsElem = createElement("div");
    this.savingThrowsComponent = new SavingThrowsComponent({
      domElem: savingThrowsElem,
      generalData: this.generalData,
      updateProficiencyInfo: this.updateProficiencyInfo,
      onUpdate: () => this.render(),
    });

    this.deathSavesComponent = this.useChild(
      "death-saves-component",
      () =>
        new DeathSavesComponent({
          domElem: createElement("div"),
          generalData: this.generalData,
          updateGeneralValue: this.updateGeneralValue,
        }),
      (child) => {
        child.generalData = this.generalData;
        child.updateGeneralValue = this.updateGeneralValue;
      },
    );

    this.currencyComponent = this.useChild(
      "currency-component",
      () =>
        new CurrencyComponent({
          domElem: createElement("div"),
          generalData: this.generalData,
          updateGeneralValue: this.updateGeneralValue,
        }),
      (child) => {
        child.generalData = this.generalData;
        child.updateGeneralValue = this.updateGeneralValue;
      },
    );

    // Skills depend on ability scores and level (proficiency bonus)
    const skillsListElem = createElement("div");
    this.skillsListComponent = new SkillsListComponent({
      domElem: skillsListElem,
      generalData: this.generalData,
      updateProficiencyInfo: this.updateProficiencyInfo,
    });

    this.resourcesComponent = this.useChild(
      "resources-component",
      () =>
        new ResourcesComponent({
          domElem: createElement("div"),
          generalData: this.generalData,
          updateGeneralValue: this.updateGeneralValue,
        }),
      (child) => {
        child.generalData = this.generalData;
        child.updateGeneralValue = this.updateGeneralValue;
      },
    );

    this.combatStatsComponent = this.useChild(
      "combat-stats-component",
      () =>
        new CombatStatsComponent({
          domElem: createElement("div"),
          generalData: this.generalData,
          updateGeneralValue: this.updateGeneralValue,
          hpComponent: this.hpComponent,
        }),
      (child) => {
        child.generalData = this.generalData;
        child.updateGeneralValue = this.updateGeneralValue;
        child.hpComponent = this.hpComponent;
      },
    );

    this.generalInfoComponent = this.useChild(
      "general-info-component",
      () =>
        new GeneralInfoComponent({
          domElem: createElement("div"),
          generalData: this.generalData,
          updateGeneralValue: this.updateGeneralValue,
          onLevelChange: () => this.render(),
        }),
      (child) => {
        child.generalData = this.generalData;
        child.updateGeneralValue = this.updateGeneralValue;
      },
    );

    return [
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
            this.classesComponent.domElem,
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
                  this.hpComponent.domElem,
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
      this.abilityScoresComponent.domElem,
      createElement("div", { class: "d-flex flex-wrap" }, [
        createElement("div", { class: "d-flex flex-column" }, [
          this.savingThrowsComponent.domElem,
          this.otherProLangComponent.domElem,
          this.resourcesComponent.domElem,
          this.deathSavesComponent.domElem,
          this.equipmentComponent.domElem,
        ]),
        createElement("div", { class: "d-flex flex-column" }, [
          this.skillsListComponent.domElem,
          this.currencyComponent.domElem,
        ]),
        createElement("div", { class: "d-flex flex-column" }, [
          this.attackComponent.domElem,
          this.featComponent.domElem,
        ]),
      ]),
    ];
  };

  renderBackgroundView = async () => {
    this.backgroundComponent = this.useChild(
      "background-component",
      () =>
        new BackgroundComponent({
          domElem: createElement("div"),
          generalData: this.generalData,
          updateBackgroundValue: this.updateBackgroundValue,
          onUpdate: () => this.render(),
        }),
      (child) => {
        child.generalData = this.generalData;
        child.updateBackgroundValue = this.updateBackgroundValue;
      },
    );

    return this.backgroundComponent.domElem;
  };

  renderSpellsView = async () => {
    this.spellsComponent = this.useChild(
      "spells-component",
      () =>
        new SpellsComponent({
          domElem: createElement("div"),
          general_id: this.generalData.id,
          generalData: this.generalData,
          updateSpellSlotValue: this.updateSpellSlotValue,
          updateSpellSlotValues: this.updateSpellSlotValues,
          calculateAbilityScoreModifier,
          calculateProBonus: () => calculateProBonus(this.generalData.level),
          calculateSpellSaveDC: () => calculateSpellSaveDC(this.generalData),
          calculateSpellAttackBonus: () =>
            calculateSpellAttackBonus(this.generalData),
        }),
      (child) => {
        child.general_id = this.generalData.id;
        child.generalData = this.generalData;
      },
    );

    this.spellsComponent.generalData = this.generalData;
    this.spellsComponent.render(); // This ensures we are updating the Spell Save DC and Attack Bonus when changed by level
    return this.spellsComponent.domElem;
  };

  isCurrentUserOwner = () => {
    if (!this.currentUserId) return false;
    return String(this.currentUserId) === String(this.generalData.user_id);
  };

  renderSettingsOrNot = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const project = searchParams.get("project");
    if (!project || this.isCurrentUserOwner()) {
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
    const nav = createElement("div", { class: "cp-nav" }, [
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
      ]);

    if (this.mainView === "general") {
      return [nav, await this.renderGeneralView()];
    }

    if (this.mainView === "background") {
      return [nav, await this.renderBackgroundView()];
    }

    if (this.mainView === "spells") {
      return [nav, await this.renderSpellsView()];
    }

    if (this.mainView === "settings") {
      const sheetSettings = this.ensureSheetSettings();
      sheetSettings.render();
      return [nav, sheetSettings.domElem];
    }

    return [nav];
  };
}
