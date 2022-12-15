import createElement from "../lib/createElement.js";
import Calendar from "../components/Calendar.js";
import state from "../lib/state.js";

export default class CalendarView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    // creation vars
    this.creatingNewCalendar = false;
    this.creatingMonths = false;
    this.calendarBeingCreated = null;
    this.monthsCreated = [];

    this.render();
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
          title: formProps.title,
          year: parseInt(formProps.year),
        }),
      });
      const data = await res.json();
      if (res.status === 201) {
        this.creatingNewCalendar = false;
        this.creatingMonths = true;
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
          title: formProps.title,
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

  renderNewMonths = async () => {
    this.domComponent.innerHTML = "";

    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      `Create months for: ${this.calendarBeingCreated.title}`
    );
    this.domComponent.appendChild(titleOfForm);

    const listOfMonthsElem = createElement("div", {}, "Months Created:");
    if (this.monthsCreated.length) {
      this.domComponent.appendChild(listOfMonthsElem);
      this.monthsCreated.forEach((month) => {
        this.domComponent.appendChild(
          createElement(
            "div",
            {},
            `#${month.index} ${month.title} ${month.number_of_days}-Days`
          )
        );
      });
    }

    const infoElem = createElement(
      "small",
      {},
      "*You can change the order of your months in the edit menu for this calendar later"
    );
    this.domComponent.appendChild(infoElem);

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
        min: "1",
        required: true,
      }),
      createElement("button", { type: "submit" }, "Add"),
    ]);
    form.addEventListener("submit", this.newMonth);

    this.domComponent.appendChild(form);

    const completeButton = createElement("button", {}, "Complete");
    completeButton.addEventListener("click", () => {
      this.creatingNewCalendar = false;
      this.creatingMonths = false;
      this.calendarBeingCreated = null;
      this.monthsCreated = [];
      this.render();
    });
    this.domComponent.appendChild(completeButton);
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
    if (this.creatingMonths) {
      return this.renderNewMonths();
    }

    // new clock button
    const newCalendarButton = createElement(
      "button",
      { style: "align-self: flex-end;" },
      "+ Calendar"
    );
    newCalendarButton.addEventListener("click", () => {
      this.creatingNewCalendar = true;
      this.render();
    });
    this.domComponent.appendChild(newCalendarButton);

    const calendarData = await this.getCalendars();

    calendarData.forEach((calendar) => {
      // create element
      const calendarComponentElement = createElement("div", {
        id: `calendar-component-${calendar.id}`,
      });
      // append
      this.domComponent.appendChild(calendarComponentElement);

      new Calendar({
        domComponent: calendarComponentElement,
        id: calendar.id,
        projectId: calendar.project_id,
        title: calendar.title,
        year: calendar.year,
        currentMonthId: calendar.current_month_id,
        currentDay: calendar.current_day,
        months: calendar.months,
      });
    });
  };
}
