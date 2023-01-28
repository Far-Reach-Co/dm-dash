import Counter from "../components/Counter.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import createElement from "../lib/createElement.js";
import state from "../lib/state.js";

export default class CountersView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";
    this.render();
  }

  newCounter = async () => {
    if (!state.counters) return;

    await postThing("/api/add_counter", {
      user_id: state.user.id,
      project_id: state.currentProject.id,
      title: `My Counter ${state.counters.length + 1}`,
      current_count: 1,
    })
  };

  renderCounterElems = async () => {
    const counterData = await getThings(
      `/api/get_counters/${state.currentProject.id}`
    );
    if (counterData) state.counters = counterData;
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
      createElement("button", { class: "new-btn" }, "+ Counter", {
        type: "click",
        event: async () => {
          await this.newCounter();
          this.render();
        },
      }),
      createElement("hr"),
      ...(await this.renderCounterElems())
    );
  };
}
