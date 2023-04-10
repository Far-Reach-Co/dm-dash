import RichText from "../lib/RichText.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import createElement from "../lib/createElement.js";
import state from "../lib/state.js";

export default class LandingView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.navigate = props.navigate;
    this.domComponent.className = "standard-view";
    this.edit = false;
    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  renderMembers = async () => {
    const projectUsers = await getThings(
      `/api/get_project_users_by_project/${state.currentProject.id}`
    );
    if (!projectUsers.length)
      return [createElement("div", { style: "display: none;" })];

    return projectUsers.map((user) => {
      return createElement(
        "div",
        { style: "margin-left: 5px; color: var(--blue6)" },
        user.username
      );
    });
  };

  renderOwner = async () => {
    const projectOwner = await getThings(
      `/api/get_user_by_id/${state.currentProject.userId}`
    );
    if (!projectOwner)
      return [createElement("div", { style: "display: none;" })];

    return createElement(
      "div",
      { style: "margin-left: 5px; color: var(--blue6)" },
      projectOwner.username
    );
  };

  saveProject = async (e, description) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;

    // update UI
    state.currentProject.title = formProps.title;
    state.currentProject.description = formProps.description;
    // update routing history for refresh
    if (history.state) {
      history.state.applicationState.currentProject.title = formProps.title;
      history.state.applicationState.currentProject.description =
        formProps.description;
      history.pushState(history.state, null);
    }
    this.toggleEdit();

    await postThing(`/api/edit_project/${state.currentProject.id}`, formProps);
  };

  renderEdit = () => {
    const richText = new RichText({
      value: state.currentProject.description,
    });

    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: state.currentProject.title,
          }),
          createElement("br"),
          createElement("label", { for: "description" }, "Description (About)"),
          richText,
          createElement("br"),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: (e) => {
            e.preventDefault();
            this.saveProject(e, richText.children[1].innerHTML);
          },
        }
      )
    );
  };

  renderEditButtonOrNull = () => {
    if (state.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else {
      return createElement(
        "a",
        { class: "small-clickable", style: "margin-left: 3px;" },
        "Edit",
        {
          type: "click",
          event: this.toggleEdit,
        }
      );
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    const descriptionComponent = createElement("div", { class: "description" });
    descriptionComponent.innerHTML = state.currentProject.description;

    this.domComponent.append(
      createElement("div", { class: "single-item-title-container" }, [
        createElement("div", { class: "single-item-title" }, [
          state.currentProject.title,
        ]),
      ]),
      this.renderEditButtonOrNull(),
      createElement("br"),
      createElement("div", {}, [
        createElement(
          "div",
          { class: "single-item-subheading" },
          "About this wyrld"
        ),
        descriptionComponent,
      ]),
      createElement("hr"),
      createElement("h1", {}, "Owner"),
      await this.renderOwner(),
      createElement("br"),
      createElement("h1", {}, "Members"),
      ...(await this.renderMembers())
    );
  };
}
