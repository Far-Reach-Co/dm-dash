import createElement from "../lib/createElement.js";
import state from "../lib/state.js";
import editButtonOrNull from "../lib/editButtonOrNull.js";

export default class Calendar {
  constructor(props) {
    // domcomp
    this.domComponent = props.domComponent;
    this.domComponent.className = "component";
    this.parentComponentRender = props.parentComponentRender;
    // values
    this.id = props.id;
    this.projectId = props.projectId;
    this.year = props.year;
    this.currentMonthId = props.currentMonthId;
    this.currentDay = props.currentDay;
    this.title = props.title;
    this.months = props.months;
    this.daysOfTheWeek = props.daysOfTheWeek;
    // render views
    this.edit = false;
    this.open = false;
    // open navigation views
    this.monthBeingViewed = this.calculateCurrentMonth();
    this.yearBeingViewed = this.year;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
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
    if (!this.months.length) return { title: "unknown-month" };
    return this.months.filter((month) => {
      if (this.currentMonthId) return month.id === this.currentMonthId;
      else return month.index === 1;
    })[0];
  };

  updateCalendar = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if (formProps.title) formProps.title = formProps.title.trim();
    const res = await fetch(
      `${window.location.origin}/api/edit_calendar/${this.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formProps),
      }
    );
  };

  removeCalendar = async () => {
    const res = await fetch(
      `${window.location.origin}/api/remove_calendar/${this.id}`,
      {
        method: "DELETE",
        headers: {
          "x-access-token": `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (res.status === 204) {
      // window.alert(`Deleted ${this.title}`)
    } else {
      window.alert("Failed to delete calendar...");
    }
  };

