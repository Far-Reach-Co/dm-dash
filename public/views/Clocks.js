import Clock from "../components/Clock.js";
import { apiGet, apiPost } from "../lib/apiUtils.js";
import { handleApiFailure } from "../lib/apiUiFeedback.js";
import createElement from "./createElement.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import state from "../lib/state.js";

export default class ClocksView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";
    this.render();
  }

  toggleNewClockLoading = () => {
    this.render();
  };

  getClockElements = async () => {
    // ******** CLOCKS
    const clockElements = [];

    var projectId = state.currentProject.id;
    const clockDataResult = await apiGet(`/api/get_clocks/${projectId}`);
    if (!clockDataResult.ok) {
      handleApiFailure(clockDataResult, {
        fallbackMessage: "Failed to load clocks",
        includeResultMessage: true,
      });
    }
    const clockData =
      clockDataResult.ok && Array.isArray(clockDataResult.data)
        ? clockDataResult.data
        : [];
    if (clockData) state.clocks = clockData;
    // render
    clockData.forEach((clock) => {
      // create element
      const clockComponentDomElement = createElement("div", {
        id: `clock-component-${clock.id}`,
      });
      // append
      clockElements.push(clockComponentDomElement);
      // instantiate
      new Clock({
        domComponent: clockComponentDomElement,
        id: clock.id,
        title: clock.title,
        currentTimeInMilliseconds: clock.current_time_in_milliseconds,
        parentRender: this.render,
      });
    });
    return clockElements;
  };

  newClock = async () => {
    if (!state.clocks) return;

    var projectId = state.currentProject.id;
    const resDataResult = await apiPost("/api/add_clock", {
      title: "New Clock",
      current_time_in_milliseconds: 0,
      project_id: projectId,
    });
    if (!resDataResult.ok) {
      handleApiFailure(resDataResult, {
        fallbackMessage: "Failed to create clock",
        includeResultMessage: true,
      });
      return;
    }
    const resData = resDataResult.ok ? resDataResult.data : null;
    if (resData) {
      const clock = resData;
      const clockComponentDomElement = createElement("div", {
        id: `clock-component-${clock.id}`,
      });
      // append
      this.domComponent.appendChild(clockComponentDomElement);
      // instantiate
      const newClock = new Clock({
        domComponent: clockComponentDomElement,
        id: clock.id,
        title: clock.title,
        currentTimeInMilliseconds: clock.current_time_in_milliseconds,
        parentRender: this.render,
      });
    }
  };

  renderAddButtonOrNull = () => {
    if (state.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else
      return createElement(
        "button",
        { class: "new-btn", title: "Create new clock" },
        "+ Clock",
        {
          type: "click",
          event: this.newClock,
        }
      );
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    // append
    this.domComponent.append(
      this.renderAddButtonOrNull(),
      createElement("hr"),
      createElement(
        "small",
        { style: "align-self: center;" },
        "* Clocks are auto saved every 60 seconds while running, or when stop is pressed"
      ),
      createElement("br"),
      ...(await this.getClockElements())
    );
  };
}
