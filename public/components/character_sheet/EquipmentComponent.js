import { deleteThing, getThings, postThing } from "../../lib/apiUtils.js";
import createElement from "../../components/createElement.js";
import renderLoadingWithMessage from "../../components/loadingWithMessage.js";
import getDataByQuery from "../../lib/getDataByQuery.js";
import parseUrlTextContent from "../../components/parseUrlTextContent.js";
import modal from "../../components/modal.js";

// load spells for suggestions on input
let equipmentSuggestions = [];
fetch("/lib/data/5e-srd-equipment.json")
  .then((res) => res.json())
  .then((data) => {
    equipmentSuggestions = data;
  });

export default class EquipmentComponent {
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

  newEquipment = async (e) => {
    e.preventDefault();
    this.toggleNewLoading();

    await postThing("/api/add_5e_character_equipment", {
      general_id: this.general_id,
      title: "New Item",
      description: "",
      quantity: 1,
      weight: 1,
    });

    this.toggleNewLoading();
  };

  populateEquipmentInfoWithSuggestion = async (equipmentItem, item) => {
    // show data inside inputs
    const titleInput = document.getElementById(
      `equipment-title-input-${equipmentItem.id}`,
    );
    const weightInput = document.getElementById(
      `equipment-weight-input-${equipmentItem.id}`,
    );

    titleInput.value = item.name;
    if (item.weight) weightInput.value = item.weight;
  };

  resetEquipmentInfoToCurrentValues = (equipmentItem) => {
    const titleInput = document.getElementById(
      `equipment-title-input-${equipmentItem.id}`,
    );
    const weightInput = document.getElementById(
      `equipment-weight-input-${equipmentItem.id}`,
    );
    if (equipmentItem.title) titleInput.value = equipmentItem.title;
    if (equipmentItem.weight) weightInput.value = equipmentItem.weight;
  };

  saveAllEquipmentInfo = (equipmentItem) => {
    // first save to local state
    const titleInput = document.getElementById(
      `equipment-title-input-${equipmentItem.id}`,
    );
    const weightInput = document.getElementById(
      `equipment-weight-input-${equipmentItem.id}`,
    );

    this.equipmentData[this.equipmentData.indexOf(equipmentItem)].title =
      titleInput.value;
    this.equipmentData[this.equipmentData.indexOf(equipmentItem)].weight =
      weightInput.valueAsNumber;

    // then save to db
    postThing(`/api/edit_5e_character_equipment/${equipmentItem.id}`, {
      title: titleInput.value,
      weight: weightInput.valueAsNumber,
    });
  };

  resetAndHideEquipmentSuggestions(equipmentItem) {
    const suggElem = document.getElementById(
      `suggestions-equipment-${equipmentItem.id}`,
    );
    suggElem.innerHTML = "";
    suggElem.appendChild(renderLoadingWithMessage());
    suggElem.style.display = "none";
  }

  showEquipmentSuggestions = (e, equipmentItem) => {
    const suggElem = document.getElementById(
      `suggestions-equipment-${equipmentItem.id}`,
    );
    suggElem.style.display = "block";
    // suggestion position relative the current component
    // Get the bounding box of the target element
    const rect = e.target.getBoundingClientRect();
    // Set the position of the suggestion element
    suggElem.style.top = rect.bottom + window.scrollY + "px"; // You can add an offset here
    suggElem.style.left = rect.left + window.scrollX + "px"; // You can add an offset here

    if (equipmentSuggestions.length) {
      // clear
      suggElem.innerHTML = "";
      // get suggestions form data
      const searchSuggestionsList = getDataByQuery(
        equipmentSuggestions,
        e.target.value,
      );
      // populate list
      for (const item of searchSuggestionsList) {
        const elem = createElement(
          "div",
          { class: "suggestions-item" },
          item.name,
          [
            {
              type: "mouseover",
              event: (e) => {
                e.preventDefault();
                this.populateEquipmentInfoWithSuggestion(equipmentItem, item);
              },
            },
            {
              type: "mousedown",
              event: (e) => {
                e.preventDefault();
                this.populateEquipmentInfoWithSuggestion(equipmentItem, item);
                // save equipmentItem info to local state and db
                this.saveAllEquipmentInfo(equipmentItem);
                // hide
                this.resetAndHideEquipmentSuggestions(equipmentItem);
              },
            },
          ],
        );
        suggElem.appendChild(elem);
      }
    }
  };

