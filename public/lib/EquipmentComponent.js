import { deleteThing, getThings, postThing } from "./apiUtils.js";
import createElement from "./createElement.js";
import renderLoadingWithMessage from "./loadingWithMessage.js";

export default class EquipmentComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "cp-info-container-column";
    this.domComponent.style = "max-width: 100%;";
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

  newEquipment = async (e) => {
    this.toggleNewLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.general_id = this.general_id;
    await postThing("/api/add_5e_character_equipment", formProps);
    this.toggleNewLoading();
  };

  renderCreatingEquipment = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new equipment"
    );
    const form = createElement("form", {}, [
      createElement("label", { for: "title" }, "Name"),
      createElement("input", {
        id: "title",
        name: "title",
        placeholder: "Name",
        required: true,
      }),
      createElement("label", { for: "quantity" }, "Quantity"),
      createElement("input", {
        id: "quantity",
        name: "quantity",
        type: "number",
        step: "0.01",
        placeholder: "4",
        required: false,
      }),
      createElement("label", { for: "weight" }, "Weight"),
      createElement("input", {
        id: "weight",
        name: "weight",
        type: "number",
        step: "0.01",
        placeholder: "1",
        required: false,
      }),
      createElement("br"),
      createElement("br"),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.creating = false;
      await this.newEquipment(e);
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

  renderEquipmentsElems = async () => {
    if (!this.equipmentData.length)
      return [createElement("small", {}, "None...")];

    return this.equipmentData.map((item, index) => {
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
                postThing(`/api/edit_5e_character_equipment/${item.id}`, {
                  title: e.target.value,
                });
                this.equipmentData[index].title = e.target.value
              },
            }
          ),

          createElement(
            "input",
            {
              class: "cp-input-gen-short input-small",
              style: "margin-right: 5px;",
              type: "number",
              name: "quantity",
              value: item.quantity ? item.quantity : "0",
            },
            null,
            {
              type: "focusout",
              event: async (e) => {
                e.preventDefault();
                await postThing(`/api/edit_5e_character_equipment/${item.id}`, {
                  quantity: e.target.valueAsNumber,
                });
                this.equipmentData[index].quantity = e.target.valueAsNumber
                // re-calc weight
                this.updateWeight();
              },
            }
          ),
          createElement(
            "input",
            {
              class: "cp-input-gen-short input-small",
              style: "margin-right: 5px;",
              type: "number",
              name: "weight",
              value: item.weight ? item.weight : "0",
            },
            null,
            {
              type: "focusout",
              event: async (e) => {
                e.preventDefault();
                await postThing(`/api/edit_5e_character_equipment/${item.id}`, {
                  weight: e.target.valueAsNumber,
                });
                this.equipmentData[index].weight = e.target.valueAsNumber
                // re-calc weight
                this.updateWeight();
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
                  deleteThing(`/api/remove_5e_character_equipment/${item.id}`);
                  e.target.parentElement.remove();
                }
              },
            }
          ),
        ]
      );
    });
  };

  updateWeight = () => {
    document.getElementById("total-equipment-weight").innerHTML =
      this.calculateTotalWeight().toString();
  };

  calculateTotalWeight = () => {
    let weight = 0;
    this.equipmentData.forEach((item) => {
      if (item.weight && item.quantity) {
        weight += item.weight * item.quantity;
      }
    });

    return weight;
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.newLoading) {
      return this.domComponent.append(renderLoadingWithMessage("Loading..."));
    }

    if (this.creating) {
      return this.renderCreatingEquipment();
    }

    const equipmentsData = await getThings(
      `/api/get_5e_character_equipments/${this.general_id}`
    );

    this.equipmentData = equipmentsData;

    this.domComponent.append(
      createElement("div", { style: "align-self: center;" }, "Equipment"),
      createElement("br"),
      createElement(
        "div",
        {
          style: "display: flex; align-items: center;",
        },
        [
          createElement("small", { style: "margin-right: 115px;" }, "Name"),
          createElement("small", { style: "margin-right: 20px;" }, "Quantity"),
          createElement("small", {}, "Weight"),
        ]
      ),
      createElement("br"),
      ...(await this.renderEquipmentsElems()),
      createElement(
        "div",
        {
          style:
            "display: flex; align-items: center; justify-content: space-between",
        },
        [
          createElement("a", { style: "align-self: flex-start;" }, "+", {
            type: "click",
            event: this.toggleCreating,
          }),
          createElement("div", { style: "display: flex;" }, [
            createElement(
              "div",
              { style: "margin-right: 5px;" },
              "Total Weight:"
            ),
            createElement(
              "div",
              { id: "total-equipment-weight" },
              this.calculateTotalWeight()
            ),
          ]),
        ]
      )
    );
  };
}
