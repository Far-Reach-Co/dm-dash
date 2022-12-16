import createElement from "../lib/createElement.js";

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

  updateCalendar = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if (formProps.title) formProps.title = formProps.title.trim();
    const res = await fetch(
      `${window.location.origin}/api/edit_calendar/${this.id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formProps),
      }
    );
  };

  removeCalendar = async () => {
    const res = await fetch(
      `${window.location.origin}/api/remove_calendar/${this.id}`,
      {
        method: "DELETE",
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
        headers: { "Content-Type": "application/json" },
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

  removeMonth = async (monthId) => {
    const res = await fetch(
      `${window.location.origin}/api/remove_month/${monthId}`,
      {
        method: "DELETE",
      }
    );
    if (res.status === 204) {
      // window.alert(`Deleted ${this.title}`)
    } else {
      window.alert("Failed to delete month...");
    }
  };

  calculateDayOfTheWeek = () => {
    if (!this.daysOfTheWeek.length || !this.months.length) return "unknown-day";
    let totalDaysPassed = 0;
    // get all the days in one year
    let daysInYear = 0;
    this.months.forEach((month) => (daysInYear += month.number_of_days));
    // get and add all days in all years
    totalDaysPassed += daysInYear * this.year;
    // get and add days from this year
    let daysPassedInThisYear = 0;
    const currentMonthIndex = this.calculateCurrentMonth().index;
    for (const month of this.months) {
      if (month.index === currentMonthIndex) break;
      daysPassedInThisYear += month.number_of_days;
    }
    daysPassedInThisYear += this.currentDay;
    totalDaysPassed += daysPassedInThisYear;

    let indexOfCurrentDay = totalDaysPassed % this.daysOfTheWeek.length;
    if (indexOfCurrentDay === 0) indexOfCurrentDay++;
    return this.daysOfTheWeek.filter(
      (day) => day.index === indexOfCurrentDay
    )[0].title;
  };

  calculateCurrentMonth = () => {
    if (!this.months.length) return { title: "unknown-month" };
    return this.months.filter((month) => month.id === this.currentMonthId)[0];
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
              headers: { "Content-Type": "application/json" },
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
          alert("Failed to update month...");
          this.parentComponentRender();
        }
      })
    );
    const successListSortedByIndex = monthUpdateSuccessList.sort(
      (a, b) => a.index - b.index
    );
    this.months = successListSortedByIndex;
  };

  renderManageMonths = () => {
    // setup main form div for each month
    const mainDiv = createElement("div", {});
    this.months.forEach((month, index) => {
      const monthContainer = createElement("div", { class: "month-container" });
      // index
      const indexLabel = createElement('div',{style: 'display: inline-block; margin-right: 10px;'},`Month ${index + 1}`)
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
        { for: "number_of_days", style: 'margin-right: 10px;' },
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
        await this.updateMonths();
        this.render();
      });
      const moveDownBtn = createElement("button", { class: "move-btn" }, "▼");
      moveDownBtn.addEventListener("click", async () => {
        // inc
        month.index += 1;
        if (this.months[index + 1]) this.months[index + 1].index -= 1;
        await this.updateMonths();
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
      createElement("button", { type: "submit", style: "margin-top: 10px;" }, "Done"),
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
      manageMonthsBtn,
      manageDaysBtn
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

    this.domComponent.append(manageBtnContainer, doneButton, removeButton);
  };

  renderOpen = async () => {
    const title = createElement(
      "div",
      { class: "component-title" },
      this.title
    );
    const monthYear = createElement(
      "div",
      {},
      `${this.calculateCurrentMonth().title} ${this.year}`
    );
    const arrowButtonLeft = createElement("button", {}, "<");
    const arrowButtonRight = createElement("button", {}, ">");

    const calendarContainer = createElement("div", {});
    calendarContainer.style.display = "grid";
    calendarContainer.style.gridTemplateColumns = `repeat(${
      this.daysOfTheWeek.length ? this.daysOfTheWeek.length : 7
    }, 1fr)`;
    for (const day of this.daysOfTheWeek) {
      const elem = createElement(
        "div",
        {
          style:
            "padding: 5px; border: 1px solid var(--main-gray); display: flex; align-items: center; justify-content: center;",
        },
        day.title
      );
      calendarContainer.append(elem);
    }
    for (var i = 1; i < this.calculateCurrentMonth().number_of_days; i++) {
      const elem = createElement(
        "div",
        {
          style:
            "padding: 5px; border: 1px solid var(--main-gray); display: flex; align-items: center; justify-content: center;",
        },
        i
      );
      if (i === this.currentDay) elem.style.backgroundColor = "var(--orange)";
      calendarContainer.append(elem);
    }

    this.domComponent.append(
      title,
      monthYear,
      arrowButtonLeft,
      arrowButtonRight,
      calendarContainer
    );
  };

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

    const titleElem = createElement(
      "div",
      { class: "component-title" },
      this.title
    );

    const infoContainer = createElement(
      "div",
      { class: "current-date" },
      `${this.calculateDayOfTheWeek()} ${this.calculateCurrentMonth().title}-${
        this.currentDay
      }-${this.year}`
    );

    const openButton = createElement("button", {}, "Open");
    openButton.addEventListener("click", () => {
      this.open = true;
      this.render();
    });

    const editButton = createElement("button", {}, "Edit");
    editButton.addEventListener("click", () => {
      this.toggleEdit();
    });

    fragment.append(titleElem, infoContainer, openButton, editButton);

    this.domComponent.appendChild(fragment);
  };
}
