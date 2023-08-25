import createElement from "./createElement.js";
import listItemTitle from "../lib/listItemTitle.js";
import { deleteThing, postThing } from "../lib/apiUtils.js";
import renderLoadingWithMessage from "../lib/loadingWithMessage.js";
import modal from "./modal.js";

export default class Calendar {
  constructor(props) {
    // domcomp
    this.domComponent = props.domComponent;

    // values
    this.id = props.id;
    this.projectId = props.projectId;
    this.projectAuth = props.projectAuth;
    this.year = props.year;
    this.currentMonthId = props.currentMonthId;
    this.currentDay = props.currentDay;
    this.title = props.title;
    this.months = props.months;
    this.daysOfTheWeek = props.daysOfTheWeek;
    // render views
    this.edit = false;
    this.open = true;
    this.loading = false;
    // open navigation views
    this.monthBeingViewed = this.calculateCurrentMonth();
    this.yearBeingViewed = this.year;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  toggleLoading = () => {
    this.loading = !this.loading;
    this.render();
  };

  calculateCurrentDayOfTheWeek = () => {
    if (!this.daysOfTheWeek.length || !this.months.length) return "unknown-day";
    let totalDaysPassed = 0;
    // get all the days in one year
    let daysInYear = 0;
    this.months.forEach((month) => (daysInYear += month.number_of_days));
    // get and add all days in all years
    totalDaysPassed += daysInYear * (this.year - 1);
    // get and add days from this year
    let daysPassedInThisYear = 0;
    const currentMonthIndex = this.calculateCurrentMonth().index;
    for (const month of this.months) {
      if (month.index === currentMonthIndex) break;
      daysPassedInThisYear += month.number_of_days;
    }
    daysPassedInThisYear += this.currentDay - 1;
    totalDaysPassed += daysPassedInThisYear;
    // get index and return title
    let indexOfCurrentDay = totalDaysPassed % this.daysOfTheWeek.length;
    indexOfCurrentDay++;
    return this.daysOfTheWeek.filter(
      (day) => day.index === indexOfCurrentDay
    )[0].title;
  };

  calculateFirstDayOfTheWeekOfMonth = (currentMonthIndex) => {
    if (!this.daysOfTheWeek.length || !this.months.length) return null;
    let totalDaysPassed = 0;
    // get all the days in one year
    let daysInYear = 0;
    this.months.forEach((month) => (daysInYear += month.number_of_days));
    // get and add all days in all years
    totalDaysPassed += daysInYear * (this.year - 1);
    // get and add days from this year
    let daysPassedInThisYear = 0;
    for (const month of this.months) {
      if (month.index === currentMonthIndex) break;
      daysPassedInThisYear += month.number_of_days;
    }
    totalDaysPassed += daysPassedInThisYear;
    // get day of the week
    let indexOfCurrentDay = totalDaysPassed % this.daysOfTheWeek.length;
    indexOfCurrentDay++;
    return this.daysOfTheWeek.filter(
      (day) => day.index === indexOfCurrentDay
    )[0];
  };

  calculateCurrentMonth = () => {
    return this.months.filter((month) => {
      if (this.currentMonthId) {
        if (month.id === this.currentMonthId) return month;
      }
      return month.index === 1;
    })[0];
  };

  updateCalendar = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if (formProps.title) formProps.title = formProps.title.trim();
    // update UI
    this.title = formProps.title;
    this.year = formProps.year;
    await postThing(`/api/edit_calendar/${this.id}`, formProps);
    // update wyrlds calendar list UI
    const elem = document.querySelector(`#calendar-title-${this.id}`);
    if (elem) {
      elem.innerText = formProps.title;
    }
  };

  newMonth = async () => {
    const data = await postThing("/api/add_month", {
      calendar_id: this.id,
      index: this.months.length + 1,
      title: `Month(${this.months.length + 1})`,
      number_of_days: 30,
    });
    if (data) this.months.push(data);
  };

  newDay = async () => {
    const data = await postThing("/api/add_day", {
      calendar_id: this.id,
      index: this.daysOfTheWeek.length + 1,
      title: `Day(${this.daysOfTheWeek.length + 1})`,
    });
    if (data) this.daysOfTheWeek.push(data);
  };

