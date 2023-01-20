import createElement from "../lib/createElement.js";
import Calendar from "../components/Calendar.js";
import state from "../lib/state.js";

export default class CalendarView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    // creation vars
    this.creatingNewCalendar = false;
    this.creatingNewMonths = false;
    this.months = [];
    this.creatingNewDaysInWeek = false;
    this.daysOfTheWeek = [];
    this.calendarBeingCreated = null;
    this.monthsCreated = [];
    this.daysCreated = [];
    this.loading = false;

    this.render();
  }

  resetCalendarCreation = () => {
    this.creatingNewCalendar = false;
    this.creatingNewMonths = false;
    this.creatingNewDaysInWeek = false;
    this.calendarBeingCreated = null;
    this.monthsCreated = [];
    this.daysCreated = [];
  };

  getCalendars = async () => {
    const projectId = state.currentProject.id;

    try {
      const res = await fetch(
        `${window.location.origin}/api/get_calendars/${projectId}`,
        {
          headers: {
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      if (res.status === 200) {
        state.calendars = data;
        return data;
      } else throw new Error();
    } catch (err) {
      console.log(err);
    }
  };

  updateCalendarCurrentMonth = async (monthId) => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/edit_calendar/${this.calendarBeingCreated.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            current_month_id: monthId,
          }),
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  newCalendar = async (e) => {
    e.preventDefault();
    if (!state.calendars) return;
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    const projectId = state.currentProject.id;
    try {
      const res = await fetch(`${window.location.origin}/api/add_calendar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          title: formProps.title.trim(),
          year: parseInt(formProps.year),
        }),
      });
      const data = await res.json();
      if (res.status === 201) {
        this.loading = false;
        this.creatingNewCalendar = false;
        this.creatingNewMonths = true;
        this.calendarBeingCreated = { title: formProps.title, id: data.id };
        this.render();
      } else throw new Error();
    } catch (err) {
      window.alert("Failed to create new calendar...");
      console.log(err);
      this.creatingNewCalendar = false;
      this.loading = false;
      this.render();
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
          calendar_id: this.calendarBeingCreated.id,
          index: this.daysOfTheWeek.length + 1,
          title: `Day(${this.daysOfTheWeek.length + 1})`,
        }),
      });
      const data = await res.json();
      if (res.status === 201) {
        this.daysOfTheWeek.push(data);
      } else throw new Error();
    } catch (err) {
      // window.alert("Failed to create new day...");
      console.log(err);
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

    const completeButton = createElement("button", {}, "Complete");
    completeButton.addEventListener("click", () => {
      if (!this.daysOfTheWeek.length)
        return alert("Please create at least one day");
      this.updateDays();
      this.resetCalendarCreation();
      this.render();
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
          if (month.index === 1) this.updateCalendarCurrentMonth(month.id);
          this.parentComponentRender();
        }
      })
    );
    const successListSortedByIndex = monthUpdateSuccessList.sort(
      (a, b) => a.index - b.index
    );
    this.months = successListSortedByIndex;
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
          calendar_id: this.calendarBeingCreated.id,
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

    const completeButton = createElement("button", {}, "Next");
    completeButton.addEventListener("click", () => {
      if (!this.months.length) return alert("Please create at least one month");
      this.creatingNewMonths = false;
      this.creatingNewDaysInWeek = true;
      this.updateMonths();
      this.render();
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

  renderNewCalendar = () => {
    if (this.loading) {
      return this.domComponent.append(createElement("div", {}, "Loading..."));
    }

    this.domComponent.append(
      createElement("div", { class: "component-title" }, "Create new calendar"),
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
          event: (e) => {
            this.loading = true;
            this.render();
            this.newCalendar(e);
          },
        }
      ),
      createElement("br"),
      createElement("button", {}, "Cancel", {
        type: "click",
        event: () => {
          this.creatingNewCalendar = false;
          this.render();
        },
      })
    );
  };

  renderCalendarElems = async () => {
    const calendarData = await this.getCalendars();

    const calendarElems = [];
    calendarData.forEach((calendar) => {
      // create element
      const calendarComponentElement = createElement("div", {
        id: `calendar-component-${calendar.id}`,
      });
      // append
      calendarElems.push(calendarComponentElement);

      new Calendar({
        domComponent: calendarComponentElement,
        parentComponentRender: this.render,
        id: calendar.id,
        projectId: calendar.project_id,
        title: calendar.title,
        year: calendar.year,
        currentMonthId: calendar.current_month_id,
        currentDay: calendar.current_day,
        months: calendar.months,
        daysOfTheWeek: calendar.days_of_the_week,
      });
    });

    if (calendarElems.length) {
      return calendarElems;
    } else return [createElement("div", {}, "None...")];
  };

  renderAddButtonOrNull = () => {
    if (state.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else
      return createElement(
        "button",
        { style: "align-self: flex-end;" },
        "+ Calendar",
        {
          type: "click",
          event: () => {
            this.creatingNewCalendar = true;
            this.render();
          },
        }
      );
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creatingNewCalendar) {
      return this.renderNewCalendar();
    }

    if (this.creatingNewMonths) {
      return this.renderNewMonths();
    }

    if (this.creatingNewDaysInWeek) {
      return this.renderNewDaysInWeek();
    }

    // append
    this.domComponent.append(
      this.renderAddButtonOrNull(),
      createElement("h1", { style: "align-self: center;" }, "Calendars"),
      createElement("br"),
      ...(await this.renderCalendarElems())
    );
  };
}
