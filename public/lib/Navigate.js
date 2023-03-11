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

  navigate = (route) => {
    if (history.state) route.applicationState = state;
    route.displayTitle = this.getDisplayTitle(route);
    history.pushState(route, null, `${window.location.pathname}?view=${route.title}`);
    this.currentRoute = route;
    this.appRender();
  };
}
