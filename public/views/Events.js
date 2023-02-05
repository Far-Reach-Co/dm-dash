import { getThings } from "../lib/apiUtils.js";
import createElement from "../lib/createElement.js";
import state from "../lib/state.js";

export default class EventsView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.searchTerm = "";
    this.limit = state.config.queryLimit;
    this.offset = 0;

    this.render();
  }

  renderEventElems = async () => {
    let endpoint = `/api/get_events/${state.currentProject.id}/${this.limit}/${this.offset}`;

    let eventsList = await getThings(endpoint);
    console.log(eventsList);
    console.log(state.currentProject.id);
    if (!eventsList) return (eventsList = [createElement("div", {}, "None")]);

    return eventsList.map((event) => {
      const elem = createElement(
        "div",
        {
          style: "display: flex; flex-direction: row; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--blue); padding: 5px;",
        },
        [
          createElement("div", { style: "" }, [event.title]),
          createElement(
            "small",
            {},
            new Date(event.date_created).toLocaleDateString("en-US", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })
          ),
          // createElement("div", { class: "description" }, event.description),
          // createElement("br")
        ]
      );

      return elem;
    });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    // append
    this.domComponent.append(
      createElement("hr"),
      createElement(
        "small",
        { style: "align-self: center;" },
        "* Events are generated from activity such as items moving to a new location"
      ),
      createElement("br"),
      createElement("br"),
      ...(await this.renderEventElems()),
      createElement("br"),
      createElement("br"),
      createElement("a", { style: "align-self: center;" }, "More", {
        type: "click",
        event: async (e) => {
          this.offset += state.config.queryOffset;
          e.target.before(...(await this.renderEventElems()));
        },
      })
    );
  };
}
