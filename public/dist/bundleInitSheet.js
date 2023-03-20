function createElement(
  element,
  attributes,
  inner,
  eventListeners
) {
  if (typeof element === "undefined") {
    return false;
  }
  if (typeof inner === "undefined") {
    inner = "";
  }
  var el = document.createElement(element);
  
  if (typeof attributes === "object") {
    for (var attribute in attributes) {
      el.setAttribute(attribute, attributes[attribute]);
    }
  }
  if(inner) {
    if (!Array.isArray(inner)) {
      inner = [inner];
    }
    for (var k = 0; k < inner.length; k++) {
      if (inner[k].tagName) {
        el.appendChild(inner[k]);
      } else {
        el.appendChild(document.createTextNode(inner[k]));
      }
    }
  }
  if(eventListeners) {
    if (!Array.isArray(eventListeners)) {
      eventListeners = [eventListeners];
    }
    for (var event of eventListeners ) {
      el.addEventListener(event.type, event.event);
    }
  }
  return el;
}

class Toast {
  constructor() {
    this.isVisible = false;
    this.message = "";
    this.domComponent = document.getElementById("toast");
    if(!this.domComponent) return;
    this.domComponent.style.visibility = "hidden";

    this.isError = false;

    this.render();
  }

  show = (message) => {
    if (!this.domComponent) return;
    this.isVisible = true;
    this.message = message;
    this.render();
    this.domComponent.style.visibility = "visible";
    const timer = setTimeout(() => {
      this.hide();
    }, 2000);
    this.timer = timer;
  };

  error = (message) => {
    if (!this.domComponent) return;
    this.isError = true;
    this.show(message);
  };

  hide = () => {
    if (!this.domComponent) return;
    clearTimeout(this.timer);
    this.isVisible = false;
    this.isError = false;
    this.message = "";
    this.domComponent.style.visibility = "hidden";
  };

  render = () => {
    if (!this.domComponent) return;
    this.domComponent.innerHTML = "";

    if (this.isError)
      return this.domComponent.append(
        createElement("div", { class: "toast toast-error" }, this.message)
      );
    else
      return this.domComponent.append(
        createElement("div", { class: "toast" }, this.message)
      );
  };
}

const toast = new Toast();

