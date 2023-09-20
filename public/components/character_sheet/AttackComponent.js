import { deleteThing, getThings, postThing } from "../../lib/apiUtils.js";
import collectTextNodes from "../../lib/collectTextNodes.js";
import isInsideSpan from "../../lib/isInsideSpan.js";
import createElement from "../createElement.js";
import renderLoadingWithMessage from "../loadingWithMessage.js";
import { setCaretStartAfter } from "../../lib/caretPositions.js";

export default class AttackComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className =
      "cp-info-container-column cp-info-container-pulsate"; // pulsate before content has loaded
    this.domComponent.style = "max-width: 100%;";
    this.generalData = props.generalData;
    this.calculateAbilityScoreModifier = props.calculateAbilityScoreModifier;
    this.calculateProBonus = props.calculateProBonus;

    this.newLoading = false;

    this.render();
  }

  toggleNewLoading = () => {
    this.newLoading = !this.newLoading;
    this.render();
  };

  getMappingValue = (mapping) => {
    if (mapping.value === "pro") {
      return this.calculateProBonus().toString();
    } else {
      return this.calculateAbilityScoreModifier(
        this.generalData[mapping.key]
      ).toString();
    }
  };

  createMagicWordsSpanElement = (mapping) => {
    // Value of new span node
    const valueToInsert = this.getMappingValue(mapping);
    // create element
    const span = document.createElement("span");
    span.setAttribute("data-value", valueToInsert);
    // span.style.color = "var(--blue6)";
    span.className = "glowing-text";
    span.style.display = "inline";
    span.textContent = mapping.value;

    // Mouse enter event
    span.addEventListener("mouseenter", (e) => {
      const hoverInfoElem = document.getElementById("hover-info");
      hoverInfoElem.style.display = "block";
      const rect = e.target.getBoundingClientRect();
      hoverInfoElem.style.top = rect.bottom + window.scrollY + "px";
      hoverInfoElem.style.left = rect.left + window.scrollX + "px";

      hoverInfoElem.append(
        createElement("div", {}, [
          createElement("h4", {}, "Magic Words"),
          createElement("div", { style: "color: var(--green)" }, mapping.value),
          createElement("p", {}, `${mapping.key} - (${valueToInsert})`),
        ])
      );
    });

    // Mouse leave event
    span.addEventListener("mouseleave", (e) => {
      this.hideHoverInfo();
    });

    return span;
  };

  applyMagicWordsToContentEditable = (contentElement, mappings) => {
    // Remove <br> elements
    const breaks = contentElement.querySelectorAll("br");
    breaks.forEach((br) => {
      br.parentNode.removeChild(br);
    });
    // Remove <div> elements
    const divs = contentElement.querySelectorAll("div");
    divs.forEach((div) => {
      div.parentNode.removeChild(div);
    });
    // remove font elements
    const fontElems = contentElement.querySelectorAll("font");
    fontElems.forEach((f) => {
      f.parentNode.removeChild(f);
    });
    // remove extra space
    if (contentElement.innerHTML.trim() == "") {
      contentElement.innerHTML = "";
    }
    // Check if a data-combined span already exists and remove it
    if (contentElement.querySelector("[data-combined]")) {
      contentElement.querySelector("[data-combined]").remove();
    }

    // Setup for replacing
    const textNodes = [];
    collectTextNodes(contentElement, textNodes);
    // Loop through text nodes and mappings to replace with span and extra text node
    for (const node of textNodes) {
      if (isInsideSpan(node)) continue;
      let lastTextNode = null;

      let remainingText = node.nodeValue;
      const fragment = document.createDocumentFragment();

      for (const mapping of mappings) {
        if (!remainingText.includes(mapping.value)) continue;

        const parts = remainingText.split(mapping.value);
        remainingText = parts.pop(); // save the last part for further splitting

        for (const part of parts) {
          fragment.appendChild(document.createTextNode(part));

          const span = this.createMagicWordsSpanElement(mapping);

          fragment.appendChild(span);

          const extraTextNode = document.createTextNode("\u200B");
          lastTextNode = extraTextNode;
          fragment.appendChild(extraTextNode);
        }
      }

      // Append the remaining text to be reprocessed
      if (remainingText) {
        fragment.appendChild(document.createTextNode(remainingText));
      }

      // Reset cursor and append new content
      // Clone fragment as
      const fragClone = fragment.cloneNode(true);
      // Check if frag contains more than just 1 text node
      if (fragClone.childNodes.length > 1) {
        node.after(fragment);
        node.remove();
        // Reset caret to be after the last text node
        setCaretStartAfter(lastTextNode);
      }
    }

    return contentElement;
  };

  getMagicWordMappings = () => {
    return [
      { value: "str", key: "strength" },
      { value: "dex", key: "dexterity" },
      { value: "con", key: "constitution" },
      { value: "wis", key: "wisdom" },
      { value: "int", key: "intelligence" },
      { value: "cha", key: "charisma" },
      { value: "pro", key: "proficiency bonus" },
    ];
  };

  handleMagicWords = (contentElement) => {
    contentElement = this.applyMagicWordsToContentEditable(
      contentElement,
      this.getMagicWordMappings()
    );
    return contentElement;
  };

  createMagicCalculationSpanElement = (result, uncalculatedExpression) => {
    // Create a new span element to hold the result
    const span = document.createElement("span");
    span.setAttribute("data-combined", true);
    // span.style.color = "var(--blue6)";
    span.className = "glowing-text";
    span.style.display = "inline";
    span.textContent = isNaN(result) ? "NaN" : result;
    span.addEventListener("mouseenter", (e) => {
      const hoverInfoElem = document.getElementById("hover-info");
      hoverInfoElem.style.display = "block";
      // Get the bounding box of the target element
      const rect = e.target.getBoundingClientRect();
      // Set the position of the suggestion element
      hoverInfoElem.style.top = rect.bottom + window.scrollY + "px"; // You can add an offset here
      hoverInfoElem.style.left = rect.left + window.scrollX + "px"; // You can add an offset here

      // set content
      hoverInfoElem.append(
        createElement("div", {}, [
          createElement("h4", {}, "Magic Calculation"),
          createElement("p", {}, uncalculatedExpression),
        ])
      );
    });
    span.addEventListener("mouseleave", (e) => {
      this.hideHoverInfo();
    });

    // Storing the un-calculated expression as a data attribute
    span.setAttribute("data-uncalculated-expression", uncalculatedExpression);

    return span;
  };

  applyCalculatedMagicWordsToContentEditable = (contentElement) => {
    // Check if a data-combined span already exists
    if (contentElement.querySelector("[data-combined]")) {
      return;
    }

    const childrenArray = Array.from(contentElement.cloneNode(true).childNodes);
    if (!childrenArray.length) return;

    let calculatedExpression = "";
    let uncalculatedExpression = "";

    childrenArray.forEach((childNode) => {
      if (childNode.nodeType === Node.TEXT_NODE) {
        let textValue = childNode.nodeValue.trim();
        // Add only numbers and operators to both calculated and uncalculated expressions
        const cleanedTextValue = textValue.replace(/[^0-9+\-*/]/g, "");
        calculatedExpression += cleanedTextValue;
        uncalculatedExpression += cleanedTextValue;
      } else if (
        childNode.tagName === "SPAN" &&
        !childNode.hasAttribute("data-combined")
      ) {
        const ability = childNode.getAttribute("data-value");
        const valAsNum = parseInt(ability, 10).toString();
        calculatedExpression += valAsNum;
        uncalculatedExpression += childNode.textContent;
      }
    });

    // Remove zero-width spaces
    calculatedExpression = calculatedExpression.replace(/\u200B/g, "");

    // Remove consecutive or duplicate operators
    calculatedExpression = calculatedExpression.replace(/([+\-*/])\1+/g, "$1");

    // Remove adjacent different operators
    calculatedExpression = calculatedExpression.replace(
      /([+\-*/])([+\-*/])/g,
      "$2"
    );

    // Check if the expression starts or ends with an operator and remove it
    calculatedExpression = calculatedExpression.replace(
      /^[+\-*/]|[+\-*/]$/g,
      ""
    );

    // Evaluate the calculatedExpression
    let result;
    try {
      if (!calculatedExpression.length) return;
      result = eval(calculatedExpression).toString();
    } catch (e) {
      result = "NaN";
    }

    const span = this.createMagicCalculationSpanElement(
      result,
      uncalculatedExpression
    );

    // Clear the content and append the new span + space
    contentElement.innerHTML = "";
    contentElement.append(span, document.createTextNode("\u200B"));
    return span;
  };

  handleRemoveSpanOnBackspace = () => {
    const selection = window.getSelection();
    const currentNode = selection.anchorNode;
    if (currentNode.parentNode.tagName === "SPAN") {
      currentNode.parentElement.remove();
    }
  };

  updateBonusElementsMagicCalcValue = () => {
    const mappings = this.getMagicWordMappings();
    const magicCalcElem = document.querySelectorAll(
      "[data-uncalculated-expression]"
    );
    // If a magic calculation exists
    if (magicCalcElem && magicCalcElem.length) {
      magicCalcElem.forEach((elem) => {
        const uncalculatedExpression = elem.getAttribute(
          "data-uncalculated-expression"
        );

        // Replace magic words with their calculated numeric values
        let calculatedExpression = uncalculatedExpression;
        mappings.forEach((mapping) => {
          const regex = new RegExp(`\\b${mapping.value}\\b`, "g");
          calculatedExpression = calculatedExpression.replace(
            regex,
            this.getMappingValue(mapping)
          );
        });

        // Evaluate the calculatedExpression
        let result;
        try {
          result = eval(calculatedExpression);
        } catch (e) {
          result = "NaN";
        }

        const span = this.createMagicCalculationSpanElement(
          result,
          uncalculatedExpression
        );
        // replace
        elem.after(span);
        elem.remove();
      });
    }
  };

  renderBonusElem = (item) => {
    const elem = createElement(
      "div",
      {
        class: "cp-input-gen-short input-small magic-text",
        id: "bonus-magic-text",
        style: "margin-right: 5px;",
        contentEditable: "true",
        name: "bonus",
      },
      item.bonus,
      [
        {
          type: "input",
          event: (e) => {
            e.preventDefault();
            this.hideHoverInfo();
            // handle magic words
            this.handleMagicWords(e.target);
          },
        },
        {
          type: "focusout",
          event: (e) => {
            e.preventDefault();
            let newBonusValue = "";
            // Combine magic words into a new magic calc
            const newElem = this.applyCalculatedMagicWordsToContentEditable(
              e.target
            );
            if (!newElem) {
              newBonusValue = e.target.textContent;
            } else
              newBonusValue = newElem.getAttribute(
                "data-uncalculated-expression"
              );
            // Revert magic words before posting
            postThing(`/api/edit_5e_character_attack/${item.id}`, {
              bonus: newBonusValue,
            });
          },
        },
        {
          type: "keydown",
          event: (e) => {
            if (e.key === "Backspace") {
              this.handleRemoveSpanOnBackspace();
            }
            if (e.key === "Enter") {
              // Trigger focusout (or blur)
              e.target.blur();
              this.hideHoverInfo();
            }
          },
        },
      ]
    );
    // run magic words and calculations
    this.handleMagicWords(elem);
    this.applyCalculatedMagicWordsToContentEditable(elem);

    return elem;
  };

  hideHoverInfo = () => {
    const hoverInfoElem = document.getElementById("hover-info");
    hoverInfoElem.style.display = "none";
    hoverInfoElem.innerHTML = "";
  };

  newAttack = async (e) => {
    e.preventDefault();
    this.toggleNewLoading();

    await postThing("/api/add_5e_character_attack", {
      general_id: this.generalData.id,
      title: "New Attack/Spell",
    });

    this.toggleNewLoading();
  };

  renderAttacksElems = async () => {
    const attacksData = await getThings(
      `/api/get_5e_character_attacks/${this.generalData.id}`
    );
    this.domComponent.className = "cp-info-container-column"; // set container styling to not include pulsate animation after loading
    if (!attacksData.length) return [createElement("small", {}, "None...")];

    return attacksData.map((item) => {
      return createElement(
        "div",
        {
          style: "display: flex; align-items: center; margin-bottom: 5px;",
        },
        [
          createElement(
            "input",
            {
              class: "cp-input-gen input-small",
              style: "margin-right: 5px;",
              name: "title",
              value: item.title ? item.title : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_attack/${item.id}`, {
                  title: e.target.value,
                });
              },
            }
          ),
          createElement(
            "input",
            {
              class: "cp-input-gen-short input-small",
              style: "margin-right: 5px;",
              name: "range",
              value: item.range ? item.range : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_attack/${item.id}`, {
                  range: e.target.value,
                });
              },
            }
          ),
          createElement(
            "input",
            {
              class: "cp-input-gen-short input-small",
              style: "margin-right: 5px;",
              name: "duration",
              value: item.duration ? item.duration : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_attack/${item.id}`, {
                  duration: e.target.value,
                });
              },
            }
          ),
          this.renderBonusElem(item),
          createElement(
            "input",
            {
              class: "cp-input-gen input-small",
              style: "margin-right: 5px;",
              name: "damage_type",
              value: item.damage_type ? item.damage_type : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_attack/${item.id}`, {
                  damage_type: e.target.value,
                });
              },
            }
          ),
          createElement(
            "div",
            {
              style: "color: var(--red1); cursor: pointer;",
              title: "Remove attack",
            },
            "ⓧ",
            {
              type: "click",
              event: (e) => {
                if (
                  window.confirm(
                    `Are you sure you want to delete ${item.title}`
                  )
                ) {
                  deleteThing(`/api/remove_5e_character_attack/${item.id}`);
                  e.target.parentElement.remove();
                }
              },
            }
          ),
        ]
      );
    });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.newLoading) {
      return this.domComponent.append(renderLoadingWithMessage("Loading..."));
    }

    this.domComponent.append(
      createElement(
        "div",
        { class: "special-font", style: "align-self: center;" },
        "Attacks and Spellcasting"
      ),
      createElement("br"),
      createElement(
        "div",
        {
          style: "display: flex; align-items: center;",
        },
        [
          createElement("small", { style: "margin-right: 140px;" }, "Name"),
          createElement("small", { style: "margin-right: 29px;" }, "Range"),
          createElement("small", { style: "margin-right: 12px;" }, "Duration"),
          createElement("small", { style: "margin-right: 16px;" }, "ATK Bonus"),
          createElement("small", {}, "Damage/Type"),
        ]
      ),
      createElement("br"),
      ...(await this.renderAttacksElems()),
      createElement(
        "a",
        { style: "align-self: flex-start;", title: "Create a new attack" },
        "+",
        {
          type: "click",
          event: this.newAttack,
        }
      )
    );
  };
}
