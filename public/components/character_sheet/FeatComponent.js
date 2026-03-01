import getDataByQuery from "../../lib/getDataByQuery.js";
import createElement from "../../lib/salt-lib/createElement.js";
import Component from "../../lib/salt-lib/Component.js";
import renderLoadingWithMessage from "../loadingWithMessage.js";
import {
  getSheet,
  insertSheetItem,
  readSheetArraySection,
  removeSheetItem,
  sortByNumericId,
  updateSheetItem,
} from "../../lib/sheetApi.js";

// load features for suggestions on input
let featSuggestions = [];
fetch("/lib/data/2014/5e-srd-features.json")
  .then((res) => res.json())
  .then((data) => {
    featSuggestions = [...featSuggestions, ...data];
  });
// add traits
fetch("/lib/data/2014/5e-srd-traits.json")
  .then((res) => res.json())
  .then((data) => {
    featSuggestions = [...featSuggestions, ...data];
  });

export default class FeatComponent extends Component {
  constructor(props = {}) {
    super({
      domElem: props.domElem || createElement("div"),
      autoRender: false,
    });

    this.domElem.className =
      "cp-info-container-column cp-info-container-pulsate"; // pulsate before content has loaded
    this.domElem.style = "max-width: 100%;";
    this.general_id = props.general_id;

    this.newLoading = false;

    this.featElements = [];

    this.render();
  }

  toggleNewLoading = () => {
    this.newLoading = !this.newLoading;
    this.render();
  };

  removeItem = (id) => {
    this.featElements = this.featElements.filter((item) => item.id != id);
    this.render();
  };

  newFeat = async (e) => {
    e.preventDefault();
    this.toggleNewLoading();

    const featData = await insertSheetItem(this.general_id, "feats", {
      type: "Class",
      title: "New Feat/Trait",
      description: "Write description here...",
    });
    if (featData) {
      // Force a fresh fetch so we don't depend on legacy add endpoint response shape.
      this.featElements = [];
    }
    this.toggleNewLoading();
  };

  renderTypeSelectOptions = (currentType) => {
    const types = ["Class", "Race", "Other"];
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

  renderFeatElems = async () => {
    // check if we have some components instantiated already
    if (this.featElements.length) {
      return this.featElements.map((item) => item.domElem);
    }

    const sheetData = await getSheet(this.general_id);
    const featsData = sortByNumericId(readSheetArraySection(sheetData, "feats"));
    this.domElem.className = "cp-info-container-column"; // set container styling to not include pulsate animation after loading
    if (!featsData.length) return [createElement("small", {}, "None...")];

    return featsData.map((item) => {
      const elem = createElement("div");
      const featElement = new SingleFeatComponent({
        parentRemoveItem: this.removeItem,
        domElem: elem,
        renderTypeSelectOptions: this.renderTypeSelectOptions,
        general_id: this.general_id,
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
      });
      // save the components
      this.featElements.push(featElement);

      return elem;
    });
  };

  render = async () => {
    if (this.newLoading) {
      return [renderLoadingWithMessage("Loading...")];
    }

    return [
      createElement(
        "div",
        {
          class:
            "d-flex align-items-center justify-content-center position-relative mb-3",
          style: "flex: 1;",
        },
        [
          createElement("div", { class: "special-font" }, "Feats and Traits"),
          createElement(
            "div",
            {
              class: "position-absolute d-flex flex-column",
              style: "right: 0; top: 0;",
            },
            [
              createElement("a", { class: "font-small mb-1" }, "+ Expand all", {
                type: "click",
                event: () => {
                  this.featElements.forEach((item) => item.show());
                },
              }),
              createElement("a", { class: "font-small" }, "- Collapse all", {
                type: "click",
                event: () => {
                  this.featElements.forEach((item) => item.hide());
                },
              }),
            ],
          ),
        ],
      ),
      createElement("hr"),
      ...(await this.renderFeatElems()),
      createElement(
        "a",
        { class: "align-self-start", title: "Create a new feat/trait" },
        "+",
        {
          type: "click",
          event: this.newFeat,
        },
      ),
    ];
  };
}

class SingleFeatComponent extends Component {
  constructor(props = {}) {
    super({
      domElem: props.domElem || createElement("div"),
      autoRender: false,
    });

    this.parentRemoveItem = props.parentRemoveItem;
    this.renderTypeSelectOptions = props.renderTypeSelectOptions;
    this.general_id = props.general_id;
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.type = props.type;

    this.hidden = false;

    this.render();
  }

  hide = () => {
    this.hidden = true;
    this.render();
  };

  show = () => {
    this.hidden = false;
    this.render();
  };

  toggleHide = () => {
    this.hidden = !this.hidden;
    this.render();
  };

  renderHideFeatButton = () => {
    if (!this.hidden) {
      return createElement("a", { class: "font-small" }, "- Collapse", {
        type: "click",
        event: this.toggleHide,
      });
    } else {
      return createElement("a", { class: "font-small" }, "+ Expand", {
        type: "click",
        event: this.toggleHide,
      });
    }
  };

  renderDescriptionOrHidden = () => {
    if (this.hidden) {
      return createElement("div", { class: "d-none" }, "");
    } else {
      return createElement(
        "textarea",
        {
          class: "cp-input-gen input-small",
          id: `feat-description-input-${this.id}`,
          name: "description",
        },
        this.description ? this.description : "",
        {
          type: "focusout",
          event: (e) => {
            e.preventDefault();
            // local
            this.description = e.target.value;
            // db
            updateSheetItem(this.general_id, "feats", this.id, {
              description: e.target.value,
            });
          },
        },
      );
    }
  };

