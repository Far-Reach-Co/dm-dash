import { deleteThing, postThing } from "../lib/apiUtils.js";
import createElement from "../lib/createElement.js";
import listItemTitle from "../lib/listItemTitle.js";

export default class Counter {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "component";

    this.id = props.id;
    this.title = props.title;
    this.currentCount = props.currentCount;
    this.projectId = props.projectId;

    this.parentRender = props.parentRender;

    this.edit = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  saveCounter = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    this.currentCount = formProps.current_count;
    this.title = formProps.title;

    await postThing(
      `/api/edit_counter/${this.id}`,
      formProps
    );
  };

  renderEdit = async () => {
    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.title,
          }),
          createElement("br"),
          createElement("label", { for: "current_count" }, "Current Count"),
          createElement("input", {
            type: "number",
            id: "current_count",
            name: "current_count",
            value: this.currentCount,
          }),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: (e) => {
            this.saveCounter(e);
            this.toggleEdit();
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Remove Counter", {
        type: "click",
        event: () => {
          if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
            deleteThing(`/api/remove_counter/${this.id}`);
            this.toggleEdit();
            this.domComponent.remove();
          }
        },
      })
    );
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        await listItemTitle(this.title, this.toggleEdit),
        createElement("img", {
          src: "/assets/counter.svg",
          width: 30,
          height: 30,
        }),
      ]),
      createElement("div", { style: "display: flex;" }, [
        createElement("div", { style: "margin-right: 5px;" }, "Current Count:"),
        createElement(
          "div",
          { style: "color: var(--green); margin-right: 20px;" },
          this.currentCount
        ),
        createElement("button", { class: "move-btn" }, "▼", {
          type: "click",
          event: () => {
            this.currentCount--;
            this.render();
            postThing(`/api/edit_counter/${this.id}`, {
              current_count: this.currentCount,
            });
          },
        }),
        createElement("button", { class: "move-btn" }, "▲", {
          type: "click",
          event: () => {
            this.currentCount++;
            this.render();
            postThing(`/api/edit_counter/${this.id}`, {
              current_count: this.currentCount,
            });
          },
        }),
      ]),
      createElement("br"),
      createElement("button", {}, "Edit", {
        type: "click",
        event: this.toggleEdit,
      })
    );
  };
}
