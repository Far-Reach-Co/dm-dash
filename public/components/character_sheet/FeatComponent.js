import { deleteThing, getThings, postThing } from "../../lib/apiUtils.js";
import getDataByQuery from "../../lib/getDataByQuery.js";
import createElement from "../createElement.js";
import renderLoadingWithMessage from "../loadingWithMessage.js";

// load features for suggestions on input
let featSuggestions = [];
fetch("/lib/data/5e-srd-features.json")
  .then((res) => res.json())
  .then((data) => {
    featSuggestions = [...featSuggestions, ...data];
  });
// add traits
fetch("/lib/data/5e-srd-traits.json")
  .then((res) => res.json())
  .then((data) => {
    featSuggestions = [...featSuggestions, ...data];
  });

export default class FeatComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className =
      "cp-info-container-column cp-info-container-pulsate"; // pulsate before content has loaded
    this.domComponent.style = "max-width: 100%;";
    this.general_id = props.general_id;

    this.newLoading = false;

    this.featComponents = [];

    this.render();
  }

  toggleNewLoading = () => {
    this.newLoading = !this.newLoading;
    this.render();
  };

  removeItem = (id) => {
    this.featComponents = this.featComponents.filter((item) => item.id != id);
    this.render();
  };

  newFeat = async (e) => {
    e.preventDefault();
    this.toggleNewLoading();

    const featData = await postThing("/api/add_5e_character_feat", {
      general_id: this.general_id,
      type: "Class",
      title: "New Feat/Trait",
      description: "Write description here...",
    });
    if (featData) {
      const elem = createElement("div");
      const featComponent = new SingleFeatComponent({
        parentRemoveItem: this.removeItem,
        domComponent: elem,
        renderTypeSelectOptions: this.renderTypeSelectOptions,
        id: featData.id,
        type: featData.type,
        title: featData.title,
        description: featData.description,
      });
      // save the components
      this.featComponents.push(featComponent);
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
        type
      );
      if (currentType && currentType === type) elem.selected = true;
      typeList.push(elem);
    });
    return typeList;
  };

  renderFeatElems = async () => {
    // check if we have some components instantiated already
    if (this.featComponents.length) {
      return this.featComponents.map((item) => item.domComponent);
    }

    const featsData = await getThings(
      `/api/get_5e_character_feats/${this.general_id}`
    );
    this.domComponent.className = "cp-info-container-column"; // set container styling to not include pulsate animation after loading
    if (!featsData.length) return [createElement("small", {}, "None...")];

    return featsData.map((item) => {
      const elem = createElement("div");
      const featComponent = new SingleFeatComponent({
        parentRemoveItem: this.removeItem,
        domComponent: elem,
        renderTypeSelectOptions: this.renderTypeSelectOptions,
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
      });
      // save the components
      this.featComponents.push(featComponent);

      return elem;
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
        {
          style:
            "display: flex; flex: 1; align-items: center; justify-content: center; position: relative; margin-bottom: var(--main-distance);",
        },
        [
          createElement("div", { class: "special-font" }, "Feats and Traits"),
          createElement(
            "div",
            {
              style:
                "position: absolute; right: 0; top: 0; display: flex; flex-direction: column;",
            },
            [
              createElement(
                "a",
                { style: "font-size: small; margin-bottom: 5px;" },
                "+ Expand all",
                {
                  type: "click",
                  event: () => {
                    this.featComponents.forEach((item) => item.show());
                  },
                }
              ),
              createElement(
                "a",
                { style: "font-size: small;" },
                "- Collapse all",
                {
                  type: "click",
                  event: () => {
                    this.featComponents.forEach((item) => item.hide());
                  },
                }
              ),
            ]
          ),
        ]
      ),
      createElement("hr"),
      ...(await this.renderFeatElems()),
      createElement(
        "a",
        { style: "align-self: flex-start;", title: "Create a new feat/trait" },
        "+",
        {
          type: "click",
          event: this.newFeat,
        }
      )
    );
  };
}

class SingleFeatComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.parentRemoveItem = props.parentRemoveItem;
    this.renderTypeSelectOptions = props.renderTypeSelectOptions;
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
      return createElement("a", { style: "font-size: small;" }, "- Collapse", {
        type: "click",
        event: this.toggleHide,
      });
    } else {
      return createElement("a", { style: "font-size: small;" }, "+ Expand", {
        type: "click",
        event: this.toggleHide,
      });
    }
  };

  renderDescriptionOrHidden = () => {
    if (this.hidden) {
      return createElement("div", { style: "display: none;" }, "");
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
            postThing(`/api/edit_5e_character_feat/${this.id}`, {
              description: e.target.value,
            });
          },
        }
      );
    }
  };

  saveAllFeatInfo = () => {
    const titleInput = document.getElementById(`feat-title-input-${this.id}`);
    const descriptionInput = document.getElementById(
      `feat-description-input-${this.id}`
    );
    this.title = titleInput.value;
    this.description = descriptionInput.value;
    // save to db
    postThing(`/api/edit_5e_character_feat/${this.id}`, {
      title: titleInput.value,
      description: descriptionInput.value,
    });
  };

  populateFeatInfoWithSuggestion = (item) => {
    const titleInput = document.getElementById(`feat-title-input-${this.id}`);
    const descriptionInput = document.getElementById(
      `feat-description-input-${this.id}`
    );
    titleInput.value = item.name;
    descriptionInput.value = item.desc.join("");
  };

  resetFeatInfoToCurrentValues = () => {
    const titleInput = document.getElementById(`feat-title-input-${this.id}`);
    const descriptionInput = document.getElementById(
      `feat-description-input-${this.id}`
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
        e.target.value
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
          ]
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
        }
      )
    );
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    // dynamically create suggestion divs on document body
    this.renderSuggestionElem();

    this.domComponent.append(
      createElement(
        "div",
        {
          style: "display: flex; flex-direction: column; position: relative;",
        },
        [
          createElement(
            "div",
            {
              style:
                "display: flex; margin-bottom: 5px; align-items: center; justify-content: space-between;",
            },
            [
              createElement(
                "div",
                {
                  style:
                    "display: flex; align-items: center; justify-content: center;",
                },
                [
                  createElement(
                    "input",
                    {
                      class: "cp-input-gen",
                      id: `feat-title-input-${this.id}`,
                      style: "color: var(--orange2)",
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
                          postThing(`/api/edit_5e_character_feat/${this.id}`, {
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
                    ]
                  ),
                  createElement(
                    "div",
                    {
                      style:
                        "color: var(--red1); margin-left: var(--main-distance); cursor: pointer;",
                      title: "Remove feat/trait",
                    },
                    "ⓧ",
                    {
                      type: "click",
                      event: async (e) => {
                        e.preventDefault();
                        if (
                          window.confirm(
                            `Are you sure you want to delete ${this.title}`
                          )
                        ) {
                          await deleteThing(
                            `/api/remove_5e_character_feat/${this.id}`
                          );
                          this.parentRemoveItem(this.id);
                        }
                      },
                    }
                  ),
                ]
              ),
              this.renderHideFeatButton(),
            ]
          ),
          createElement(
            "select",
            {
              class: "select-option-small",
              style: "margin-bottom: 5px;",
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
                postThing(`/api/edit_5e_character_feat/${this.id}`, {
                  type: e.target.value,
                });
              },
            }
          ),
          this.renderDescriptionOrHidden(),
          createElement("hr"),
        ]
      )
    );
  };
}
