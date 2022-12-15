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
        `${window.location.origin}/api/get_projects/${state.user.id}`
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: state.user.id,
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

  render = async () => {
    this.domComponent.innerHTML = "";
    // add project button
    const newProjectButton = createElement(
      "button",
      { style: "align-self: flex-end;" },
      "+ Project"
    );
    newProjectButton.addEventListener("click", this.newProject);
    this.domComponent.appendChild(newProjectButton);

    const title = createElement(
      "h1",
      { class: "projects-view-title" },
      "Choose your project"
    );
    this.domComponent.appendChild(title);
    this.domComponent.appendChild(createElement("hr"));

    const projectData = await this.getProjects();
    projectData.forEach((project) => {
      // create element
      const projectComponentElement = createElement("div", {
        id: `project-component-${project.id}`,
      });
      // append
      this.domComponent.appendChild(projectComponentElement);
      // instantiate javascript
      new Project({
        domComponent: projectComponentElement,
        id: project.id,
        title: project.title,
        dateCreated: project.date_created,
        parentRender: this.render,
        navigate: this.navigate,
      });
    });
  };
}
