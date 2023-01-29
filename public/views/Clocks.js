import Clock from "../components/Clock.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import createElement from "../lib/createElement.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import state from "../lib/state.js";

export default class ClocksView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";
    this.render();
  }
  
  toggleNewClockLoading = () => {
    this.newClockLoading = !this.newClockLoading;
    this.render();
  };

  getClockElements = async () => {
    // ******** CLOCKS
    let clockData = [];
    const clockElements = [];
    // try to get clocks from state before rendering new ones
    const clocksByProject =
      state.clockComponents[`project-${state.currentProject.id}`];
    if (clocksByProject && clocksByProject.length) {
      clockData = clocksByProject;
      // render
      clockData.forEach((clock) => {
        // create element
        const clockComponentDomElement = createElement("div", {
          id: `clock-component-${clock.id}`,
        });
        // update
        clock.domComponent = clockComponentDomElement;
        clock.domComponent.className = "component";
        clock.parentRender = this.render;
        clock.render();
        // append
        clockElements.push(clockComponentDomElement);
      });
    } else {
      var projectId = state.currentProject.id;
      const clockData = await getThings(`/api/get_clocks/${projectId}`);
      if (clockData) state.clocks = clockData;
      // render
      state.clockComponents[`project-${state.currentProject.id}`] = [];
      clockData.forEach((clock) => {
        // create element
        const clockComponentDomElement = createElement("div", {
          id: `clock-component-${clock.id}`,
        });
        // append
        clockElements.push(clockComponentDomElement);
        // instantiate
        const newClock = new Clock({
          domComponent: clockComponentDomElement,
          id: clock.id,
          title: clock.title,
          currentTimeInMilliseconds: clock.current_time_in_milliseconds,
          parentRender: this.render,
        });
        state.clockComponents[`project-${state.currentProject.id}`].push(
          newClock
        );
      });
    }
    return clockElements;
  };

  newClock = async () => {
    if (!state.clocks) return;
    this.toggleNewClockLoading()

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
      // this.domComponent.appendChild(clockComponentDomElement);
      // instantiate
      const newClock = new Clock({
        domComponent: clockComponentDomElement,
        id: clock.id,
        title: clock.title,
        currentTimeInMilliseconds: clock.current_time_in_milliseconds,
        parentRender: this.render,
      });
      state.clockComponents[`project-${state.currentProject.id}`].push(
        newClock
      );
    }
    this.toggleNewClockLoading()
  };

  renderAddButtonOrNull = () => {
    if (state.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else
      return createElement("button", { class: "new-btn" }, "+ Clock", {
        type: "click",
        event: this.newClock,
      });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.newClockLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage(
          "Please wait while we create your new clock..."
        )
      );
    }

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
