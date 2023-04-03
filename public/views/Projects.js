import Project from "../components/Project.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import createElement from "../lib/createElement.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import state from "../lib/state.js";

export default class ProjectsView {
  constructor(props) {
    this.navigate = props.navigate;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.newProjectLoading = false;

    this.render();
  }

  toggleLoadingNewProject = () => {
    this.newProjectLoading = !this.newProjectLoading;
    this.render();
  };

  newProject = async () => {
    this.toggleLoadingNewProject();
    await postThing("/api/add_project", {
      title: `My Project ${state.projects.length + 1}`,
    });
    this.toggleLoadingNewProject();
  };

  renderProjectsElems = async () => {
    const projectData = await getThings("/api/get_projects");
    if (projectData) state.projects = projectData;

    const map = projectData.map((project) => {
      // create element
      const elem = createElement("div", {
        id: `project-component-${project.id}`,
      });
      // instantiate javascript
      new Project({
        domComponent: elem,
        id: project.id,
        title: project.title,
        description: project.description,
        dateCreated: project.date_created,
        usedDataInBytes: project.used_data_in_bytes,
        isEditor: project.is_editor,
        wasJoined: project.was_joined,
        dateJoined: project.date_joined,
        projectUserId: project.project_user_id,
        projectInvite: project.project_invite,
        parentRender: this.render,
        navigate: this.navigate,
      });
      return elem;
    });
    if (map.length) return map;
    else return [createElement("div", {}, "None...")];
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.newProjectLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Please wait while we prepare your project...")
      );
    }

    // append
    this.domComponent.append(
      // createElement(
      //   "h1",
      //   { class: "projects-view-title" },
      //   "Choose your project"
      //   ),
      //   createElement("hr", { class: "special-hr" }),
      createElement("button", { class: "new-btn" }, "+ Project", {
        type: "click",
        event: this.newProject,
      }),
      createElement("hr"),
      ...(await this.renderProjectsElems())
    );
  };
}
