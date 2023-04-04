import Campaign from "../components/Campaign.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import createElement from "../lib/createElement.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import state from "../lib/state.js";

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
      return createElement("button", { class: "new-btn" }, "+ Campaign", {
        type: "click",
        event: this.newCampaign,
      });
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
      this.renderAddButtonOrNull(),
      createElement("hr"),
      createElement("br"),
      ...(await this.getCampaignElements())
    );
  };
}