async function getThings(endpoint) {
  try {
    const res = await fetch(window.location.origin + endpoint, {
      headers: {
        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();
    if (res.status === 200) {
      return data;
    } else throw new Error();
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function deleteThing(endpoint) {
  try {
    const res = await fetch(window.location.origin + endpoint, {
      method: "DELETE",
      headers: {
        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (res.status === 204) {
      toast.show("Removed");
    } else {
      throw new Error();
    }
  } catch (err) {
    toast.error("Error");
    console.log(err);
  }
}

async function postThing(endpoint, body) {
  try {
    const res = await fetch(window.location.origin + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.status === 200 || res.status === 201) {
      toast.show("Success");
      return data;
    } else throw new Error();
  } catch (err) {
    // window.alert("Failed to save note...");
    console.log(err);
    toast.error("Error");
    return null;
  }
}

class HPComponent {
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
          { class: "edit-hp", src: "/assets/gears.svg" },
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
          { class: "edit-hp", src: "/assets/gears.svg" },
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
            value: this.calculateCurrentHP(),
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

function renderSpinner() {
  return createElement("div", {class: "lds-dual-ring"})
}

function renderLoadingWithMessage(message) {
  return createElement(
    "div",
    { style: "align-self: center; display: flex; flex-direction: column; align-items: center;" },
    [
      createElement("h2", {}, message),
      renderSpinner(),
    ]
  );
}

class OtherProLangComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "cp-info-container-column";
    this.general_id = props.general_id;

    this.newLoading = false;

    this.render();
  }

  toggleNewLoading = () => {
    this.newLoading = !this.newLoading;
    this.render();
  };

  newOtherProLang = async () => {
    this.toggleNewLoading();
    await postThing("/api/add_5e_character_other_pro_lang", {
      general_id: this.general_id,
      type: null,
      proficiency: "New Proficiency",
    });
    this.toggleNewLoading();
  };

  renderTypeSelectOptions = (currentType) => {
    const types = ["Language", "Weapon", "Armor", "Other"];
    const typeList = [];
    types.forEach((type) => {
      const elem = createElement(
        "option",
        { class: "select-option-small", value: type },
        type
      );
      if (currentType && currentType === type) elem.selected = true;
      typeList.push(elem);
    });
    return typeList;
  };

  renderOtherProLangElems = async () => {
    const otherProLangsData = await getThings(
      `/api/get_5e_character_other_pro_langs/${this.general_id}`
    );
    if (!otherProLangsData.length)
      return [createElement("small", {}, "None...")];

    return otherProLangsData.map((item) => {
      return createElement(
        "div",
        {
          style:
            "display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;",
        },
        [
          createElement(
            "select",
            {
              class: "select-option-small",
              id: "type",
              name: "type",
              style: "margin-right: 10px;",
            },
            [
              createElement("option", { value: "None" }, "None"),
              ...this.renderTypeSelectOptions(item.type),
            ],
            {
              type: "change",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_other_pro_lang/${item.id}`, {
                  type: e.target.value,
                });
              },
            }
          ),
          createElement(
            "input",
            {
              class: "cp-input-gen input-small",
              name: "name",
              value: item.proficiency ? item.proficiency : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_other_pro_lang/${item.id}`, {
                  proficiency: e.target.value,
                });
              },
            }
          ),
          createElement(
            "div",
            {
              style: "color: var(--red1); margin-left: 10px; cursor: pointer;",
            },
            "ⓧ",
            {
              type: "click",
              event: (e) => {
                if (
                  window.confirm(
                    `Are you sure you want to delete ${item.proficiency}`
                  )
                ) {
                  deleteThing(
                    `/api/remove_5e_character_other_pro_lang/${item.id}`
                  );
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
        { style: "align-self: center;" },
        "Other Proficiencies & Languages"
      ),
      createElement("br"),
      createElement(
        "div",
        {
          style:
            "display: flex; align-items: center; justify-content: space-between;",
        },
        [
          createElement("small", {}, "Type"),
          createElement("small", {}, "Proficiency"),
          createElement("small", {}, ""),
        ]
      ),
      createElement("br"),
      ...(await this.renderOtherProLangElems()),
      createElement("a", { style: "align-self: flex-start;" }, "+", {
        type: "click",
        event: this.newOtherProLang,
      })
    );
  };
}

class AttackComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "cp-info-container-column";
    this.domComponent.style = "max-width: 100%;";
    this.general_id = props.general_id;

    this.newLoading = false;
    this.creating = false;

    this.render();
  }

  toggleNewLoading = () => {
    this.newLoading = !this.newLoading;
    this.render();
  };

  toggleCreating = () => {
    this.creating = !this.creating;
    this.render();
  };

  newAttack = async (e) => {
    this.toggleNewLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.general_id = this.general_id;
    await postThing("/api/add_5e_character_attack", formProps);
    this.toggleNewLoading();
  };

  renderCreatingAttack = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new attack"
    );
    const form = createElement("form", {}, [
      createElement("label", { for: "title" }, "Name"),
      createElement("input", {
        id: "title",
        name: "title",
        placeholder: "Name",
        required: true,
      }),
      createElement("label", { for: "range" }, "Range"),
      createElement("input", {
        id: "range",
        name: "range",
        placeholder: "Range",
      }),
      createElement("label", { for: "duration" }, "Duration"),
      createElement("input", {
        id: "duration",
        name: "duration",
        placeholder: "Range",
      }),
      createElement("label", { for: "bonus" }, "ATK Bonus"),
      createElement("input", {
        id: "bonus",
        name: "bonus",
        placeholder: "+6",
      }),
      createElement("label", { for: "damage_type" }, "Damage/Type"),
      createElement("input", {
        id: "damage_type",
        name: "damage_type",
        placeholder: "1d4+3 Piercing",
      }),
      // createElement("label", { for: "description" }, "Description"),
      // createElement("textarea", {
      //   id: "description",
      //   name: "description",
      // }),
      createElement("br"),
      createElement("br"),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.creating = false;
      await this.newAttack(e);
    });

    const cancelButton = createElement(
      "button",
      { class: "btn-red" },
      "Cancel"
    );
    cancelButton.addEventListener("click", () => {
      this.toggleCreating();
    });

    this.domComponent.append(
      titleOfForm,
      createElement("br"),
      form,
      createElement("br"),
      cancelButton
    );
  };

  renderAttacksElems = async () => {
    const attacksData = await getThings(
      `/api/get_5e_character_attacks/${this.general_id}`
    );
    if (!attacksData.length) return [createElement("small", {}, "None...")];

    return attacksData.map((item) => {
      return createElement(
        "div",
        {
          style:
            "display: flex; align-items: center; margin-bottom: 5px;",
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
          createElement(
            "input",
            {
              class: "cp-input-gen-short input-small",
              style: "margin-right: 5px;",
              name: "bonus",
              value: item.bonus ? item.bonus : "",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_attack/${item.id}`, {
                  bonus: e.target.value,
                });
              },
            }
          ),
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
                  deleteThing(
                    `/api/remove_5e_character_attack/${item.id}`
                  );
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

    if (this.creating) {
      return this.renderCreatingAttack();
    }

    this.domComponent.append(
      createElement(
        "div",
        { style: "align-self: center;" },
        "Attacks and Spellcasting"
      ),
      createElement("br"),
      createElement(
        "div",
        {
          style:
            "display: flex; align-items: center;",
        },
        [
          createElement("small", {style: "margin-right: 115px;"}, "Name"),
          createElement("small", {style: "margin-right: 32px;"}, "Range"),
          createElement("small", {style: "margin-right: 18px;"}, "Duration"),
          createElement("small", {style: "margin-right: 30px;"}, "ATK Bonus"),
          createElement("small", {}, "Damage/Type"),
        ]
      ),
      createElement("br"),
      ...(await this.renderAttacksElems()),
      createElement("a", { style: "align-self: flex-start;" }, "+", {
        type: "click",
        event: this.toggleCreating,
      })
    );
  };
}

class EquipmentComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "cp-info-container-column";
    this.domComponent.style = "max-width: 100%;";
    this.general_id = props.general_id;

    this.newLoading = false;
    this.creating = false;

    this.render();
  }

  toggleNewLoading = () => {
    this.newLoading = !this.newLoading;
    this.render();
  };

  toggleCreating = () => {
    this.creating = !this.creating;
    this.render();
  };

  newEquipment = async (e) => {
    this.toggleNewLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.general_id = this.general_id;
    await postThing("/api/add_5e_character_equipment", formProps);
    this.toggleNewLoading();
  };

  renderCreatingEquipment = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new equipment"
    );
    const form = createElement("form", {}, [
      createElement("label", { for: "title" }, "Name"),
      createElement("input", {
        id: "title",
        name: "title",
        placeholder: "Name",
        required: true,
      }),
      createElement("label", { for: "quantity" }, "Quantity"),
      createElement("input", {
        id: "quantity",
        name: "quantity",
        type: "number",
        step: "0.01",
        placeholder: "4",
        required: false,
      }),
      createElement("label", { for: "weight" }, "Weight"),
      createElement("input", {
        id: "weight",
        name: "weight",
        type: "number",
        step: "0.01",
        placeholder: "1",
        required: false,
      }),
      createElement("br"),
      createElement("br"),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.creating = false;
      await this.newEquipment(e);
    });

    const cancelButton = createElement(
      "button",
      { class: "btn-red" },
      "Cancel"
    );
    cancelButton.addEventListener("click", () => {
      this.toggleCreating();
    });

    this.domComponent.append(
      titleOfForm,
      createElement("br"),
      form,
      createElement("br"),
      cancelButton
    );
  };

  renderEquipmentsElems = async () => {
    if (!this.equipmentData.length)
      return [createElement("small", {}, "None...")];

    return this.equipmentData.map((item, index) => {
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
                postThing(`/api/edit_5e_character_equipment/${item.id}`, {
                  title: e.target.value,
                });
                this.equipmentData[index].title = e.target.value;
              },
            }
          ),

          createElement(
            "input",
            {
              class: "cp-input-gen-short input-small",
              style: "margin-right: 5px;",
              type: "number",
              name: "quantity",
              value: item.quantity ? item.quantity : "0",
            },
            null,
            {
              type: "focusout",
              event: async (e) => {
                e.preventDefault();
                await postThing(`/api/edit_5e_character_equipment/${item.id}`, {
                  quantity: e.target.valueAsNumber,
                });
                this.equipmentData[index].quantity = e.target.valueAsNumber;
                // re-calc weight
                this.updateWeight();
              },
            }
          ),
          createElement(
            "input",
            {
              class: "cp-input-gen-short input-small",
              style: "margin-right: 5px;",
              type: "number",
              name: "weight",
              value: item.weight ? item.weight : "0",
            },
            null,
            {
              type: "focusout",
              event: async (e) => {
                e.preventDefault();
                await postThing(`/api/edit_5e_character_equipment/${item.id}`, {
                  weight: e.target.valueAsNumber,
                });
                this.equipmentData[index].weight = e.target.valueAsNumber;
                // re-calc weight
                this.updateWeight();
              },
            }
          ),
          createElement(
            "div",
            {
              style: "color: var(--red1); cursor: pointer;",
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
                  deleteThing(`/api/remove_5e_character_equipment/${item.id}`);
                  e.target.parentElement.remove();
                }
              },
            }
          ),
        ]
      );
    });
  };

  updateWeight = () => {
    document.getElementById("total-equipment-weight").innerHTML =
      this.calculateTotalWeight().toString();
  };

  calculateTotalWeight = () => {
    let weight = 0;
    this.equipmentData.forEach((item) => {
      if (item.weight && item.quantity) {
        weight += item.weight * item.quantity;
      }
    });

    return weight;
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.newLoading) {
      return this.domComponent.append(renderLoadingWithMessage("Loading..."));
    }

    if (this.creating) {
      return this.renderCreatingEquipment();
    }

    const equipmentsData = await getThings(
      `/api/get_5e_character_equipments/${this.general_id}`
    );

    this.equipmentData = equipmentsData;

    this.domComponent.append(
      createElement("div", { style: "align-self: center;" }, "Equipment"),
      createElement("br"),
      createElement(
        "div",
        {
          style: "display: flex; align-items: center;",
        },
        [
          createElement("small", { style: "margin-right: 115px;" }, "Name"),
          createElement("small", { style: "margin-right: 20px;" }, "Quantity"),
          createElement("small", {}, "Weight"),
        ]
      ),
      createElement("br"),
      ...(await this.renderEquipmentsElems()),
      createElement(
        "div",
        {
          style:
            "display: flex; align-items: center; justify-content: space-between",
        },
        [
          createElement("a", { style: "align-self: flex-start;" }, "+", {
            type: "click",
            event: this.toggleCreating,
          }),
          createElement("div", { style: "display: flex;" }, [
            createElement(
              "div",
              { style: "margin-right: 5px;" },
              "Total Weight:"
            ),
            createElement(
              "div",
              { id: "total-equipment-weight" },
              this.calculateTotalWeight()
            ),
          ]),
        ]
      )
    );
  };
}

class FeatComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "cp-info-container-column";
    this.domComponent.style = "max-width: 100%;";
    this.general_id = props.general_id;

    this.newLoading = false;
    this.creating = false;

    this.render();
  }

  toggleNewLoading = () => {
    this.newLoading = !this.newLoading;
    this.render();
  };

  toggleCreating = () => {
    this.creating = !this.creating;
    this.render();
  };

  newFeat = async (e) => {
    this.toggleNewLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if (formProps.type === "None") formProps.type = null;
    formProps.general_id = this.general_id;
    await postThing("/api/add_5e_character_feat", formProps);
    this.toggleNewLoading();
  };

  renderCreatingFeat = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new feat"
    );
    const form = createElement("form", {}, [
      createElement("label", { for: "title" }, "Name"),
      createElement("input", {
        id: "title",
        name: "title",
        placeholder: "Name",
        required: true,
      }),
      createElement("label", { for: "type" }, "Type"),
      createElement(
        "select",
        {
          class: "select-option-small",
          id: "type",
          name: "type",
          style: "margin-right: 10px;",
        },
        [
          createElement("option", { value: "None" }, "None"),
          ...this.renderTypeSelectOptions(),
        ]
      ),
      createElement("label", { for: "description" }, "Description"),
      createElement("textarea", {
        id: "description",
        name: "description",
      }),
      createElement("br"),
      createElement("br"),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.creating = false;
      await this.newFeat(e);
    });

    const cancelButton = createElement(
      "button",
      { class: "btn-red" },
      "Cancel"
    );
    cancelButton.addEventListener("click", () => {
      this.toggleCreating();
    });

    this.domComponent.append(
      titleOfForm,
      createElement("br"),
      form,
      createElement("br"),
      cancelButton
    );
  };

  renderTypeSelectOptions = (currentType) => {
    const types = ["Class", "Race", "Other"];
    const typeList = [];
    types.forEach((type) => {
      const elem = createElement(
        "option",
        { class: "select-option-small", value: type },
        type
      );
      if (currentType && currentType === type) elem.selected = true;
      typeList.push(elem);
    });
    return typeList;
  };

  renderFeatElems = async () => {
    const featsData = await getThings(
      `/api/get_5e_character_feats/${this.general_id}`
    );
    if (!featsData.length)
      return [createElement("small", {}, "None...")];

    return featsData.map((item) => {
      return createElement(
        "div",
        {
          style: "display: flex; flex-direction: column;",
        },
        [
          createElement("div", { style: "display: flex; margin-bottom: 5px;" }, [
            createElement(
              "input",
              {
                class: "cp-input-gen",
                style: "color: var(--orange2)",
                name: "title",
                value: item.title ? item.title : "",
              },
              null,
              {
                type: "focusout",
                event: (e) => {
                  e.preventDefault();
                  postThing(`/api/edit_5e_character_feat/${item.id}`, {
                    title: e.target.value,
                  });
                },
              }
            ),
            createElement(
              "div",
              {
                style:
                  "color: var(--red1); margin-left: 10px; cursor: pointer;",
              },
              "ⓧ",
              {
                type: "click",
                event: (e) => {
                  e.preventDefault();
                  if (
                    window.confirm(
                      `Are you sure you want to delete ${item.title}`
                    )
                  ) {
                    deleteThing(`/api/remove_5e_character_feat/${item.id}`);
                    e.target.parentElement.parentElement.remove();
                  }
                },
              }
            ),
          ]),
          createElement(
            "select",
            {
              class: "select-option-small",
              style: "margin-bottom: 5px;",
              id: "type",
              name: "type",
            },
            [
              createElement("option", { value: "None" }, "None"),
              ...this.renderTypeSelectOptions(item.type),
            ],
            {
              type: "change",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_feat/${item.id}`, {
                  type: e.target.value,
                });
              },
            }
          ),
          createElement(
            "textarea",
            {
              class: "cp-input-gen input-small",
              style: "height: 100px;",
              name: "description",
            },
            item.description ? item.description : "",
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_feat/${item.id}`, {
                  description: e.target.value,
                });
              },
            }
          ),
          createElement("hr")
        ]
      );
    });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.newLoading) {
      return this.domComponent.append(renderLoadingWithMessage("Loading..."));
    }

    if (this.creating) {
      return this.renderCreatingFeat();
    }

    this.domComponent.append(
      createElement(
        "div",
        { style: "align-self: center;" },
        "Feats and Traits"
      ),
      createElement("br"),
      ...(await this.renderFeatElems()),
      createElement("a", { style: "align-self: flex-start;" }, "+", {
        type: "click",
        event: this.toggleCreating,
      })
    );
  };
}

class SpellsComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.general_id = props.general_id;
    this.generalData = props.generalData;
    this.updateSpellSlotValue = props.updateSpellSlotValue;
    this.calculateAbilityScoreModifier = props.calculateAbilityScoreModifier;
    this.calculateProBonus = props.calculateProBonus;

    this.newLoading = false;

    this.render();
  }

  calculateSpellSaveDC = () => {
    let spellSaveDC = 8;
    if (this.generalData.spell_slots.spell_casting_ability) {
      const abilityScore =
        this.generalData[this.generalData.spell_slots.spell_casting_ability];
      let mod = this.calculateAbilityScoreModifier(abilityScore);
      if (mod === "0") mod = 0;
      spellSaveDC += mod;
    }

    spellSaveDC += this.calculateProBonus();

    if (spellSaveDC === 0) spellSaveDC = 0;
    return spellSaveDC;
  };

  calculateSpellAttackBonus = () => {
    let bonus = 0;
    if (this.generalData.spell_slots.spell_casting_ability) {
      const abilityScore =
        this.generalData[this.generalData.spell_slots.spell_casting_ability];
      let mod = this.calculateAbilityScoreModifier(abilityScore);
      if (mod === "0") mod = 0;
      bonus += mod;
    }

    bonus += this.calculateProBonus();

    if (bonus === 0) bonus = 0;
    return bonus;
  };

  renderSpellSlotsElems = () => {
    const list = [
      {
        title: "First level",
        totalKey: "first_total",
        expendedKey: "first_expended",
      },
      {
        title: "Second level",
        totalKey: "second_total",
        expendedKey: "second_expended",
      },
      {
        title: "Third level",
        totalKey: "third_total",
        expendedKey: "third_expended",
      },
      {
        title: "Fourth level",
        totalKey: "fourth_total",
        expendedKey: "fourth_expended",
      },
      {
        title: "Fifth level",
        totalKey: "fifth_total",
        expendedKey: "fifth_expended",
      },
      {
        title: "Sixth level",
        totalKey: "sixth_total",
        expendedKey: "sixth_expended",
      },
      {
        title: "Seventh level",
        totalKey: "seventh_total",
        expendedKey: "seventh_expended",
      },
      {
        title: "Eighth level",
        totalKey: "eighth_total",
        expendedKey: "eighth_expended",
      },
      {
        title: "Nineth level",
        totalKey: "nineth_total",
        expendedKey: "nineth_expended",
      },
    ];

    return list.map((spellSlot) => {
      const elem = createElement("div");
      new SingleSpell({
        domComponent: elem,
        general_id: this.general_id,
        generalData: this.generalData,
        spellSlot: spellSlot,
        updateSpellSlotValue: this.updateSpellSlotValue,
        isCantrip: false,
      });
      return elem;
    });
  };

  renderCantrip = () => {
    const elem = createElement("div");
    new SingleSpell({
      domComponent: elem,
      general_id: this.general_id,
      spellSlot: { title: "cantrip" },
      generalData: this.generalData,
      updateSpellSlotValue: this.updateSpellSlotValue,
      isCantrip: true,
    });
    return elem;
  };

  renderTypeSelectOptions = (currentType) => {
    const types = [
      "strength",
      "dexterity",
      "constitution",
      "intelligence",
      "wisdom",
      "charisma",
    ];
    const typeList = [];
    types.forEach((type) => {
      const elem = createElement(
        "option",
        { class: "select-option-small", value: type },
        type
      );
      if (currentType && currentType === type) elem.selected = true;
      typeList.push(elem);
    });
    return typeList;
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.newLoading) {
      return this.domComponent.append(renderLoadingWithMessage("Loading..."));
    }

    this.domComponent.append(
      createElement(
        "div",
        {
          style: "display: flex; flex-direction: column; align-items: center;",
        },
        [
          createElement("div", {}, [
            createElement(
              "div",
              {
                class: "cp-info-container-row",
                style: "width: fit-content; align-items: flex-start;",
              },
              [
                createElement(
                  "div",
                  {
                    style:
                      "display: flex; flex-direction: column; align-items: center; justify-content: center;",
                  },
                  [
                    createElement(
                      "small",
                      { style: "margin-bottom: 8px;" },
                      "Spell Casting Ability"
                    ),
                    createElement(
                      "select",
                      {
                        id: "spell_casting_ability",
                        name: "spell_casting_ability",
                        style: "margin-right: 10px; width: fit-content",
                      },
                      [
                        createElement("option", { value: "None" }, "None"),
                        ...this.renderTypeSelectOptions(
                          this.generalData.spell_slots.spell_casting_ability
                        ),
                      ],
                      {
                        type: "change",
                        event: (e) => {
                          e.preventDefault();
                          this.updateSpellSlotValue(
                            "spell_casting_ability",
                            e.target.value
                          );
                          this.render();
                        },
                      }
                    ),
                  ]
                ),
                createElement(
                  "div",
                  {
                    style:
                      "display: flex; flex-direction: column; align-items: center; margin-right: 10px; margin-left: 10px;",
                  },
                  [
                    createElement("small", {}, "Spell Save DC"),
                    createElement(
                      "div",
                      {
                        class: "cp-content-long-number",
                      },
                      this.calculateSpellSaveDC()
                    ),
                  ]
                ),
                createElement(
                  "div",
                  {
                    style:
                      "display: flex; flex-direction: column; align-items: center; justify-content: center;",
                  },
                  [
                    createElement("small", {}, "Spell Attack Bonus"),
                    createElement(
                      "div",
                      {
                        class: "cp-content-long-number",
                      },
                      `+${this.calculateSpellAttackBonus()}`
                    ),
                  ]
                ),
              ]
            ),
          ]),
          createElement("div", { style: "display: flex; flex-wrap: wrap;" }, [
            this.renderCantrip(),
            ...this.renderSpellSlotsElems(),
          ]),
        ]
      )
    );
  };
}

class SingleSpell {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.general_id = props.general_id;
    this.spellSlot = props.spellSlot;
    this.generalData = props.generalData;
    this.updateSpellSlotValue = props.updateSpellSlotValue;
    this.isCantrip = props.isCantrip;

    this.spells = [];

    this.render();
  }

  newSpell = async (type) => {
    const res = await postThing("/api/add_5e_character_spell", {
      general_id: this.general_id,
      type,
      title: "New Spell",
      description: "",
    });
    if (res) this.render();
  };

  renderSpells = async () => {
    if (!this.spells.length) return [createElement("div", {}, "None...")];
    return this.spells.map((spell) => {
      return createElement(
        "div",
        {
          style: "display: flex; flex-direction: column;",
        },
        [
          createElement(
            "div",
            { style: "display: flex; margin-bottom: 5px;" },
            [
              createElement(
                "input",
                {
                  class: "cp-input-gen",
                  style: "color: var(--orange2)",
                  name: "title",
                  value: spell.title ? spell.title : "",
                },
                null,
                {
                  type: "focusout",
                  event: (e) => {
                    e.preventDefault();
                    postThing(`/api/edit_5e_character_spell/${spell.id}`, {
                      title: e.target.value,
                    });
                  },
                }
              ),
              createElement(
                "div",
                {
                  style:
                    "color: var(--red1); margin-left: 10px; cursor: pointer;",
                },
                "ⓧ",
                {
                  type: "click",
                  event: (e) => {
                    e.preventDefault();
                    if (
                      window.confirm(
                        `Are you sure you want to delete ${spell.title}`
                      )
                    ) {
                      deleteThing(`/api/remove_5e_character_spell/${spell.id}`);
                      e.target.parentElement.parentElement.remove();
                    }
                  },
                }
              ),
            ]
          ),
          createElement(
            "textarea",
            {
              class: "cp-input-gen input-small",
              style: "height: 100px;",
              name: "description",
            },
            spell.description ? spell.description : "",
            {
              type: "focusout",
              event: (e) => {
                e.preventDefault();
                postThing(`/api/edit_5e_character_spell/${spell.id}`, {
                  description: e.target.value,
                });
              },
            }
          ),
          createElement("hr"),
        ]
      );
    });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    const spells = await getThings(
      `/api/get_5e_character_spells/${this.general_id}/${this.spellSlot.title}`
    );
    if (spells.length) this.spells = spells;

    if (this.isCantrip) {
      return this.domComponent.append(
        createElement("div", { class: "cp-info-container-column" }, [
          createElement("h2", {}, "Cantrips"),
          createElement("br"),
          ...(await this.renderSpells()),
          createElement("a", { style: "align-self: flex-start;" }, "+", {
            type: "click",
            event: () => this.newSpell("cantrip"),
          }),
        ])
      );
    }

    this.domComponent.append(
      createElement("div", { class: "cp-info-container-column" }, [
        createElement("h2", {}, this.spellSlot.title),
        createElement("div", { class: "cp-content-container-center" }, [
          createElement(
            "div",
            {
              style:
                "display: flex; align-items: center; justify-content: center;",
            },
            [
              createElement("small", {}, "Total"),
              createElement(
                "input",
                {
                  class: "cp-input-no-border-small",
                  name: this.spellSlot.totalKey,
                  type: "number",
                  value: this.generalData.spell_slots[this.spellSlot.totalKey]
                    ? this.generalData.spell_slots[this.spellSlot.totalKey]
                    : "0",
                },
                null,
                {
                  type: "focusout",
                  event: (e) => {
                    this.updateSpellSlotValue(
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
              class: "cp-input-no-border cp-input-small",
              name: this.spellSlot.expendedKey,
              type: "number",
              value: this.generalData.spell_slots[this.spellSlot.expendedKey]
                ? this.generalData.spell_slots[this.spellSlot.expendedKey]
                : "0",
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                this.updateSpellSlotValue(e.target.name, e.target.valueAsNumber);
              },
            }
          ),
          createElement("small", {}, "Expended"),
        ]),
        createElement("hr"),
        ...(await this.renderSpells()),
        createElement("a", { style: "align-self: flex-start;" }, "+", {
          type: "click",
          event: () => this.newSpell(this.spellSlot.title),
        }),
      ])
    );
  };
}

class FiveEPlayerSheet {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.navigate = props.navigate;
    (this.domComponent.className = "standard-view"),
      (this.domComponent.style = "align-items: center; max-width: 100%;"),
      (this.generalData = props.params.content);
    // general, background, etc
    this.mainView = "general";
    
    this.render();
  }

  updateGeneralValue = async (name, value) => {
    this.generalData[name] = value;
    postThing(`/api/edit_5e_character_general/${this.generalData.id}`, {
      [name]: value,
    });
  };

  updateBackgroundValue = async (name, value) => {
    this.generalData.background[name] = value;
    postThing(`/api/edit_5e_character_background/${this.generalData.id}`, {
      [name]: value,
    });
  };

  updateSpellSlotValue = async (name, value) => {
    this.generalData.spell_slots[name] = value;
    postThing(
      `/api/edit_5e_character_spell_slots/${this.generalData.spell_slots.id}`,
      {
        [name]: value,
      }
    );
  };

  updateProficiencyInfo = async (name, value) => {
    this.generalData.proficiencies[name] = value;
    postThing(
      `/api/edit_5e_character_proficiencies/${this.generalData.proficiencies.id}`,
      {
        [name]: value,
      }
    );
  };

  calculateAbilityScoreModifier = (abilityScore) => {
    switch (abilityScore) {
      case 1:
        return -5;
      case 2:
      case 3:
        return -4;
      case 4:
      case 5:
        return -3;
      case 6:
      case 7:
        return -2;
      case 8:
      case 9:
        return -1;
      case 10:
      case 11:
        return "0";
      case 12:
      case 13:
        return 1;
      case 14:
      case 15:
        return 2;
      case 16:
      case 17:
        return 3;
      case 18:
      case 19:
        return 4;
      case 20:
      case 21:
        return 5;
      case 22:
      case 23:
        return 6;
      case 24:
      case 25:
        return 7;
      case 26:
      case 27:
        return 8;
      case 28:
      case 29:
        return 9;
      case 30:
        return 10;
      default:
        return "0";
    }
  };

  calculateProBonus = () => {
    if (this.generalData.level < 5) {
      return 2;
    } else if (this.generalData.level < 9) {
      return 3;
    } else if (this.generalData.level < 13) {
      return 4;
    } else if (this.generalData.level < 17) {
      return 5;
    } else return 6;
  };

  calculatePassivePerception = () => {
    let wisMod = this.calculateAbilityScoreModifier(this.generalData.wisdom);
    if (wisMod === "0") wisMod = 0;
    let pp = 10 + wisMod;
    if (this.generalData.proficiencies.perception) {
      pp += this.calculateProBonus();
    }
    return pp;
  };

  calculateProficiency = (ability, isPro) => {
    let abilityMod = this.calculateAbilityScoreModifier(ability);
    if (abilityMod === "0") abilityMod = 0;
    let pro = abilityMod;
    if (isPro) {
      pro += this.calculateProBonus();
    }
    if (pro === 0) pro = "0";
    return pro;
  };

  renderAbilityScores = () => {
    const abilityScores = [
      {
        title: "Strength",
        key: "strength",
      },
      {
        title: "Dexterity",
        key: "dexterity",
      },
      {
        title: "Consitution",
        key: "constitution",
      },
      {
        title: "Intelligence",
        key: "intelligence",
      },
      {
        title: "Wisdom",
        key: "wisdom",
      },
      {
        title: "Charisma",
        key: "charisma",
      },
    ];

    return abilityScores.map((ability) => {
      return createElement(
        "div",
        { class: "cp-content-container-center border-rounded" },
        [
          createElement("small", {}, ability.title),
          createElement(
            "input",
            {
              class: "cp-input-no-border cp-input-large",
              type: "number",
              name: ability.key,
              value: this.generalData[ability.key]
                ? this.generalData[ability.key]
                : 0,
            },
            null,
            {
              type: "focusout",
              event: (e) => {
                this.updateGeneralValue(e.target.name, e.target.valueAsNumber);
                this.render();
              },
            }
          ),
          createElement(
            "div",
            { class: "ability-score-modifier" },
            this.calculateAbilityScoreModifier(this.generalData[ability.key])
          ),
        ]
      );
    });
  };

  renderSavingThrows = () => {
    const savingThrows = [
      {
        title: "Strength",
        key: "sv_str",
        ability: "strength",
      },
      {
        title: "Dexterity",
        key: "sv_dex",
        ability: "dexterity",
      },
      {
        title: "Constitution",
        key: "sv_con",
        ability: "constitution",
      },
      {
        title: "Intelligence",
        key: "sv_int",
        ability: "intelligence",
      },
      {
        title: "Wisdom",
        key: "sv_wis",
        ability: "wisdom",
      },
      {
        title: "Charisma",
        key: "sv_cha",
        ability: "charisma",
      },
    ];

    return savingThrows.map((save) => {
      return createElement("div", { class: "proficiency-item" }, [
        createElement(
          "div",
          {
            class: this.generalData.proficiencies[save.key]
              ? "proficiency-item-radio-checked"
              : "proficiency-item-radio",
          },
          null,
          {
            type: "click",
            event: (e) => {
              let newVal = !this.generalData.proficiencies[save.key];
              this.updateProficiencyInfo(save.key, newVal);
              this.render();
            },
          }
        ),
        createElement(
          "div",
          { class: "proficiency-item-number" },
          this.calculateProficiency(
            this.generalData[save.ability],
            this.generalData.proficiencies[save.key]
          )
        ),
        createElement("small", { class: "proficiency-item-title" }, save.title),
      ]);
    });
  };

  renderSkills = () => {
    const skills = [
      {
        title: "Acrobatics",
        key: "acrobatics",
        ability: "dexterity",
      },
      {
        title: "Animal Handling",
        key: "animal_handling",
        ability: "wisdom",
      },
      {
        title: "Arcana",
        key: "arcana",
        ability: "intelligence",
      },
      {
        title: "Atheltics",
        key: "athletics",
        ability: "strength",
      },
      {
        title: "Deception",
        key: "deception",
        ability: "charisma",
      },
      {
        title: "History",
        key: "history",
        ability: "intelligence",
      },
      {
        title: "Insight",
        key: "insight",
        ability: "wisdom",
      },
      {
        title: "Intimidation",
        key: "intimidation",
        ability: "charisma",
      },
      {
        title: "Investigation",
        key: "investigation",
        ability: "intelligence",
      },
      {
        title: "Medicine",
        key: "medicine",
        ability: "wisdom",
      },
      {
        title: "Nature",
        key: "nature",
        ability: "intelligence",
      },
      {
        title: "Perception",
        key: "perception",
        ability: "wisdom",
      },
      {
        title: "Performancce",
        key: "performance",
        ability: "charisma",
      },
      {
        title: "Persuasion",
        key: "persuasion",
        ability: "charisma",
      },
      {
        title: "Religion",
        key: "religion",
        ability: "intelligence",
      },
      {
        title: "Sleight of Hand",
        key: "sleight_of_hand",
        ability: "dexterity",
      },
      {
        title: "Stealth",
        key: "stealth",
        ability: "dexterity",
      },
      {
        title: "Survival",
        key: "survival",
        ability: "wisdom",
      },
    ];

    return skills.map((skill) => {
      return createElement("div", { class: "proficiency-item" }, [
        createElement(
          "div",
          {
            class: this.generalData.proficiencies[skill.key]
              ? "proficiency-item-radio-checked"
              : "proficiency-item-radio",
          },
          null,
          {
            type: "click",
            event: (e) => {
              let newVal = !this.generalData.proficiencies[skill.key];
              this.updateProficiencyInfo(skill.key, newVal);
              this.render();
            },
          }
        ),
        createElement(
          "div",
          { class: "proficiency-item-number" },
          this.calculateProficiency(
            this.generalData[skill.ability],
            this.generalData.proficiencies[skill.key]
          )
        ),
        createElement("small", { class: "proficiency-item-title" }, [
          skill.title,
          createElement(
            "small",
            { style: "font-size: smaller; color: var(--light-gray)" },
            ` (${skill.ability.substring(0, 3)})`
          ),
        ]),
      ]);
    });
  };

  renderGeneralView = async () => {
    if (!this.hpComponent) {
      const HPComponentElem = createElement("div");
      this.hpComponent = new HPComponent({
        domComponent: HPComponentElem,
        updateGeneralValue: this.updateGeneralValue,
        max_hp: this.generalData.max_hp,
        temp_hp: this.generalData.temp_hp,
        current_hp: this.generalData.current_hp,
      });
    }

    if (!this.otherProLangComponent) {
      const otherProLangComponentElem = createElement("div");
      this.otherProLangComponent = new OtherProLangComponent({
        domComponent: otherProLangComponentElem,
        general_id: this.generalData.id,
      });
    }

    if (!this.attackComponent) {
      const attackComponentElem = createElement("div");
      this.attackComponent = new AttackComponent({
        domComponent: attackComponentElem,
        general_id: this.generalData.id,
      });
    }

    if (!this.equipmentComponent) {
      const equipmentComponentElem = createElement("div");
      this.equipmentComponent = new EquipmentComponent({
        domComponent: equipmentComponentElem,
        general_id: this.generalData.id,
      });
    }

    if (!this.featComponent) {
      const featComponentElem = createElement("div");
      this.featComponent = new FeatComponent({
        domComponent: featComponentElem,
        general_id: this.generalData.id,
      });
    }

    this.domComponent.append(
      createElement(
        "div",
        {
          style: "display: flex; flex: 1; flex-wrap: wrap;",
        },
        [
          createElement("div", { class: "cp-info-container-column" }, [
            createElement("div", { class: "cp-content-container" }, [
              createElement("small", {}, "Character Name"),
              createElement(
                "input",
                {
                  class: "cp-input-gen cp-input-char-name",
                  name: "name",
                  value: this.generalData.name ? this.generalData.name : "",
                },
                null,
                {
                  type: "focusout",
                  event: (e) => {
                    this.updateGeneralValue(e.target.name, e.target.value);
                  },
                }
              ),
            ]),
            createElement("div", { style: "display: flex; flex-wrap: wrap;" }, [
              createElement("div", {}, [
                createElement("div", { class: "cp-content-container" }, [
                  createElement("small", {}, "Race"),
                  createElement(
                    "input",
                    {
                      class: "cp-input-gen cp-input-regular",
                      name: "race",
                      value: this.generalData.race ? this.generalData.race : "",
                    },
                    null,
                    {
                      type: "focusout",
                      event: (e) => {
                        this.updateGeneralValue(e.target.name, e.target.value);
                      },
                    }
                  ),
                ]),
                createElement("div", { class: "cp-content-container" }, [
                  createElement("small", {}, "Class"),
                  createElement(
                    "input",
                    {
                      class: "cp-input-gen cp-input-regular",
                      name: "class",
                      value: this.generalData.class
                        ? this.generalData.class
                        : "",
                    },
                    null,
                    {
                      type: "focusout",
                      event: (e) => {
                        this.updateGeneralValue(e.target.name, e.target.value);
                      },
                    }
                  ),
                ]),
              ]),
              createElement("div", {}, [
                createElement("div", { class: "cp-content-container" }, [
                  createElement("small", {}, "Level"),
                  createElement(
                    "input",
                    {
                      class: "cp-input-gen cp-input-regular",
                      type: "number",
                      name: "level",
                      value: this.generalData.level
                        ? this.generalData.level
                        : "",
                    },
                    null,
                    {
                      type: "focusout",
                      event: (e) => {
                        this.updateGeneralValue(
                          e.target.name,
                          e.target.valueAsNumber
                        );
                        this.render();
                      },
                    }
                  ),
                ]),
                createElement("div", { class: "cp-content-container" }, [
                  createElement("small", {}, "EXP"),
                  createElement(
                    "input",
                    {
                      class: "cp-input-gen cp-input-regular",
                      type: "number",
                      name: "exp",
                      value: this.generalData.exp ? this.generalData.exp : "",
                    },
                    null,
                    {
                      type: "focusout",
                      event: (e) => {
                        this.updateGeneralValue(
                          e.target.name,
                          e.target.valueAsNumber
                        );
                      },
                    }
                  ),
                ]),
              ]),
            ]),
          ]),
          createElement("div", { class: "cp-info-container-column" }, [
            createElement(
              "div",
              {
                style:
                  "display: flex; flex-wrap: wrap; justify-content: center;",
              },
              [
                createElement("div", { class: "cp-content-container-center" }, [
                  createElement(
                    "input",
                    {
                      class: "cp-input-no-border cp-input-large",
                      type: "number",
                      name: "armor_class",
                      value: this.generalData.armor_class
                        ? this.generalData.armor_class
                        : "",
                    },
                    null,
                    {
                      type: "focusout",
                      event: (e) => {
                        this.updateGeneralValue(
                          e.target.name,
                          e.target.valueAsNumber
                        );
                      },
                    }
                  ),
                  createElement("small", {}, "Armor Class"),
                ]),
                createElement("div", { class: "cp-content-container-center" }, [
                  createElement(
                    "input",
                    {
                      class: "cp-input-no-border cp-input-large",
                      type: "number",
                      name: "initiative",
                      value: this.generalData.initiative
                        ? this.generalData.initiative
                        : "",
                    },
                    null,
                    {
                      type: "focusout",
                      event: (e) => {
                        this.updateGeneralValue(
                          e.target.name,
                          e.target.valueAsNumber
                        );
                      },
                    }
                  ),
                  createElement("small", {}, "Initiative"),
                ]),
                createElement("div", { class: "cp-content-container-center" }, [
                  createElement(
                    "input",
                    {
                      class: "cp-input-no-border cp-input-large",
                      type: "number",
                      name: "speed",
                      value: this.generalData.speed
                        ? this.generalData.speed
                        : "",
                    },
                    null,
                    {
                      type: "focusout",
                      event: (e) => {
                        this.updateGeneralValue(
                          e.target.name,
                          e.target.valueAsNumber
                        );
                      },
                    }
                  ),
                  createElement("small", {}, "Speed"),
                ]),
              ]
            ),
            createElement(
              "div",
              {
                style:
                  "display: flex; flex-wrap: wrap; justify-content: center;",
              },
              [
                createElement("div", { class: "cp-content-container-center" }, [
                  createElement(
                    "div",
                    {
                      class: this.generalData.inspiration
                        ? "boolean-input-active"
                        : "boolean-input",
                      name: "inspiration",
                    },
                    null,
                    {
                      type: "click",
                      event: (e) => {
                        if (e.target.className === "boolean-input")
                          e.target.className = "boolean-input-active";
                        else e.target.className = "boolean-input";
                        this.generalData.inspiration =
                          !this.generalData.inspiration;
                        this.updateGeneralValue(
                          "inspiration",
                          this.generalData.inspiration
                        );
                      },
                    }
                  ),
                  createElement("small", {}, "Inspiration"),
                ]),
                createElement("div", { class: "cp-content-container-center" }, [
                  createElement(
                    "div",
                    {
                      style:
                        "display: flex; align-items: center; justify-content: center;",
                    },
                    [
                      createElement("small", {}, "Total"),
                      createElement(
                        "input",
                        {
                          class: "cp-input-no-border-small",
                          name: "hit_dice_total",
                          type: "number",
                          value: this.generalData.hit_dice_total
                            ? this.generalData.hit_dice_total
                            : "",
                        },
                        null,
                        {
                          type: "focusout",
                          event: (e) => {
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
                      name: "hit_dice",
                      value: this.generalData.hit_dice
                        ? this.generalData.hit_dice
                        : "",
                    },
                    null,
                    {
                      type: "focusout",
                      event: (e) => {
                        this.updateGeneralValue(e.target.name, e.target.value);
                      },
                    }
                  ),
                  createElement("small", {}, "Hit Dice"),
                ]),
                this.hpComponent.domComponent,
              ]
            ),
          ]),
        ]
      ),
      createElement("div", { style: "display: flex; flex-wrap: wrap;" }, [
        ...this.renderAbilityScores(),
      ]),
      createElement("div", { style: "display: flex; flex-wrap: wrap;" }, [
        createElement("div", { class: "cp-content-container-long" }, [
          createElement(
            "div",
            {
              class: "cp-content-long-number",
            },
            `+${this.calculateProBonus()}`
          ),
          createElement(
            "div",
            { class: "cp-content-long-title" },
            createElement("small", {}, "Proficiency Bonus")
          ),
        ]),
        createElement("div", { class: "cp-content-container-long" }, [
          createElement(
            "div",
            {
              class: "cp-content-long-number",
            },
            this.calculatePassivePerception()
          ),
          createElement(
            "div",
            { class: "cp-content-long-title" },
            createElement("small", {}, "Passive Perception (Wis)")
          ),
        ]),
      ]),
      createElement("div", { style: "display: flex; flex-wrap: wrap;" }, [
        createElement(
          "div",
          { style: "display: flex; flex-direction: column;" },
          [
            createElement("div", { class: "cp-info-container-column" }, [
              createElement(
                "div",
                { style: "align-self: center;" },
                "Saving Throws"
              ),
              ...this.renderSavingThrows(),
            ]),
            this.otherProLangComponent.domComponent,
            createElement("div", { class: "cp-info-container-row" }, [
              createElement("div", { class: "cp-content-container-center" }, [
                createElement(
                  "div",
                  {
                    style:
                      "display: flex; align-items: center; justify-content: center;",
                  },
                  [
                    createElement("small", {}, "Total"),
                    createElement(
                      "input",
                      {
                        class: "cp-input-no-border-small",
                        name: "class_resource_total",
                        type: "number",
                        value: this.generalData.class_resource_total
                          ? this.generalData.class_resource_total
                          : "",
                      },
                      null,
                      {
                        type: "focusout",
                        event: (e) => {
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
                    name: "class_resource",
                    value: this.generalData.class_resource
                      ? this.generalData.class_resource
                      : "",
                  },
                  null,
                  {
                    type: "focusout",
                    event: (e) => {
                      this.updateGeneralValue(e.target.name, e.target.value);
                    },
                  }
                ),
                createElement(
                  "input",
                  {
                    class: "cp-input-no-border",
                    style: "font-size: small; color: var(--orange3);",
                    name: "class_resource_title",
                    value: this.generalData.class_resource_title
                      ? this.generalData.class_resource_title
                      : "",
                    placeholder: "Class Resource",
                  },
                  null,
                  {
                    type: "focusout",
                    event: (e) => {
                      this.updateGeneralValue(e.target.name, e.target.value);
                    },
                  }
                ),
              ]),
              createElement("div", { class: "cp-content-container-center" }, [
                createElement(
                  "div",
                  {
                    style:
                      "display: flex; align-items: center; justify-content: center;",
                  },
                  [
                    createElement("small", {}, "Total"),
                    createElement(
                      "input",
                      {
                        class: "cp-input-no-border-small",
                        name: "other_resource_total",
                        type: "number",
                        value: this.generalData.other_resource_total
                          ? this.generalData.other_resource_total
                          : "",
                      },
                      null,
                      {
                        type: "focusout",
                        event: (e) => {
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
                    name: "other_resource_total",
                    type: "number",
                    value: this.generalData.other_resource_total
                      ? this.generalData.other_resource_total
                      : "0",
                  },
                  null,
                  {
                    type: "focusout",
                    event: (e) => {
                      this.updateGeneralValue(
                        e.target.name,
                        e.target.valueAsNumber
                      );
                    },
                  }
                ),
                createElement(
                  "input",
                  {
                    class: "cp-input-no-border",
                    style: "font-size: small; color: var(--orange3);",
                    name: "other_resource_title",
                    value: this.generalData.other_resource_title
                      ? this.generalData.other_resource_title
                      : "",
                    placeholder: "Other Resource",
                  },
                  null,
                  {
                    type: "focusout",
                    event: (e) => {
                      this.updateGeneralValue(e.target.name, e.target.value);
                    },
                  }
                ),
              ]),
            ]),
            createElement("div", { class: "cp-info-container-column" }, [
              createElement(
                "div",
                { style: "align-self: center;" },
                "Death Saves"
              ),
              createElement("div", { style: "display: flex;" }, [
                createElement("small", {}, "Successes"),
                createElement(
                  "div",
                  { style: "display: flex; margin-left: auto;" },
                  [
                    createElement(
                      "div",
                      {
                        class: this.generalData.ds_success_1
                          ? "small-boolean-input-checked"
                          : "small-boolean-input",
                      },
                      null,
                      {
                        type: "click",
                        event: () => {
                          let newVal = !this.generalData.ds_success_1;
                          this.updateGeneralValue("ds_success_1", newVal);
                          this.render();
                        },
                      }
                    ),
                    createElement(
                      "div",
                      {
                        class: this.generalData.ds_success_2
                          ? "small-boolean-input-checked"
                          : "small-boolean-input",
                      },
                      null,
                      {
                        type: "click",
                        event: () => {
                          let newVal = !this.generalData.ds_success_2;
                          this.updateGeneralValue("ds_success_2", newVal);
                          this.render();
                        },
                      }
                    ),
                    createElement(
                      "div",
                      {
                        class: this.generalData.ds_success_3
                          ? "small-boolean-input-checked"
                          : "small-boolean-input",
                      },
                      null,
                      {
                        type: "click",
                        event: () => {
                          let newVal = !this.generalData.ds_success_3;
                          this.updateGeneralValue("ds_success_3", newVal);
                          this.render();
                        },
                      }
                    ),
                  ]
                ),
              ]),
              createElement("div", { style: "display: flex;" }, [
                createElement("small", {}, "Failures"),
                createElement(
                  "div",
                  { style: "display: flex; margin-left: auto;" },
                  [
                    createElement(
                      "div",
                      {
                        class: this.generalData.ds_failure_1
                          ? "small-boolean-input-checked-red"
                          : "small-boolean-input",
                      },
                      null,
                      {
                        type: "click",
                        event: () => {
                          let newVal = !this.generalData.ds_failure_1;
                          this.updateGeneralValue("ds_failure_1", newVal);
                          this.render();
                        },
                      }
                    ),
                    createElement(
                      "div",
                      {
                        class: this.generalData.ds_failure_2
                          ? "small-boolean-input-checked-red"
                          : "small-boolean-input",
                      },
                      null,
                      {
                        type: "click",
                        event: () => {
                          let newVal = !this.generalData.ds_failure_2;
                          this.updateGeneralValue("ds_failure_2", newVal);
                          this.render();
                        },
                      }
                    ),
                    createElement(
                      "div",
                      {
                        class: this.generalData.ds_failure_3
                          ? "small-boolean-input-checked-red"
                          : "small-boolean-input",
                      },
                      null,
                      {
                        type: "click",
                        event: () => {
                          let newVal = !this.generalData.ds_failure_3;
                          this.updateGeneralValue("ds_failure_3", newVal);
                          this.render();
                        },
                      }
                    ),
                  ]
                ),
              ]),
            ]),
            this.equipmentComponent.domComponent,
          ]
        ),
        createElement("div", { class: "cp-info-container-column" }, [
          createElement("div", { style: "align-self: center;" }, "Skills"),
          ...this.renderSkills(),
        ]),
        createElement(
          "div",
          { style: "display: flex; flex-direction: column;" },
          [
            this.attackComponent.domComponent,
            this.featComponent.domComponent,
          ]
        ),
      ])
    );
  };

  renderBackgroundView = async () => {
    this.domComponent.append(
      createElement(
        "div",
        {
          style: "display: flex; flex: 1; flex-wrap: wrap;",
        },
        [
          createElement(
            "div",
            { style: "display: flex; flex-direction: column;" },
            [
              createElement("div", { class: "cp-info-container-column" }, [
                createElement(
                  "div",
                  { style: "display: flex; flex-wrap: wrap;" },
                  [
                    createElement("div", {}, [
                      createElement("div", { class: "cp-content-container" }, [
                        createElement("small", {}, "Background"),
                        createElement(
                          "input",
                          {
                            class: "cp-input-gen cp-input-regular",
                            name: "background",
                            value: this.generalData.background.background
                              ? this.generalData.background.background
                              : "",
                          },
                          null,
                          {
                            type: "focusout",
                            event: (e) => {
                              this.updateBackgroundValue(
                                e.target.name,
                                e.target.value
                              );
                            },
                          }
                        ),
                      ]),
                      createElement("div", { class: "cp-content-container" }, [
                        createElement("small", {}, "Alignment"),
                        createElement(
                          "input",
                          {
                            class: "cp-input-gen cp-input-regular",
                            name: "alignment",
                            value: this.generalData.background.alignment
                              ? this.generalData.background.alignment
                              : "",
                          },
                          null,
                          {
                            type: "focusout",
                            event: (e) => {
                              this.updateBackgroundValue(
                                e.target.name,
                                e.target.value
                              );
                            },
                          }
                        ),
                      ]),
                    ]),
                    createElement("div", {}, [
                      createElement("div", { class: "cp-content-container" }, [
                        createElement("small", {}, "Age"),
                        createElement(
                          "input",
                          {
                            class: "cp-input-gen cp-input-regular",
                            name: "age",
                            value: this.generalData.background.age
                              ? this.generalData.background.age
                              : "",
                          },
                          null,
                          {
                            type: "focusout",
                            event: (e) => {
                              this.updateBackgroundValue(
                                e.target.name,
                                e.target.value
                              );
                            },
                          }
                        ),
                      ]),
                      createElement("div", { class: "cp-content-container" }, [
                        createElement("small", {}, "Eyes"),
                        createElement(
                          "input",
                          {
                            class: "cp-input-gen cp-input-regular",
                            name: "eyes",
                            value: this.generalData.background.eyes
                              ? this.generalData.background.eyes
                              : "",
                          },
                          null,
                          {
                            type: "focusout",
                            event: (e) => {
                              this.updateBackgroundValue(
                                e.target.name,
                                e.target.value
                              );
                            },
                          }
                        ),
                      ]),
                    ]),
                    createElement("div", {}, [
                      createElement("div", { class: "cp-content-container" }, [
                        createElement("small", {}, "Skin"),
                        createElement(
                          "input",
                          {
                            class: "cp-input-gen cp-input-regular",
                            name: "skin",
                            value: this.generalData.background.skin
                              ? this.generalData.background.skin
                              : "",
                          },
                          null,
                          {
                            type: "focusout",
                            event: (e) => {
                              this.updateBackgroundValue(
                                e.target.name,
                                e.target.value
                              );
                            },
                          }
                        ),
                      ]),
                      createElement("div", { class: "cp-content-container" }, [
                        createElement("small", {}, "Hair"),
                        createElement(
                          "input",
                          {
                            class: "cp-input-gen cp-input-regular",
                            name: "hair",
                            value: this.generalData.background.hair
                              ? this.generalData.background.hair
                              : "",
                          },
                          null,
                          {
                            type: "focusout",
                            event: (e) => {
                              this.updateBackgroundValue(
                                e.target.name,
                                e.target.value
                              );
                            },
                          }
                        ),
                      ]),
                    ]),
                    createElement("div", {}, [
                      createElement("div", { class: "cp-content-container" }, [
                        createElement("small", {}, "Height"),
                        createElement(
                          "input",
                          {
                            class: "cp-input-gen cp-input-regular",
                            name: "height",
                            value: this.generalData.background.height
                              ? this.generalData.background.height
                              : "",
                          },
                          null,
                          {
                            type: "focusout",
                            event: (e) => {
                              this.updateBackgroundValue(
                                e.target.name,
                                e.target.value
                              );
                            },
                          }
                        ),
                      ]),
                      createElement("div", { class: "cp-content-container" }, [
                        createElement("small", {}, "Weight"),
                        createElement(
                          "input",
                          {
                            class: "cp-input-gen cp-input-regular",
                            name: "weight",
                            value: this.generalData.background.weight
                              ? this.generalData.background.weight
                              : "",
                          },
                          null,
                          {
                            type: "focusout",
                            event: (e) => {
                              this.updateBackgroundValue(
                                e.target.name,
                                e.target.value
                              );
                            },
                          }
                        ),
                      ]),
                    ]),
                  ]
                ),
              ]),
              createElement("div", { class: "cp-info-container-column" }, [
                createElement(
                  "div",
                  { style: "color: var(--orange3)" },
                  "Appearance"
                ),
                createElement("br"),
                createElement(
                  "textarea",
                  {
                    class: "cp-input-gen input-small",
                    style: "height: 250px;",
                    name: "appearance",
                  },
                  this.generalData.background.appearance
                    ? this.generalData.background.appearance
                    : "",
                  {
                    type: "focusout",
                    event: (e) => {
                      this.updateBackgroundValue(e.target.name, e.target.value);
                      this.render();
                    },
                  }
                ),
              ]),
              createElement("div", { class: "cp-info-container-column" }, [
                createElement(
                  "div",
                  { style: "color: var(--orange3)" },
                  "Backstory"
                ),
                createElement("br"),
                createElement(
                  "textarea",
                  {
                    class: "cp-input-gen input-small",
                    style: "height: 250px;",
                    name: "backstory",
                  },
                  this.generalData.background.backstory
                    ? this.generalData.background.backstory
                    : "",
                  {
                    type: "focusout",
                    event: (e) => {
                      this.updateBackgroundValue(e.target.name, e.target.value);
                      this.render();
                    },
                  }
                ),
              ]),
              createElement("div", { class: "cp-info-container-column" }, [
                createElement(
                  "div",
                  { style: "color: var(--orange3)" },
                  "Allies & Organizations"
                ),
                createElement("br"),
                createElement(
                  "textarea",
                  {
                    class: "cp-input-gen input-small",
                    style: "height: 250px;",
                    name: "allies_and_organizations",
                  },
                  this.generalData.background.allies_and_organizations
                    ? this.generalData.background.allies_and_organizations
                    : "",
                  {
                    type: "focusout",
                    event: (e) => {
                      this.updateBackgroundValue(e.target.name, e.target.value);
                      this.render();
                    },
                  }
                ),
              ]),
              createElement("div", { class: "cp-info-container-column" }, [
                createElement(
                  "div",
                  { style: "color: var(--orange3)" },
                  "Other Info"
                ),
                createElement("br"),
                createElement(
                  "textarea",
                  {
                    class: "cp-input-gen input-small",
                    style: "height: 250px;",
                    name: "other_info",
                  },
                  this.generalData.background.other_info
                    ? this.generalData.background.other_info
                    : "",
                  {
                    type: "focusout",
                    event: (e) => {
                      this.updateBackgroundValue(e.target.name, e.target.value);
                      this.render();
                    },
                  }
                ),
              ]),
            ]
          ),
          createElement("div", { class: "cp-info-container-column " }, [
            createElement(
              "div",
              { style: "display: flex; flex-direction: column;" },
              [
                createElement(
                  "div",
                  { style: "color: var(--orange3)" },
                  "Personality Traits"
                ),
                createElement("br"),
                createElement(
                  "textarea",
                  {
                    class: "cp-input-gen input-small",
                    style: "height: 100px; width: 250px;",
                    name: "personality_traits",
                  },
                  this.generalData.background.personality_traits
                    ? this.generalData.background.personality_traits
                    : "",
                  {
                    type: "focusout",
                    event: (e) => {
                      this.updateBackgroundValue(e.target.name, e.target.value);
                      this.render();
                    },
                  }
                ),
                createElement("hr"),
              ]
            ),
            createElement(
              "div",
              { style: "display: flex; flex-direction: column;" },
              [
                createElement(
                  "div",
                  { style: "color: var(--orange3)" },
                  "Ideals"
                ),
                createElement("br"),
                createElement(
                  "textarea",
                  {
                    class: "cp-input-gen input-small",
                    style: "height: 100px; width: 250px;",
                    name: "ideals",
                  },
                  this.generalData.background.ideals
                    ? this.generalData.background.ideals
                    : "",
                  {
                    type: "focusout",
                    event: (e) => {
                      this.updateBackgroundValue(e.target.name, e.target.value);
                      this.render();
                    },
                  }
                ),
                createElement("hr"),
              ]
            ),
            createElement(
              "div",
              { style: "display: flex; flex-direction: column;" },
              [
                createElement(
                  "div",
                  { style: "color: var(--orange3)" },
                  "Bonds"
                ),
                createElement("br"),
                createElement(
                  "textarea",
                  {
                    class: "cp-input-gen input-small",
                    style: "height: 100px; width: 250px;",
                    name: "bonds",
                  },
                  this.generalData.background.bonds
                    ? this.generalData.background.bonds
                    : "",
                  {
                    type: "focusout",
                    event: (e) => {
                      this.updateBackgroundValue(e.target.name, e.target.value);
                      this.render();
                    },
                  }
                ),
                createElement("hr"),
              ]
            ),
            createElement(
              "div",
              { style: "display: flex; flex-direction: column;" },
              [
                createElement(
                  "div",
                  { style: "color: var(--orange3)" },
                  "Flaws"
                ),
                createElement("br"),
                createElement(
                  "textarea",
                  {
                    class: "cp-input-gen input-small",
                    style: "height: 100px; width: 250px;",
                    name: "flaws",
                  },
                  this.generalData.background.flaws
                    ? this.generalData.background.flaws
                    : "",
                  {
                    type: "focusout",
                    event: (e) => {
                      this.updateBackgroundValue(e.target.name, e.target.value);
                      this.render();
                    },
                  }
                ),
                createElement("hr"),
              ]
            ),
          ]),
        ]
      )
    );
  };

  renderSpellsView = async () => {
    if (!this.spellsComponent) {
      const spellsComponentElem = createElement("div");
      this.spellsComponent = new SpellsComponent({
        domComponent: spellsComponentElem,
        general_id: this.generalData.id,
        generalData: this.generalData,
        updateSpellSlotValue: this.updateSpellSlotValue,
        calculateAbilityScoreModifier: this.calculateAbilityScoreModifier,
        calculateProBonus: this.calculateProBonus,
      });
    }
    this.spellsComponent.generalData = this.generalData;
    this.domComponent.append(this.spellsComponent.domComponent);
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    // char nav
    this.domComponent.append(
      createElement("div", { class: "cp-nav" }, [
        createElement(
          "a",
          {
            class:
              this.mainView === "general"
                ? "cp-nav-item-active"
                : "cp-nav-item",
          },
          "General",
          {
            type: "click",
            event: () => {
              this.mainView = "general";
              this.render();
            },
          }
        ),
        createElement(
          "a",
          {
            class:
              this.mainView === "background"
                ? "cp-nav-item-active"
                : "cp-nav-item",
          },
          "Background",
          {
            type: "click",
            event: () => {
              this.mainView = "background";
              this.render();
            },
          }
        ),
        createElement(
          "a",
          {
            class:
              this.mainView === "spells" ? "cp-nav-item-active" : "cp-nav-item",
          },
          "Spells",
          {
            type: "click",
            event: () => {
              this.mainView = "spells";
              this.render();
            },
          }
        ),
      ])
    );

    if (this.mainView === "general") {
      return this.renderGeneralView();
    }

    if (this.mainView === "background") {
      return this.renderBackgroundView();
    }

    if (this.mainView === "spells") {
      return this.renderSpellsView();
    }
  };
}

class InitSheet {
  constructor() {
    // stop initial spinner
    document.getElementById("initial-spinner").remove();

    this.appComponent = document.getElementById("app");
    this.elem = document.createElement("div");
    this.appComponent.appendChild(this.elem);
    this.init();
  }

  init = async () => {
    this.generalId = history.state;
    const generalData = await getThings(
      `/api/get_5e_character_general/${this.generalId}`
    );
    new FiveEPlayerSheet({
      domComponent: this.elem,
      params: {content: generalData}
    });
  };
}

new InitSheet();
