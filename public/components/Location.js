import createElement from "../lib/createElement.js";

export default class Location {
  constructor(props) {
    this.domComponent = props.domComponent;

    this.location = props.location;
    this.navigate = props.navigate;
    this.parentRender = props.parentRender;

    this.edit = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  removeLocation = async () => {
    const res = await fetch(
      `${window.location.origin}/api/remove_location/${this.location.id}`,
      {
        method: "DELETE",
      }
    );
    if (res.status === 204) {
      // window.alert(`Deleted ${this.title}`)
    } else {
      window.alert("Failed to delete location...");
    }
  }

  saveLocation = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    try {
      const res = await fetch(
        `${window.location.origin}/api/edit_location/${this.location.id}`,
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
      window.alert("Failed to save location...");
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
            value: this.location.title,
          }),
          createElement("label", { for: "description" }, "Description"),
          createElement(
            "textarea",
            {
              id: "description",
              name: "description",
              cols: "30",
              rows: "7"
            },
            this.location.description
          ),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: async (e) => {
            await this.saveLocation(e);
            this.toggleEdit();
            this.parentRender();
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Remove Location", {
        type: "click",
        event: async () => {
          if (window.confirm(`Are you sure you want to delete ${this.location.title}`)) {
            await this.removeLocation();
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
        this.location.title,
        createElement("img", {
          src: "../assets/location.svg",
          width: 30,
          height: 30,
        }),
      ]),
      createElement("div", { class: "description" }, this.location.description),
      createElement("br"),
      createElement("button", {}, "Open", {
        type: "click",
        event: () =>
          this.navigate({
            title: "single-location",
            sidebar: true,
            params: { location: this.location },
          }),
      }),
      createElement("button", {}, "Edit", {
        type: "click",
        event: this.toggleEdit,
      })
    );
  };
}
