import { deleteThing, getThings, postThing } from "../../lib/apiUtils.js";
import createElement from "../../components/createElement.js";
import renderLoadingWithMessage from "../../components/loadingWithMessage.js";

export default class ClassesComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className =
      "cp-info-container-column cp-info-container-pulsate"; // pulsate before content has loaded
    this.general_id = props.general_id;

    this.classesData = null;
    this.newLoading = false;

    this.render();
  }

  toggleNewLoading = () => {
    this.newLoading = !this.newLoading;
    this.render();
  };

  newClassItem = async () => {
    this.toggleNewLoading();
    const res = await postThing("/api/add_5e_character_class", {
      general_id: this.general_id,
    });
    this.toggleNewLoading();
  };

  calculateCurrentHitDice = () => {
    // Gather hit dice total info
    let acc = 0;
    if (this.classesData && this.classesData.length) {
      this.classesData.forEach((item) => {
        if (item.current_hit_dice) {
          acc += item.current_hit_dice;
        }
      });
    }
    return acc;
  };

  renderDiceTypeSelectOptions = (currentType) => {
    if (currentType && currentType != "") {
      currentType = currentType.toUpperCase();
    }
    const types = ["D4", "D6", "D8", "D10", "D12", "D20"];
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

  renderClassesElems = async () => {
    const classesData = await getThings(
      `/api/get_5e_character_classes/${this.general_id}`
    );
    this.domComponent.className = "cp-info-container-column"; // set container styling to not include pulsate animation after loading
    if (!classesData.length) return [createElement("small", {}, "None...")];

    this.classesData = classesData;

    return classesData.map((item) => {
      return createElement(
        "div",
        {
          class: "d-flex align-items-center mb-1",
        },
        [
          createElement(
            "input",
            {
              class: "cp-input-gen cp-input-regular me-1",
              name: "class",
              value: item.class ? item.class : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_class/${item.id}`, {
                  class: e.target.value,
                });
              },
            }
          ),
          createElement(
            "input",
            {
              class: "cp-input-gen cp-input-regular me-1",
              name: "subclass",
              value: item.subclass ? item.subclass : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_class/${item.id}`, {
                  subclass: e.target.value,
                });
              },
            }
          ),
          createElement(
            "select",
            {
              class: "select-option-small me-1",
              id: "type",
              name: "type",
            },
            [
              createElement("option", { value: "None" }, "None"),
              ...this.renderDiceTypeSelectOptions(item.hit_dice_type),
            ],
            {
              type: "change",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_class/${item.id}`, {
                  hit_dice_type: e.target.value,
                });
              },
            }
          ),
          createElement(
            "input",
            {
              class: "cp-input-gen-short me-1",
              name: "total_hit_dice",
              type: "number",
              value: item.total_hit_dice ? item.total_hit_dice : 0,
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_class/${item.id}`, {
                  total_hit_dice: e.target.value,
                });
              },
            }
          ),
          createElement(
            "input",
            {
              class: "cp-input-gen-short",
              name: "current_hit_dice",
              type: "number",
              value: item.current_hit_dice ? item.current_hit_dice : 0,
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_class/${item.id}`, {
                  current_hit_dice: e.target.value,
                });
              },
            }
          ),
          createElement(
            "div",
            {
              class: "text-red cursor-pointer ms-3",
              title: "Remove Class",
            },
            "ⓧ",
            {
              type: "click",
              event: (e) => {
                if (
                  window.confirm(
                    `Are you sure you want to delete ${
                      item.class ? item.class : "Empty"
                    }`
                  )
                ) {
                  deleteThing(`/api/remove_5e_character_class/${item.id}`);
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
        { class: "special-font align-self-center" },
        "Class Info"
      ),
      createElement(
        "div",
        {
          class: "d-flex align-items-center",
        },
        [
          createElement("small", { style: "margin-right: 100px;" }, "Class"),
          createElement("small", { style: "margin-right: 70px;" }, "Sub Class"),
          createElement(
            "small",
            { style: "margin-right: 20px;" },
            "Hit Dice Type"
          ),
          createElement("small", { style: "margin-right: 35px;" }, "Total"),
          createElement("small", {}, "Current"),
        ]
      ),
      ...(await this.renderClassesElems()),
      createElement(
        "a",
        {
          class: "align-self-start",
          title: "Create a new class + subclass + hit dice",
        },
        "+",
        {
          type: "click",
          event: this.newClassItem,
        }
      )
    );
  };
}
