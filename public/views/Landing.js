import RichText from "../lib/RichText.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import createElement from "../lib/createElement.js";
import { renderImageLarge } from "../lib/imageRenderUtils.js";
import state from "../lib/state.js";
import {
  getPresignedForImageDownload,
  uploadImage,
} from "../lib/imageUtils.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import { tipBox } from "../lib/tipBox.js";

export default class LandingView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.navigate = props.navigate;
    this.domComponent.className = "standard-view";
    this.edit = false;
    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  toggleUploadingImage = () => {
    this.uploadingImage = !this.uploadingImage;
    this.render();
  };

  renderMembers = async () => {
    const projectUsers = await getThings(
      `/api/get_project_users_by_project/${state.currentProject.id}`
    );
    if (!projectUsers.length)
      return [createElement("div", { style: "display: none;" })];

    return projectUsers.map((user) => {
      return createElement(
        "div",
        { style: "font-size: small; margin-top: 5px;" },
        user.username
      );
    });
  };

  renderOwner = async () => {
    const projectOwner = await getThings(
      `/api/get_user_by_id/${state.currentProject.userId}`
    );
    if (!projectOwner)
      return [createElement("div", { style: "display: none;" })];

    return createElement(
      "div",
      { style: "font-size: small; margin-top: 5px;" },
      projectOwner.username
    );
  };

  renderRemoveImage = async () => {
    if (state.currentProject.imageId) {
      const imageSource = await getPresignedForImageDownload(
        state.currentProject.imageId
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
              style: "color: var(--red1); cursor: pointer; margin-left: 5px;",
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
                  postThing(`/api/edit_project/${state.currentProject.id}`, {
                    image_id: null,
                  });
                  deleteThing(
                    `/api/remove_image/${state.currentProject.id}/${state.currentProject.imageId}`
                  );
                  e.target.parentElement.remove();
                  state.currentProject.imageId = null;
                }
              },
            }
          ),
        ]
      );
    } else return createElement("div", { style: "visibility: none;" });
  };

  saveProject = async (e, description) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;
    if (formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      this.toggleUploadingImage();
      const newImage = await uploadImage(
        formProps.image,
        state.currentProject.id,
        state.currentProject.imageId
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
        state.currentProject.imageId = newImage.id;
      }
      delete formProps.image;
      this.uploadingImage = false;
    }

    // update UI
    state.currentProject.title = formProps.title;
    state.currentProject.description = formProps.description;
    // update routing history for refresh
    if (history.state) {
      history.state.applicationState.currentProject.title = formProps.title;
      history.state.applicationState.currentProject.description =
        formProps.description;
      history.state.applicationState.currentProject.imageId =
        state.currentProject.imageId;
      history.pushState(history.state, null);
    }
    this.toggleEdit();

    await postThing(`/api/edit_project/${state.currentProject.id}`, formProps);
  };

  renderEdit = async () => {
    if (this.uploadingImage) {
      return this.domComponent.append(
        renderLoadingWithMessage("Uploading your image...")
      );
    }

    const richText = new RichText({
      value: state.currentProject.description,
    });

    this.domComponent.append(
      createElement("h1", {}, "Edit About"),
      createElement("br"),
      createElement("div", { style: "display: flex;" }, [
        createElement("div", { style: "margin-right: var(--main-distance);" }, [
          createElement(
            "form",
            {},
            [
              createElement("label", { for: "title" }, "Title"),
              createElement("input", {
                id: "title",
                name: "title",
                value: state.currentProject.title,
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
              createElement(
                "button",
                { class: "new-btn", type: "submit" },
                "Save"
              ),
            ],
            {
              type: "submit",
              event: (e) => {
                e.preventDefault();
                this.saveProject(e, richText.children[1].innerHTML);
              },
            }
          ),
          createElement("hr"),
          createElement("button", { class: "btn-red" }, "Cancel", {
            type: "click",
            event: this.toggleEdit,
          }),
        ]),
        tipBox(
          "You can add an image that will display below the text, we recommend a general map of your wyrld.",
          "/assets/peli/small/peli_note_small.png",
          true
        ),
      ])
    );
  };

  renderCampaignsList = async () => {
    const campaignData = await getThings(
      `/api/get_table_views/${state.currentProject.id}`
    );
    if (!campaignData) campaignData = [];

    const elemMap = campaignData.map((campaign) => {
      const elem = createElement(
        "a",
        {
          class: "small-clickable",
          style: "margin-top: 5px",
          title: "Open this campaign in new tab",
        },
        campaign.title + " ↗",
        {
          type: "click",
          event: () => {
            localStorage.setItem(
              "current-table-project-id",
              state.currentProject.id
            );
            localStorage.setItem("current-campaign-id", campaign.id);
            window.open("/vtt.html", "_blank").focus();
          },
        }
      );

      return elem;
    });

    if (elemMap.length) return elemMap;
    else
      return [
        createElement("small", { style: "margin-left: 5px;" }, "None..."),
      ];
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
          title: "Edit the title and description of the about tab",
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

    const descriptionComponent = createElement("div", {
      class: "description",
      style: "max-height: max-content;",
    });
    descriptionComponent.innerHTML = state.currentProject.description;

    this.domComponent.append(
      createElement("div", { class: "single-item-title-container" }, [
        createElement("div", { class: "single-item-title" }, [
          state.currentProject.title,
        ]),
      ]),
      this.renderEditButtonOrNull(),
      createElement("br"),
      createElement("div", { class: "single-item-main-section" }, [
        createElement("div", {}, [
          createElement(
            "div",
            { class: "single-item-subheading" },
            "About this wyrld"
          ),
          descriptionComponent,
        ]),
        createElement(
          "div",
          {
            style:
              "display: flex; flex-direction: column; align-items: flex-end;",
          },
          [
            createElement("div", { class: "single-info-box" }, [
              createElement(
                "div",
                { class: "single-info-box-subheading" },
                "Open Campaigns"
              ),
              ...(await this.renderCampaignsList()),
              createElement("br"),
              createElement(
                "div",
                { class: "single-info-box-subheading" },
                "Owner"
              ),
              await this.renderOwner(),
              createElement("br"),
              createElement(
                "div",
                { class: "single-info-box-subheading" },
                "Members"
              ),
              ...(await this.renderMembers()),
              createElement("br"),
            ]),
            createElement("br"),
            tipBox(
              "This page serves to display general information about your wyrld. What do your players need to know before they start?",
              "/assets/peli/small/peli_question_small.png",
              true
            ),
          ]
        ),
      ]),
      createElement("br"),
      await renderImageLarge(state.currentProject.imageId),
      createElement("br")
    );
  };
}
