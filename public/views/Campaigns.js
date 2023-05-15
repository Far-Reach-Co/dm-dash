import Campaign from "../components/Campaign.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import createElement from "../lib/createElement.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import state from "../lib/state.js";
import { tipBox } from "../lib/tipBox.js";

export default class CampaignsView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.newCampaignLoading = false;

    this.render();
  }

  toggleLoadingNewCampaign = () => {
    this.newCampaignLoading = !this.newCampaignLoading;
    this.render();
  };

  newCampaign = async () => {
    this.toggleLoadingNewCampaign();
    await postThing("/api/add_table_view", {
      project_id: state.currentProject.id,
    });
    this.toggleLoadingNewCampaign();
  };

  getCampaignElements = async () => {
    const campaignData = await getThings(
      `/api/get_table_views/${state.currentProject.id}`
    );

    return campaignData.map((campaign) => {
      const campaignComponentDomElement = createElement("div");
      new Campaign({
        domComponent: campaignComponentDomElement,
        id: campaign.id,
        title: campaign.title,
        dateCreated: campaign.date_created,
      });

      return campaignComponentDomElement;
    });
  };

  renderAddButtonOrNull = () => {
    if (state.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else
      return createElement("div", {}, [
        createElement(
          "button",
          {
            class: "new-btn",
            title: "Create a new campaign with virtual table",
          },
          "+ Campaign",
          {
            type: "click",
            event: this.newCampaign,
          }
        ),
        createElement(
          "div",
          { class: "hint" },
          "*Create new campaign with virtual table"
        ),
      ]);
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.newCampaignLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage(
          "Please wait while we prepare your campaign..."
        )
      );
    }

    // append
    this.domComponent.append(
      createElement("h1", { class: "projects-view-title" }, "Campaigns"),
      createElement("hr", { class: "special-hr" }),
      this.renderAddButtonOrNull(),
      createElement("hr"),
      tipBox(
        "A campaign provides a real-time virtual table where users can upload and manipulate images to use as a visual aid for their game.",
        "/assets/peli/small/peli_question_small.png",
        false
      ),
      createElement("br"),
      createElement(
        "div",
        {
          style:
            "display: flex; flex: 1; align-items: flex-end; flex-wrap: wrap-reverse;",
        },
        [
          createElement(
            "div",
            { style: "margin-right: var(--main-distance);" },
            tipBox(
              "The current features only allow Managers to manipulate the map and grid layers of the table while other players may only move the images on the object-layer.",
              "/assets/peli/small/peli_dm_small.png",
              true
            )
          ),
          createElement(
            "div",
            { style: "display: flex; flex: 1; flex-direction: column;" },
            [...(await this.getCampaignElements())]
          ),
        ]
      )
    );
  };
}
