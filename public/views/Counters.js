import Counter from "../components/Counter.js";
import createElement from "../lib/createElement.js";
import state from "../lib/state.js";

export default class CountersView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";
    this.render();
  }

  getCounters = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/get_counters/${state.currentProject.id}`,
        {
          headers: {
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      if (res.status === 200) {
        state.counters = data;
        return data;
      } else throw new Error();
    } catch (err) {
      console.log(err);
    }
  };

  newCounter = async () => {
    if (!state.counters) return;
    try {
      const res = await fetch(`${window.location.origin}/api/add_counter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user_id: state.user.id,
          project_id: state.currentProject.id,
          title: `My Counter ${state.counters.length + 1}`,
          current_count: 1,
        }),
      });
      await res.json();
      if (res.status === 201) {
        this.render();
      } else throw new Error();
    } catch (err) {
      window.alert("Failed to create new counter...");
      console.log(err);
    }
  };

  renderCounterElems = async () => {
    const counterData = await this.getCounters();
    const map = counterData.map((counter) => {
      // create element
      const elem = createElement("div", {
        id: `counter-component-${counter.id}`,
      });

      new Counter({
        domComponent: elem,
        parentRender: this.render,
        id: counter.id,
        title: counter.title,
        currentCount: counter.current_count,
        projectId: counter.project_id,
      });

      return elem;
    });

    if (map.length) return map;
    else return [createElement("div", {}, "None...")];
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    // append
    this.domComponent.append(
      createElement("button", { style: "align-self: flex-end;" }, "+ Counter", {
        type: "click",
        event: this.newCounter,
      }),
      createElement("h1", { style: "align-self: center;" }, "Counters"),
      createElement("br"),
      ...(await this.renderCounterElems())
    );
  };
}
