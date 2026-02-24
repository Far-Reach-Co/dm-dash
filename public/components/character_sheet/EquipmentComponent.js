import { deleteThing, getThings, postThing } from "../../lib/apiUtils.js";
import createElement from "../../components/createElement.js";
import renderLoadingWithMessage from "../../components/loadingWithMessage.js";
import getDataByQuery from "../../lib/getDataByQuery.js";
import parseUrlTextContent from "../../components/parseUrlTextContent.js";
import modal from "../../components/modal.js";
import tooltip from "../../components/Tooltip.js";

// Generate description from structured weapon data
function generateWeaponDescription(item) {
  const parts = [];

  // Weapon type
  if (item.weapon_category && item.weapon_range) {
    parts.push(`${item.weapon_category} ${item.weapon_range} Weapon`);
  }

  // Damage
  if (item.damage) {
    const damageType = item.damage.damage_type?.name || "";
    parts.push(`Damage: ${item.damage.damage_dice} ${damageType}`);
  }

  // Properties
  if (item.properties && item.properties.length > 0) {
    const propNames = item.properties.map((p) => p.name).join(", ");
    parts.push(`Properties: ${propNames}`);
  }

  // Range
  if (item.range) {
    let rangeStr = `Range: ${item.range.normal} ft`;
    if (item.range.long) {
      rangeStr += `/${item.range.long} ft`;
    }
    if (item.throw_range) {
      rangeStr += ` (thrown ${item.throw_range.normal}/${item.throw_range.long} ft)`;
    }
    parts.push(rangeStr);
  }

  // Cost
  if (item.cost) {
    parts.push(`Cost: ${item.cost.quantity} ${item.cost.unit}`);
  }

  return parts.join("\n");
}

// Generate description from structured armor data
function generateArmorDescription(item) {
  const parts = [];

  // Armor type
  if (item.armor_category) {
    parts.push(`${item.armor_category} Armor`);
  }

  // AC
  if (item.armor_class) {
    let acStr = `AC: ${item.armor_class.base}`;
    if (item.armor_class.dex_bonus) {
      if (item.armor_class.max_bonus) {
        acStr += ` + Dex modifier (max ${item.armor_class.max_bonus})`;
      } else {
        acStr += " + Dex modifier";
      }
    }
    parts.push(acStr);
  }

  // Strength requirement
  if (item.str_minimum && item.str_minimum > 0) {
    parts.push(`Strength Required: ${item.str_minimum}`);
  }

  // Stealth disadvantage
  if (item.stealth_disadvantage) {
    parts.push("Stealth: Disadvantage");
  }

  // Cost
  if (item.cost) {
    parts.push(`Cost: ${item.cost.quantity} ${item.cost.unit}`);
  }

  return parts.join("\n");
}

// Generate description from item data when desc field is missing
function generateItemDescription(item) {
  // Check if it's a weapon
  if (item.equipment_category?.index === "weapon" || item.weapon_category) {
    return generateWeaponDescription(item);
  }

  // Check if it's armor
  if (item.equipment_category?.index === "armor" || item.armor_category) {
    return generateArmorDescription(item);
  }

  return null;
}

// load equipment and magic items for suggestions on input
let equipmentSuggestions = [];
Promise.all([
  fetch("/lib/data/2014/5e-srd-equipment.json").then((res) => res.json()),
  fetch("/lib/data/2014/5e-srd-magic-items.json").then((res) => res.json()),
]).then(([equipment, magicItems]) => {
  // Add item type to distinguish between equipment and magic items
  const equipmentWithType = equipment.map((item) => ({
    ...item,
    itemType: "equipment",
  }));
  const magicItemsWithType = magicItems.map((item) => ({
    ...item,
    itemType: "magic-items",
  }));
  equipmentSuggestions = [...equipmentWithType, ...magicItemsWithType];
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

    // Populate description from JSON data if available, or generate from structured data
    let description = null;
    if (item.desc && item.desc.length) {
      description = Array.isArray(item.desc)
        ? item.desc.join("\n\n")
        : item.desc;
    } else {
      // Generate description from structured data (weapons, armor, etc.)
      description = generateItemDescription(item);
    }

    if (description) {
      // Add link to SRD page
      const itemType = item.itemType || "equipment";
      const srdLink = `\n\nView full details: https://farreachco.com/dnd/5e/srd/${itemType}/${item.index}`;
      this.equipmentData[
        this.equipmentData.indexOf(equipmentItem)
      ].description = description + srdLink;
    }
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

    const index = this.equipmentData.indexOf(equipmentItem);
    this.equipmentData[index].title = titleInput.value;
    this.equipmentData[index].weight = weightInput.valueAsNumber;

    // then save to db
    const dataToSave = {
      title: titleInput.value,
      weight: weightInput.valueAsNumber,
    };

    // Include description if it was populated from autofill
    if (this.equipmentData[index].description) {
      dataToSave.description = this.equipmentData[index].description;
    }

    postThing(
      `/api/edit_5e_character_equipment/${equipmentItem.id}?general_id=${this.general_id}`,
      dataToSave,
    );
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

  showDescriptionHover = (equipmentItem, e) => {
    const description = equipmentItem.description || "No description";
    const maxLength = 200;

    // Truncate if too long
    let displayDescription = description;
    let isTruncated = false;
    if (description.length > maxLength) {
      displayDescription = description.substring(0, maxLength) + "...";
      isTruncated = true;
    }

    const contentElements = [
      createElement(
        "h4",
        { class: "mb-1" },
        equipmentItem.title || "Equipment",
      ),
      createElement("div", {}, parseUrlTextContent(displayDescription)),
    ];

    // Add hint if truncated
    if (isTruncated) {
      contentElements.push(
        createElement(
          "small",
          {
            class: "text-grey mt-1",
            style: "display: block; font-style: italic;",
          },
          "Click note icon for full description",
        ),
      );
    }

    tooltip.show({
      content: contentElements,
      event: e,
      maxWidth: 300,
    });
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
            postThing(`/api/edit_5e_character_equipment/${equipmentItem.id}?general_id=${this.general_id}`, {
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
                        `/api/edit_5e_character_equipment/${equipmentItem.id}?general_id=${this.general_id}`,
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
                      `/api/edit_5e_character_equipment/${equipmentItem.id}?general_id=${this.general_id}`,
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
                      `/api/edit_5e_character_equipment/${equipmentItem.id}?general_id=${this.general_id}`,
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
                  class: "icon note me-1 cursor-pointer",
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
                    event: () => tooltip.hide(),
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
                  event: async (e) => {
                    const confirmed = await window.customConfirm(
                      `Are you sure you want to delete ${equipmentItem.title}`,
                      { confirmText: "Delete", danger: true },
                    );
                    if (!confirmed) return;

                    deleteThing(
                      `/api/remove_5e_character_equipment/${equipmentItem.id}?general_id=${this.general_id}`,
                    );
                    e.target.parentElement.remove();
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
