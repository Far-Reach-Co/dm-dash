import createElement from "../lib/createElement.js";
import state from "../lib/state.js";

export default class Calendar {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "component";
    this.id = props.id;
    this.projectId = props.projectId;
    this.year = props.year;
    this.currentMonthId = props.currentMonthId;
    this.currentDay = props.currentDay;
    this.title = props.title;
    this.months = props.months;
    this.edit = false;
    this.open = false;

    this.render();
  }

  renderEdit = async () => {};

  renderOpen = async () => {};

  render = () => {
    this.domComponent.innerHTML = "";

    // edit
    if (this.edit) {
      return this.renderEdit();
    }
    // open
    if (this.open) {
      return this.renderOpen();
    }

    const fragment = document.createDocumentFragment();
    // calc
    const monthCalculated = this.months.length
      ? this.months.filter((month) => month.id === this.currentMonthId)[0].title
      : "unknown";

    const titleElem = createElement(
      "div",
      { class: "component-title" },
      this.title
    );

    const infoContainer = createElement(
      "div",
      { class: "current-date" },
      `Current Date: ${monthCalculated}-${this.currentDay}-${this.year}`
    );

    const openButton = createElement("button", {}, "Open");
    openButton.addEventListener("click", () => {
      this.open = true;
      this.render();
    });

    const editButton = createElement("button", {}, "Edit");
    editButton.addEventListener("click", () => {
      this.edit = true;
      this.render();
    });

    fragment.append(titleElem, infoContainer, openButton, editButton);

    this.domComponent.appendChild(fragment);
  };
}
