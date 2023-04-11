import createElement from "./createElement.js";

export default class HPComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.max_hp = props.max_hp;
    this.current_hp = props.current_hp;
    this.temp_hp = props.temp_hp;

    this.updateGeneralValue = props.updateGeneralValue;

    this.tempView = false;

    this.render();
  }

  toggleTempView = () => {
    this.tempView = !this.tempView;
    this.render();
  };

  calculateCurrentHP = () => {
    let hp = this.current_hp;
    if (this.current_hp) {
      if (this.temp_hp) {
        if (Math.sign(this.temp_hp)) {
          hp += this.temp_hp;
          return hp;
        } else {
          hp -= this.temp_hp;
          return hp;
        }
      } else return hp;
    }
  };

  calculateHPColor = () => {
    let color = "inherit";
    if (this.current_hp) {
      if (this.temp_hp) {
        if (Math.sign(this.temp_hp) === 1) {
          color = "var(--green)";
          return color;
        } else if (Math.sign(this.temp_hp) === -1) {
          color = "var(--pink)";
          return color;
        }
      } else return color;
    }
  };

  renderTempView = () => {
    this.domComponent.append(
      createElement("div", { class: "cp-content-container-center" }, [
        createElement(
          "img",
          {
            class: "edit-hp",
            src: "/assets/gears.svg",
            title: "Close temporary HP view",
          },
          null,
          {
            type: "click",
            event: () => {
              this.toggleTempView();
            },
          }
        ),
        createElement(
          "input",
          {
            class: "cp-input-no-border cp-input-large",
            type: "number",
            name: "temp_hp",
            value: this.temp_hp ? this.temp_hp : 0,
          },
          null,
          {
            type: "focusout",
            event: (e) => {
              if (e.target.value === "") e.target.value = 0;
              this.temp_hp = e.target.valueAsNumber;
              this.updateGeneralValue("temp_hp", e.target.valueAsNumber);
            },
          }
        ),
        createElement("small", {}, "Temporary HP"),
      ])
    );
  };

  render = () => {
    this.domComponent.innerHTML = "";

    if (this.tempView) {
      return this.renderTempView();
    }

    this.domComponent.append(
      createElement("div", { class: "cp-content-container-center" }, [
        createElement(
          "img",
          {
            class: "edit-hp",
            src: "/assets/gears.svg",
            title: "Open temporary HP view",
          },
          null,
          {
            type: "click",
            event: this.toggleTempView,
          }
        ),
        createElement(
          "div",
          {
            style:
              "display: flex; align-items: center; justify-content: center;",
          },
          [
            createElement("small", {}, "Max"),
            createElement(
              "input",
              {
                class: "cp-input-no-border-small",
                type: "number",
                name: "max_hp",
                value: this.max_hp ? this.max_hp : 0,
              },
              null,
              {
                type: "focusout",
                event: (e) => {
                  this.max_hp = e.target.valueAsNumber;
                  this.updateGeneralValue(
                    e.target.name,
                    e.target.valueAsNumber
                  );
                },
              }
            ),
          ]
        ),
        createElement(
          "input",
          {
            class: "cp-input-no-border cp-input-large",
            style: `color: ${this.calculateHPColor()}`,
            type: "number",
            name: "current_hp",
            value: this.calculateCurrentHP() ? this.calculateCurrentHP() : 0,
          },
          null,
          {
            type: "focusout",
            event: (e) => {
              const previousHP = this.calculateCurrentHP();
              const currentHP = e.target.valueAsNumber;
              if (currentHP < previousHP && this.temp_hp > 0) {
                if (previousHP - currentHP <= this.temp_hp) {
                  this.temp_hp -= previousHP - currentHP;
                  this.updateGeneralValue("temp_hp", this.temp_hp);
                } else {
                  this.temp_hp = 0;
                  this.updateGeneralValue("temp_hp", this.temp_hp);
                  this.current_hp = currentHP;
                  this.updateGeneralValue(e.target.name, this.current_hp);
                }
              } else {
                if (currentHP >= previousHP && this.temp_hp > 0) {
                  this.current_hp = currentHP - this.temp_hp;
                  this.updateGeneralValue(e.target.name, this.current_hp);
                } else {
                  this.current_hp = currentHP;
                  this.updateGeneralValue(e.target.name, this.current_hp);
                }
              }
              this.render();
            },
          }
        ),
        createElement("small", {}, "Hit Points"),
      ])
    );
  };
}
