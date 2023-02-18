import { deleteThing, getThings, postThing } from "./apiUtils.js";
import createElement from "./createElement.js";
import renderLoadingWithMessage from "./loadingWithMessage.js";

export default class FeatComponent {
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

  newFeat = async (e) => {
    this.toggleNewLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if (formProps.type === "None") formProps.type = null;
    formProps.general_id = this.general_id;
    await postThing("/api/add_5e_character_feat", formProps);
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
          style: "margin-right: 10px;",
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
    const featsData = await getThings(
      `/api/get_5e_character_feats/${this.general_id}`
    );
    if (!featsData.length)
      return [createElement("small", {}, "None...")];

    return featsData.map((item) => {
      return createElement(
        "div",
        {
          style: "display: flex; flex-direction: column;",
        },
        [
          createElement("div", { style: "display: flex; margin-bottom: 5px;" }, [
            createElement(
              "input",
              {
                class: "cp-input-gen",
                style: "color: var(--orange2)",
                name: "title",
                value: item.title ? item.title : "",
              },
              null,
              {
                type: "focusout",
                event: (e) => {
                  e.preventDefault();
                  postThing(`/api/edit_5e_character_feat/${item.id}`, {
                    title: e.target.value,
                  });
                },
              }
            ),
            createElement(
              "div",
              {
                style:
                  "color: var(--red1); margin-left: 10px; cursor: pointer;",
              },
              "ⓧ",
              {
                type: "click",
                event: (e) => {
                  e.preventDefault();
                  if (
                    window.confirm(
                      `Are you sure you want to delete ${item.title}`
                    )
                  ) {
                    deleteThing(`/api/remove_5e_character_feat/${item.id}`);
                    e.target.parentElement.parentElement.remove();
                  }
                },
              }
            ),
          ]),
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
              ...this.renderTypeSelectOptions(item.type),
            ],
            {
              type: "change",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_feat/${item.id}`, {
                  type: e.target.value,
                });
              },
            }
          ),
          createElement(
            "textarea",
            {
              class: "cp-input-gen input-small",
              style: "height: 100px;",
              name: "description",
            },
            item.description ? item.description : "",
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_feat/${item.id}`, {
                  description: e.target.value,
                });
              },
            }
          ),
          createElement("hr")
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
      return this.renderCreatingFeat();
    }

    this.domComponent.append(
      createElement(
        "div",
        { style: "align-self: center;" },
        "Feats and Traits"
      ),
      createElement("br"),
      ...(await this.renderFeatElems()),
      createElement("a", { style: "align-self: flex-start;" }, "+", {
        type: "click",
        event: this.toggleCreating,
      })
    );
  };
}
