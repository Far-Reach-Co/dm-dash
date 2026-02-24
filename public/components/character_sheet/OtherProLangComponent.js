import createElement from "../../components/createElement.js";
import renderLoadingWithMessage from "../../components/loadingWithMessage.js";
import {
  getSheet,
  insertSheetItem,
  readSheetArraySection,
  removeSheetItem,
  sortByNumericId,
  updateSheetItem,
} from "../../lib/sheetApi.js";

export default class OtherProLangComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className =
      "cp-info-container-column cp-info-container-pulsate"; // pulsate before content has loaded
    this.general_id = props.general_id;

    this.newLoading = false;

    this.render();
  }

  toggleNewLoading = () => {
    this.newLoading = !this.newLoading;
    this.render();
  };

  newOtherProLang = async () => {
    this.toggleNewLoading();
    await insertSheetItem(this.general_id, "otherProLangs", {
      type: null,
      proficiency: "",
    });
    this.toggleNewLoading();
  };

  renderTypeSelectOptions = (currentType) => {
    const types = ["Language", "Weapon", "Armor", "Other"];
    const typeList = [];
    types.forEach((type) => {
      const elem = createElement(
        "option",
        { class: "select-option-small", value: type },
        type,
      );
      if (currentType && currentType === type) elem.selected = true;
      typeList.push(elem);
    });
    return typeList;
  };

  renderOtherProLangElems = async () => {
    const sheetData = await getSheet(this.general_id);
    const otherProLangsData = sortByNumericId(
      readSheetArraySection(sheetData, "otherProLangs"),
    );
    this.domComponent.className = "cp-info-container-column"; // set container styling to not include pulsate animation after loading
    if (!otherProLangsData.length)
      return [createElement("small", {}, "None...")];

    return otherProLangsData.map((item) => {
      return createElement(
        "div",
        {
          class: "d-flex align-items-center justify-content-between mb-1",
        },
        [
          createElement(
            "select",
            {
              class: "select-option-small me-3",
              id: "type",
              name: "type",
            },
            [
              createElement("option", { value: "None" }, "None"),
              ...this.renderTypeSelectOptions(item.type),
            ],
            {
              type: "change",
              event: (e) => {
                e.preventDefault();
                updateSheetItem(this.general_id, "otherProLangs", item.id, {
                  type: e.target.value,
                });
              },
            },
          ),
          createElement(
            "input",
            {
              class: "cp-input-gen input-small",
              name: "name",
              placeHolder: "Proficiency",
              value: item.proficiency ? item.proficiency : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                updateSheetItem(this.general_id, "otherProLangs", item.id, {
                  proficiency: e.target.value,
                });
              },
            },
          ),
          createElement(
            "div",
            {
              class: "text-red cursor-pointer red-x ms-3",
              title: "Remove proficiency",
            },
            "ⓧ",
            {
              type: "click",
              event: async (e) => {
                const confirmed = await window.customConfirm(
                  `Are you sure you want to delete ${
                    item.proficiency ? item.proficiency : "Empty"
                  }`,
                  { confirmText: "Delete", danger: true },
                );
                if (!confirmed) return;

                const removed = await removeSheetItem(
                  this.general_id,
                  "otherProLangs",
                  item.id,
                );
                if (!removed) return;
                e.target.parentElement.remove();
              },
            },
          ),
        ],
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
        "Other Proficiencies & Languages",
      ),
      createElement("br"),
      createElement(
        "div",
        {
          class: "d-flex align-items-center",
        },
        [
          createElement("small", { style: "margin-right: 85px" }, "Type"),
          createElement("small", {}, "Proficiency"),
          createElement("small", {}, ""),
        ],
      ),
      createElement("br"),
      ...(await this.renderOtherProLangElems()),
      createElement(
        "a",
        { class: "align-self-start", title: "Create a new proficiency" },
        "+",
        {
          type: "click",
          event: this.newOtherProLang,
        },
      ),
    );
  };
}
