import { deleteThing, getThings, postThing } from "../../lib/apiUtils.js";
import createElement from "../createElement.js";
import renderLoadingWithMessage from "../loadingWithMessage.js";

export default class AttackComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className =
      "cp-info-container-column cp-info-container-pulsate"; // pulsate before content has loaded
    this.domComponent.style = "max-width: 100%;";
    this.general_id = props.general_id;

    this.newLoading = false;

    this.render();
  }

  toggleNewLoading = () => {
    this.newLoading = !this.newLoading;
    this.render();
  };

  newAttack = async (e) => {
    e.preventDefault();
    this.toggleNewLoading();

    await postThing("/api/add_5e_character_attack", {
      general_id: this.general_id,
      title: "New Attack/Spell",
    });

    this.toggleNewLoading();
  };

  renderAttacksElems = async () => {
    const attacksData = await getThings(
      `/api/get_5e_character_attacks/${this.general_id}`
    );
    this.domComponent.className = "cp-info-container-column"; // set container styling to not include pulsate animation after loading
    if (!attacksData.length) return [createElement("small", {}, "None...")];

    return attacksData.map((item) => {
      return createElement(
        "div",
        {
          style: "display: flex; align-items: center; margin-bottom: 5px;",
        },
        [
          createElement(
            "input",
            {
              class: "cp-input-gen input-small",
              style: "margin-right: 5px;",
              name: "title",
              value: item.title ? item.title : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_attack/${item.id}`, {
                  title: e.target.value,
                });
              },
            }
          ),
          createElement(
            "input",
            {
              class: "cp-input-gen-short input-small",
              style: "margin-right: 5px;",
              name: "range",
              value: item.range ? item.range : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_attack/${item.id}`, {
                  range: e.target.value,
                });
              },
            }
          ),
          createElement(
            "input",
            {
              class: "cp-input-gen-short input-small",
              style: "margin-right: 5px;",
              name: "duration",
              value: item.duration ? item.duration : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_attack/${item.id}`, {
                  duration: e.target.value,
                });
              },
            }
          ),
          createElement(
            "input",
            {
              class: "cp-input-gen-short input-small",
              style: "margin-right: 5px;",
              name: "bonus",
              value: item.bonus ? item.bonus : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_attack/${item.id}`, {
                  bonus: e.target.value,
                });
              },
            }
          ),
          createElement(
            "input",
            {
              class: "cp-input-gen input-small",
              style: "margin-right: 5px;",
              name: "damage_type",
              value: item.damage_type ? item.damage_type : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_attack/${item.id}`, {
                  damage_type: e.target.value,
                });
              },
            }
          ),
          createElement(
            "div",
            {
              style: "color: var(--red1); cursor: pointer;",
              title: "Remove attack",
            },
            "ⓧ",
            {
              type: "click",
              event: (e) => {
                if (
                  window.confirm(
                    `Are you sure you want to delete ${item.title}`
                  )
                ) {
                  deleteThing(`/api/remove_5e_character_attack/${item.id}`);
                  e.target.parentElement.remove();
                }
              },
            }
          ),
        ]
      );
    });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.newLoading) {
      return this.domComponent.append(renderLoadingWithMessage("Loading..."));
    }

    this.domComponent.append(
      createElement(
        "div",
        { class: "special-font", style: "align-self: center;" },
        "Attacks and Spellcasting"
      ),
      createElement("br"),
      createElement(
        "div",
        {
          style: "display: flex; align-items: center;",
        },
        [
          createElement("small", { style: "margin-right: 140px;" }, "Name"),
          createElement("small", { style: "margin-right: 29px;" }, "Range"),
          createElement("small", { style: "margin-right: 12px;" }, "Duration"),
          createElement("small", { style: "margin-right: 16px;" }, "ATK Bonus"),
          createElement("small", {}, "Damage/Type"),
        ]
      ),
      createElement("br"),
      ...(await this.renderAttacksElems()),
      createElement(
        "a",
        { style: "align-self: flex-start;", title: "Create a new attack" },
        "+",
        {
          type: "click",
          event: this.newAttack,
        }
      )
    );
  };
}
