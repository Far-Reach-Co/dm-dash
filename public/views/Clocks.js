import Clock from "../components/Clock.js";
import createElement from "../lib/createElement.js";
import state from "../lib/state.js";

export default class ClocksView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";
    this.render();
  }

  getClocks = async () => {
    var projectId = state.currentProject;
    try {
      const res = await fetch(
        `${window.location.origin}/api/get_clocks/${projectId}`
      );
      const data = await res.json();
      if (res.status === 200) {
        state.clocks = data;
        return data;
      } else throw new Error();
    } catch (err) {
      console.log(err);
    }
  };

  newClock = async () => {
    if (!state.clocks) return;

    var projectId = state.currentProject;
    try {
      const res = await fetch(`${window.location.origin}/api/add_clock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Clock",
          current_time_in_milliseconds: 0,
          project_id: projectId,
        }),
      });
      const data = await res.json()
      if (res.status === 201) {
        const clock = data;
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
        state.clockComponents[`project-${state.currentProject}`].push(newClock);
      } else throw new Error();
    } catch (err) {
      window.alert("Failed to create new clock...");
      console.log(err);
    }
  };

  render = async () => {
    // ********************** STATIC
    this.domComponent.innerHTML = "";
    // new clock button
    const newClockButton = createElement(
      "button",
      { style: "align-self: flex-end;" },
      "+ Clock"
    );
    newClockButton.addEventListener("click", this.newClock);
    this.domComponent.appendChild(newClockButton);

    const clockSaveMessageDiv = createElement(
      "small",
      { style: "align-self: center;" },
      "* Clocks are auto saved every 60 seconds while running, or when stop is pressed"
    );
    this.domComponent.appendChild(clockSaveMessageDiv);
    // ********************* END STATIC

    // ******** CLOCKS
    const fragment = document.createDocumentFragment();
    let clockData = [];
    // try to get clocks from state before rendering new ones
    const clocksByProject =
      state.clockComponents[`project-${state.currentProject}`];
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
        clock.domComponent.className = "clock-component";
        clock.parentRender = this.render;
        clock.render();
        // append
        fragment.appendChild(clockComponentDomElement);
      });
    } else {
      clockData = await this.getClocks();
      // render
      state.clockComponents[`project-${state.currentProject}`] = [];
      clockData.forEach((clock) => {
        // create element
        const clockComponentDomElement = createElement("div", {
          id: `clock-component-${clock.id}`,
        });
        // append
        fragment.appendChild(clockComponentDomElement);
        // instantiate
        const newClock = new Clock({
          domComponent: clockComponentDomElement,
          id: clock.id,
          title: clock.title,
          currentTimeInMilliseconds: clock.current_time_in_milliseconds,
          parentRender: this.render,
        });
        state.clockComponents[`project-${state.currentProject}`].push(newClock);
      });
    }
    // append
    this.domComponent.appendChild(fragment);
  };
}
