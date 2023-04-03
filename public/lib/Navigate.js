import { getThings } from "./apiUtils.js";
import capitalizeFirstLetter from "./capitalizeFirstLetter.js";
import state from "./state.js";

export default class Navigate {
  constructor(props) {
    this.appRender = props.appRender;
    // this.previousRoutes = [];
    this.currentRoute = null;

    window.addEventListener("popstate", (e) => {
      const route = e.state;
      this.currentRoute = route;
      this.appRender();
    });
  }

  getDisplayTitle(route) {
    let displayTitle = capitalizeFirstLetter(route.title);
    if (route.params && route.params.content && route.params.content.title) {
      displayTitle = route.params.content.title;
    }
    return displayTitle;
  }

  back = () => {
    history.back();
  };

  navigate = async (route) => {
    if (history.state) route.applicationState = state;
    route.displayTitle = this.getDisplayTitle(route);
    if (!state.currentProject) {
      const searchParams = new URLSearchParams(window.location.search);
      const projectId = searchParams.get("project");
      if (projectId) {
        const projectData = await getThings(`/api/get_project/${projectId}`);
        state.currentProject = {
          id: projectData.id,
          title: projectData.title,
          description: projectData.description,
          dateCreated: projectData.date_created,
          isEditor: projectData.is_editor,
          wasJoined: projectData.was_joined,
          dateJoined: projectData.date_joined,
          projectUserId: projectData.project_user_id,
        };
      }
    }
    let locationString = `${window.location.pathname}?view=${route.title}`;
    if (state.currentProject)
      locationString += `&project=${state.currentProject.id}`;
    if (route.id) locationString += `&id=${route.id}`;
    history.pushState(route, null, locationString);
    this.currentRoute = route;
    this.appRender();
  };
}