  renderSuggestionElem = (equipmentItem) => {
    document.body.appendChild(
      createElement(
        "div",
        {
          class: "suggestions",
          id: `suggestions-equipment-${equipmentItem.id}`,
        },
        renderLoadingWithMessage(),
        {
          type: "mouseout",
          event: (e) => {
            e.preventDefault();
            if (e.target.childNodes.length) {
              this.resetEquipmentInfoToCurrentValues(equipmentItem);
            }
          },
        },
      ),
    );
  };

  hideHoverInfo = () => {
    const hoverInfoElem = document.getElementById("hover-info");
    hoverInfoElem.style.display = "none";
    hoverInfoElem.innerHTML = "";
  };

  showDescriptionHover = (equipmentItem, e) => {
    const hoverInfoElem = document.getElementById("hover-info");
    hoverInfoElem.style.display = "block";
    const rect = e.target.getBoundingClientRect();
    hoverInfoElem.style.top = rect.bottom + window.scrollY + "px";
    hoverInfoElem.style.left = rect.left + window.scrollX + "px";

    const description = equipmentItem.description || "No description";
    hoverInfoElem.append(
      createElement("div", { style: "max-width: 300px;" }, [
        createElement(
          "h4",
          { class: "mb-1" },
          equipmentItem.title || "Equipment",
        ),
        createElement("div", {}, parseUrlTextContent(description)),
      ]),
    );
  };

  renderEquipmentDescriptionModal = (equipmentItem, index) => {
    return createElement("div", { class: "help-content" }, [
      createElement("h1", {}, equipmentItem.title || "Equipment"),
      createElement("hr"),
      createElement("h2", {}, "Description"),
      createElement(
        "div",
        {
          contenteditable: true,
          class: "equipment-notes",
          name: "description",
          style: "overflow: auto;",
        },
        equipmentItem.description
          ? parseUrlTextContent(equipmentItem.description)
          : "Add a description...",
        {
          type: "focusout",
          event: (e) => {
            e.preventDefault();
            // Update local state
            this.equipmentData[index].description = e.target.textContent;
            // Save to db
            postThing(`/api/edit_5e_character_equipment/${equipmentItem.id}`, {
              description: e.target.textContent,
            });
          },
        },
      ),
    ]);
  };

