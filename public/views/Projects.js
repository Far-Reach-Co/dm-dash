import Project from "../components/Project.js";
import { getThings, postThing } from "../lib/apiUtils.js";
import createElement from "../lib/createElement.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import state from "../lib/state.js";
import { tipBox } from "../lib/tipBox.js";

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
      title: `My Wyrld ${state.projects.length + 1}`,
    });
    this.toggleLoadingNewProject();
  };

  renderProjectsElems = async () => {
    const projectData = await getThings("/api/get_projects");
    if (projectData) state.projects = projectData;

    let map = projectData
      .sort((a, b) => {
        const aDate = a.date_joined
          ? new Date(a.date_joined)
          : new Date(a.date_created);
        const bDate = b.date_joined
          ? new Date(b.date_joined)
          : new Date(b.date_created);

        return bDate - aDate;
      })
      .map((project) => {
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
          userId: project.user_id,
          imageId: project.image_id,
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
    if (map.length) {
      return map;
    } else return [createElement("div", {}, "None...")];
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
      createElement("h1", { class: "projects-view-title" }, "Wyrlds"),
      createElement("hr", { class: "special-hr" }),
      createElement(
        "div",
        { style: "display: flex; flex-direction: column;" },
        [
          createElement(
            "button",
            { class: "new-btn", title: "Create a new wyrld" },
            "+ Wyrld",
            {
              type: "click",
              event: this.newProject,
            }
          ),
          createElement("div", { class: "hint" }, "*Create a new wyrld"),
        ]
      ),
      createElement("hr"),
      createElement("div", { style: "display: flex;" }, [
        createElement(
          "div",
          { style: "display: flex; flex-direction: column;" },
          [
            tipBox(
              "Invite your friends to join a wyrld by sending them an invite link which can be created in the wyrld settings.",
              "/assets/peli/small/peli_love_small.png",
              true
            ),
            createElement("br"),
            tipBox(
              'Giving a invited-user "edit" access to a wyrld allows them to manage different resources including virtual table tools.',
              "/assets/peli/small/peli_dm_small.png",
              true
            ),
          ]
        ),
        createElement(
          "div",
          {
            style:
              "display: flex; flex-direction: column; flex: 1; margin-left: 10px; margin-top: 5px;",
          },
          [...(await this.renderProjectsElems())]
        ),
      ])
    );
  };
}
