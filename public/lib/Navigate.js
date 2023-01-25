import app from "../App.js";
import capitalizeFirstLetter from "./capitalizeFirstLetter.js";

class Navigate {
  constructor() {
    // this.previousRoutes = [];
    this.currentRoute = null;

    window.addEventListener("popstate", (e) => {
      const route = e.state
      this.currentRoute = route;
      app.render();
    })
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
    route.displayTitle = this.getDisplayTitle(route);
    history.pushState(route, null, `/dashboard.html?view=${route.title}`);
    this.currentRoute = route;
    app.render();
  };
}

const navigate = new Navigate();
export default navigate;