  updateMonths = async () => {
    const monthUpdateSuccessList = [];

    await Promise.all(
      this.months.map(async (month) => {
        const resData = await postThing(`/api/edit_month/${month.id}`, {
          title: month.title,
          index: month.index,
          number_of_days: month.number_of_days,
        });
        if (resData) monthUpdateSuccessList.push(resData);
      })
    );
    const successListSortedByIndex = monthUpdateSuccessList.sort(
      (a, b) => a.index - b.index
    );

    this.months = successListSortedByIndex;
  };

  updateDays = async () => {
    const dayUpdateSuccessList = [];

    await Promise.all(
      this.daysOfTheWeek.map(async (day) => {
        const resData = await postThing(`/api/edit_day/${day.id}`, {
          title: day.title,
          index: day.index,
        });
        if (resData) dayUpdateSuccessList.push(resData);
      })
    );
    const successListSortedByIndex = dayUpdateSuccessList.sort(
      (a, b) => a.index - b.index
    );
    this.daysOfTheWeek = successListSortedByIndex;
  };

  handleDayClicked = async (dayNumber) => {
    // dont let non-editors use this
    if (!this.projectAuth) return;

    dayNumber = parseInt(dayNumber);
    // updated UI
    this.currentMonthId = this.monthBeingViewed.id;
    this.currentDay = dayNumber;
    this.render();
    // then send data call
    await postThing(`/api/edit_calendar/${this.id}`, {
      current_day: dayNumber,
      current_month_id: this.monthBeingViewed.id,
    });
  };

  renderManageDays = () => {
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
    // done
    const doneBtn = createElement("button", {}, "Done");
    doneBtn.addEventListener("click", async () => {
      this.manageDays = false;
      this.toggleLoading();
      await this.updateDays();
      this.toggleLoading();
    });
    mainDiv.append(doneBtn);
    // append
    this.domComponent.appendChild(mainDiv);
  };

  renderManageMonths = () => {
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
    // done
    const doneBtn = createElement("button", {}, "Done");
    doneBtn.addEventListener("click", async () => {
      this.manageMonths = false;
      this.toggleLoading();
      await this.updateMonths();
      this.toggleLoading();
    });
    mainDiv.append(doneBtn);
    // append
    this.domComponent.appendChild(mainDiv);
  };

