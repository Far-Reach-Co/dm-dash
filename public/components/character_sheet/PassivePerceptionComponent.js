import createElement from "../../lib/salt-lib/createElement.js";
import Component from "../../lib/salt-lib/Component.js";
import calculateColorMod from "./calculateColorMod.js";

export default class PassivePerceptionComponent extends Component {
  constructor(props = {}) {
    super({
      domElem: props.domElem || createElement("div"),
      autoRender: false,
    });

    this.calculatePassivePerception = props.calculatePassivePerception;
    this.wisdom = props.wisdom;
    this.wisdomMod = props.wisdomMod;
    this.updateGeneralValue = props.updateGeneralValue;

    this.modView = false;

    this.render();
  }

  toggleModView = () => {
    this.modView = !this.modView;
    this.render();
  };

  renderModView() {
    return createElement("div", { class: "cp-content-container-long" }, [
      createElement(
        "input",
        {
          class: "cp-content-long-number",
          style: `max-width: 50px;`,
          type: "number",
          name: "wisdome_mod",
          value: this.wisdomMod ? this.wisdomMod : 0,
        },
        null,
        {
          type: "focusout",
          event: (e) => {
            if (e.target.value === "") e.target.value = 0;
            this.wisdomMod = e.target.valueAsNumber;
            this.updateGeneralValue("wisdom_mod", e.target.valueAsNumber);
          },
        }
      ),
      createElement(
        "div",
        { class: "cp-content-long-title align-items-baseline" },
        [
          createElement(
            "img",
            {
              width: 15,
              class: "gear-gen me-1",
              src: "/assets/gears.svg",
              title: "Toggle modifier view",
            },
            null,
            {
              type: "click",
              event: () => {
                this.toggleModView();
              },
            }
          ),
          createElement(
            "small",
            { class: "text-pink" },
            "Passive Perception (mod)"
          ),
        ]
      ),
    ]);
  }

  render = () => {
    if (this.modView) {
      return this.renderModView();
    }

    return createElement("div", { class: "cp-content-container-long" }, [
      createElement(
        "div",
        {
          class: "cp-content-long-number",
          style: `color: ${calculateColorMod(
            this.calculatePassivePerception(),
            this.wisdomMod,
            "var(--blue6)"
          )}`,
        },
        this.calculatePassivePerception()
      ),
      createElement(
        "div",
        { class: "cp-content-long-title align-items-baseline" },
        [
          createElement(
            "img",
            {
              width: 15,
              class: "gear-gen me-1",
              src: "/assets/gears.svg",
              title: "Toggle modifier view",
            },
            null,
            {
              type: "click",
              event: () => {
                this.toggleModView();
              },
            }
          ),
          createElement("small", {}, "Passive Perception (Wis)"),
        ]
      ),
    ]);
  };
}
