import createElement from "../lib/createElement.js";
import { deleteThing, postThing } from "../lib/apiUtils.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";

export default class CreateCalendar {
  constructor() {
    this.domComponent = document.querySelector("#create-calendar");

    // creation vars
    this.creatingNewMonths = false;
    this.months = [];
    this.creatingNewDaysInWeek = false;
    this.daysOfTheWeek = [];
    this.calendarBeingCreated = null;
    this.monthsCreated = [];
    this.daysCreated = [];
    this.loading = false;

    const searchParams = new URLSearchParams(window.location.search);
    this.projectId = searchParams.get("id");

    this.render();
  }

  toggleLoading = () => {
    this.loading = !this.loading;
    this.render();
  };

  updateCalendarCurrentMonth = async (monthId) => {
    await postThing(`/api/edit_calendar/${this.calendarBeingCreated.id}`, {
      current_month_id: monthId,
    });
  };

  newCalendar = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    const resData = await postThing("/api/add_calendar", {
      project_id: this.projectId,
      title: formProps.title.trim(),
      year: parseInt(formProps.year),
    });
    if (resData) return resData;
    else return null;
  };

  newDay = async () => {
    const data = await postThing("/api/add_day", {
      calendar_id: this.calendarBeingCreated.id,
      index: this.daysOfTheWeek.length + 1,
      title: `Day(${this.daysOfTheWeek.length + 1})`,
    });
    if (data) this.daysOfTheWeek.push(data);
  };

  updateDays = async () => {
    const dayUpdateSuccessList = [];

    await Promise.all(
      this.daysOfTheWeek.map(async (day) => {
        await postThing(`/api/edit_day/${day.id}`, {
          title: day.title,
          index: day.index,
        });
      })
    );
    const successListSortedByIndex = dayUpdateSuccessList.sort(
      (a, b) => a.index - b.index
    );
    this.daysOfTheWeek = successListSortedByIndex;
  };

  renderNewDaysInWeek = () => {
    this.domComponent.innerHTML = "";

    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      `Create days for: ${this.calendarBeingCreated.title}`
    );

    const infoElem = createElement(
      "small",
      {},
      "You can change/manage days in the 'edit' menu for this calendar after creation"
    );

    // setup main form div for each day
    const mainDiv = createElement("div", {});
    this.daysOfTheWeek
      .sort((a, b) => a.index - b.index)
      .forEach((day, index) => {
        const dayContainer = createElement("div", { class: "day-container" });
        // index
        const indexLabel = createElement(
          "div",
          {
            style: "display: inline-block; margin-right: var(--main-distance);",
          },
          `Day ${index + 1}`
        );
        // title
        const titleInput = createElement("input", {
          name: "title",
          value: day.title,
        });
        titleInput.addEventListener("change", (e) => {
          day.title = e.target.value.trim();
        });

        // remove
        const removeDayBtn = createElement(
          "button",
          { class: "btn-red" },
          "Remove Day"
        );
        removeDayBtn.addEventListener("click", () => {
          deleteThing(`/api/remove_day/${day.id}`);
          this.daysOfTheWeek.splice(this.daysOfTheWeek.indexOf(day), 1);
          this.render();
        });
        // move index
        const moveBtnContainer = createElement("div", {
          style: "display: inline-block;",
        });
        const moveUpBtn = createElement("button", { class: "move-btn" }, "▲");
        moveUpBtn.addEventListener("click", async () => {
          // dec
          day.index -= 1;
          if (this.daysOfTheWeek[index - 1])
            this.daysOfTheWeek[index - 1].index += 1;
          this.render();
        });
        const moveDownBtn = createElement("button", { class: "move-btn" }, "▼");
        moveDownBtn.addEventListener("click", async () => {
          // inc
          day.index += 1;
          if (this.daysOfTheWeek[index + 1])
            this.daysOfTheWeek[index + 1].index -= 1;
          this.render();
        });
        // manage render which buttons are available based on index position
        if (day.index === 1 && this.daysOfTheWeek.length > 1) {
          moveBtnContainer.append(moveDownBtn);
        } else if (day.index != this.daysOfTheWeek.length) {
          moveBtnContainer.append(moveDownBtn);
          moveBtnContainer.append(moveUpBtn);
        } else {
          moveBtnContainer.append(moveUpBtn);
        }
        // append
        dayContainer.append(
          indexLabel,
          titleInput,
          removeDayBtn,
          moveBtnContainer
        );
        mainDiv.append(dayContainer);
      });
    // add day
    const addBtn = createElement("button", {}, "+ Day");
    addBtn.addEventListener("click", async () => {
      this.toggleLoading();
      await this.newDay();
      this.toggleLoading();
    });
    mainDiv.append(addBtn);

    const completeButton = createElement("button", {}, "Complete");
    completeButton.addEventListener("click", async () => {
      if (!this.daysOfTheWeek.length)
        return alert("Please create at least one day");

      window.location.href = `/wyrld?id=${this.projectId}`;
    });

    // append
    this.domComponent.append(
      titleOfForm,
      infoElem,
      createElement("br"),
      mainDiv,
      createElement("br"),
      completeButton
    );
  };

  updateMonths = async () => {
    const monthUpdateSuccessList = [];

    await Promise.all(
      this.months.map(async (month) => {
        await postThing(`/api/edit_month/${month.id}`, {
          title: month.title,
          index: month.index,
          number_of_days: month.number_of_days,
        });
      })
    );
    const successListSortedByIndex = monthUpdateSuccessList.sort(
      (a, b) => a.index - b.index
    );
    this.months = successListSortedByIndex;
  };

  newMonth = async () => {
    const data = await postThing("/api/add_month", {
      calendar_id: this.calendarBeingCreated.id,
      index: this.months.length + 1,
      title: `Month(${this.months.length + 1})`,
      number_of_days: 30,
    });
    if (data) this.months.push(data);
  };

  renderNewMonths = async () => {
    this.domComponent.innerHTML = "";

    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      `Create months for: ${this.calendarBeingCreated.title}`
    );

    const infoElem = createElement(
      "small",
      {},
      "You can change/manage months in the 'edit' menu for this calendar after creation"
    );

    // setup main form div for each month
    const mainDiv = createElement("div", {});
    this.months
      .sort((a, b) => a.index - b.index)
      .forEach((month, index) => {
        const monthContainer = createElement("div", {
          class: "month-container",
        });
        // index
        const indexLabel = createElement(
          "div",
          {
            style: "display: inline-block; margin-right: var(--main-distance);",
          },
          `Month ${index + 1}`
        );
        // title
        const titleInput = createElement("input", {
          name: "title",
          value: month.title,
        });
        titleInput.addEventListener("change", (e) => {
          month.title = e.target.value.trim();
        });
        // number of days
        const numOfDaysLabel = createElement(
          "label",
          {
            for: "number_of_days",
            style: "margin-right: var(--main-distance);",
          },
          "Days"
        );
        const numOfDaysInput = createElement("input", {
          name: "number_of_days",
          value: month.number_of_days.toString(),
          type: "number",
          step: "1",
          min: "1",
        });
        numOfDaysInput.addEventListener("change", (e) => {
          month.number_of_days = parseInt(e.target.value);
        });
        // remove
        const removeMonthBtn = createElement(
          "button",
          { class: "btn-red" },
          "Remove Month"
        );
        removeMonthBtn.addEventListener("click", () => {
          deleteThing(`/api/remove_month/${month.id}`);
          this.months.splice(this.months.indexOf(month), 1);
          this.render();
        });
        // move index
        const moveBtnContainer = createElement("div", {
          style: "display: inline-block;",
        });
        const moveUpBtn = createElement("button", { class: "move-btn" }, "▲");
        moveUpBtn.addEventListener("click", async () => {
          // dec
          month.index -= 1;
          if (this.months[index - 1]) this.months[index - 1].index += 1;
          this.render();
        });
        const moveDownBtn = createElement("button", { class: "move-btn" }, "▼");
        moveDownBtn.addEventListener("click", async () => {
          // inc
          month.index += 1;
          if (this.months[index + 1]) this.months[index + 1].index -= 1;
          this.render();
        });
        // manage render which buttons are available based on index position
        if (month.index === 1 && this.months.length > 1) {
          moveBtnContainer.append(moveDownBtn);
        } else if (month.index != this.months.length) {
          moveBtnContainer.append(moveDownBtn);
          moveBtnContainer.append(moveUpBtn);
        } else {
          moveBtnContainer.append(moveUpBtn);
        }
        // append
        monthContainer.append(
          indexLabel,
          titleInput,
          numOfDaysLabel,
          numOfDaysInput,
          removeMonthBtn,
          moveBtnContainer
        );
        mainDiv.append(monthContainer);
      });
    // add month
    const addBtn = createElement("button", {}, "+ Month");
    addBtn.addEventListener("click", async () => {
      this.toggleLoading();
      await this.newMonth();
      this.toggleLoading();
    });
    mainDiv.append(addBtn);

    const completeButton = createElement("button", {}, "Next");
    completeButton.addEventListener("click", async () => {
      if (!this.months.length) return alert("Please create at least one month");
      this.toggleLoading();
      this.creatingNewMonths = false;
      this.creatingNewDaysInWeek = true;
      await this.updateMonths();
      this.toggleLoading();
    });

    // append
    this.domComponent.append(
      titleOfForm,
      infoElem,
      createElement("br"),
      mainDiv,
      createElement("br"),
      completeButton
    );
  };

  renderNewCalendar = async () => {
    this.domComponent.append(
      createElement(
        "small",
        { style: "max-width: 600px;" },
        "First, provide a title and the current year of your new calendar. Next, you can enter a list of months. Last you can enter a list for 'days of the week'."
      ),
      createElement("br"),
      createElement(
        "form",
        {},
        [
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            placeholder: "Wyrld Calendar",
            required: true,
          }),
          createElement("br"),
          createElement("label", { for: "year" }, "Current Year"),
          createElement("input", {
            id: "year",
            name: "year",
            type: "number",
            step: "1",
            min: "1",
            value: "1",
            required: true,
          }),
          createElement("br"),
          createElement("button", { type: "submit" }, "Next"),
        ],
        {
          type: "submit",
          event: async (e) => {
            e.preventDefault();
            this.toggleLoading();
            const newCal = await this.newCalendar(e);
            if (newCal) {
              this.calendarBeingCreated = newCal;
              this.creatingNewMonths = true;
            }
            this.toggleLoading();
          },
        }
      )
    );
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    // keep this first
    if (this.loading) {
      return this.domComponent.append(renderLoadingWithMessage("Loading..."));
    }

    if (this.creatingNewMonths) {
      return this.renderNewMonths();
    }

    if (this.creatingNewDaysInWeek) {
      return this.renderNewDaysInWeek();
    }

    return this.renderNewCalendar();
  };
}

window.CreateCalendar = CreateCalendar;
