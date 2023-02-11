import createElement from "../lib/createElement.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import HPComponent from "../lib/HPComponent.js";

class FiveEPlayerSheet {
  constructor() {
    this.appComponent = document.getElementById("app");
    this.domComponent = createElement("div", {
      class: "standard-view",
      style: "align-items: center;",
    });
    this.appComponent.appendChild(this.domComponent);

    this.user = null;
    // general, background, etc
    this.mainView = "general";

    // stop initial spinner
    document.getElementById("initial-spinner").remove();
    this.generalData = history.state;
    this.render();
  }

  updateGeneralValue = async (name, value) => {
    this.generalData[name] = value;
    postThing(`/api/edit_5e_character_general/${this.generalData.id}`, {
      [name]: value,
    });
  };

  updateProficiencyInfo = async (name, value) => {
    this.generalData.proficiencies[name] = value;
    postThing(
      `/api/edit_5e_character_proficiencies/${this.generalData.proficiencies.id}`,
      {
        [name]: value,
      }
    );
  };

  calculateAbilityScoreModifier = (abilityScore) => {
    switch (abilityScore) {
      case 1:
        return -5;
      case 2:
      case 3:
        return -4;
      case 4:
      case 5:
        return -3;
      case 6:
      case 7:
        return -2;
      case 8:
      case 9:
        return -1;
      case 10:
      case 11:
        return "0";
      case 12:
      case 13:
        return 1;
      case 14:
      case 15:
        return 2;
      case 16:
      case 17:
        return 3;
      case 18:
      case 19:
        return 4;
      case 20:
      case 21:
        return 5;
      case 22:
      case 23:
        return 6;
      case 24:
      case 25:
        return 7;
      case 26:
      case 27:
        return 8;
      case 28:
      case 29:
        return 9;
      case 30:
        return 10;
      default:
        return "0";
    }
  };

  calculateProBonus = () => {
    if (this.generalData.exp < 6500) {
      return 2;
    } else if (this.generalData.exp < 48000) {
      return 3;
    } else if (this.generalData.exp < 120000) {
      return 4;
    } else if (this.generalData.exp < 225000) {
      return 5;
    } else return 6;
  };

  calculatePassivePerception = () => {
    let wisMod = this.calculateAbilityScoreModifier(this.generalData.wisdom);
    if (wisMod === "0") wisMod = 0;
    let pp = 10 + wisMod;
    if (this.generalData.proficiencies.perception) {
      pp += this.calculateProBonus();
    }
    return pp;
  };

  calculateProficiency = (ability, isPro) => {
    let abilityMod = this.calculateAbilityScoreModifier(ability);
    if (abilityMod === "0") abilityMod = 0;
    let pro = abilityMod;
    if (isPro) {
      pro += this.calculateProBonus();
    }
    if (pro === 0) pro = "0";
    return pro;
  };

