import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import loreTypeSelect from "../lib/loreTypeSelect.js";
import { deleteThing, getThings, postThing } from "../lib/apiUtils.js";
import NoteManager from "./NoteManager.js";
import {
  getPresignedForImageDownload,
  uploadImage,
} from "../lib/imageUtils.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import { renderImageLarge } from "../lib/imageRenderUtils.js";
import characterSelect from "../lib/characterSelect.js";
import locationSelect from "../lib/locationSelect.js";
import itemSelect from "../lib/itemSelect.js";
import RichText from "../lib/RichText.js";

export default class SingleLoreView {
  constructor(props) {
    this.navigate = props.navigate;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.edit = false;
    this.uploadingImage = false;
    this.managing = false;
    this.manageType = "";
    this.manageLoading = false;

    this.init(props);
  }

  init = async (props) => {
    // set params if not from navigation
    var searchParams = new URLSearchParams(window.location.search);
    var contentId = searchParams.get("id");
    if (props.params && props.params.content) {
      this.lore = props.params.content;
    } else this.lore = await getThings(`/api/get_lore/${contentId}`);

    this.render();
  };

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  toggleManaging = (type) => {
    if (type) this.manageType = type;
    this.managing = !this.managing;
    this.render();
  };

  toggleManageLoading = () => {
    this.manageLoading = !this.manageLoading;
    this.render();
  };

