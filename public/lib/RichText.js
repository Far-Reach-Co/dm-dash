import createElement from "./createElement.js";

export default class RichText {
  constructor(props) {
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
      {
        type: "keydown",
        event: (event) => {
          if (event.key === "Enter") {
            document.execCommand("insertLineBreak");
            event.preventDefault();
          }
        },
      }
    );

    textAreaComponent.innerHTML = props.value ? props.value : null;

    this.domComponent = createElement("div", { class: "rich-text-container" }, [
      createElement("div", { class: "rich-text-option-container noselect" }, [
        createElement(
          "b",
          {
            title: "Make selected text bold",
            class: "rich-text-option noselect",
          },
          "B",
          {
            type: "click",
            event: () => {
              var sel = window.getSelection(); // Gets selection
              if (sel.rangeCount) {
                var elem = document.createElement("span");
                elem.style.fontWeight = "bold";
                elem.innerHTML = sel.toString();

                var range = sel.getRangeAt(0);
                range.deleteContents();
                range.insertNode(elem);
              }

              // document.execCommand("bold");
            },
          }
        ),
        createElement(
          "i",
          { class: "rich-text-option", title: "Make selected text italic" },
          "i",
          {
            type: "click",
            event: () => {
              var sel = window.getSelection(); // Gets selection
              if (sel.rangeCount) {
                var elem = document.createElement("span");
                elem.style.fontStyle = "italic";
                elem.innerHTML = sel.toString();

                var range = sel.getRangeAt(0);
                range.deleteContents();
                range.insertNode(elem);
              }
            },
          }
        ),
        createElement(
          "u",
          { class: "rich-text-option", title: "Make selected text underlined" },
          "U",
          {
            type: "click",
            event: () => {
              var sel = window.getSelection(); // Gets selection
              if (sel.rangeCount) {
                var elem = document.createElement("span");
                elem.style.textDecoration = "underline";
                elem.innerHTML = sel.toString();

                var range = sel.getRangeAt(0);
                range.deleteContents();
                range.insertNode(elem);
              }
            },
          }
        ),
        createElement(
          "div",
          { class: "rich-text-option", title: "Make selected text hyperlink" },
          "@",
          {
            type: "click",
            event: () => {
              var sel = window.getSelection(); // Gets selection
              if (sel.rangeCount) {
                var elem = document.createElement("a");
                var href = window.prompt("Please enter the link address");
                if (href) elem.href = href;
                elem.innerHTML = sel.toString();

                var range = sel.getRangeAt(0);
                range.deleteContents();
                range.insertNode(elem);
              }
            },
          }
        ),
      ]),
      textAreaComponent,
    ]);

    return this.domComponent;
  }
}