  renderManageCalendar = () => {
    const form = createElement("form", {}, [
      createElement("label", { for: "title" }, "Calendar Title"),
      createElement("input", {
        id: "title",
        value: this.title,
        name: "title",
      }),
      createElement("label", { for: "year" }, "Current Year"),
      createElement("input", {
        id: "year",
        name: "year",
        type: "number",
        step: "1",
        min: "1",
        value: this.year,
      }),
      createElement(
        "button",
        { type: "submit", style: "margin-top: var(--main-distance);" },
        "Done"
      ),
    ]);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.manageCalendar = false;
      this.toggleLoading();
      await this.updateCalendar(e);
      this.toggleLoading();
    });

    this.domComponent.appendChild(form);
  };

  renderEdit = async () => {
    if (this.loading) {
      return this.domComponent.append(renderLoadingWithMessage("Loading..."));
    }

    if (this.manageCalendar) {
      return this.renderManageCalendar();
    }
    if (this.manageMonths) {
      return this.renderManageMonths();
    }
    if (this.manageDays) {
      return this.renderManageDays();
    }

    const manageBtnContainer = createElement("div", {
      style: "margin-bottom: var(--main-distance);",
    });

    const manageCalendarBtn = createElement("button", {}, "Manage Calendar");
    manageCalendarBtn.addEventListener("click", async () => {
      // toggle and render
      this.manageCalendar = true;
      this.render();
    });
    const manageMonthsBtn = createElement("button", {}, "Manage Months");
    manageMonthsBtn.addEventListener("click", async () => {
      // toggle and render
      this.manageMonths = true;
      this.render();
    });
    const manageDaysBtn = createElement(
      "button",
      {},
      "Manage Days of the Week"
    );
    manageDaysBtn.addEventListener("click", async () => {
      // toggle and render
      this.manageDays = true;
      this.render();
    });

    manageBtnContainer.append(
      manageCalendarBtn,
      createElement("br"),
      manageMonthsBtn,
      createElement("br"),
      manageDaysBtn,
      createElement("br")
    );

    const doneButton = createElement("button", {}, "Done");
    doneButton.addEventListener("click", async () => {
      // toggle and render
      this.toggleEdit();
    });
    const removeButton = createElement(
      "button",
      { class: "btn-red" },
      "Remove Calendar"
    );
    removeButton.addEventListener("click", () => {
      if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
        deleteThing(`/api/remove_calendar/${this.id}`);
        this.toggleEdit();
        this.domComponent.remove();
        modal.hide();
      }
    });

    this.domComponent.append(
      createElement("div", { class: "component-title" }, `Edit ${this.title}`),
      createElement("br"),
      manageBtnContainer,
      doneButton,
      removeButton
    );
  };

  renderOpen = async () => {
    const previousMonth = this.months.filter(
      (month) => month.index === this.monthBeingViewed.index - 1
    )[0];
    const nextMonth = this.months.filter(
      (month) => month.index === this.monthBeingViewed.index + 1
    )[0];
    const title = createElement(
      "div",
      { class: "component-title" },
      this.title
    );
    const monthYear = createElement(
      "div",
      {},
      `${this.monthBeingViewed.title} ${this.year}`
    );
    const arrowButtonLeft = createElement(
      "button",
      { title: "View the previous month" },
      "<"
    );
    arrowButtonLeft.addEventListener("click", () => {
      this.monthBeingViewed = previousMonth;
      this.render();
    });
    const arrowButtonRight = createElement(
      "button",
      { title: "View the next month" },
      ">"
    );
    arrowButtonRight.addEventListener("click", () => {
      this.monthBeingViewed = nextMonth;
      this.render();
    });

    const calendarContainer = createElement("div", {
      class: "calendar-container",
    });
    calendarContainer.style.display = "grid";
    calendarContainer.style.gridTemplateColumns = `repeat(${
      this.daysOfTheWeek.length ? this.daysOfTheWeek.length : 7
    }, 1fr)`;
    for (const day of this.daysOfTheWeek) {
      const elem = createElement("div", { class: "calendar-box" }, day.title);
      calendarContainer.append(elem);
    }
    const firstDayOfTheWeekOfTheMonth = this.calculateFirstDayOfTheWeekOfMonth(
      this.monthBeingViewed.index
    );
    // input empty days
    for (var i = 1; i < firstDayOfTheWeekOfTheMonth.index; i++) {
      const elem = createElement("div", { class: "calendar-box" }, dayNumber);
      calendarContainer.append(elem);
    }
    // input real days
    for (
      var dayNumber = 1;
      dayNumber <= this.monthBeingViewed.number_of_days;
      dayNumber++
    ) {
      const elem = createElement(
        "div",
        {
          class: `calendar-box ${
            !this.projectAuth ? "non-clickable-day" : "clickable-day"
          }`,
          title: !this.projectAuth ? "" : "Set to current day",
        },
        dayNumber,
        { type: "click", event: () => this.handleDayClicked(elem.innerHTML) }
      );
      if (
        dayNumber === this.currentDay &&
        this.monthBeingViewed.id === this.currentMonthId
      )
        elem.style.backgroundColor = "var(--orange)";
      calendarContainer.append(elem);
    }

    const closeButton = createElement("button", {}, "Close");
    closeButton.addEventListener("click", () => {
      this.open = false;
      this.render();
    });

    this.domComponent.append(
      createElement("div", { class: "d-flex justify-content-between" }, [
        await listItemTitle(
          createElement("h1", { style: "color: var(--green)" }, this.title),
          this.toggleEdit,
          this.projectAuth
        ),
        createElement("img", {
          src: "/assets/calendar.svg",
          width: 30,
          height: 30,
        }),
      ]),
      monthYear
    );
    if (previousMonth) {
      this.domComponent.append(arrowButtonLeft);
    }
    if (nextMonth) {
      this.domComponent.append(arrowButtonRight);
    }
    this.domComponent.append(createElement("br"), calendarContainer);
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    // edit
    if (this.edit) {
      return this.renderEdit();
    }

    // open
    return this.renderOpen();
  };
}

window.Calendar = Calendar;