  addLoreRelation = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.lore_id = this.lore.id;
    if (Object.values(formProps)[0] != 0) {
      this.toggleManageLoading();
      await postThing(`/api/add_lore_relation`, formProps);
      this.toggleManageLoading();
    }
  };

  renderLoreRelationList = async (type) => {
    const loreRelations = await getThings(
      `/api/get_lore_relations_by_lore/${type}/${this.lore.id}`
    );

    if (!loreRelations.length) return [createElement("small", {}, "None...")];

    return await Promise.all(
      loreRelations.map(async (relation) => {
        let url = "/api";
        let navigateComponentTitle = "";
        switch (type) {
          case "locations":
            url += `/get_location/${relation.location_id}`;
            navigateComponentTitle = "single-location";
            break;
          case "characters":
            url += `/get_character/${relation.character_id}`;
            navigateComponentTitle = "single-character";
            break;
          case "items":
            url += `/get_item/${relation.item_id}`;
            navigateComponentTitle = "single-item";
            break;
        }
        const endpoint = url;
        const item = await getThings(endpoint);
        if (item) {
          if (this.managing) {
            const elem = createElement(
              "div",
              { style: "margin-left: 10px; display: flex;" },
              [
                item.title,
                createElement(
                  "div",
                  {
                    style:
                      "color: var(--red1); margin-left: 10px; cursor: pointer;",
                    title: "Remove connection",
                  },
                  "ⓧ",
                  {
                    type: "click",
                    event: () => {
                      deleteThing(`/api/remove_lore_relation/${relation.id}`);
                      elem.remove();
                    },
                  }
                ),
              ]
            );
            return elem;
          } else {
            const elem = createElement(
              "a",
              {
                class: "small-clickable",
                style: "margin: 3px",
                title: `Navigate to the detail view of this ${type.substring(
                  0,
                  type.length - 1
                )}`,
              },
              item.title,
              {
                type: "click",
                event: () => {
                  this.navigate({
                    title: navigateComponentTitle,
                    id: item.id,
                    sidebar: true,
                    params: { content: item },
                  });
                },
              }
            );
            return elem;
          }
        }
      })
    );
  };

  renderAddSelect = async () => {
    switch (this.manageType) {
      case "locations":
        return await locationSelect();
      case "characters":
        return await characterSelect();
      case "items":
        return await itemSelect();
    }
  };

  renderManaging = async () => {
    if (this.manageLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Please wait while we update your lore...")
      );
    }

    this.domComponent.append(
      createElement("h1", {}, `Manage Lore ${this.manageType}`),
      createElement("hr"),
      createElement("h2", {}, `Current ${this.manageType}`),
      ...(await this.renderLoreRelationList(this.manageType)),
      createElement("hr"),
      createElement("h2", {}, `Add ${this.manageType}`),
      createElement(
        "form",
        {},
        [
          await this.renderAddSelect(),
          createElement("br"),
          createElement("button", { class: "new-btn", type: "submit" }, "Add"),
        ],
        {
          type: "submit",
          event: async (e) => {
            e.preventDefault();
            await this.addLoreRelation(e);
          },
        }
      ),
      createElement("hr"),
      createElement("button", {}, "Done", {
        type: "click",
        event: this.toggleManaging,
      })
    );
  };

  renderLoreType = () => {
    if (this.lore.type) {
      return createElement(
        "small",
        { style: "color: var(--light-gray); margin-left: 5px;" },
        this.lore.type
      );
    } else return createElement("div", { style: "display: none;" });
  };

  toggleUploadingImage = () => {
    this.uploadingImage = !this.uploadingImage;
    this.render();
  };

  saveLore = async (e, description) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      this.toggleUploadingImage();
      const newImage = await uploadImage(
        formProps.image,
        state.currentProject.id,
        this.lore.image_id
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
        this.lore.image_id = newImage.id;
      }
      delete formProps.image;
      this.uploadingImage = false;
    }

    // update UI
    this.lore.title = formProps.title;
    this.lore.description = formProps.description;
    this.lore.type = formProps.type;
    this.toggleEdit();

    await postThing(`/api/edit_lore/${this.lore.id}`, formProps);
  };

  renderRemoveImage = async () => {
    if (this.lore.image_id) {
      const imageSource = await getPresignedForImageDownload(
        this.lore.image_id
      );

      return createElement(
        "div",
        { style: "display: flex; align-items: baseline;" },
        [
          createElement("img", {
            src: imageSource.url,
            width: 100,
            height: "auto",
          }),
          createElement(
            "div",
            {
              style: "color: var(--red1); cursor: pointer;",
              title: "Remove image",
            },
            "ⓧ",
            {
              type: "click",
              event: (e) => {
                e.preventDefault();
                if (
                  window.confirm("Are you sure you want to delete this image?")
                ) {
                  postThing(`/api/edit_lore/${this.lore.id}`, {
                    image_id: null,
                  });
                  deleteThing(
                    `/api/remove_image/${state.currentProject.id}/${this.lore.image_id}`
                  );
                  e.target.parentElement.remove();
                  this.lore.image_id = null;
                }
              },
            }
          ),
        ]
      );
    } else return createElement("div", { style: "visibility: none;" });
  };

  renderEdit = async () => {
    if (this.uploadingImage) {
      return this.domComponent.append(
        renderLoadingWithMessage("Uploading your image...")
      );
    }

    const richText = new RichText({
      value: this.lore.description,
    });

    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("div", {}, "Type Select (Optional)"),
          loreTypeSelect(null, this.lore.type),
          createElement("br"),
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.lore.title,
          }),
          createElement("br"),
          createElement("label", { for: "description" }, "Description"),
          richText,
          createElement("br"),
          createElement(
            "label",
            { for: "image", class: "file-input" },
            "Add/Change Image"
          ),
          await this.renderRemoveImage(),
          createElement("input", {
            id: "image",
            name: "image",
            type: "file",
            accept: "image/*",
          }),
          createElement("br"),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: (e) => {
            e.preventDefault();
            this.saveLore(e, richText.children[1].innerHTML);
          },
        }
      )
    );
  };

  renderManageButtonOrNull = (type) => {
    if (state.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else {
      return createElement(
        "a",
        {
          class: "small-clickable",
          style: "align-self: flex-end;",
          title: `Open manage menu to add/remove connections for ${type}`,
        },
        "Manage",
        {
          type: "click",
          event: () => this.toggleManaging(type),
        }
      );
    }
  };

  renderEditButtonOrNull = () => {
    if (state.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else {
      return createElement(
        "a",
        {
          class: "small-clickable",
          style: "margin-left: 3px;",
          title: "Open edit utility",
        },
        "Edit",
        {
          type: "click",
          event: this.toggleEdit,
        }
      );
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    if (this.managing) {
      return this.renderManaging();
    }

    const noteManagerElem = createElement("div");
    new NoteManager({
      domComponent: noteManagerElem,
      altEndpoint: `/api/get_notes_by_lore/${this.lore.id}`,
      loreId: this.lore.id,
    });

    const descriptionComponent = createElement("div", { class: "description" });
    descriptionComponent.innerHTML = this.lore.description;

    // append
    this.domComponent.append(
      createElement("div", { class: "single-item-title-container" }, [
        createElement("div", { class: "single-item-title" }, [
          this.lore.title,
          this.renderLoreType(),
        ]),
        createElement("img", {
          src: "/assets/lore.svg",
          width: 45,
          height: 45,
        }),
      ]),
      this.renderEditButtonOrNull(),
      createElement("br"),
      createElement("div", { class: "single-item-main-section" }, [
        createElement("div", {}, [
          createElement(
            "div",
            { class: "single-item-subheading" },
            "Description:"
          ),
          descriptionComponent,
        ]),
        createElement("div", { class: "single-info-box" }, [
          createElement("div", { class: "single-info-box-subheading" }, [
            "Locations",
            this.renderManageButtonOrNull("locations"),
          ]),
          ...(await this.renderLoreRelationList("locations")),
          createElement("br"),
          createElement("div", { class: "single-info-box-subheading" }, [
            "Characters",
            this.renderManageButtonOrNull("characters"),
          ]),
          ...(await this.renderLoreRelationList("characters")),
          createElement("br"),
          createElement("div", { class: "single-info-box-subheading" }, [
            "Items",
            this.renderManageButtonOrNull("items"),
          ]),
          ...(await this.renderLoreRelationList("items")),
          createElement("br"),
        ]),
      ]),
      createElement("br"),
      await renderImageLarge(this.lore.image_id),
      createElement("br"),
      createElement("br"),
      noteManagerElem
    );
  };
}
