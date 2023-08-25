import Clock from "../components/Clock.js";
import { getThings, postThing } from "../lib/apiUtils.js";
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
    const clockData = await getThings(`/api/get_clocks/${projectId}`);
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
    const resData = await postThing("/api/add_clock", {
      title: "New Clock",
      current_time_in_milliseconds: 0,
      project_id: projectId,
    });
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
