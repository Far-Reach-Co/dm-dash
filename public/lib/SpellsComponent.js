import { deleteThing, getThings, postThing } from "./apiUtils.js";
import createElement from "./createElement.js";
import renderLoadingWithMessage from "./loadingWithMessage.js";

export default class SpellsComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.general_id = props.general_id;
    this.generalData = props.generalData;
    this.updateSpellSlotValue = props.updateSpellSlotValue;
    this.calculateAbilityScoreModifier = props.calculateAbilityScoreModifier;
    this.calculateProBonus = props.calculateProBonus;

    this.newLoading = false;
    this.spells = [];

    this.render();
  }

  calculateSpellSaveDC = () => {
    let spellSaveDC = 8;
    if (this.generalData.spell_slots.spell_casting_ability) {
      const abilityScore = this.generalData[this.generalData.spell_slots.spell_casting_ability]
      let mod = this.calculateAbilityScoreModifier(abilityScore);
      if (mod === "0") mod = 0;
      spellSaveDC += mod;
    }

    spellSaveDC += this.calculateProBonus();

    if (spellSaveDC === 0) spellSaveDC = 0;
    return spellSaveDC
  }

  calculateSpellAttackBonus = () => {
    let bonus = 0;
    if (this.generalData.spell_slots.spell_casting_ability) {
      const abilityScore = this.generalData[this.generalData.spell_slots.spell_casting_ability]
      let mod = this.calculateAbilityScoreModifier(abilityScore);
      if (mod === "0") mod = 0;
      bonus += mod;
    }

    bonus += this.calculateProBonus();

    if (bonus === 0) bonus = 0;
    return bonus
  }

  newSpell = async (type) => {
    const res = await postThing("/api/add_5e_character_spell", {
      general_id: this.general_id,
      type,
      title: "New Spell",
      description: "",
    });
    if (res) this.render();
  };

  renderSpells = (type) => {
    if (!this.spells.filter((spell) => spell.type === type).length)
      return [createElement("small", {}, "None...")];
    return this.spells
      .filter((spell) => spell.type === type)
      .map((spell) => {
        return createElement(
          "div",
          {
            style: "display: flex; flex-direction: column;",
          },
          [
            createElement(
              "div",
              { style: "display: flex; margin-bottom: 5px;" },
              [
                createElement(
                  "input",
                  {
                    class: "cp-input-gen",
                    style: "color: var(--orange2)",
                    name: "title",
                    value: spell.title ? spell.title : "",
                  },
                  null,
                  {
                    type: "focusout",
                    event: (e) => {
                      e.preventDefault();
                      postThing(`/api/edit_5e_character_spell/${spell.id}`, {
                        title: e.target.value,
                      });
                    },
                  }
                ),
                createElement(
                  "div",
                  {
                    style:
                      "color: var(--red1); margin-left: 10px; cursor: pointer;",
                  },
                  "ⓧ",
                  {
                    type: "click",
                    event: (e) => {
                      e.preventDefault();
                      if (
                        window.confirm(
                          `Are you sure you want to delete ${spell.title}`
                        )
                      ) {
                        deleteThing(
                          `/api/remove_5e_character_spell/${spell.id}`
                        );
                        e.target.parentElement.parentElement.remove();
                      }
                    },
                  }
                ),
              ]
            ),
            createElement(
              "textarea",
              {
                class: "cp-input-gen input-small",
                style: "height: 100px;",
                name: "description",
              },
              spell.description ? spell.description : "",
              {
                type: "focusout",
                event: (e) => {
                  e.preventDefault();
                  postThing(`/api/edit_5e_character_spell/${spell.id}`, {
                    description: e.target.value,
                  });
                },
              }
            ),
            createElement("hr"),
          ]
        );
      });
  };

  renderSpellSlotsElems = () => {
    const list = [
      {
        title: "First level",
        totalKey: "first_total",
        expendedKey: "first_expended",
      },
      {
        title: "Second level",
        totalKey: "second_total",
        expendedKey: "second_expended",
      },
      {
        title: "Third level",
        totalKey: "third_total",
        expendedKey: "third_expended",
      },
      {
        title: "Fourth level",
        totalKey: "fourth_total",
        expendedKey: "fourth_expended",
      },
      {
        title: "Fifth level",
        totalKey: "fifth_total",
        expendedKey: "fifth_expended",
      },
      {
        title: "Sixth level",
        totalKey: "sixth_total",
        expendedKey: "sixth_expended",
      },
      {
        title: "Seventh level",
        totalKey: "seventh_total",
        expendedKey: "seventh_expended",
      },
      {
        title: "Eighth level",
        totalKey: "eighth_total",
        expendedKey: "eighth_expended",
      },
      {
        title: "Nineth level",
        totalKey: "nineth_total",
        expendedKey: "nineth_expended",
      },
    ];

    return list.map((spellSlot) => {
      return createElement("div", { class: "cp-info-container-column" }, [
        createElement("h2", {}, spellSlot.title),
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
                  name: spellSlot.totalKey,
                  type: "number",
                  value: this.generalData.spell_slots[spellSlot.totalKey]
                    ? this.generalData.spell_slots[spellSlot.totalKey]
                    : "0",
                },
                null,
                {
                  type: "focusout",
                  event: (e) => {
                    this.updateSpellSlotValue(
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
              class: "cp-input-no-border cp-input-small",
              name: spellSlot.expendedKey,
              value: this.generalData.spell_slots[spellSlot.expendedKey]
                ? this.generalData.spell_slots[spellSlot.expendedKey]
                : "0",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                this.updateSpellSlotValue(e.target.name, e.target.value);
              },
            }
          ),
          createElement("small", {}, "Expended"),
        ]),
        createElement("hr"),
        ...this.renderSpells(spellSlot.title),
        createElement("a", { style: "align-self: flex-start;" }, "+", {
          type: "click",
          event: () => this.newSpell(spellSlot.title),
        }),
      ]);
    });
  };

  renderTypeSelectOptions = (currentType) => {
    const types = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
    const typeList = [];
    types.forEach((type) => {
      const elem = createElement(
        "option",
        { class: "select-option-small", value: type },
        type
      );
      if (currentType && currentType === type) elem.selected = true;
      typeList.push(elem);
    });
    return typeList;
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    const spells = await getThings(
      `/api/get_5e_character_spells/${this.general_id}`
    );
    if (spells.length) this.spells = spells;

    if (this.newLoading) {
      return this.domComponent.append(renderLoadingWithMessage("Loading..."));
    }

    this.domComponent.append(
      createElement(
        "div",
        {
          style: "display: flex; flex-direction: column; align-items: center;",
        },
        [
          createElement("div", {}, [
            createElement(
              "div",
              {
                class: "cp-info-container-row",
                style: "width: fit-content; align-items: flex-start;",
              },
              [
                createElement("div", { style: "display: flex; flex-direction: column; align-items: center; justify-content: center;" }, [
                  createElement("small", {style: "margin-bottom: 8px;"}, "Spell Casting Ability"),
                  createElement(
                    "select",
                    {
                      id: "spell_casting_ability",
                      name: "spell_casting_ability",
                      style: "margin-right: 10px; width: fit-content",
                    },
                    [
                      createElement("option", { value: "None" }, "None"),
                      ...this.renderTypeSelectOptions(this.generalData.spell_slots.spell_casting_ability),
                    ],
                    {
                      type: "change",
                      event: (e) => {
                        e.preventDefault();
                        this.updateSpellSlotValue("spell_casting_ability", e.target.value)
                        this.render();
                      },
                    }
                  ),
                ]),
                createElement("div", { style: "display: flex; flex-direction: column; align-items: center; margin-right: 10px; margin-left: 10px;" }, [
                  createElement("small", {}, "Spell Save DC"),
                  createElement(
                    "div",
                    {
                      class: "cp-content-long-number"
                    },
                    this.calculateSpellSaveDC(),
                  ),
                ]),
                createElement("div", { style: "display: flex; flex-direction: column; align-items: center; justify-content: center;" }, [
                  createElement("small", {}, "Spell Attack Bonus"),
                  createElement(
                    "div",
                    {
                      class: "cp-content-long-number"
                    },
                    `+${this.calculateSpellAttackBonus()}`,
                  ),
                ]),
              ]
            ),
          ]),
          createElement("div", { style: "display: flex; flex-wrap: wrap;" }, [
            createElement("div", { class: "cp-info-container-column" }, [
              createElement("h2", {}, "Cantrips"),
              createElement("br"),
              ...(await this.renderSpells("cantrip")),
              createElement("a", { style: "align-self: flex-start;" }, "+", {
                type: "click",
                event: () => this.newSpell("cantrip"),
              }),
            ]),
            ...this.renderSpellSlotsElems(),
          ]),
        ]
      )
    );
  };
}
