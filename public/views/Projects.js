import Project from "../components/Project.js";
import createElement from "../lib/createElement.js";
import state from "../lib/state.js";

export default class ProjectsView {
  constructor(props) {
    this.navigate = props.navigate;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";
    this.render();
  }

  getProjects = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/get_projects`, {
          headers: { "x-access-token": `Bearer ${localStorage.getItem("token")}` }
        }
      );
      const data = await res.json();
      if (res.status === 200) {
        state.projects = data;
        return data;
      } else throw new Error();
    } catch (err) {
      console.log(err);
    }
  };

  newProject = async () => {
    if (!state.projects) return;
    try {
      const res = await fetch(`${window.location.origin}/api/add_project`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-access-token": `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({
          title: `My Project ${state.projects.length + 1}`,
        }),
      });
      await res.json();
      if (res.status === 201) {
        this.render();
      } else throw new Error();
    } catch (err) {
      window.alert("Failed to create new project...");
      console.log(err);
    }
  };

  renderProjectsElems = async () => {
    const projectData = await this.getProjects();
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
        dateCreated: project.date_created,
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

    // append
    this.domComponent.append(
      createElement("button", {}, "+ Project", {
        type: "click",
        event: this.newProject,
      }),
      createElement(
        "h1",
        { class: "projects-view-title" },
        "Choose your project"
      ),
      createElement("hr", { class: "special-hr" }),
      ...(await this.renderProjectsElems()),
    );
  };
}
