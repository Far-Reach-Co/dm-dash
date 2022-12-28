import createElement from "../lib/createElement.js";

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

  removeCounter = async () => {
    const res = await fetch(
      `${window.location.origin}/api/remove_counter/${this.id}`,
      {
        method: "DELETE",
      }
    );
    if (res.status === 204) {
      // window.alert(`Deleted ${this.title}`)
    } else {
      window.alert("Failed to delete counter...");
    }
  };

  saveCounter = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);

    try {
      const res = await fetch(
        `${window.location.origin}/api/edit_counter/${this.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formProps),
        }
      );
      await res.json();
      if (res.status === 200) {
      } else throw new Error();
    } catch (err) {
      window.alert("Failed to save counter...");
      console.log(err);
    }
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
          event: async (e) => {
            await this.saveCounter(e);
            this.toggleEdit();
            this.parentRender();
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Remove Counter", {
        type: "click",
        event: async () => {
          if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
            await this.removeCounter();
            this.toggleEdit();
            this.parentRender();
          }
        },
      })
    );
  };

  render = () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        this.title,
        createElement("img", {
          src: "../assets/counter.svg",
          width: 30,
          height: 30,
        }),
      ]),
      createElement("div", {}, `Current Count: ${this.currentCount}`),
      createElement("br"),
      createElement("button", {}, "Edit", {
        type: "click",
        event: this.toggleEdit,
      })
    );
  };
}
