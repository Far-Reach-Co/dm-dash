import { deleteThing, getThings, postThing } from "./apiUtils.js";
import createElement from "./createElement.js";
import renderLoadingWithMessage from "./loadingWithMessage.js";

export default class AttackComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "cp-info-container-column";
    this.domComponent.style = "max-width: 100%;"
    this.general_id = props.general_id;

    this.newLoading = false;
    this.creating = false;

    this.render();
  }

  toggleNewLoading = () => {
    this.newLoading = !this.newLoading;
    this.render();
  };

  toggleCreating = () => {
    this.creating = !this.creating;
    this.render();
  };

  newAttack = async (e) => {
    this.toggleNewLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.general_id = this.general_id;
    await postThing("/api/add_5e_character_attack", formProps);
    this.toggleNewLoading();
  };

  renderCreatingAttack = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new attack"
    );
    const form = createElement("form", {}, [
      createElement("label", { for: "title" }, "Name"),
      createElement("input", {
        id: "title",
        name: "title",
        placeholder: "Name",
        required: true,
      }),
      createElement("label", { for: "range" }, "Range"),
      createElement("input", {
        id: "range",
        name: "range",
        placeholder: "Range",
      }),
      createElement("label", { for: "duration" }, "Duration"),
      createElement("input", {
        id: "duration",
        name: "duration",
        placeholder: "Range",
      }),
      createElement("label", { for: "bonus" }, "ATK Bonus"),
      createElement("input", {
        id: "bonus",
        name: "bonus",
        placeholder: "+6",
      }),
      createElement("label", { for: "damage_type" }, "Damage/Type"),
      createElement("input", {
        id: "damage_type",
        name: "damage_type",
        placeholder: "1d4+3 Piercing",
      }),
      // createElement("label", { for: "description" }, "Description"),
      // createElement("textarea", {
      //   id: "description",
      //   name: "description",
      // }),
      createElement("br"),
      createElement("br"),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.creating = false;
      await this.newAttack(e);
    });

    const cancelButton = createElement(
      "button",
      { class: "btn-red" },
      "Cancel"
    );
    cancelButton.addEventListener("click", () => {
      this.toggleCreating();
    });

    this.domComponent.append(
      titleOfForm,
      createElement("br"),
      form,
      createElement("br"),
      cancelButton
    );
  };

  renderAttacksElems = async () => {
    const attacksData = await getThings(
      `/api/get_5e_character_attacks/${this.general_id}`
    );
    if (!attacksData.length) return [createElement("small", {}, "None...")];

    return attacksData.map((item) => {
      return createElement(
        "div",
        {
          style:
            "display: flex; align-items: center; margin-bottom: 5px;",
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
                  deleteThing(
                    `/api/remove_5e_character_attack/${item.id}`
                  );
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

    if (this.creating) {
      return this.renderCreatingAttack();
    }

    this.domComponent.append(
      createElement(
        "div",
        { style: "align-self: center;" },
        "Attacks and Spellcasting"
      ),
      createElement("br"),
      createElement(
        "div",
        {
          style:
            "display: flex; align-items: center;",
        },
        [
          createElement("small", {style: "margin-right: 115px;"}, "Name"),
          createElement("small", {style: "margin-right: 32px;"}, "Range"),
          createElement("small", {style: "margin-right: 18px;"}, "Duration"),
          createElement("small", {style: "margin-right: 30px;"}, "ATK Bonus"),
          createElement("small", {}, "Damage/Type"),
        ]
      ),
      createElement("br"),
      ...(await this.renderAttacksElems()),
      createElement("a", { style: "align-self: flex-start;" }, "+", {
        type: "click",
        event: this.toggleCreating,
      })
    );
  };
}
