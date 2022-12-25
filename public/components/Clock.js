import createElement from "../lib/createElement.js";
import msToTime from "../lib/msToTime.js";
import state from "../lib/state.js";

export default class Clock {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "component";
    this.parentRender = props.parentRender;
    this.id = props.id;
    this.title = props.title;
    (this.isRunning = false),
      (this.currentTimeInMilliseconds = props.currentTimeInMilliseconds);
    this.runClock = undefined;
    this.runAutoSave = undefined;
    this.edit = false;
    this.runSpeed = 1;
    this.render();
  }

  calculateNowAndRunspeed = () => {
    return Math.floor(Date.now() * this.runSpeed);
  };

  start = () => {
    if (!this.isRunning) {
      this.isRunning = true;
      // get start time
      var startTime =
        this.calculateNowAndRunspeed() - this.currentTimeInMilliseconds;
      // update clock
      this.runClock = setInterval(() => {
        var elapsedTime = this.calculateNowAndRunspeed() - startTime;

        // reset if one day
        if (elapsedTime === 8640000) this.currentTimeInMilliseconds = 0;

        var timeDif = elapsedTime - this.currentTimeInMilliseconds;
        this.currentTimeInMilliseconds += timeDif;
        this.renderDisplayTime();
      }, 100);
      // Auto Save
      this.runAutoSave = setInterval(() => {
        this.saveClock();
      }, 60 * 1000);
    }
  };

  stop = () => {
    clearInterval(this.runClock);
    clearInterval(this.runAutoSave);
    this.isRunning = false;
    this.saveClock();
  };

  reset = () => {
    this.currentTimeInMilliseconds = 0;
  };

  editTitle = (title) => {
    this.title = title.trim();
  };

  toggleEdit = () => {
    this.stop();
    this.edit = !this.edit;
    this.render();
  };

  renderDisplayTime = () => {
    var milliseconds = this.currentTimeInMilliseconds;
    var twentyFourHourTime = msToTime(milliseconds, false);
    var twelveHourTime = msToTime(milliseconds, true);

    this.currentTimeDiv.innerHTML = /*html*/ `<div>${twentyFourHourTime}</div> <div style="color: var(--light-gray);">${twelveHourTime}</div>`;
  };

  saveClock = async () => {
    const res = await fetch(
      `${window.location.origin}/api/edit_clock/${this.id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: this.title,
          current_time_in_milliseconds: this.currentTimeInMilliseconds,
        }),
      }
    );
  };

  removeClock = async () => {
    const res = await fetch(
      `${window.location.origin}/api/remove_clock/${this.id}`,
      {
        method: "DELETE",
      }
    );
    if (res.status === 204) {
      // window.alert(`Deleted ${this.title}`)
    } else {
      window.alert("Failed to delete clock...");
    }
  };

  renderEditClock = () => {
    var milliseconds = this.currentTimeInMilliseconds;
    var time = msToTime(milliseconds, false);
    var valueForInput = time.substring(0, time.length - 2);

    const editTitle = createElement("div", {}, "Edit");

    const titleInput = createElement("input", {
      value: this.title,
    });

    const timeInput = createElement("input", {
      value: valueForInput,
      type: "time",
    });
    timeInput.addEventListener(
      "change",
      (e) => (this.currentTimeInMilliseconds = e.target.valueAsNumber)
    );
    const doneButton = createElement("button", {}, "Done");
    doneButton.addEventListener("click", async () => {
      this.editTitle(titleInput.value);
      await this.saveClock();
      this.toggleEdit();
    });
    const removeButton = createElement(
      "button",
      { class: "btn-red" },
      "Remove Clock"
    );
    removeButton.addEventListener("click", async () => {
      if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
        try {
          await this.removeClock();
          this.domComponent.remove();
          const clocksByProject =
            state.clockComponents[`project-${state.currentProject}`];
          for (var i = 0; i < clocksByProject.length; i++) {
            if (clocksByProject[i].id === this.id) {
              clocksByProject.splice(i, 1);
            }
          }
        } catch (err) {}
        this.toggleEdit();
      }
    });
    const resetButton = createElement("button", {}, "Reset");
    resetButton.addEventListener("click", async () => {
      if (window.confirm(`Are you sure you want to reset ${this.title}`)) {
        this.reset();
        await this.saveClock();
        this.toggleEdit();
      }
    });
    // append
    this.domComponent.append(
      editTitle,
      titleInput,
      timeInput,
      doneButton,
      resetButton,
      removeButton
    );
  };

  render = () => {
    // clear
    this.domComponent.innerHTML = "";
    // if edit clock
    if (this.edit) {
      this.renderEditClock();
      return;
    }

    const titleDiv = createElement("div", { class: "component-title" }, [
      this.title,
      createElement("img", {
        src: "../assets/clock.svg",
        width: 30,
        height: 30,
      }),
    ]);

    const currentTimeDiv = createElement("div", {
      id: `current-time-${this.id}`,
    });

    this.currentTimeDiv = currentTimeDiv;

    const startButton = createElement("button", {}, "Start");
    startButton.addEventListener("click", this.start);

    const stopButton = createElement("button", {}, "Stop");
    stopButton.addEventListener("click", this.stop);

    const editButton = createElement("button", {}, "Edit");
    editButton.addEventListener("click", this.toggleEdit);

    const selectSpeed = createElement("select", { name: "speed" }, [
      createElement("option", { value: 1 }, "--Speed Select--"),
      createElement("option", { value: 1 }, "1"),
      createElement("option", { value: 0.5 }, "1/2"),
      createElement("option", { value: 0.25 }, "1/4"),
      createElement("option", { value: 2 }, "2x"),
      createElement("option", { value: 4 }, "4x"),
      createElement("option", { value: 10 }, "10x"),
      createElement("option", { value: 25 }, "25x"),
      createElement("option", { value: 50 }, "50x"),
      createElement("option", { value: 100 }, "100x"),
    ]);
    selectSpeed.addEventListener("change", (e) => {
      this.stop();
      this.runSpeed = parseFloat(e.target.value);
      this.start();
    });

    // append
    this.domComponent.append(
      titleDiv,
      currentTimeDiv,
      createElement("br"),
      startButton,
      stopButton,
      editButton,
      selectSpeed
    );
    // Display time
    this.renderDisplayTime();
  };
}