  renderAbilityScores = () => {
    const abilityScores = [
      {
        title: "Strength",
        key: "strength",
      },
      {
        title: "Dexterity",
        key: "dexterity",
      },
      {
        title: "Consitution",
        key: "constitution",
      },
      {
        title: "Intelligence",
        key: "intelligence",
      },
      {
        title: "Wisdom",
        key: "wisdom",
      },
      {
        title: "Charisma",
        key: "charisma",
      },
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
                this.render();
              },
            }
          ),
          createElement(
            "div",
            { class: "ability-score-modifier" },
            this.calculateAbilityScoreModifier(this.generalData[ability.key])
          ),
        ]
      );
    });
  };

  renderSavingThrows = () => {
    const savingThrows = [
      {
        title: "Strength",
        key: "sv_str",
        ability: "strength",
      },
      {
        title: "Dexterity",
        key: "sv_dex",
        ability: "dexterity",
      },
      {
        title: "Constitution",
        key: "sv_con",
        ability: "constitution",
      },
      {
        title: "Intelligence",
        key: "sv_int",
        ability: "intelligence",
      },
      {
        title: "Wisdom",
        key: "sv_wis",
        ability: "wisdom",
      },
      {
        title: "Charisma",
        key: "sv_cha",
        ability: "charisma",
      },
    ];

    return savingThrows.map((save) => {
      return createElement("div", { class: "proficiency-item" }, [
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
            event: (e) => {
              let newVal = !this.generalData.proficiencies[save.key];
              this.updateProficiencyInfo(save.key, newVal);
              this.render();
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
    });
  };

  renderSkills = () => {
    const skills = [
      {
        title: "Acrobatics",
        key: "acrobatics",
        ability: "dexterity",
      },
      {
        title: "Animal Handling",
        key: "animal_handling",
        ability: "wisdom",
      },
      {
        title: "Arcana",
        key: "arcana",
        ability: "intelligence",
      },
      {
        title: "Atheltics",
        key: "athletics",
        ability: "strength",
      },
      {
        title: "Deception",
        key: "deception",
        ability: "charisma",
      },
      {
        title: "History",
        key: "history",
        ability: "intelligence",
      },
      {
        title: "Insight",
        key: "insight",
        ability: "wisdom",
      },
      {
        title: "Intimidation",
        key: "intimidation",
        ability: "charisma",
      },
      {
        title: "Investigation",
        key: "investigation",
        ability: "intelligence",
      },
      {
        title: "Medicine",
        key: "medicine",
        ability: "wisdom",
      },
      {
        title: "Nature",
        key: "nature",
        ability: "intelligence",
      },
      {
        title: "Perception",
        key: "perception",
        ability: "wisdom",
      },
      {
        title: "Performancce",
        key: "performance",
        ability: "charisma",
      },
      {
        title: "Persuasion",
        key: "persuasion",
        ability: "charisma",
      },
      {
        title: "Religion",
        key: "religion",
        ability: "intelligence",
      },
      {
        title: "Sleight of Hand",
        key: "sleight_of_hand",
        ability: "dexterity",
      },
      {
        title: "Stealth",
        key: "stealth",
        ability: "dexterity",
      },
      {
        title: "Survival",
        key: "survival",
        ability: "wisdom",
      },
    ];

    return skills.map((skill) => {
      return createElement("div", { class: "proficiency-item" }, [
        createElement(
          "div",
          {
            class: this.generalData.proficiencies[skill.key]
              ? "proficiency-item-radio-checked"
              : "proficiency-item-radio",
          },
          null,
          {
            type: "click",
            event: (e) => {
              let newVal = !this.generalData.proficiencies[skill.key];
              this.updateProficiencyInfo(skill.key, newVal);
              this.render();
            },
          }
        ),
        createElement(
          "div",
          { class: "proficiency-item-number" },
          this.calculateProficiency(
            this.generalData[skill.ability],
            this.generalData.proficiencies[skill.key]
          )
        ),
        createElement("small", { class: "proficiency-item-title" }, [
          skill.title,
          createElement(
            "small",
            { style: "font-size: smaller; color: var(--light-gray)" },
            ` (${skill.ability.substring(0, 3)})`
          ),
        ]),
      ]);
    });
  };

  renderGeneralView = async () => {
    const theHPComponent = createElement("div");
    new HPComponent({
      domComponent: theHPComponent,
      updateGeneralValue: this.updateGeneralValue,
      max_hp: this.generalData.max_hp,
      temp_hp: this.generalData.temp_hp,
      current_hp: this.generalData.current_hp,
    });

    this.domComponent.append(
      createElement(
        "div",
        {
          style: "display: flex; flex: 1; flex-wrap: wrap;",
        },
        [
          createElement("div", { class: "cp-info-container-column" }, [
            createElement("div", { class: "cp-content-container" }, [
              createElement("small", {}, "Character Name"),
              createElement(
                "input",
                {
                  class: "cp-input-gen cp-input-char-name",
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
            createElement("div", { style: "display: flex; flex-wrap: wrap;" }, [
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
                createElement("div", { class: "cp-content-container" }, [
                  createElement("small", {}, "Class"),
                  createElement(
                    "input",
                    {
                      class: "cp-input-gen cp-input-regular",
                      name: "class",
                      value: this.generalData.class
                        ? this.generalData.class
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
                ]),
              ]),
              createElement("div", {}, [
                createElement("div", { class: "cp-content-container" }, [
                  createElement("small", {}, "Level"),
                  createElement(
                    "input",
                    {
                      class: "cp-input-gen cp-input-regular",
                      type: "number",
                      name: "level",
                      value: this.generalData.level
                        ? this.generalData.level
                        : "",
                    },
                    null,
                    {
                      type: "focusout",
                      event: (e) => {
                        this.updateGeneralValue(
                          e.target.name,
                          e.target.valueAsNumber
                        );
                      },
                    }
                  ),
                ]),
                createElement("div", { class: "cp-content-container" }, [
                  createElement("small", {}, "EXP"),
                  createElement(
                    "input",
                    {
                      class: "cp-input-gen cp-input-regular",
                      type: "number",
                      name: "exp",
                      value: this.generalData.exp ? this.generalData.exp : "",
                    },
                    null,
                    {
                      type: "focusout",
                      event: (e) => {
                        this.updateGeneralValue(
                          e.target.name,
                          e.target.valueAsNumber
                        );
                        this.render();
                      },
                    }
                  ),
                ]),
              ]),
            ]),
          ]),
          createElement("div", { class: "cp-info-container-column" }, [
            createElement(
              "div",
              {
                style:
                  "display: flex; flex-wrap: wrap; justify-content: center;",
              },
              [
                createElement("div", { class: "cp-content-container-center" }, [
                  createElement(
                    "input",
                    {
                      class: "cp-input-no-border cp-input-large",
                      type: "number",
                      name: "armor_class",
                      value: this.generalData.armor_class
                        ? this.generalData.armor_class
                        : "",
                    },
                    null,
                    {
                      type: "focusout",
                      event: (e) => {
                        this.updateGeneralValue(
                          e.target.name,
                          e.target.valueAsNumber
                        );
                      },
                    }
                  ),
                  createElement("small", {}, "Armor Class"),
                ]),
                createElement("div", { class: "cp-content-container-center" }, [
                  createElement(
                    "input",
                    {
                      class: "cp-input-no-border cp-input-large",
                      type: "number",
                      name: "initiative",
                      value: this.generalData.initiative
                        ? this.generalData.initiative
                        : "",
                    },
                    null,
                    {
                      type: "focusout",
                      event: (e) => {
                        this.updateGeneralValue(
                          e.target.name,
                          e.target.valueAsNumber
                        );
                      },
                    }
                  ),
                  createElement("small", {}, "Initiative"),
                ]),
                createElement("div", { class: "cp-content-container-center" }, [
                  createElement(
                    "input",
                    {
                      class: "cp-input-no-border cp-input-large",
                      type: "number",
                      name: "speed",
                      value: this.generalData.speed
                        ? this.generalData.speed
                        : "",
                    },
                    null,
                    {
                      type: "focusout",
                      event: (e) => {
                        this.updateGeneralValue(
                          e.target.name,
                          e.target.valueAsNumber
                        );
                      },
                    }
                  ),
                  createElement("small", {}, "Speed"),
                ]),
              ]
            ),
            createElement(
              "div",
              {
                style:
                  "display: flex; flex-wrap: wrap; justify-content: center;",
              },
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
                        this.generalData.inspiration =
                          !this.generalData.inspiration;
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
                    {
                      style:
                        "display: flex; align-items: center; justify-content: center;",
                    },
                    [
                      createElement("small", {}, "Total"),
                      createElement(
                        "input",
                        {
                          class: "cp-input-no-border-small",
                          name: "hit_dice_total",
                          type: "number",
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
                              e.target.valueAsNumber
                            );
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
                      value: this.generalData.hit_dice
                        ? this.generalData.hit_dice
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
                  createElement("small", {}, "Hit Dice"),
                ]),
                theHPComponent,
              ]
            ),
          ]),
        ]
      ),
      createElement("div", { style: "display: flex; flex-wrap: wrap;" }, [
        ...this.renderAbilityScores(),
      ]),
      createElement("div", { style: "display: flex; flex-wrap: wrap;" }, [
        createElement("div", { class: "cp-content-container-long" }, [
          createElement(
            "div",
            {
              class: "cp-content-long-number",
            },
            `+${this.calculateProBonus()}`,
            {
              type: "focusout",
              event: (e) => {
                this.updateGeneralValue(e.target.name, e.target.valueAsNumber);
              },
            }
          ),
          createElement(
            "div",
            { class: "cp-content-long-title" },
            createElement("small", {}, "Proficiency Bonus")
          ),
        ]),
        createElement("div", { class: "cp-content-container-long" }, [
          createElement(
            "div",
            {
              class: "cp-content-long-number",
            },
            this.calculatePassivePerception(),
            {
              type: "focusout",
              event: (e) => {
                this.updateGeneralValue(e.target.name, e.target.valueAsNumber);
              },
            }
          ),
          createElement(
            "div",
            { class: "cp-content-long-title" },
            createElement("small", {}, "Passive Perception (Wis)")
          ),
        ]),
      ]),
      createElement("div", { style: "display: flex; flex-wrap: wrap;" }, [
        createElement(
          "div",
          { style: "display: flex; flex-direction: column;" },
          [
            createElement("div", { class: "cp-info-container-column" }, [
              createElement(
                "div",
                { style: "align-self: center;" },
                "Saving Throws"
              ),
              ...this.renderSavingThrows(),
            ]),
            createElement("div", { class: "cp-info-container-column" }, [
              createElement(
                "div",
                { style: "align-self: center;" },
                "Death Saves"
              ),
              createElement("div", { style: "display: flex;" }, [
                createElement("small", {}, "Successes"),
                createElement(
                  "div",
                  { style: "display: flex; margin-left: auto;" },
                  [
                    createElement(
                      "div",
                      {
                        class: this.generalData.ds_success_1
                          ? "small-boolean-input-checked"
                          : "small-boolean-input",
                      },
                      null,
                      {
                        type: "click",
                        event: () => {
                          let newVal = !this.generalData.ds_success_1;
                          this.updateGeneralValue("ds_success_1", newVal);
                          this.render();
                        },
                      }
                    ),
                    createElement(
                      "div",
                      {
                        class: this.generalData.ds_success_2
                          ? "small-boolean-input-checked"
                          : "small-boolean-input",
                      },
                      null,
                      {
                        type: "click",
                        event: () => {
                          let newVal = !this.generalData.ds_success_2;
                          this.updateGeneralValue("ds_success_2", newVal);
                          this.render();
                        },
                      }
                    ),
                    createElement(
                      "div",
                      {
                        class: this.generalData.ds_success_3
                          ? "small-boolean-input-checked"
                          : "small-boolean-input",
                      },
                      null,
                      {
                        type: "click",
                        event: () => {
                          let newVal = !this.generalData.ds_success_3;
                          this.updateGeneralValue("ds_success_3", newVal);
                          this.render();
                        },
                      }
                    ),
                  ]
                ),
              ]),
              createElement("div", { style: "display: flex;" }, [
                createElement("small", {}, "Failures"),
                createElement(
                  "div",
                  { style: "display: flex; margin-left: auto;" },
                  [
                    createElement(
                      "div",
                      {
                        class: this.generalData.ds_failure_1
                          ? "small-boolean-input-checked-red"
                          : "small-boolean-input",
                      },
                      null,
                      {
                        type: "click",
                        event: () => {
                          let newVal = !this.generalData.ds_failure_1;
                          this.updateGeneralValue("ds_failure_1", newVal);
                          this.render();
                        },
                      }
                    ),
                    createElement(
                      "div",
                      {
                        class: this.generalData.ds_failure_2
                          ? "small-boolean-input-checked-red"
                          : "small-boolean-input",
                      },
                      null,
                      {
                        type: "click",
                        event: () => {
                          let newVal = !this.generalData.ds_failure_2;
                          this.updateGeneralValue("ds_failure_2", newVal);
                          this.render();
                        },
                      }
                    ),
                    createElement(
                      "div",
                      {
                        class: this.generalData.ds_failure_3
                          ? "small-boolean-input-checked-red"
                          : "small-boolean-input",
                      },
                      null,
                      {
                        type: "click",
                        event: () => {
                          let newVal = !this.generalData.ds_failure_3;
                          this.updateGeneralValue("ds_failure_3", newVal);
                          this.render();
                        },
                      }
                    ),
                  ]
                ),
              ]),
            ]),
          ]
        ),
        createElement("div", { class: "cp-info-container-column" }, [
          createElement("div", { style: "align-self: center;" }, "Skills"),
          ...this.renderSkills(),
        ]),
      ])
    );
  };

  render = async () => {
    this.domComponent.innerHTML = "";
    console.log(this.generalData);

    // char nav
    this.domComponent.append(
      createElement("div", { class: "cp-nav" }, [
        createElement(
          "a",
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
          }
        ),
        createElement(
          "a",
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
          }
        ),
        createElement(
          "a",
          {
            class:
              this.mainView === "other" ? "cp-nav-item-active" : "cp-nav-item",
          },
          "Other",
          {
            type: "click",
            event: () => {
              this.mainView = "other";
              this.render();
            },
          }
        ),
      ])
    );

    if (this.mainView === "general") {
      return this.renderGeneralView();
    }
  };
}

new FiveEPlayerSheet();
