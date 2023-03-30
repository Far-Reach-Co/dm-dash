import createElement from "./createElement.js";

export default class RichText {
  constructor(props) {
    this.exec = (command, value = null) =>
      document.execCommand(command, false, value);
    this.formatBlock = "formatBlock";
    this.queryCommandState = (command) => document.queryCommandState(command);

    const textAreaComponent = createElement(
      "div",
      {
        contentEditable: "true",
        wrap: "soft",
        spellcheck: true,
        class: "text-area-rich",
        id: "description",
        name: "description",
        "data-ph": "...Write your text here.",
      },
      null,
      [
        {
          type: "input",
          event: ({ target: { firstChild } }) => {
            if (firstChild && firstChild.nodeType === 3)
              this.exec(this.formatBlock, `<div>`);
            else if (textAreaComponent.innerHTML === "<br>")
              textAreaComponent.innerHTML = "";
          },
        },
        {
          type: "keydown",
          event: (event) => {
            if (event.key === "Enter") {
              document.execCommand("insertLineBreak");
              event.preventDefault();
            }
          },
        },
      ]
    );

    this.textAreaComponent = textAreaComponent;

    textAreaComponent.innerHTML = props.value ? props.value : null;

    this.domComponent = createElement("div", { class: "rich-text-container" }, [
      createElement("div", { class: "rich-text-option-container noselect" }, [
        ...this.renderActions(),
      ]),
      textAreaComponent,
    ]);

    return this.domComponent;
  }

  renderActions = () => {
    const actions = [
      {
        icon: "<b>B</b>",
        title: "Bold",
        state: () => this.queryCommandState("bold"),
        result: () => this.exec("bold"),
      },
      {
        icon: "<i>I</i>",
        title: "Italic",
        state: () => this.queryCommandState("italic"),
        result: () => this.exec("italic"),
      },
      {
        icon: "<u>U</u>",
        title: "Underline",
        state: () => this.queryCommandState("underline"),
        result: () => this.exec("underline"),
      },
      {
        icon: "<strike>S</strike>",
        title: "Strike-through",
        state: () => this.queryCommandState("strikeThrough"),
        result: () => this.exec("strikeThrough"),
      },
      // {
      //   icon: "&#182;",
      //   title: "Paragraph",
      //   result: () => this.exec(this.formatBlock, "<p>"),
      // },
      // {
      //   icon: "&#8220;",
      //   title: "Quote",
      //   result: () => this.exec(this.formatBlock, "<blockquote>"),
      // },
      // {
      //   icon: "&#35;",
      //   title: "Ordered List",
      //   result: () => this.exec("insertOrderedList"),
      // },
      // {
      //   icon: "&#8226;",
      //   title: "Unordered List",
      //   result: () => this.exec("insertUnorderedList"),
      // },
      // {
      //   icon: "&lt;/&gt;",
      //   title: "Code",
      //   result: () => this.exec(this.formatBlock, "<pre>"),
      // },
      // {
      //   icon: "&#8213;",
      //   title: "Horizontal Line",
      //   result: () => this.exec("insertHorizontalRule"),
      // },
      {
        icon: "@",
        title: "Link",
        result: () => {
          const url = window.prompt("Enter the link URL");
          if (url) this.exec("createLink", url);
        },
      },
    ];

    const actionsElems = actions.map((action) => {
      const button = createElement(
        "button",
        {
          title: action.title,
        },
        null,
        {
          type: "click",
          event: (e) => {
            e.preventDefault();
            action.result() && this.textAreaComponent.focus();
          },
        }
      );

      button.innerHTML = action.icon;

      if (action.state) {
        const handler = () => {
          this.textAreaComponent.addEventListener("keyup", handler);
          this.textAreaComponent.addEventListener("mouseup", handler);
          this.textAreaComponent.addEventListener("click", handler);
        };
      }
      return button;
    });
    return actionsElems;
  };
}
