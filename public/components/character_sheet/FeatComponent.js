import { deleteThing, getThings, postThing } from "../../lib/apiUtils.js";
import createElement from "../createElement.js";
import renderLoadingWithMessage from "../loadingWithMessage.js";

export default class FeatComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className =
      "cp-info-container-column cp-info-container-pulsate"; // pulsate before content has loaded
    this.domComponent.style = "max-width: 100%;";
    this.general_id = props.general_id;

    this.newLoading = false;
    this.creating = false;

    this.featComponents = [];

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

  removeItem = (id) => {
    this.featComponents = this.featComponents.filter((item) => item.id != id);
    this.render();
  };

  newFeat = async (e) => {
    this.toggleNewLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if (formProps.type === "None") formProps.type = null;
    formProps.general_id = this.general_id;
    const featData = await postThing("/api/add_5e_character_feat", formProps);
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

  renderCreatingFeat = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new feat"
    );
    const form = createElement("form", {}, [
      createElement("label", { for: "title" }, "Name"),
      createElement("input", {
        id: "title",
        name: "title",
        placeholder: "Name",
        required: true,
      }),
      createElement("label", { for: "type" }, "Type"),
      createElement(
        "select",
        {
          class: "select-option-small",
          id: "type",
          name: "type",
          style: "margin-right: var(--main-distance);",
        },
        [
          createElement("option", { value: "None" }, "None"),
          ...this.renderTypeSelectOptions(),
        ]
      ),
      createElement("label", { for: "description" }, "Description"),
      createElement("textarea", {
        id: "description",
        name: "description",
      }),
      createElement("br"),
      createElement("br"),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.creating = false;
      await this.newFeat(e);
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

    if (this.creating) {
      return this.renderCreatingFeat();
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
          event: this.toggleCreating,
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
          name: "description",
        },
        this.description ? this.description : "",
        {
          type: "focusout",
          event: (e) => {
            e.preventDefault();
            postThing(`/api/edit_5e_character_feat/${this.id}`, {
              description: e.target.value,
            });
          },
        }
      );
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      createElement(
        "div",
        {
          style: "display: flex; flex-direction: column;",
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
                      style: "color: var(--orange2)",
                      name: "title",
                      value: this.title ? this.title : "",
                    },
                    null,
                    {
                      type: "focusout",
                      event: (e) => {
                        e.preventDefault();
                        postThing(`/api/edit_5e_character_feat/${this.id}`, {
                          title: e.target.value,
                        });
                      },
                    }
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