  saveAllFeatInfo = () => {
    const titleInput = document.getElementById(`feat-title-input-${this.id}`);
    const descriptionInput = document.getElementById(
      `feat-description-input-${this.id}`,
    );
    this.title = titleInput.value;
    this.description = descriptionInput.value;
    // save to db
    updateSheetItem(this.general_id, "feats", this.id, {
      title: titleInput.value,
      description: descriptionInput.value,
    });
  };

  populateFeatInfoWithSuggestion = (item) => {
    const titleInput = document.getElementById(`feat-title-input-${this.id}`);
    const descriptionInput = document.getElementById(
      `feat-description-input-${this.id}`,
    );
    titleInput.value = item.name;
    descriptionInput.value = item.desc.join("");
  };

  resetFeatInfoToCurrentValues = () => {
    const titleInput = document.getElementById(`feat-title-input-${this.id}`);
    const descriptionInput = document.getElementById(
      `feat-description-input-${this.id}`,
    );
    titleInput.value = this.title;
    descriptionInput.value = this.description;
  };

  resetAndHideFeatSuggestions() {
    const suggElem = document.getElementById(`suggestions-feats-${this.id}`);
    suggElem.innerHTML = "";
    suggElem.appendChild(renderLoadingWithMessage());
    suggElem.style.display = "none";
  }

  showFeatSuggestions = (e) => {
    const suggElem = document.getElementById(`suggestions-feats-${this.id}`);
    suggElem.style.display = "block";
    // suggestion position relative the current component
    // Get the bounding box of the target element
    const rect = e.target.getBoundingClientRect();
    // Set the position of the suggestion element
    suggElem.style.top = rect.bottom + window.scrollY + "px"; // You can add an offset here
    suggElem.style.left = rect.left + window.scrollX + "px"; // You can add an offset here

    if (featSuggestions.length) {
      // clear
      suggElem.innerHTML = "";
      // get suggestions form data
      const searchSuggestionsList = getDataByQuery(
        featSuggestions,
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
                this.populateFeatInfoWithSuggestion(item);
              },
            },
            {
              type: "mousedown",
              event: (e) => {
                e.preventDefault();
                this.populateFeatInfoWithSuggestion(item);
                // save feat info to local state and db
                this.saveAllFeatInfo();
                // hide
                this.resetAndHideFeatSuggestions();
              },
            },
          ],
        );
        suggElem.appendChild(elem);
      }
    }
  };

  renderSuggestionElem = () => {
    document.body.appendChild(
      createElement(
        "div",
        { class: "suggestions", id: `suggestions-feats-${this.id}` },
        renderLoadingWithMessage(),
        {
          type: "mouseout",
          event: (e) => {
            e.preventDefault();
            if (e.target.childNodes.length) {
              this.resetFeatInfoToCurrentValues();
            }
          },
        },
      ),
    );
  };

  render = async () => {
    // dynamically create suggestion divs on document body
    this.renderSuggestionElem();

    return [
      createElement(
        "div",
        {
          class: "d-flex flex-column position-relative",
        },
        [
          createElement(
            "div",
            {
              class: "d-flex mb-1 align-items-center justify-content-between",
            },
            [
              createElement(
                "div",
                {
                  class: "d-flex align-items-center justify-content-center",
                },
                [
                  createElement(
                    "input",
                    {
                      class: "cp-input-gen text-orange",
                      id: `feat-title-input-${this.id}`,
                      name: "title",
                      value: this.title ? this.title : "",
                    },
                    null,

                    [
                      {
                        type: "focusin",
                        event: (e) => {
                          e.preventDefault();
                          this.showFeatSuggestions(e);
                        },
                      },
                      {
                        type: "focusout",
                        event: (e) => {
                          e.preventDefault();
                          // hide suggestions
                          this.resetAndHideFeatSuggestions();
                          // update local state
                          this.title = e.target.value;
                          // update db state
                          updateSheetItem(this.general_id, "feats", this.id, {
                            title: e.target.value,
                          });
                        },
                      },
                      {
                        type: "input",
                        event: (e) => {
                          e.preventDefault();
                          this.showFeatSuggestions(e);
                        },
                      },
                    ],
                  ),
                  createElement(
                    "div",
                    {
                      class: "text-red cursor-pointer red-x ms-3",
                      title: "Remove feat/trait",
                    },
                    "ⓧ",
                    {
                      type: "click",
                      event: async (e) => {
                        e.preventDefault();
                        const confirmed = await window.customConfirm(
                          `Are you sure you want to delete ${this.title}`,
                          { confirmText: "Delete", danger: true },
                        );
                        if (!confirmed) return;

                        const removed = await removeSheetItem(
                          this.general_id,
                          "feats",
                          this.id,
                        );
                        if (!removed) return;
                        this.parentRemoveItem(this.id);
                      },
                    },
                  ),
                ],
              ),
              this.renderHideFeatButton(),
            ],
          ),
          createElement(
            "select",
            {
              class: "select-option-small mb-1",
              id: "type",
              name: "type",
            },
            [
              createElement("option", { value: "None" }, "None"),
              ...this.renderTypeSelectOptions(this.type),
            ],
            {
              type: "change",
              event: (e) => {
                e.preventDefault();
                // local
                this.type = e.target.value;
                // db
                updateSheetItem(this.general_id, "feats", this.id, {
                  type: e.target.value,
                });
              },
            },
          ),
          this.renderDescriptionOrHidden(),
          createElement("hr"),
        ],
      ),
    ];
  };
}