  renderEquipmentsElems = async () => {
    if (!this.equipmentData.length)
      return [createElement("small", {}, "None...")];

    return this.equipmentData.map((equipmentItem, index) => {
      // dynamically create suggestion divs on document body
      this.renderSuggestionElem(equipmentItem);

      return createElement(
        "div",
        {
          class: "d-flex flex-column",
        },
        [
          createElement(
            "div",
            {
              class: "d-flex align-items-center mb-1",
            },
            [
              createElement(
                "input",
                {
                  class: "cp-input-gen input-small me-1",
                  id: `equipment-title-input-${equipmentItem.id}`,
                  name: "title",
                  value: equipmentItem.title ? equipmentItem.title : "",
                },
                null,
                [
                  {
                    type: "focusin",
                    event: (e) => {
                      e.preventDefault();
                      this.showEquipmentSuggestions(e, equipmentItem);
                    },
                  },
                  {
                    type: "focusout",
                    event: (e) => {
                      e.preventDefault();
                      // hide suggestions
                      this.resetAndHideEquipmentSuggestions(equipmentItem);
                      postThing(
                        `/api/edit_5e_character_equipment/${equipmentItem.id}`,
                        {
                          title: e.target.value,
                        },
                      );
                      this.equipmentData[index].title = e.target.value;
                    },
                  },
                  {
                    type: "input",
                    event: (e) => {
                      e.preventDefault();
                      this.showEquipmentSuggestions(e, equipmentItem);
                    },
                  },
                ],
              ),

              createElement(
                "input",
                {
                  class: "cp-input-gen-short input-small me-1",
                  type: "number",
                  name: "quantity",
                  value: equipmentItem.quantity ? equipmentItem.quantity : "0",
                },
                null,
                {
                  type: "focusout",
                  event: async (e) => {
                    e.preventDefault();
                    await postThing(
                      `/api/edit_5e_character_equipment/${equipmentItem.id}`,
                      {
                        quantity: e.target.valueAsNumber,
                      },
                    );
                    this.equipmentData[index].quantity = e.target.valueAsNumber;
                    // re-calc weight
                    this.updateWeight();
                  },
                },
              ),
              createElement(
                "input",
                {
                  class: "cp-input-gen-short input-small me-1",
                  id: `equipment-weight-input-${equipmentItem.id}`,
                  type: "number",
                  name: "weight",
                  value: equipmentItem.weight ? equipmentItem.weight : "0",
                },
                null,
                {
                  type: "focusout",
                  event: async (e) => {
                    e.preventDefault();
                    await postThing(
                      `/api/edit_5e_character_equipment/${equipmentItem.id}`,
                      {
                        weight: e.target.valueAsNumber,
                      },
                    );
                    this.equipmentData[index].weight = e.target.valueAsNumber;
                    // re-calc weight
                    this.updateWeight();
                  },
                },
              ),
              createElement(
                "img",
                {
                  class: "icon note me-1",
                  src: "/assets/note.svg",
                  title: "View/Edit Description",
                },
                null,
                [
                  {
                    type: "mouseenter",
                    event: (e) => this.showDescriptionHover(equipmentItem, e),
                  },
                  {
                    type: "mouseleave",
                    event: () => this.hideHoverInfo(),
                  },
                  {
                    type: "click",
                    event: () =>
                      modal.show(
                        this.renderEquipmentDescriptionModal(
                          equipmentItem,
                          index,
                        ),
                      ),
                  },
                ],
              ),
              createElement(
                "div",
                {
                  class: "text-red cursor-pointer red-x",
                  title: "Remove equipment",
                },
                "ⓧ",
                {
                  type: "click",
                  event: (e) => {
                    if (
                      window.confirm(
                        `Are you sure you want to delete ${equipmentItem.title}`,
                      )
                    ) {
                      deleteThing(
                        `/api/remove_5e_character_equipment/${equipmentItem.id}`,
                      );
                      e.target.parentElement.remove();
                    }
                  },
                },
              ),
            ],
          ),
        ],
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

    const equipmentsData = await getThings(
      `/api/get_5e_character_equipments/${this.general_id}`,
    );
    this.domComponent.className = "cp-info-container-column"; // set container styling to not include pulsate animation after loading

    this.equipmentData = equipmentsData;

    this.domComponent.append(
      createElement(
        "div",
        { class: "special-font align-self-center" },
        "Equipment",
      ),
      createElement("br"),
      createElement(
        "div",
        {
          class: "d-flex align-items-center",
        },
        [
          createElement("small", { style: "margin-right: 140px;" }, "Name"),
          createElement("small", { class: "me-2" }, "Quantity"),
          createElement("small", {}, "Weight"),
        ],
      ),
      createElement("br"),
      ...(await this.renderEquipmentsElems()),
      createElement(
        "div",
        {
          class: "d-flex align-items-center justify-content-between",
        },
        [
          createElement(
            "a",
            {
              class: "align-self-start",
              title: "Create a new equipment item",
            },
            "+",
            {
              type: "click",
              event: this.newEquipment,
            },
          ),
          createElement("div", { class: "d-flex" }, [
            createElement("div", { class: "me-1" }, "Total Weight:"),
            createElement(
              "div",
              { id: "total-equipment-weight" },
              this.calculateTotalWeight(),
            ),
          ]),
        ],
      ),
    );
  };
}
