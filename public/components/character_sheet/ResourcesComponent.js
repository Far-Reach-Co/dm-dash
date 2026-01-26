import createElement from "../../components/createElement.js";

export default class ResourcesComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.generalData = props.generalData;
    this.updateGeneralValue = props.updateGeneralValue;

    this.render();
  }

  renderResourceBlock = (totalName, currentName, titleName, placeholder) => {
    return createElement("div", { class: "cp-content-container-center" }, [
      createElement(
        "div",
        { class: "d-flex align-items-center justify-content-center" },
        [
          createElement("small", {}, "Total"),
          createElement(
            "input",
            {
              class: "cp-input-no-border-small",
              name: totalName,
              type: "number",
              value: this.generalData[totalName]
                ? this.generalData[totalName]
                : "0",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                this.updateGeneralValue(e.target.name, e.target.valueAsNumber);
              },
            }
          ),
        ]
      ),
      createElement(
        "input",
        {
          class: "cp-input-no-border cp-input-large",
          name: currentName,
          type: currentName === "other_resource" ? "text" : "number",
          value: this.generalData[currentName]
            ? this.generalData[currentName]
            : "0",
        },
        null,
        {
          type: "focusout",
          event: (e) => {
            const value =
              currentName === "other_resource"
                ? e.target.value
                : e.target.valueAsNumber;
            this.updateGeneralValue(e.target.name, value);
          },
        }
      ),
      createElement(
        "input",
        {
          class: "font-small text-orange3",
          name: titleName,
          value: this.generalData[titleName] ? this.generalData[titleName] : "",
          placeholder: placeholder,
        },
        null,
        {
          type: "focusout",
          event: (e) => {
            this.updateGeneralValue(e.target.name, e.target.value);
          },
        }
      ),
    ]);
  };

  render = () => {
    this.domComponent.innerHTML = "";
    this.domComponent.className = "cp-info-container-row";

    this.domComponent.append(
      this.renderResourceBlock(
        "class_resource_total",
        "class_resource",
        "class_resource_title",
        "Class Resource"
      ),
      this.renderResourceBlock(
        "other_resource_total",
        "other_resource",
        "other_resource_title",
        "Other Resource"
      )
    );
  };
}