  newMonth = async () => {
    try {
      const res = await fetch(`${window.location.origin}/api/add_month`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          calendar_id: this.id,
          index: this.months.length + 1,
          title: `Month(${this.months.length + 1})`,
          number_of_days: 30,
        }),
      });
      const data = await res.json();
      if (res.status === 201) {
        this.months.push(data);
      } else throw new Error();
    } catch (err) {
      window.alert("Failed to create new month...");
      console.log(err);
    }
  };

  newDay = async () => {
    try {
      const res = await fetch(`${window.location.origin}/api/add_day`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          calendar_id: this.id,
          index: this.daysOfTheWeek.length + 1,
          title: `Day(${this.daysOfTheWeek.length + 1})`,
        }),
      });
      const data = await res.json();
      if (res.status === 201) {
        this.daysOfTheWeek.push(data);
      } else throw new Error();
    } catch (err) {
      window.alert("Failed to create new day...");
      console.log(err);
    }
  };

  removeMonth = async (monthId) => {
    const res = await fetch(
      `${window.location.origin}/api/remove_month/${monthId}`,
      {
        method: "DELETE",
        headers: {
          "x-access-token": `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (res.status === 204) {
      // window.alert(`Deleted ${this.title}`)
    } else {
      // window.alert("Failed to delete month...");
    }
  };

  removeDay = async (dayId) => {
    const res = await fetch(
      `${window.location.origin}/api/remove_day/${dayId}`,
      {
        method: "DELETE",
        headers: {
          "x-access-token": `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (res.status === 204) {
      // window.alert(`Deleted ${this.title}`)
    } else {
      // window.alert("Failed to delete day...");
    }
  };

  updateMonths = async () => {
    const monthUpdateSuccessList = [];

    await Promise.all(
      this.months.map(async (month) => {
        try {
          const res = await fetch(
            `${window.location.origin}/api/edit_month/${month.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-access-token": `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                title: month.title,
                index: month.index,
                number_of_days: month.number_of_days,
              }),
            }
          );
          const data = await res.json();
          monthUpdateSuccessList.push(data);
        } catch (err) {
          console.log(err);
          // alert("Failed to update month...");
          this.parentComponentRender();
        }
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
        try {
          const res = await fetch(
            `${window.location.origin}/api/edit_day/${day.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-access-token": `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                title: day.title,
                index: day.index,
              }),
            }
          );
          const data = await res.json();
          dayUpdateSuccessList.push(data);
        } catch (err) {
          console.log(err);
          // alert("Failed to update day...");
          this.parentComponentRender();
        }
      })
    );
    const successListSortedByIndex = dayUpdateSuccessList.sort(
      (a, b) => a.index - b.index
    );
    this.daysOfTheWeek = successListSortedByIndex;
  };

  handleDayClicked = async (dayNumber) => {
    // dont let non-editors use this
    if (state.currentProject.isEditor === false) return;

    dayNumber = parseInt(dayNumber);
    // updated UI
    this.currentMonthId = this.monthBeingViewed.id;
    this.currentDay = dayNumber;
    this.render();
    // then send data call
    try {
      const res = await fetch(
        `${window.location.origin}/api/edit_calendar/${this.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            current_day: dayNumber,
            current_month_id: this.monthBeingViewed.id,
          }),
        }
      );
    } catch (err) {
      console.log(err);
      // window.alert("Failed to update current day...");
    }
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
          { style: "display: inline-block; margin-right: 10px;" },
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
          this.removeDay(day.id);
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
      await this.newDay();
      this.render();
    });
    mainDiv.append(addBtn);
    // done
    const doneBtn = createElement("button", {}, "Done");
    doneBtn.addEventListener("click", async () => {
      await this.updateDays();
      this.manageDays = false;
      this.render();
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
          { style: "display: inline-block; margin-right: 10px;" },
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
          { for: "number_of_days", style: "margin-right: 10px;" },
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
          this.removeMonth(month.id);
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
      await this.newMonth();
      this.render();
    });
    mainDiv.append(addBtn);
    // done
    const doneBtn = createElement("button", {}, "Done");
    doneBtn.addEventListener("click", async () => {
      await this.updateMonths();
      this.manageMonths = false;
      this.render();
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
        { type: "submit", style: "margin-top: 10px;" },
        "Done"
      ),
    ]);
    form.addEventListener("submit", async (e) => {
      await this.updateCalendar(e);
      this.manageCalendar = false;
      this.render();
    });

    this.domComponent.appendChild(form);
  };

  renderEdit = async () => {
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
      style: "margin-bottom: 10px;",
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
      this.parentComponentRender();
    });
    const removeButton = createElement(
      "button",
      { class: "btn-red" },
      "Remove Calendar"
    );
    removeButton.addEventListener("click", async () => {
      if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
        await this.removeCalendar();
        this.toggleEdit();
        this.domComponent.remove();
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
    const arrowButtonLeft = createElement("button", {}, "<");
    arrowButtonLeft.addEventListener("click", () => {
      this.monthBeingViewed = previousMonth;
      this.render();
    });
    const arrowButtonRight = createElement("button", {}, ">");
    arrowButtonRight.addEventListener("click", () => {
      this.monthBeingViewed = nextMonth;
      this.render();
    });

    const calendarContainer = createElement("div", {});
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
            state.currentProject.isEditor === false
              ? "non-clickable-day"
              : "clickable-day"
          }`,
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

    this.domComponent.append(title, monthYear);
    if (previousMonth) {
      this.domComponent.append(arrowButtonLeft);
    }
    if (nextMonth) {
      this.domComponent.append(arrowButtonRight);
    }
    this.domComponent.append(
      createElement("br"),
      calendarContainer,
      createElement("br"),
      closeButton
    );
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    // edit
    if (this.edit) {
      return this.renderEdit();
    }
    // open
    if (this.open) {
      return this.renderOpen();
    }

    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        await editButtonOrNull(this.title, this.toggleEdit),
        createElement("img", {
          src: "../assets/calendar.svg",
          width: 30,
          height: 30,
        }),
      ]),
      createElement(
        "div",
        { class: "current-date" },
        `${this.calculateCurrentDayOfTheWeek()}, ${this.currentDay} of ${
          this.calculateCurrentMonth().title
        } in the year ${this.year}`
      ),
      createElement("button", {}, "Open", {
        type: "click",
        event: () => {
          this.open = true;
          this.render();
        },
      })
    );
  };
}
