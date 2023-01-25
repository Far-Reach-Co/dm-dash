import app from "../App.js";
import capitalizeFirstLetter from "./capitalizeFirstLetter.js";

class Navigate {
  constructor() {
    this.previousRoutes = [];
    this.currentRoute = null;
  }

  previousRoute = () => {
    const previousRoute = this.previousRoutes[this.previousRoutes.length - 1];
    let displayTitle = capitalizeFirstLetter(previousRoute.title);
    if (
      previousRoute.params &&
      previousRoute.params.content &&
      previousRoute.params.content.title
    ) {
      displayTitle = previousRoute.params.content.title;
    }
    previousRoute.displayTitle = displayTitle;
    return previousRoute;
  };

  back = () => {
    this.currentRoute = this.previousRoutes[this.previousRoutes.length - 1];
    this.previousRoutes.pop();
    app.render();
  };

  navigate = ({ title, sidebar, params }) => {
    this.previousRoutes.push(this.currentRoute);
    this.currentRoute = { title, sidebar, params };
    app.render();
  };
}

const navigate = new Navigate();
export default navigate;
