import createElement from "../../components/createElement.js";

export default class BackgroundComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.generalData = props.generalData;
    this.updateBackgroundValue = props.updateBackgroundValue;
    this.onUpdate = props.onUpdate;

    this.render();
  }

  renderInput = (label, name) => {
    return createElement("div", { class: "cp-content-container" }, [
      createElement("small", {}, label),
      createElement(
        "input",
        {
          class: "cp-input-gen cp-input-regular",
          name: name,
          value: this.generalData.background[name]
            ? this.generalData.background[name]
            : "",
        },
        null,
        {
          type: "focusout",
          event: (e) => {
            this.updateBackgroundValue(e.target.name, e.target.value);
          },
        }
      ),
    ]);
  };

  renderTextarea = (label, name, height = "250px", width = null) => {
    const style = width
      ? `height: ${height}; width: ${width};`
      : `height: ${height};`;

    return createElement("div", { class: "cp-info-container-column" }, [
      createElement("div", { class: "text-orange3" }, label),
      createElement("br"),
      createElement(
        "textarea",
        {
          class: "cp-input-gen input-small",
          style: style,
          name: name,
        },
        this.generalData.background[name]
          ? this.generalData.background[name]
          : "",
        {
          type: "focusout",
          event: (e) => {
            this.updateBackgroundValue(e.target.name, e.target.value);
            if (this.onUpdate) this.onUpdate();
          },
        }
      ),
    ]);
  };

  renderTraitTextarea = (label, name) => {
    return createElement("div", { class: "d-flex flex-column" }, [
      createElement("div", { class: "text-orange3" }, label),
      createElement("br"),
      createElement(
        "textarea",
        {
          class: "cp-input-gen input-small",
          style: "height: 100px; width: 250px;",
          name: name,
        },
        this.generalData.background[name]
          ? this.generalData.background[name]
          : "",
        {
          type: "focusout",
          event: (e) => {
            this.updateBackgroundValue(e.target.name, e.target.value);
            if (this.onUpdate) this.onUpdate();
          },
        }
      ),
      createElement("hr"),
    ]);
  };

  render = () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      createElement(
        "div",
        { class: "d-flex flex-wrap", style: "flex: 1;" },
        [
          createElement("div", { class: "d-flex flex-column" }, [
            createElement("div", { class: "cp-info-container-column" }, [
              createElement("div", { class: "d-flex flex-wrap" }, [
                createElement("div", {}, [
                  this.renderInput("Background", "background"),
                  this.renderInput("Alignment", "alignment"),
                ]),
                createElement("div", {}, [
                  this.renderInput("Age", "age"),
                  this.renderInput("Eyes", "eyes"),
                ]),
                createElement("div", {}, [
                  this.renderInput("Skin", "skin"),
                  this.renderInput("Hair", "hair"),
                ]),
                createElement("div", {}, [
                  this.renderInput("Height", "height"),
                  this.renderInput("Weight", "weight"),
                ]),
              ]),
            ]),
            this.renderTextarea("Appearance", "appearance"),
            this.renderTextarea("Backstory", "backstory"),
            this.renderTextarea("Allies & Organizations", "allies_and_organizations"),
            this.renderTextarea("Other Info", "other_info"),
          ]),
          createElement("div", { class: "cp-info-container-column" }, [
            this.renderTraitTextarea("Personality Traits", "personality_traits"),
            this.renderTraitTextarea("Ideals", "ideals"),
            this.renderTraitTextarea("Bonds", "bonds"),
            this.renderTraitTextarea("Flaws", "flaws"),
          ]),
        ]
      )
    );
  };
}
