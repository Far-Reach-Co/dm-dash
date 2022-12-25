import createElement from "../lib/createElement.js";
import Calendar from "../components/Calendar.js";
import state from "../lib/state.js";

export default class CalendarView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    // creation vars
    this.creatingNewCalendar = false;
    this.creatingNewMOnths = false;
    this.creatingNewDaysInWeek = false;
    this.calendarBeingCreated = null;
    this.monthsCreated = [];
    this.daysCreated = [];

    this.render();
  }

  resetCalendarCreation = () => {
    this.creatingNewCalendar = false;
    this.creatingNewMOnths = false;
    this.creatingNewDaysInWeek = false;
    this.calendarBeingCreated = null;
    this.monthsCreated = [];
    this.daysCreated = [];
  }

  getCalendars = async () => {
    const projectId = state.currentProject;

    try {
      const res = await fetch(
        `${window.location.origin}/api/get_calendars/${projectId}`
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
          headers: { "Content-Type": "application/json" },
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
    const projectId = state.currentProject;
    try {
      const res = await fetch(`${window.location.origin}/api/add_calendar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          title: formProps.title.trim(),
          year: parseInt(formProps.year),
        }),
      });
      const data = await res.json();
      if (res.status === 201) {
        this.creatingNewCalendar = false;
        this.creatingNewMOnths = true;
        this.calendarBeingCreated = { title: formProps.title, id: data.id };
        this.render();
      } else throw new Error();
    } catch (err) {
      window.alert("Failed to create new calendar...");
      console.log(err);
      this.creatingNewCalendar = false;
      this.render();
    }
  };

  newMonth = async (e) => {
    e.preventDefault();
    if (!state.calendars) return;
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    try {
      const res = await fetch(`${window.location.origin}/api/add_month`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendar_id: this.calendarBeingCreated.id,
          index: this.monthsCreated.length + 1,
          title: formProps.title.trim(),
          number_of_days: parseInt(formProps.number_of_days),
        }),
      });
      const data = await res.json();
      if (res.status === 201) {
        if (data.index === 1) {
          await this.updateCalendarCurrentMonth(data.id);
        }
        this.monthsCreated.push(data);
        this.renderNewMonths();
      } else throw new Error();
    } catch (err) {
      window.alert("Failed to create new month...");
      console.log(err);
    }
  };

  newDayInWeek = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    try {
      const res = await fetch(`${window.location.origin}/api/add_day`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendar_id: this.calendarBeingCreated.id,
          index: this.daysCreated.length + 1,
          title: formProps.title.trim()
        }),
      });
      const data = await res.json();
      if (res.status === 201) {
        this.daysCreated.push(data);
        this.renderNewDaysInWeek();
      } else throw new Error();
    } catch (err) {
      window.alert("Failed to create new day...");
      console.log(err);
    }
  }

  renderNewDaysInWeek = () => {
    this.domComponent.innerHTML = "";

    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      `Create days for: ${this.calendarBeingCreated.title}`
    );

    const listOfDaysElems = [];
    const listOfDaysTitle = createElement("div", {}, "Days Created:");
    if (this.daysCreated.length) {
      listOfDaysElems.push(listOfDaysTitle);
      this.daysCreated.forEach((days) => {
        listOfDaysElems.push(
          createElement(
            "div",
            { style: "color: var(--yellow);" },
            `#${days.index} ${days.title}`
          )
        );
      });
    }

    const infoElem = createElement(
      "small",
      {},
      "*You can change/manage days in the 'open' menu for this calendar after creation"
    );

    const form = createElement("form", {}, [
      createElement("label", { for: "title" }, "Title"),
      createElement("input", {
        name: "title",
        placeholder: "Title of day",
        required: true,
      }),
      createElement("button", { type: "submit" }, "Add"),
    ]);
    form.addEventListener("submit", this.newDayInWeek);

    const completeButton = createElement("button", {}, "Complete");
    completeButton.addEventListener("click", () => {
      this.resetCalendarCreation();
      this.render();
    });

    // append
    this.domComponent.append(
      titleOfForm,
      ...listOfDaysElems,
      infoElem,
      form,
      completeButton
    );
  }

  renderNewMonths = async () => {
    this.domComponent.innerHTML = "";

    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      `Create months for: ${this.calendarBeingCreated.title}`
    );
    
    const listOfMonthsElements = [];
    const listOfMonthsTitle = createElement("div", {}, "Months Created:");
    if (this.monthsCreated.length) {
      listOfMonthsElements.push(listOfMonthsTitle);
      this.monthsCreated.forEach((month) => {
        listOfMonthsElements.push(
          createElement(
            "div",
            { style: "color: var(--yellow);" },
            `#${month.index} ${month.title} ${month.number_of_days}-Days`
          )
        );
      });
    }

    const infoElem = createElement(
      "small",
      {},
      "*You can change/manage months in the 'open' menu for this calendar after creation"
    );

    const form = createElement("form", {}, [
      createElement("label", { for: "title" }, "Title"),
      createElement("input", {
        name: "title",
        placeholder: "Title of month",
        required: true,
      }),
      createElement("label", { for: "number_of_days" }, "Number of days"),
      createElement("input", {
        name: "number_of_days",
        placeholder: "1",
        type: "number",
        step: "1",
        min: "1",
        required: true,
      }),
      createElement("button", { type: "submit" }, "Add"),
    ]);
    form.addEventListener("submit", this.newMonth);

    const completeButton = createElement("button", {}, "Complete");
    completeButton.addEventListener("click", () => {
      this.creatingNewMOnths = false;
      this.creatingNewDaysInWeek = true;
      this.render();
    });

    // append
    this.domComponent.append(
      titleOfForm,
      ...listOfMonthsElements,
      infoElem,
      form,
      completeButton
    );
  };

  renderNewCalendar = () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new calendar"
    );
    const form = createElement("form", {}, [
      createElement("label", { for: "title" }, "Title"),
      createElement("input", {
        id: "title",
        name: "title",
        placeholder: "Wyrld Calendar",
        required: true,
      }),
      createElement("label", { for: "year" }, "Starting year"),
      createElement("input", {
        id: "year",
        name: "year",
        type: "number",
        step: "1",
        min: "1",
        value: "1",
        required: true,
      }),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", this.newCalendar);

    const cancelButton = createElement("button", {}, "Cancel");
    cancelButton.addEventListener("click", () => {
      this.creatingNewCalendar = false;
      this.render();
    });

    this.domComponent.append(titleOfForm, form, cancelButton);
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creatingNewCalendar) {
      return this.renderNewCalendar();
    }

    if (this.creatingNewMOnths) {
      return this.renderNewMonths();
    }
    
    if (this.creatingNewDaysInWeek) {
      return this.renderNewDaysInWeek();
    }

    const newCalendarButton = createElement(
      "button",
      { style: "align-self: flex-end;" },
      "+ Calendar"
    );
    newCalendarButton.addEventListener("click", () => {
      this.creatingNewCalendar = true;
      this.render();
    });

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
        daysOfTheWeek: calendar.days_of_the_week
      });
    });

    // append
    this.domComponent.append(
      newCalendarButton,
      createElement("h1", {style: "align-self: center;"}, "Calendars"),
      createElement("br"),
      ...calendarElems
    )
  };
}
