import createElement from "./createElement.js";
import renderSpinner from "./spinner.js";

export default function renderLoadingWithMessage(message) {
  return createElement(
    "div",
    {
      style:
        "align-self: center; display: flex; flex-direction: column; align-items: center;",
    },
    [createElement("h2", {}, message), renderSpinner()]
  );
}

window.renderLoadingWithMessage = renderLoadingWithMessage;
