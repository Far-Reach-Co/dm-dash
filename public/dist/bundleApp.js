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

let state = {
  config: {
    // serverURL: 'http://localhost:4000'
    serverURL: "http://localhost:4000",
    queryLimit: 10,
    queryOffset: 10,
  }
};

if (history.state && history.state.applicationState) {
  state = history.state.applicationState;
}

var state$1 = state;

class AccountManager {
  constructor() {
    this.userInfo = null;

    this.editEmail = false;
    this.saveEmailLoading = false;
    this.init();
  }

  toggleEditEmail = () => {
    this.editEmail = !this.editEmail;
    this.renderAccountApp();
  };

  toggleSaveEmailLoading = () => {
    this.saveEmailLoading = !this.saveEmailLoading;
    this.renderAccountApp();
  };

  init = async () => {
    try {
      // try to append tabs
      await this.appendAccountTabOrLogin();
      if (!this.userInfo) {
        console.log("uhh");
        if (
          window.location.pathname === "/dashboard.html" ||
          window.location.pathname === "/account.html" ||
          window.location.pathname === "/vtt.html" ||
          window.location.pathname === "/sheets.html" ||
          window.location.pathname === "/5eplayer.html"
        ) {
          return (window.location.pathname = "/login.html");
        }
      }
      // stop initial spinner
      if (document.getElementById("initial-spinner")) {
        document.getElementById("initial-spinner").remove();
      }

      // do account app if account page
      if (window.location.pathname === "/account.html") {
        this.renderAccountApp();
      }
    } catch (err) {
      console.log(err);
    }
  };

  verifyToken = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await fetch(`${window.location.origin}/api/verify_jwt`, {
          headers: { "x-access-token": `Bearer ${token}` },
        });
        const resData = await res.json();
        if (res.status === 200) {
          this.userInfo = resData;
          state$1.user = resData;
          return resData;
        } else if (res.status === 400) {
          console.log("expired token");
          return null;
        } else throw resData.error;
      } catch (err) {
        console.log(err);
        return null;
      }
    }
  };

  appendAccountTabOrLogin = async () => {
    const token = await this.verifyToken();
    const navContainer = document.getElementById("nav-links-container");
    const navContainerMobile = document.getElementById(
      "nav-links-container-mobile"
    );
    if (token) {
      navContainer.append(
        createElement(
          "a",
          { class: "top-nav-btn", href: "/dashboard.html" },
          "Dashboard"
        ),
        createElement(
          "a",
          { class: "top-nav-btn", href: "/sheets.html" },
          "Players"
        ),
        createElement(
          "a",
          { class: "top-nav-btn", href: "/account.html" },
          "Account"
        ),
        createElement("a", { class: "top-nav-btn" }, "Logout", {
          type: "click",
          event: () => {
            localStorage.removeItem("token");
            window.location.pathname = "/";
          },
        })
      );
      navContainerMobile.append(
        createElement(
          "a",
          { class: "top-nav-btn", href: "/dashboard.html" },
          "Dashboard"
        ),
        createElement(
          "a",
          { class: "top-nav-btn", href: "/sheets.html" },
          "Players"
        ),
        createElement(
          "a",
          { class: "top-nav-btn", href: "/account.html" },
          "Account"
        ),
        createElement("a", { class: "top-nav-btn" }, "Logout", {
          type: "click",
          event: () => {
            localStorage.removeItem("token");
            window.location.pathname = "/";
          },
        })
      );
    } else {
      navContainer.appendChild(
        createElement(
          "a",
          { class: "top-nav-btn", href: "/login.html" },
          "Login"
        )
      );
      navContainerMobile.appendChild(
        createElement(
          "a",
          { class: "top-nav-btn", href: "/login.html" },
          "Login"
        )
      );
    }
  };

  saveEmail = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);

    const resData = await postThing(
      `/api/edit_user/${this.userInfo.id}`,
      formProps
    );
    if (resData) this.userInfo.email = resData.email;
  };

  renderEmailOrEditEmail = () => {
    if (this.editEmail) {
      return createElement(
        "div",
        { style: "display: flex; flex-direction: column;" },
        [
          createElement("h2", {}, "Edit Email"),
          createElement(
            "form",
            {},
            [
              createElement("label", { for: "email" }, "New Email"),
              createElement("input", {
                type: "email",
                id: "email",
                name: "email",
                value: this.userInfo.email,
                required: true,
              }),
              createElement("br"),
              createElement("button", { type: "submit" }, "Done"),
            ],
            {
              type: "submit",
              event: async (e) => {
                e.preventDefault();
                this.editEmail = false;
                this.toggleSaveEmailLoading();
                await this.saveEmail(e);
                this.toggleSaveEmailLoading();
              },
            }
          ),
          createElement("br"),
          createElement("button", { class: "btn-red" }, "Cancel", {
            type: "click",
            event: this.toggleEditEmail,
          }),
        ]
      );
    }

    return createElement(
      "div",
      { style: "display: flex; justify-content: space-between;" },
      [
        createElement("h2", {}, "Email"),
        createElement("div", { style: "display: flex; align-items: center;" }, [
          createElement(
            "a",
            { class: "small-clickable", style: "margin-right: 5px" },
            "Edit",
            {
              type: "click",
              event: this.toggleEditEmail,
            }
          ),
          createElement("div", {}, this.userInfo.email),
        ]),
      ]
    );
  };

  renderAccountApp = () => {
    const domComponent = document.getElementById("app");
    domComponent.innerHTML = "";

    if (this.saveEmailLoading) {
      return domComponent.append(
        renderLoadingWithMessage("Saving your new email...")
      );
    }

    // domComponent.className = "component";
    domComponent.append(
      createElement("div", { class: "standard-view" }, [
        createElement("h1", { style: "margin: auto;" }, "Account"),
        createElement("br"),
        createElement("div", { class: "component" }, [
          this.renderEmailOrEditEmail(),
          createElement("br"),
          createElement("hr"),
          createElement("button", {}, "Reset Password", {
            type: "click",
            event: () => {
              window.location.pathname = "/resetpassword.html";
            },
          }),
        ]),
      ])
    );
  };
}

new AccountManager();

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "successful" : "unsuccessful";
    console.log("Fallback: Copying text command was " + msg);
    if (successful) toast.show("Copied");
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function () {
      console.log("Async: Copying to clipboard was successful!");
      toast.show("Copied");
    },
    function (err) {
      console.error("Async: Could not copy text: ", err);
    }
  );
}

function humanFileSize(bytes, si=true, dp=1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + 'B';
  }

  const units = si 
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + units[u];
}

class Project {
  constructor(props) {
    this.navigate = props.navigate;
    this.domComponent = props.domComponent;
    this.domComponent.className = "project-btn-container";

    this.id = props.id;
    this.title = props.title;
    this.dateCreated = props.dateCreated;
    this.projectInvite = props.projectInvite;
    this.isEditor = props.isEditor;
    this.wasJoined = props.wasJoined;
    this.dateJoined = props.dateJoined;
    this.projectUserId = props.projectUserId;
    this.usedDataInBytes = props.usedDataInBytes;

    this.edit = false;
    this.parentRender = props.parentRender;
    this.loadingProjectInvite = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  editTitle = (title) => {
    this.title = title.trim();
  };

  saveProject = async () => {
    await postThing(`/api/edit_project/${this.id}`, {
      title: this.title,
    });
  };

  addInviteLink = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/add_project_invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            project_id: this.id,
          }),
        }
      );
      const data = await res.json();
      if (res.status === 201) {
        this.projectInvite = data;
      } else throw new Error();
    } catch (err) {
      console.log(err);
      alert("There was a problem creating your invite link");
    }
  };

  updateProjectUserEditorStatus = async (userId, status) => {
    this.isEditor = status;
    await postThing(`/api/edit_project_user/${userId}`, {
      is_editor: status,
    });
  };

  renderProjectUsersList = async () => {
    const projectUsers = await getThings(
      `/api/get_project_users_by_project/${this.id}`
    );
    const map = projectUsers.map((user) => {
      if (user.is_editor === undefined) user.is_editor = false;
      const checkbox = createElement("input", { type: "checkbox" }, null, {
        type: "change",
        event: (e) => {
          this.updateProjectUserEditorStatus(
            user.project_user_id,
            e.currentTarget.checked
          );
        },
      });
      checkbox.checked = user.is_editor;

      const elem = createElement(
        "div",
        { style: "display: flex; justify-content: space-between;" },
        [
          createElement("div", {}, user.email),
          createElement("label", { class: "switch" }, [
            checkbox,
            createElement("span", { class: "slider round" }),
          ]),
        ]
      );
      return elem;
    });
    if (map.length) return map;
    else return [createElement("div", { style: "visibility: hidden;" })];
  };

  renderManageUsersComponent = async () => {
    if (!this.wasJoined) {
      return [
        createElement("h2", {}, "Manage Invited-Users"),
        createElement("br"),
        createElement(
          "div",
          { style: "display: flex; justify-content: space-between;" },
          [
            createElement("small", {}, "Email"),
            createElement("small", {}, "Is Editor"),
          ]
        ),
        createElement("br"),
        ...(await this.renderProjectUsersList()),
        createElement("hr"),
      ];
    } else return [createElement("div", { style: "visibility: hidden;" })];
  };

  renderInviteLinkComponent = () => {
    if (!this.projectInvite) {
      return [
        createElement("hr"),
        createElement("h2", {}, "Share This Project"),
        createElement("br"),
        createElement("button", {}, "Create Invite Link", {
          type: "click",
          event: async () => {
            this.loadingProjectInvite = true;
            this.render();
            await this.addInviteLink();
            this.loadingProjectInvite = false;
            this.render();
          },
        }),
      ];
    } else {
      const inviteLink = `${window.location.origin}/invite.html?invite=${this.projectInvite.uuid}`;

      const inviteLinkButton = createElement(
        "button",
        { style: "margin-right: 10px;" },
        "Copy Link"
      );
      inviteLinkButton.addEventListener("click", () => {
        copyTextToClipboard(inviteLink);
      });

      const removeInviteButton = createElement(
        "button",
        { class: "btn-red" },
        "Delete Link"
      );
      removeInviteButton.addEventListener("click", () => {
        if (
          window.confirm(`Are you sure you want to delete the invite link?`)
        ) {
          deleteThing(`/api/remove_project_invite/${this.projectInvite.id}`);
          this.projectInvite = null;
          this.render();
        }
      });

      return [
        createElement("hr"),
        createElement("h2", {}, "Share Invite Link"),
        createElement("br"),
        createElement("div", {}, inviteLink),
        inviteLinkButton,
        createElement("br"),
        removeInviteButton,
      ];
    }
  };

  renderEditProject = async () => {
    if (this.loadingProjectInvite) {
      return this.domComponent.append(
        renderLoadingWithMessage("Creating invite link...")
      );
    }

    const titleInput = createElement("input", {
      id: `edit-project-title-${this.id}`,
      value: this.title,
      style: "margin-right: 10px;",
    });

    const doneButton = createElement(
      "button",
      { style: "margin-right: 10px;" },
      "Done"
    );
    doneButton.addEventListener("click", async () => {
      this.editTitle(titleInput.value);
      this.saveProject();
      this.toggleEdit();
    });

    const removeButton = createElement(
      "button",
      { class: "btn-red" },
      `${this.wasJoined ? "Leave" : "Delete"} Project`
    );
    removeButton.addEventListener("click", async () => {
      if (
        window.confirm(
          `Are you sure you want to ${this.wasJoined ? "leave" : "delete"} ${
            this.title
          }`
        )
      ) {
        if (!this.wasJoined) {
          deleteThing(`/api/remove_project/${this.id}`);
          this.toggleEdit();
          this.domComponent.remove();
        } else {
          await deleteThing(`/api/remove_project_user/${this.projectUserId}`);
          this.parentRender();
        }
      }
    });

    if (this.isEditor === false) {
      return this.domComponent.append(
        createElement("div", { class: "project-edit-container" }, [
          createElement("h2", {}, `Edit Project: "${this.title}"`),
          doneButton,
          createElement("br"),
          removeButton,
        ])
      );
    }

    // append
    this.domComponent.append(
      createElement("div", { class: "project-edit-container" }, [
        createElement("h2", {}, `Edit Project: "${this.title}"`),
        createElement("br"),
        createElement("div", { style: "display: flex; align-items: center;" }, [
          createElement("div", { style: "margin-right: 10px" }, "Title"),
          titleInput,
        ]),
        ...this.renderInviteLinkComponent(),
        createElement("hr"),
        ...(await this.renderManageUsersComponent()),
        doneButton,
        createElement("br"),
        removeButton,
      ])
    );
  };

  calculateDateDisplay = () => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    if (!this.dateJoined) {
      return `Created: ${new Date(this.dateCreated).toLocaleDateString(
        "en-US",
        options
      )}`;
    } else {
      return `Joined: ${new Date(this.dateJoined).toLocaleDateString(
        "en-US",
        options
      )}`;
    }
  };

  calculateUsedData = () => {
    return "Data Size:" + " " + humanFileSize(this.usedDataInBytes);
  };

  render = () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEditProject();
    }

    // append
    this.domComponent.append(
      createElement(
        "div",
        {
          id: `project-${this.id}`,
          class: "project-button",
        },
        [
          createElement("h1", {}, this.title),
          createElement(
            "div",
            { class: "project-extra-info" },
            this.calculateDateDisplay()
          ),
          createElement(
            "div",
            { class: "project-extra-info" },
            this.calculateUsedData()
          ),
        ],
        {
          type: "click",
          event: () => {
            state$1.currentProject = {
              id: this.id,
              title: this.title,
              dateCreated: this.dateCreated,
              projectInvite: this.projectInvite,
              isEditor: this.isEditor,
              wasJoined: this.wasJoined,
              dateJoined: this.dateJoined,
              projectUserId: this.projectUserId,
            };
            this.navigate({ title: "main", sidebar: true });
          },
        }
      ),
      createElement(
        "img",
        {
          class: "icon",
          src: "/assets/gears.svg",
        },
        null,
        {
          type: "click",
          event: this.toggleEdit,
        }
      )
    );
  };
}

class ProjectsView {
  constructor(props) {
    this.navigate = props.navigate;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.newProjectLoading = false;

    this.render();
  }

  toggleLoadingNewProject = () => {
    this.newProjectLoading = !this.newProjectLoading;
    this.render();
  };

  newProject = async () => {
    this.toggleLoadingNewProject();
    await postThing("/api/add_project", {
      title: `My Project ${state$1.projects.length + 1}`,
    });
    this.toggleLoadingNewProject();
  };

  renderProjectsElems = async () => {
    const projectData = await getThings("/api/get_projects");
    if (projectData) state$1.projects = projectData;

    const map = projectData.map((project) => {
      // create element
      const elem = createElement("div", {
        id: `project-component-${project.id}`,
      });
      // instantiate javascript
      new Project({
        domComponent: elem,
        id: project.id,
        title: project.title,
        dateCreated: project.date_created,
        usedDataInBytes: project.used_data_in_bytes,
        isEditor: project.is_editor,
        wasJoined: project.was_joined,
        dateJoined: project.date_joined,
        projectUserId: project.project_user_id,
        projectInvite: project.project_invite,
        parentRender: this.render,
        navigate: this.navigate,
      });
      return elem;
    });
    if (map.length) return map;
    else return [createElement("div", {}, "None...")];
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.newProjectLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Please wait while we prepare your project...")
      );
    }

    // append
    this.domComponent.append(
      // createElement(
      //   "h1",
      //   { class: "projects-view-title" },
      //   "Choose your project"
      //   ),
      //   createElement("hr", { class: "special-hr" }),
      createElement("button", { class: "new-btn" }, "+ Project", {
        type: "click",
        event: this.newProject,
      }),
      createElement("hr"),
      ...(await this.renderProjectsElems())
    );
  };
}

function msToTime(duration, twelveHours) {
  let milliseconds = Math.floor((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  // days = Math.floor(duration / (1000 * 60 * 60 * 24))

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  // handle 12 hour clock output
  if (twelveHours) {
    let hoursGreaterThanTwelve = null;
    if (hours == "00") {
      return "12" + ":" + minutes + " AM";
    }
    if (hours > 12) {
      hoursGreaterThanTwelve = hours - 12;
      return hoursGreaterThanTwelve + ":" + minutes + " PM";
    }
    if (hours == 12) {
      return hours + ":" + minutes + " PM";
    }

    return hours + ":" + minutes + " AM";
  }

  return (
    // 'Days: ' +
    // days +
    // '........' +
    hours + ":" + minutes + ":" + seconds + "." + milliseconds
  );
}

function hidableEditLink(toggleEdit) {
  if (state$1.currentProject.isEditor === false) {
    return createElement("div", { style: "visibility: hidden;" });
  } else {
    return createElement("div", { class: "edit-btn" }, "[Edit]", {
      type: "click",
      event: toggleEdit,
    });
  }
}

function listItemTitle(title, toggleEdit) {
  return createElement("div", { class: "title-edit" }, [
    title,
    hidableEditLink(toggleEdit),
  ]);
}

class Clock {
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
    await postThing(`/api/edit_clock/${this.id}`, {
      title: this.title,
      current_time_in_milliseconds: this.currentTimeInMilliseconds,
    });
  };

  renderEditClock = () => {
    var milliseconds = this.currentTimeInMilliseconds;
    var time = msToTime(milliseconds, false);
    var valueForInput = time.substring(0, time.length - 2);

    const editTitle = createElement(
      "div",
      { class: "component-title" },
      `Edit ${this.title}`
    );

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
      this.toggleEdit();
      this.saveClock();
    });
    const removeButton = createElement(
      "button",
      { class: "btn-red" },
      "Remove Clock"
    );
    removeButton.addEventListener("click", () => {
      if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
        deleteThing(`/api/remove_clock/${this.id}`);
        this.domComponent.remove();
        this.toggleEdit();
      }
    });
    const resetButton = createElement("button", {}, "Reset");
    resetButton.addEventListener("click", async () => {
      if (window.confirm(`Are you sure you want to reset ${this.title}`)) {
        this.reset();
        this.toggleEdit();
        this.saveClock();
      }
    });
    // append
    this.domComponent.append(
      editTitle,
      createElement("br"),
      titleInput,
      createElement("br"),
      timeInput,
      createElement("br"),
      doneButton,
      resetButton,
      removeButton
    );
  };

  renderEditButtonsOrNull = () => {
    if (state$1.currentProject.isEditor === false) {
      return [createElement("div", { style: "visibility: hidden;" })];
    } else {
      const selectSpeed = createElement("select", { name: "speed" }, [
        createElement("option", { value: 1 }, "Speed"),
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
      for (var option of selectSpeed.children) {
        if (option.value == this.runSpeed) {
          option.selected = true;
          break;
        }
      }

      return [
        createElement("br"),
        createElement("button", { class: "new-btn" }, "Start", {
          type: "click",
          event: this.start,
        }),
        createElement("button", { class: "btn-red" }, "Stop", {
          type: "click",
          event: this.stop,
        }),
        createElement("br"),
        selectSpeed,
      ];
    }
  };

  render = async () => {
    // clear
    this.domComponent.innerHTML = "";
    // if edit clock
    if (this.edit) {
      this.renderEditClock();
      return;
    }

    const currentTimeDiv = createElement("div", {
      id: `current-time-${this.id}`,
    });

    this.currentTimeDiv = currentTimeDiv;

    // append
    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        await listItemTitle(this.title, this.toggleEdit),
        createElement("img", {
          src: "/assets/clock.svg",
          width: 30,
          height: 30,
        }),
      ]),
      currentTimeDiv,
      ...this.renderEditButtonsOrNull()
    );
    // Display time
    this.renderDisplayTime();
  };
}

class ClocksView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";
    this.render();
  }

  toggleNewClockLoading = () => {
    this.render();
  };

  getClockElements = async () => {
    // ******** CLOCKS
    const clockElements = [];

    var projectId = state$1.currentProject.id;
    const clockData = await getThings(`/api/get_clocks/${projectId}`);
    if (clockData) state$1.clocks = clockData;
    // render
    clockData.forEach((clock) => {
      // create element
      const clockComponentDomElement = createElement("div", {
        id: `clock-component-${clock.id}`,
      });
      // append
      clockElements.push(clockComponentDomElement);
      // instantiate
      new Clock({
        domComponent: clockComponentDomElement,
        id: clock.id,
        title: clock.title,
        currentTimeInMilliseconds: clock.current_time_in_milliseconds,
        parentRender: this.render,
      });
    });
    return clockElements;
  };

  newClock = async () => {
    if (!state$1.clocks) return;

    var projectId = state$1.currentProject.id;
    const resData = await postThing("/api/add_clock", {
      title: "New Clock",
      current_time_in_milliseconds: 0,
      project_id: projectId,
    });
    if (resData) {
      const clock = resData;
      const clockComponentDomElement = createElement("div", {
        id: `clock-component-${clock.id}`,
      });
      // append
      this.domComponent.appendChild(clockComponentDomElement);
      // instantiate
      new Clock({
        domComponent: clockComponentDomElement,
        id: clock.id,
        title: clock.title,
        currentTimeInMilliseconds: clock.current_time_in_milliseconds,
        parentRender: this.render,
      });
    }
  };

  renderAddButtonOrNull = () => {
    if (state$1.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else
      return createElement("button", { class: "new-btn" }, "+ Clock", {
        type: "click",
        event: this.newClock,
      });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    // append
    this.domComponent.append(
      this.renderAddButtonOrNull(),
      createElement("hr"),
      createElement(
        "small",
        { style: "align-self: center;" },
        "* Clocks are auto saved every 60 seconds while running, or when stop is pressed"
      ),
      createElement("br"),
      ...(await this.getClockElements())
    );
  };
}

class Calendar {
  constructor(props) {
    // domcomp
    this.domComponent = props.domComponent;
    this.domComponent.className = "component";
    this.parentComponentRender = props.parentComponentRender;
    // values
    this.id = props.id;
    this.projectId = props.projectId;
    this.year = props.year;
    this.currentMonthId = props.currentMonthId;
    this.currentDay = props.currentDay;
    this.title = props.title;
    this.months = props.months;
    this.daysOfTheWeek = props.daysOfTheWeek;
    // render views
    this.edit = false;
    this.open = false;
    this.loading = false;
    // open navigation views
    this.monthBeingViewed = this.calculateCurrentMonth();
    this.yearBeingViewed = this.year;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  toggleLoading = () => {
    this.loading = !this.loading;
    this.render();
  };

  calculateCurrentDayOfTheWeek = () => {
    if (!this.daysOfTheWeek.length || !this.months.length) return "unknown-day";
    let totalDaysPassed = 0;
    // get all the days in one year
    let daysInYear = 0;
    this.months.forEach((month) => (daysInYear += month.number_of_days));
    // get and add all days in all years
    totalDaysPassed += daysInYear * (this.year - 1);
    // get and add days from this year
    let daysPassedInThisYear = 0;
    const currentMonthIndex = this.calculateCurrentMonth().index;
    for (const month of this.months) {
      if (month.index === currentMonthIndex) break;
      daysPassedInThisYear += month.number_of_days;
    }
    daysPassedInThisYear += this.currentDay - 1;
    totalDaysPassed += daysPassedInThisYear;
    // get index and return title
    let indexOfCurrentDay = totalDaysPassed % this.daysOfTheWeek.length;
    indexOfCurrentDay++;
    return this.daysOfTheWeek.filter(
      (day) => day.index === indexOfCurrentDay
    )[0].title;
  };

  calculateFirstDayOfTheWeekOfMonth = (currentMonthIndex) => {
    if (!this.daysOfTheWeek.length || !this.months.length) return null;
    let totalDaysPassed = 0;
    // get all the days in one year
    let daysInYear = 0;
    this.months.forEach((month) => (daysInYear += month.number_of_days));
    // get and add all days in all years
    totalDaysPassed += daysInYear * (this.year - 1);
    // get and add days from this year
    let daysPassedInThisYear = 0;
    for (const month of this.months) {
      if (month.index === currentMonthIndex) break;
      daysPassedInThisYear += month.number_of_days;
    }
    totalDaysPassed += daysPassedInThisYear;
    // get day of the week
    let indexOfCurrentDay = totalDaysPassed % this.daysOfTheWeek.length;
    indexOfCurrentDay++;
    return this.daysOfTheWeek.filter(
      (day) => day.index === indexOfCurrentDay
    )[0];
  };

  calculateCurrentMonth = () => {
    if (!this.months.length) return { title: "unknown-month" };
    return this.months.filter((month) => {
      if (this.currentMonthId) return month.id === this.currentMonthId;
      else return month.index === 1;
    })[0];
  };

  updateCalendar = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    if (formProps.title) formProps.title = formProps.title.trim();
    // update UI
    this.title = formProps.title;
    this.year = formProps.year;
    await postThing(`/api/edit_calendar/${this.id}`, formProps);
  };

  newMonth = async () => {
    const data = await postThing("/api/add_month", {
      calendar_id: this.id,
      index: this.months.length + 1,
      title: `Month(${this.months.length + 1})`,
      number_of_days: 30,
    });
    if (data) this.months.push(data);
  };

  newDay = async () => {
    const data = await postThing("/api/add_day", {
      calendar_id: this.id,
      index: this.daysOfTheWeek.length + 1,
      title: `Day(${this.daysOfTheWeek.length + 1})`,
    });
    if (data) this.daysOfTheWeek.push(data);
  };

  updateMonths = async () => {
    const monthUpdateSuccessList = [];

    await Promise.all(
      this.months.map(async (month) => {
        const resData = await postThing(`/api/edit_month/${month.id}`, {
          title: month.title,
          index: month.index,
          number_of_days: month.number_of_days,
        });
        if (resData) monthUpdateSuccessList.push(resData);
      })
    );
    const successListSortedByIndex = monthUpdateSuccessList.sort(
      (a, b) => a.index - b.index
    );

    this.months = successListSortedByIndex;
  };

  updateDays = async () => {
    const dayUpdateSuccessList = [];

    await Promise.all(
      this.daysOfTheWeek.map(async (day) => {
        const resData = await postThing(`/api/edit_day/${day.id}`, {
          title: day.title,
          index: day.index,
        });
        if (resData) dayUpdateSuccessList.push(resData);
      })
    );
    const successListSortedByIndex = dayUpdateSuccessList.sort(
      (a, b) => a.index - b.index
    );
    this.daysOfTheWeek = successListSortedByIndex;
  };

  handleDayClicked = async (dayNumber) => {
    // dont let non-editors use this
    if (state$1.currentProject.isEditor === false) return;

    dayNumber = parseInt(dayNumber);
    // updated UI
    this.currentMonthId = this.monthBeingViewed.id;
    this.currentDay = dayNumber;
    this.render();
    // then send data call
    await postThing(`/api/edit_calendar/${this.id}`, {
      current_day: dayNumber,
      current_month_id: this.monthBeingViewed.id,
    });
  };

  renderManageDays = () => {
    // setup main form div for each day
    const mainDiv = createElement("div", {});
    this.daysOfTheWeek
      .sort((a, b) => a.index - b.index)
      .forEach((day, index) => {
        const dayContainer = createElement("div", { class: "day-container" });
        // index
        const indexLabel = createElement(
          "div",
          { style: "display: inline-block; margin-right: 10px;" },
          `Day ${index + 1}`
        );
        // title
        const titleInput = createElement("input", {
          name: "title",
          value: day.title,
        });
        titleInput.addEventListener("change", (e) => {
          day.title = e.target.value.trim();
        });

        // remove
        const removeDayBtn = createElement(
          "button",
          { class: "btn-red" },
          "Remove Day"
        );
        removeDayBtn.addEventListener("click", () => {
          deleteThing(`/api/remove_day/${day.id}`);
          this.daysOfTheWeek.splice(this.daysOfTheWeek.indexOf(day), 1);
          this.render();
        });
        // move index
        const moveBtnContainer = createElement("div", {
          style: "display: inline-block;",
        });
        const moveUpBtn = createElement("button", { class: "move-btn" }, "▲");
        moveUpBtn.addEventListener("click", async () => {
          // dec
          day.index -= 1;
          if (this.daysOfTheWeek[index - 1])
            this.daysOfTheWeek[index - 1].index += 1;
          this.render();
        });
        const moveDownBtn = createElement("button", { class: "move-btn" }, "▼");
        moveDownBtn.addEventListener("click", async () => {
          // inc
          day.index += 1;
          if (this.daysOfTheWeek[index + 1])
            this.daysOfTheWeek[index + 1].index -= 1;
          this.render();
        });
        // manage render which buttons are available based on index position
        if (day.index === 1 && this.daysOfTheWeek.length > 1) {
          moveBtnContainer.append(moveDownBtn);
        } else if (day.index != this.daysOfTheWeek.length) {
          moveBtnContainer.append(moveDownBtn);
          moveBtnContainer.append(moveUpBtn);
        } else {
          moveBtnContainer.append(moveUpBtn);
        }
        // append
        dayContainer.append(
          indexLabel,
          titleInput,
          removeDayBtn,
          moveBtnContainer
        );
        mainDiv.append(dayContainer);
      });
    // add day
    const addBtn = createElement("button", {}, "+ Day");
    addBtn.addEventListener("click", async () => {
      this.toggleLoading();
      await this.newDay();
      this.toggleLoading();
    });
    mainDiv.append(addBtn);
    // done
    const doneBtn = createElement("button", {}, "Done");
    doneBtn.addEventListener("click", async () => {
      this.manageDays = false;
      this.toggleLoading();
      await this.updateDays();
      this.toggleLoading();
    });
    mainDiv.append(doneBtn);
    // append
    this.domComponent.appendChild(mainDiv);
  };

  renderManageMonths = () => {
    // setup main form div for each month
    const mainDiv = createElement("div", {});
    this.months
      .sort((a, b) => a.index - b.index)
      .forEach((month, index) => {
        const monthContainer = createElement("div", {
          class: "month-container",
        });
        // index
        const indexLabel = createElement(
          "div",
          { style: "display: inline-block; margin-right: 10px;" },
          `Month ${index + 1}`
        );
        // title
        const titleInput = createElement("input", {
          name: "title",
          value: month.title,
        });
        titleInput.addEventListener("change", (e) => {
          month.title = e.target.value.trim();
        });
        // number of days
        const numOfDaysLabel = createElement(
          "label",
          { for: "number_of_days", style: "margin-right: 10px;" },
          "Days"
        );
        const numOfDaysInput = createElement("input", {
          name: "number_of_days",
          value: month.number_of_days.toString(),
          type: "number",
          step: "1",
          min: "1",
        });
        numOfDaysInput.addEventListener("change", (e) => {
          month.number_of_days = parseInt(e.target.value);
        });
        // remove
        const removeMonthBtn = createElement(
          "button",
          { class: "btn-red" },
          "Remove Month"
        );
        removeMonthBtn.addEventListener("click", () => {
          deleteThing(`/api/remove_month/${month.id}`);
          this.months.splice(this.months.indexOf(month), 1);
          this.render();
        });
        // move index
        const moveBtnContainer = createElement("div", {
          style: "display: inline-block;",
        });
        const moveUpBtn = createElement("button", { class: "move-btn" }, "▲");
        moveUpBtn.addEventListener("click", async () => {
          // dec
          month.index -= 1;
          if (this.months[index - 1]) this.months[index - 1].index += 1;
          this.render();
        });
        const moveDownBtn = createElement("button", { class: "move-btn" }, "▼");
        moveDownBtn.addEventListener("click", async () => {
          // inc
          month.index += 1;
          if (this.months[index + 1]) this.months[index + 1].index -= 1;
          this.render();
        });
        // manage render which buttons are available based on index position
        if (month.index === 1 && this.months.length > 1) {
          moveBtnContainer.append(moveDownBtn);
        } else if (month.index != this.months.length) {
          moveBtnContainer.append(moveDownBtn);
          moveBtnContainer.append(moveUpBtn);
        } else {
          moveBtnContainer.append(moveUpBtn);
        }
        // append
        monthContainer.append(
          indexLabel,
          titleInput,
          numOfDaysLabel,
          numOfDaysInput,
          removeMonthBtn,
          moveBtnContainer
        );
        mainDiv.append(monthContainer);
      });
    // add month
    const addBtn = createElement("button", {}, "+ Month");
    addBtn.addEventListener("click", async () => {
      this.toggleLoading();
      await this.newMonth();
      this.toggleLoading();
    });
    mainDiv.append(addBtn);
    // done
    const doneBtn = createElement("button", {}, "Done");
    doneBtn.addEventListener("click", async () => {
      this.manageMonths = false;
      this.toggleLoading();
      await this.updateMonths();
      this.toggleLoading();
    });
    mainDiv.append(doneBtn);
    // append
    this.domComponent.appendChild(mainDiv);
  };

  renderManageCalendar = () => {
    const form = createElement("form", {}, [
      createElement("label", { for: "title" }, "Calendar Title"),
      createElement("input", {
        id: "title",
        value: this.title,
        name: "title",
      }),
      createElement("label", { for: "year" }, "Current Year"),
      createElement("input", {
        id: "year",
        name: "year",
        type: "number",
        step: "1",
        min: "1",
        value: this.year,
      }),
      createElement(
        "button",
        { type: "submit", style: "margin-top: 10px;" },
        "Done"
      ),
    ]);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.manageCalendar = false;
      this.toggleLoading();
      await this.updateCalendar(e);
      this.toggleLoading();
    });

    this.domComponent.appendChild(form);
  };

  renderEdit = async () => {
    if (this.loading) {
      return this.domComponent.append(renderLoadingWithMessage("Loading..."));
    }

    if (this.manageCalendar) {
      return this.renderManageCalendar();
    }
    if (this.manageMonths) {
      return this.renderManageMonths();
    }
    if (this.manageDays) {
      return this.renderManageDays();
    }

    const manageBtnContainer = createElement("div", {
      style: "margin-bottom: 10px;",
    });

    const manageCalendarBtn = createElement("button", {}, "Manage Calendar");
    manageCalendarBtn.addEventListener("click", async () => {
      // toggle and render
      this.manageCalendar = true;
      this.render();
    });
    const manageMonthsBtn = createElement("button", {}, "Manage Months");
    manageMonthsBtn.addEventListener("click", async () => {
      // toggle and render
      this.manageMonths = true;
      this.render();
    });
    const manageDaysBtn = createElement(
      "button",
      {},
      "Manage Days of the Week"
    );
    manageDaysBtn.addEventListener("click", async () => {
      // toggle and render
      this.manageDays = true;
      this.render();
    });

    manageBtnContainer.append(
      manageCalendarBtn,
      createElement("br"),
      manageMonthsBtn,
      createElement("br"),
      manageDaysBtn,
      createElement("br")
    );

    const doneButton = createElement("button", {}, "Done");
    doneButton.addEventListener("click", async () => {
      // toggle and render
      this.toggleEdit();
    });
    const removeButton = createElement(
      "button",
      { class: "btn-red" },
      "Remove Calendar"
    );
    removeButton.addEventListener("click", () => {
      if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
        deleteThing(`/api/remove_calendar/${this.id}`);
        this.toggleEdit();
        this.domComponent.remove();
      }
    });

    this.domComponent.append(
      createElement("div", { class: "component-title" }, `Edit ${this.title}`),
      createElement("br"),
      manageBtnContainer,
      doneButton,
      removeButton
    );
  };

  renderOpen = async () => {
    const previousMonth = this.months.filter(
      (month) => month.index === this.monthBeingViewed.index - 1
    )[0];
    const nextMonth = this.months.filter(
      (month) => month.index === this.monthBeingViewed.index + 1
    )[0];
    const title = createElement(
      "div",
      { class: "component-title" },
      this.title
    );
    const monthYear = createElement(
      "div",
      {},
      `${this.monthBeingViewed.title} ${this.year}`
    );
    const arrowButtonLeft = createElement("button", {}, "<");
    arrowButtonLeft.addEventListener("click", () => {
      this.monthBeingViewed = previousMonth;
      this.render();
    });
    const arrowButtonRight = createElement("button", {}, ">");
    arrowButtonRight.addEventListener("click", () => {
      this.monthBeingViewed = nextMonth;
      this.render();
    });

    const calendarContainer = createElement("div", {
      class: "calendar-container",
    });
    calendarContainer.style.display = "grid";
    calendarContainer.style.gridTemplateColumns = `repeat(${
      this.daysOfTheWeek.length ? this.daysOfTheWeek.length : 7
    }, 1fr)`;
    for (const day of this.daysOfTheWeek) {
      const elem = createElement("div", { class: "calendar-box" }, day.title);
      calendarContainer.append(elem);
    }
    const firstDayOfTheWeekOfTheMonth = this.calculateFirstDayOfTheWeekOfMonth(
      this.monthBeingViewed.index
    );
    // input empty days
    for (var i = 1; i < firstDayOfTheWeekOfTheMonth.index; i++) {
      const elem = createElement("div", { class: "calendar-box" }, dayNumber);
      calendarContainer.append(elem);
    }
    // input real days
    for (
      var dayNumber = 1;
      dayNumber <= this.monthBeingViewed.number_of_days;
      dayNumber++
    ) {
      const elem = createElement(
        "div",
        {
          class: `calendar-box ${
            state$1.currentProject.isEditor === false
              ? "non-clickable-day"
              : "clickable-day"
          }`,
        },
        dayNumber,
        { type: "click", event: () => this.handleDayClicked(elem.innerHTML) }
      );
      if (
        dayNumber === this.currentDay &&
        this.monthBeingViewed.id === this.currentMonthId
      )
        elem.style.backgroundColor = "var(--orange)";
      calendarContainer.append(elem);
    }

    const closeButton = createElement("button", {}, "Close");
    closeButton.addEventListener("click", () => {
      this.open = false;
      this.render();
    });

    this.domComponent.append(title, monthYear);
    if (previousMonth) {
      this.domComponent.append(arrowButtonLeft);
    }
    if (nextMonth) {
      this.domComponent.append(arrowButtonRight);
    }
    this.domComponent.append(
      createElement("br"),
      calendarContainer,
      createElement("br"),
      closeButton
    );
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    // edit
    if (this.edit) {
      return this.renderEdit();
    }
    // open
    if (this.open) {
      return this.renderOpen();
    }

    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        await listItemTitle(this.title, this.toggleEdit),
        createElement("img", {
          src: "/assets/calendar.svg",
          width: 30,
          height: 30,
        }),
      ]),
      createElement(
        "div",
        { class: "current-date" },
        `${this.calculateCurrentDayOfTheWeek()}, ${this.currentDay} of ${
          this.calculateCurrentMonth().title
        } in the year ${this.year}`
      ),
      createElement("button", {}, "Open", {
        type: "click",
        event: () => {
          this.open = true;
          this.render();
        },
      })
    );
  };
}

class CalendarView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    // creation vars
    this.creatingNewCalendar = false;
    this.creatingNewMonths = false;
    this.months = [];
    this.creatingNewDaysInWeek = false;
    this.daysOfTheWeek = [];
    this.calendarBeingCreated = null;
    this.monthsCreated = [];
    this.daysCreated = [];
    this.loading = false;

    this.render();
  }

  toggleLoading = () => {
    this.loading = !this.loading;
    this.render();
  }

  resetCalendarCreation = () => {
    this.creatingNewCalendar = false;
    this.creatingNewMonths = false;
    this.creatingNewDaysInWeek = false;
    this.calendarBeingCreated = null;
    this.monthsCreated = [];
    this.daysCreated = [];
  };

  updateCalendarCurrentMonth = async (monthId) => {
    await postThing(`/api/edit_calendar/${this.calendarBeingCreated.id}`, {
      current_month_id: monthId,
    });
  };

  newCalendar = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    const projectId = state$1.currentProject.id;
    const resData = await postThing("/api/add_calendar", {
      project_id: projectId,
      title: formProps.title.trim(),
      year: parseInt(formProps.year),
    });
    if (resData) return resData;
    else return null;
  };

  newDay = async () => {
    const data = await postThing("/api/add_day", {
      calendar_id: this.calendarBeingCreated.id,
      index: this.daysOfTheWeek.length + 1,
      title: `Day(${this.daysOfTheWeek.length + 1})`,
    });
    if (data) this.daysOfTheWeek.push(data);
  };

  updateDays = async () => {
    const dayUpdateSuccessList = [];

    await Promise.all(
      this.daysOfTheWeek.map(async (day) => {
        await postThing(`/api/edit_day/${day.id}`, {
          title: day.title,
          index: day.index,
        });
      })
    );
    const successListSortedByIndex = dayUpdateSuccessList.sort(
      (a, b) => a.index - b.index
    );
    this.daysOfTheWeek = successListSortedByIndex;
  };

  renderNewDaysInWeek = () => {
    this.domComponent.innerHTML = "";

    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      `Create days for: ${this.calendarBeingCreated.title}`
    );

    const infoElem = createElement(
      "small",
      {},
      "You can change/manage days in the 'edit' menu for this calendar after creation"
    );

    // setup main form div for each day
    const mainDiv = createElement("div", {});
    this.daysOfTheWeek
      .sort((a, b) => a.index - b.index)
      .forEach((day, index) => {
        const dayContainer = createElement("div", { class: "day-container" });
        // index
        const indexLabel = createElement(
          "div",
          { style: "display: inline-block; margin-right: 10px;" },
          `Day ${index + 1}`
        );
        // title
        const titleInput = createElement("input", {
          name: "title",
          value: day.title,
        });
        titleInput.addEventListener("change", (e) => {
          day.title = e.target.value.trim();
        });

        // remove
        const removeDayBtn = createElement(
          "button",
          { class: "btn-red" },
          "Remove Day"
        );
        removeDayBtn.addEventListener("click", () => {
          deleteThing(`/api/remove_day/${day.id}`);
          this.daysOfTheWeek.splice(this.daysOfTheWeek.indexOf(day), 1);
          this.render();
        });
        // move index
        const moveBtnContainer = createElement("div", {
          style: "display: inline-block;",
        });
        const moveUpBtn = createElement("button", { class: "move-btn" }, "▲");
        moveUpBtn.addEventListener("click", async () => {
          // dec
          day.index -= 1;
          if (this.daysOfTheWeek[index - 1])
            this.daysOfTheWeek[index - 1].index += 1;
          this.render();
        });
        const moveDownBtn = createElement("button", { class: "move-btn" }, "▼");
        moveDownBtn.addEventListener("click", async () => {
          // inc
          day.index += 1;
          if (this.daysOfTheWeek[index + 1])
            this.daysOfTheWeek[index + 1].index -= 1;
          this.render();
        });
        // manage render which buttons are available based on index position
        if (day.index === 1 && this.daysOfTheWeek.length > 1) {
          moveBtnContainer.append(moveDownBtn);
        } else if (day.index != this.daysOfTheWeek.length) {
          moveBtnContainer.append(moveDownBtn);
          moveBtnContainer.append(moveUpBtn);
        } else {
          moveBtnContainer.append(moveUpBtn);
        }
        // append
        dayContainer.append(
          indexLabel,
          titleInput,
          removeDayBtn,
          moveBtnContainer
        );
        mainDiv.append(dayContainer);
      });
    // add day
    const addBtn = createElement("button", {}, "+ Day");
    addBtn.addEventListener("click", async () => {
      this.toggleLoading();
      await this.newDay();
      this.toggleLoading();
    });
    mainDiv.append(addBtn);

    const completeButton = createElement("button", {}, "Complete");
    completeButton.addEventListener("click", async () => {
      if (!this.daysOfTheWeek.length) return alert("Please create at least one day");
      this.toggleLoading();
      this.resetCalendarCreation();
      await this.updateDays();
      this.toggleLoading();
    });

    // append
    this.domComponent.append(
      titleOfForm,
      infoElem,
      createElement("br"),
      mainDiv,
      createElement("br"),
      completeButton
    );
  };

  updateMonths = async () => {
    const monthUpdateSuccessList = [];

    await Promise.all(
      this.months.map(async (month) => {
        await postThing(`/api/edit_month/${month.id}`, {
          title: month.title,
          index: month.index,
          number_of_days: month.number_of_days,
        });
      })
    );
    const successListSortedByIndex = monthUpdateSuccessList.sort(
      (a, b) => a.index - b.index
    );
    this.months = successListSortedByIndex;
  };

  newMonth = async () => {
    const data = await postThing("/api/add_month", {
      calendar_id: this.calendarBeingCreated.id,
      index: this.months.length + 1,
      title: `Month(${this.months.length + 1})`,
      number_of_days: 30,
    });
    if (data) this.months.push(data);
  };

  renderNewMonths = async () => {
    this.domComponent.innerHTML = "";

    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      `Create months for: ${this.calendarBeingCreated.title}`
    );

    const infoElem = createElement(
      "small",
      {},
      "You can change/manage months in the 'edit' menu for this calendar after creation"
    );

    // setup main form div for each month
    const mainDiv = createElement("div", {});
    this.months
      .sort((a, b) => a.index - b.index)
      .forEach((month, index) => {
        const monthContainer = createElement("div", {
          class: "month-container",
        });
        // index
        const indexLabel = createElement(
          "div",
          { style: "display: inline-block; margin-right: 10px;" },
          `Month ${index + 1}`
        );
        // title
        const titleInput = createElement("input", {
          name: "title",
          value: month.title,
        });
        titleInput.addEventListener("change", (e) => {
          month.title = e.target.value.trim();
        });
        // number of days
        const numOfDaysLabel = createElement(
          "label",
          { for: "number_of_days", style: "margin-right: 10px;" },
          "Days"
        );
        const numOfDaysInput = createElement("input", {
          name: "number_of_days",
          value: month.number_of_days.toString(),
          type: "number",
          step: "1",
          min: "1",
        });
        numOfDaysInput.addEventListener("change", (e) => {
          month.number_of_days = parseInt(e.target.value);
        });
        // remove
        const removeMonthBtn = createElement(
          "button",
          { class: "btn-red" },
          "Remove Month"
        );
        removeMonthBtn.addEventListener("click", () => {
          deleteThing(`/api/remove_month/${month.id}`);
          this.months.splice(this.months.indexOf(month), 1);
          this.render();
        });
        // move index
        const moveBtnContainer = createElement("div", {
          style: "display: inline-block;",
        });
        const moveUpBtn = createElement("button", { class: "move-btn" }, "▲");
        moveUpBtn.addEventListener("click", async () => {
          // dec
          month.index -= 1;
          if (this.months[index - 1]) this.months[index - 1].index += 1;
          this.render();
        });
        const moveDownBtn = createElement("button", { class: "move-btn" }, "▼");
        moveDownBtn.addEventListener("click", async () => {
          // inc
          month.index += 1;
          if (this.months[index + 1]) this.months[index + 1].index -= 1;
          this.render();
        });
        // manage render which buttons are available based on index position
        if (month.index === 1 && this.months.length > 1) {
          moveBtnContainer.append(moveDownBtn);
        } else if (month.index != this.months.length) {
          moveBtnContainer.append(moveDownBtn);
          moveBtnContainer.append(moveUpBtn);
        } else {
          moveBtnContainer.append(moveUpBtn);
        }
        // append
        monthContainer.append(
          indexLabel,
          titleInput,
          numOfDaysLabel,
          numOfDaysInput,
          removeMonthBtn,
          moveBtnContainer
        );
        mainDiv.append(monthContainer);
      });
    // add month
    const addBtn = createElement("button", {}, "+ Month");
    addBtn.addEventListener("click", async () => {
      this.toggleLoading();
      await this.newMonth();
      this.toggleLoading();
    });
    mainDiv.append(addBtn);

    const completeButton = createElement("button", {}, "Next");
    completeButton.addEventListener("click", async () => {
      if (!this.months.length) return alert("Please create at least one month");
      this.toggleLoading();
      this.creatingNewMonths = false;
      this.creatingNewDaysInWeek = true;
      await this.updateMonths();
      this.toggleLoading();
    });

    // append
    this.domComponent.append(
      titleOfForm,
      infoElem,
      createElement("br"),
      mainDiv,
      createElement("br"),
      completeButton
    );
  };

  renderNewCalendar = async () => {
    this.domComponent.append(
      createElement("div", { class: "component-title" }, "Create new calendar"),
      createElement(
        "small",
        { style: "max-width: 600px;" },
        "First, provide a title and the current year of your new calendar. Next, you can enter a list of months. Last you can enter a list for 'days of the week'."
      ),
      createElement("br"),
      createElement(
        "form",
        {},
        [
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            placeholder: "Wyrld Calendar",
            required: true,
          }),
          createElement("br"),
          createElement("label", { for: "year" }, "Current Year"),
          createElement("input", {
            id: "year",
            name: "year",
            type: "number",
            step: "1",
            min: "1",
            value: "1",
            required: true,
          }),
          createElement("br"),
          createElement("button", { type: "submit" }, "Next"),
        ],
        {
          type: "submit",
          event: async (e) => {
            e.preventDefault();
            this.creatingNewCalendar = false;
            this.toggleLoading();
            const newCal = await this.newCalendar(e);
            if (newCal) {
              this.calendarBeingCreated = newCal;
              this.creatingNewMonths = true;
            }
            this.toggleLoading();
          },
        }
      ),
      createElement("br"),
      createElement("button", {class: "btn-red"}, "Cancel", {
        type: "click",
        event: () => {
          this.creatingNewCalendar = false;
          this.render();
        },
      })
    );
  };

  renderCalendarElems = async () => {
    const calendarData = await getThings(
      `/api/get_calendars/${state$1.currentProject.id}`
    );

    const calendarElems = [];
    calendarData.forEach((calendar) => {
      // create element
      const calendarComponentElement = createElement("div", {
        id: `calendar-component-${calendar.id}`,
      });
      // append
      calendarElems.push(calendarComponentElement);

      new Calendar({
        domComponent: calendarComponentElement,
        parentComponentRender: this.render,
        id: calendar.id,
        projectId: calendar.project_id,
        title: calendar.title,
        year: calendar.year,
        currentMonthId: calendar.current_month_id,
        currentDay: calendar.current_day,
        months: calendar.months,
        daysOfTheWeek: calendar.days_of_the_week,
      });
    });

    if (calendarElems.length) {
      return calendarElems;
    } else return [createElement("div", {}, "None...")];
  };

  renderAddButtonOrNull = () => {
    if (state$1.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else
      return createElement("button", {class: "new-btn"}, "+ Calendar", {
        type: "click",
        event: () => {
          this.creatingNewCalendar = true;
          this.render();
        },
      });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    // keep this first
    if (this.loading) {
      return this.domComponent.append(renderLoadingWithMessage("Loading..."));
    }

    if (this.creatingNewCalendar) {
      return this.renderNewCalendar();
    }

    if (this.creatingNewMonths) {
      return this.renderNewMonths();
    }

    if (this.creatingNewDaysInWeek) {
      return this.renderNewDaysInWeek();
    }

    // append
    this.domComponent.append(
      this.renderAddButtonOrNull(),
      createElement("hr"),
      ...(await this.renderCalendarElems())
    );
  };
}

class SideBar {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "sidebar";
    this.isVisible = false;
    this.navigate = props.navigate;
    this.mainRoutes = props.mainRoutes;
    this.secondRoutes = props.secondRoutes;
  }

  renderCloseSidebarElem = () => {
    const elem = createElement("img", {
      id: "close-sidebar",
      class: "close-sidebar",
      src: "/assets/sidebar.svg",
      height: 32,
      width: 32,
    });
    elem.addEventListener("click", this.close);
    return elem;
  };

  close = () => {
    this.isVisible = false;
    if (this.container && this.container.style)
      this.container.style.transform = "translate(200px, 0px)";
    if (this.domComponent && this.domComponent.style)
      this.domComponent.style.zIndex = "2";
  };

  open = () => {
    this.isVisible = true;
    if (this.container && this.container.style)
      this.container.style.transform = "translate(0px, 0px)";
    if (this.domComponent && this.domComponent.style)
      this.domComponent.style.zIndex = "4";
  };

  renderMainRoutesElems = () => {
    return this.mainRoutes.map((route) => {
      let className = "sidebar-item";
      if (
        this.navigate.currentRoute &&
        this.navigate.currentRoute.title === route.title
      )
        className += " sidebar-selected-item";
      const elem = createElement(
        "a",
        {
          class: className,
          id: route.id,
        },
        route.displayTitle
      );
      // event listener
      elem.addEventListener("click", () => {
        this.navigate.navigate({
          title: route.title,
          sidebar: true,
          params: route.params,
        });
      });
      return elem;
    });
  };

  renderToolRoutesElems = () => {
    return this.secondRoutes.map((route) => {
      let className = "sidebar-item";
      if (
        this.navigate.currentRoute &&
        this.navigate.currentRoute.title === route.title
      )
        className += " sidebar-selected-item";
      const elem = createElement(
        "a",
        {
          class: className,
          id: route.id,
        },
        route.displayTitle
      );
      // event listener
      elem.addEventListener("click", () => {
        this.navigate.navigate({
          title: route.title,
          sidebar: true,
          params: route.params,
        });
      });
      return elem;
    });
  };

  hide = () => {
    this.close();
    this.domComponent.innerHTML = "";
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    const container = createElement(
      "div",
      {
        class: "sidebar-container",
      },
      [
        createElement("div", { class: "sidebar-header" }, "Main Modules"),
        ...this.renderMainRoutesElems(),
        createElement("a", {class: "sidebar-item"}, "Table ↗", {
          type: "click",
          event: () => {
            localStorage.setItem("current-table-project-id", state$1.currentProject.id);
            window.open("/vtt.html", '_blank').focus();
          }
        }),
        createElement("div", { class: "sidebar-header" }, "Personal Tools"),
        ...this.renderToolRoutesElems(),
        this.renderCloseSidebarElem(),
      ]
    );
    this.container = container;
    this.domComponent.append(container);
  };
}

async function getPresignedForImageDownload(imageId) {
  try {
    const res = await fetch(`${window.origin}/api/signed_URL_download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        bucket_name: "wyrld",
        folder_name: "images",
        image_id: imageId,
      }),
    });
    const data = await res.json();
    if (data) return data;
    else throw new Error();
  } catch (err) {
    console.log(err);
    return null;
  }
}

// async function getPresignedForImageUpload(name) {
//   try {
//     const res = await fetch(`${window.origin}/api/signed_URL_upload`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-access-token": `Bearer ${localStorage.getItem("token")}`,
//       },
//       body: JSON.stringify({
//         name,
//         bucket_name: "wyrld",
//         folder_name: "images",
//       }),
//     });
//     const data = await res.json();
    
//     if (data) return data;
//     else throw new Error();
//   } catch (err) {
//     console.log(err);
//     return null;
//   }
// }

// export async function uploadImage(image) {
//   try {
//     // first get presigned url
//     const presigned = await getPresignedForImageUpload(image.name);
//     if (presigned) {
//       // take presigned data and send file to bucket
//       const formData = new FormData();

//       Object.keys(presigned.url.fields).forEach((key) => {
//         formData.append(key, presigned.url.fields[key]);
//       });
//       formData.append("file", image);

//       const resAWS = await fetch(presigned.url.url, {
//         method: "POST",
//         body: formData,
//       });
//       // if success return name of image
//       if (resAWS.status === 200 || resAWS.status === 204) {
//         return presigned.imageRef;
//       } else throw new Error();
//     } else throw new Error();
//   } catch (err) {
//     console.log(err);
//   }
// }

async function uploadImage(image, currentProjectId, currentImageId) {
  try {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("bucket_name", "wyrld");
    formData.append("folder_name", "images");
    formData.append("project_id", currentProjectId);
    if (currentImageId) formData.append("current_file_id", currentImageId);
    
    const res = await fetch(`${window.origin}/api/file_upload`, {
      method: "POST",
      headers: {
        // "Content-Type": "multipart/form-data",
        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });
    const data = await res.json();
    
    if (data) return data;
    else throw new Error();
  } catch (err) {
    console.log(err);
    return null;
  }
}

function locationTypeSelect(onChangeCallback, currentType) {
  function renderLocationTypeSelectOptions() {
    const types = [
      "Shop",
      "Town",
      "Village",
      "City",
      "Country",
      "Region",
      "Area",
      "Continent",
      "Planet",
    ];
    const typeList = [];
    types.forEach((type) => {
      const elem = createElement("option", { value: type }, type);
      if (currentType && currentType === type) elem.selected = true;
      typeList.push(elem);
    });
    return typeList;
  }

  return createElement(
    "select",
    { id: "type", name: "type", required: false },
    [
      createElement("option", { value: "None" }, "None"),
      ...renderLocationTypeSelectOptions(),
    ],
    {type: "change", event: (e) => {
      if(onChangeCallback) onChangeCallback(e.target.value);
    }}
  );
}

class Modal {
  constructor() {
    this.domComponent = document.getElementById("modal");
    this.domContent = document.getElementById("modal-content");
    this.closeButton = document.getElementById("close-modal");

    this.closeButton.addEventListener("click", this.hide);
    document.addEventListener('click', (e) => {
      if(e.target.id === "modal") {
        this.hide();
      }
    });
  }

  show = (content) => {
    this.domComponent.style.visibility = "visible";
    this.domContent.innerHTML = "";
    this.domContent.append(content);
  };

  hide = () => {
    this.domComponent.style.visibility = "hidden";
  };
}

const modal = new Modal();

async function handleImageClick(imageSource) {
  modal.show(
    createElement("img", { src: imageSource.url, class: "modal-image" })
  );
}

async function renderImageLarge(imageId) {
  if (imageId) {
    const imageSource = await getPresignedForImageDownload(imageId);
    if (imageSource) {
      return createElement(
        "img",
        {
          class: "clickable-image",
          src: imageSource.url,
          width: "50%",
          height: "auto",
        },
        null,
        {
          type: "click",
          event: () => handleImageClick(imageSource),
        }
      );
    } else return createElement("div", { style: "visibility: hidden;" });
  } else return createElement("div", { style: "visibility: hidden;" });
}

async function renderImageSmallOrPlaceholder(
  imageId,
  placeholderImageLocation
) {
  if (imageId) {
    const imageSource = await getPresignedForImageDownload(imageId);
    if (imageSource) {
      return createElement("img", {
        src: imageSource.url,
        width: 30,
        height: 30,
      });
    } else {
      if (placeholderImageLocation) {
        return createElement("img", {
          src: placeholderImageLocation,
          width: 30,
          height: 30,
        });
      }
    }
  } else {
    if (placeholderImageLocation) {
      return createElement("img", {
        src: placeholderImageLocation,
        width: 30,
        height: 30,
      });
    }
  }
}

class RichText {
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

      if (action.state) ;
      return button;
    });
    return actionsElems;
  };
}

class Location {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.location = props.location;
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.type = props.type;
    this.isSub = props.isSub;
    this.parentLocationId = props.parentLocationId;
    this.projectId = props.projectId;

    this.navigate = props.navigate;
    this.parentRender = props.parentRender;
    this.handleTypeFilterChange = props.handleTypeFilterChange
      ? props.handleTypeFilterChange
      : null;

    this.edit = false;
    this.uploadingImage = false;
    this.imageId = props.imageId;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  toggleUploadingImage = () => {
    this.uploadingImage = !this.uploadingImage;
    this.render();
  };

  removeLocation = async () => {
    await deleteThing(`/api/remove_location/${this.id}`);
  };

  saveLocation = async (e, description) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      this.toggleUploadingImage();
      const newImage = await uploadImage(
        formProps.image,
        state$1.currentProject.id,
        this.imageId
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
        this.imageId = newImage.id;
        this.location.image_id = newImage.id;
      }
      delete formProps.image;
      this.uploadingImage = false;
    }

    // update UI
    this.title = formProps.title;
    this.location.title = formProps.title;
    this.description = formProps.description;
    this.location.description = formProps.description;
    this.type = formProps.type;
    this.location.type = formProps.type;
    this.toggleEdit();

    await postThing(`/api/edit_location/${this.id}`, formProps);
  };

  renderRemoveImage = async () => {
    if (this.imageId) {
      const imageSource = await getPresignedForImageDownload(this.imageId);

      return createElement(
        "div",
        { style: "display: flex; align-items: baseline;" },
        [
          createElement("img", {
            src: imageSource.url,
            width: 100,
            height: "auto",
          }),
          createElement(
            "div",
            {
              style: "color: var(--red1); cursor: pointer;",
            },
            "ⓧ",
            {
              type: "click",
              event: (e) => {
                e.preventDefault();
                if (
                  window.confirm("Are you sure you want to delete this image?")
                ) {
                  postThing(`/api/edit_location/${this.id}`, {
                    image_id: null,
                  });
                  deleteThing(
                    `/api/remove_image/${state$1.currentProject.id}/${this.imageId}`
                  );
                  e.target.parentElement.remove();
                  this.imageId = null;
                }
              },
            }
          ),
        ]
      );
    } else return createElement("div", { style: "visibility: none;" });
  };

  renderEdit = async () => {
    if (this.uploadingImage) {
      return this.domComponent.append(
        renderLoadingWithMessage("Uploading your image...")
      );
    }

    const richText = new RichText({
      value: this.description,
    });

    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("div", {}, "Type Select"),
          locationTypeSelect(null, this.type),
          createElement("br"),
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.title,
          }),
          createElement("br"),
          createElement("label", { for: "description" }, "Description"),
          richText,
          createElement("br"),
          createElement(
            "label",
            { for: "image", class: "file-input" },
            "Add/Change Image"
          ),
          await this.renderRemoveImage(),
          createElement("input", {
            id: "image",
            name: "image",
            type: "file",
            accept: "image/*",
          }),
          createElement("br"),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: (e) => {
            e.preventDefault();
            this.saveLocation(e, richText.children[1].innerHTML);
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Remove Location", {
        type: "click",
        event: () => {
          if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
            this.removeLocation();
            this.toggleEdit();
            this.domComponent.remove();
          }
        },
      })
    );
  };

  renderImage = async () => {
    if (this.imageId) {
      const imageSource = await getPresignedForImageDownload(this.imageId);
      if (imageSource) {
        return createElement("img", {
          src: imageSource.url,
          width: 30,
          height: 30,
        });
      } else {
        return createElement("img", {
          src: "/assets/location.svg",
          width: 30,
          height: 30,
        });
      }
    } else {
      return createElement("img", {
        src: "/assets/location.svg",
        width: 30,
        height: 30,
      });
    }
  };

  renderLocationType = () => {
    if (this.type) {
      return createElement("a", { class: "small-clickable" }, this.type, {
        type: "click",
        event: () => {
          if (this.handleTypeFilterChange) {
            this.handleTypeFilterChange(this.type);
          }
        },
      });
    } else return createElement("div", { style: "display: none;" });
  };

  renderEditButtonOrNull = () => {
    if (state$1.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else {
      return createElement("button", {}, "Edit", {
        type: "click",
        event: this.toggleEdit,
      });
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    const descriptionComponent = createElement("div", { class: "description" });
    descriptionComponent.innerHTML = this.description;

    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        await listItemTitle(this.title, this.toggleEdit),
        this.renderLocationType(),
        await renderImageSmallOrPlaceholder(
          this.imageId,
          "/assets/location.svg"
        ),
      ]),
      descriptionComponent,
      createElement("br"),
      createElement("button", {}, "Open", {
        type: "click",
        event: () =>
          this.navigate({
            title: "single-location",
            sidebar: true,
            params: { content: this.location },
          }),
      })
    );
  };
}

function searchElement(placeholder, component) {
  return createElement(
    "input",
    {
      class: "search",
      placeholder: placeholder,
      value: component.searchTerm,
    },
    null,
    {
      type: "change",
      event: (e) => {
        component.offset = 0;
        component.searchTerm = e.target.value.toLowerCase();
        component.render();
      },
    }
  );
}

class LocationsView {
  constructor(props) {
    this.navigate = props.navigate;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.searchTerm = "";
    this.filter = null;
    this.limit = state$1.config.queryLimit;
    this.offset = 0;

    this.creatingLocation = false;
    this.newLocationLoading = false;

    this.render();
  }

  resetFilters = () => {
    this.searchTerm = "";
    this.filter = null;
    this.offset = 0;
  };

  toggleCreatingLocation = () => {
    this.resetFilters();
    this.creatingLocation = !this.creatingLocation;
    this.render();
  };

  toggleNewLocationLoading = () => {
    this.newLocationLoading = !this.newLocationLoading;
    this.render();
  };

  getLocations = async () => {
    let url = `/api/get_locations/${state$1.currentProject.id}/${this.limit}/${this.offset}`;
    if (
      !this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `/api/get_locations_keyword/${state$1.currentProject.id}/${this.limit}/${this.offset}/${this.searchTerm}`;
    if (
      this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `/api/get_locations_filter_keyword/${state$1.currentProject.id}/${this.limit}/${this.offset}/${this.filter}/${this.searchTerm}`;
    if (this.filter && (this.searchTerm === "" || this.searchTerm === " "))
      url = `/api/get_locations_filter/${state$1.currentProject.id}/${this.limit}/${this.offset}/${this.filter}`;

    return await getThings(url);
  };

  newLocation = async (e, description) => {
    this.toggleNewLocationLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;

    const projectId = state$1.currentProject.id;
    formProps.project_id = projectId;
    formProps.is_sub = false;
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image && formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      const newImage = await uploadImage(
        formProps.image,
        state$1.currentProject.id,
        this.imageId
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
      }
      delete formProps.image;
    }

    await postThing("/api/add_location", formProps);
    this.toggleNewLocationLoading();
  };

  renderCreatingLocation = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new location"
    );

    const richText = new RichText({});

    const form = createElement("form", {}, [
      createElement("div", {}, "Type Select (Optional)"),
      locationTypeSelect(null, null),
      createElement("br"),
      createElement("label", { for: "title" }, "Title"),
      createElement("input", {
        id: "title",
        name: "title",
        placeholder: "Location Title",
        required: true,
      }),
      createElement("br"),
      createElement("label", { for: "description" }, "Description"),
      richText,
      createElement("br"),
      createElement(
        "label",
        { for: "image", class: "file-input" },
        "Upload Image"
      ),
      createElement("input", {
        id: "image",
        name: "image",
        type: "file",
        accept: "image/*",
      }),
      createElement("br"),
      createElement("br"),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.creatingLocation = false;
      await this.newLocation(e, richText.children[1].innerHTML);
    });

    const cancelButton = createElement(
      "button",
      { class: "btn-red" },
      "Cancel"
    );
    cancelButton.addEventListener("click", () => {
      this.toggleCreatingLocation();
    });

    this.domComponent.append(
      titleOfForm,
      createElement("br"),
      form,
      createElement("br"),
      cancelButton
    );
  };

  renderLocationsElems = async () => {
    let locationData = await this.getLocations();

    const locationsMap = locationData.map((location) => {
      // create element
      const elem = createElement("div", {
        id: `location-component-${location.id}`,
        class: "component",
      });

      new Location({
        domComponent: elem,
        location: location,
        id: location.id,
        title: location.title,
        description: location.description,
        type: location.type,
        isSub: location.is_sub,
        parentLocationId: location.parent_location_id,
        projectId: location.project_id,
        imageId: location.image_id,
        navigate: this.navigate,
        parentRender: this.render,
        handleTypeFilterChange: this.handleTypeFilterChange,
      });

      return elem;
    });

    if (locationsMap.length) return locationsMap;
    else return [createElement("div", {}, "None...")];
  };

  handleTypeFilterChange = (value) => {
    if (value === "None") value = null;
    this.filter = value;
    this.offset = 0;
    this.render();
  };

  renderAddButtonOrNull = () => {
    if (state$1.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else
      return createElement("button", { class: "new-btn" }, "+ Location", {
        type: "click",
        event: this.toggleCreatingLocation,
      });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creatingLocation) {
      return this.renderCreatingLocation();
    }

    if (this.newLocationLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Please wait while we create your location...")
      );
    }

    // append
    this.domComponent.append(
      createElement(
        "div",
        {
          class: "view-options-container",
        },
        [
          this.renderAddButtonOrNull(),
          createElement("div", { class: "view-filter-options-container" }, [
            createElement(
              "div",
              { style: "display: flex; flex-direction: column;" },
              [
                createElement("small", {}, "Filter by type"),
                locationTypeSelect(this.handleTypeFilterChange, this.filter),
              ]
            ),
            createElement("br"),
            searchElement("Search Locations", this),
          ]),
        ]
      ),
      createElement("hr"),
      ...(await this.renderLocationsElems()),
      createElement("a", { style: "align-self: center;" }, "More", {
        type: "click",
        event: async (e) => {
          this.offset += state$1.config.queryOffset;
          e.target.before(...(await this.renderLocationsElems()));
        },
      })
    );
  };
}

async function locationSelect(
  selectedLocation,
  locationToSkip,
  onChangeCallback
) {
  async function renderLocationSelectOptions() {
    let locations = await getThings(
      `/api/get_locations/${state$1.currentProject.id}/100/0`
    );

    const locationElemsList = [];

    locations.forEach((location) => {
      let isInSubHeirarchy = false;

      if (locationToSkip) {
        // skip location and its sub locations
        if (location.id === locationToSkip.id) return;
        // check sublocation lineage and skip
        let checkingSubHeirachy = true;

        let locationToCheck = location;
        while (checkingSubHeirachy) {
          if (locationToCheck.is_sub) {
            if (locationToCheck.parent_location_id === locationToSkip.id) {
              isInSubHeirarchy = true;
              checkingSubHeirachy = false;
            } else {
              const parentLocation = locations.filter(
                (location) => locationToCheck.parent_location_id === location.id
              )[0];
              locationToCheck = parentLocation;
              checkingSubHeirachy = true;
            }
          } else checkingSubHeirachy = false;
        }
      }

      if (isInSubHeirarchy) return;

      const elem = createElement(
        "option",
        { value: location.id },
        location.title
      );
      if (selectedLocation == location.id) elem.selected = true;
      locationElemsList.push(elem);
    });

    return locationElemsList;
  }

  return createElement(
    "select",
    { id: "location_id", name: "location_id", required: false },
    [
      createElement("option", { value: 0 }, "None"),
      ...(await renderLocationSelectOptions()),
    ],
    {
      type: "change",
      event: (e) => {
        if (onChangeCallback) onChangeCallback(e.target.value);
      },
    }
  );
}

class Note {
  constructor(props) {
    this.domComponent = props.domComponent;

    this.parentRender = props.parentRender;
    this.id = props.id;
    this.projectId = props.projectId;
    this.title = props.title;
    this.description = props.description;
    this.dateCreated = props.dateCreated;
    this.locationId = props.locationId;
    this.characterId = props.characterId;
    this.itemId = props.itemId;

    this.edit = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  saveNote = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    // update UI
    this.title = formProps.title;
    this.description = formProps.description;

    await postThing(`/api/edit_note/${this.id}`, formProps);
  };

  renderEdit = async () => {
    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.title,
          }),
          createElement("label", { for: "description" }, "Description"),
          createElement(
            "textarea",
            {
              id: "description",
              name: "description",
              cols: "30",
              rows: "7",
            },
            this.description
          ),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: (e) => {
            e.preventDefault();
            this.saveNote(e);
            this.toggleEdit();
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Remove Note", {
        type: "click",
        event: () => {
          if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
            deleteThing(`/api/remove_note/${this.id}`);
            this.toggleEdit();
            this.domComponent.remove();
          }
        },
      })
    );
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        createElement("div", { class: "title-edit" }, [
          this.title,
          createElement("div", { class: "edit-btn" }, "[Edit]", {
            type: "click",
            event: this.toggleEdit,
          }),
        ]),
        createElement(
          "div",
          { class: "note-date" },
          new Date(this.dateCreated).toLocaleDateString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })
        ),
        createElement("img", {
          src: "/assets/note.svg",
          width: 30,
          height: 30,
        }),
      ]),
      createElement("div", { class: "description" }, this.description),
      createElement("br")
    );
  };
}

class NoteManager {
  constructor(props) {
    this.domComponent = props.domComponent;
    
    // options
    this.standAlone = props.standAlone;
    if (this.standAlone) this.domComponent.className = "standard-view";
    this.altEndpoint = props.altEndpoint;
    this.locationId = props.locationId;
    this.itemId = props.itemId;
    this.characterId = props.characterId;
    this.loreId = props.loreId;

    this.searchTerm = "";
    this.limit = state$1.config.queryLimit;
    this.offset = 0;

    this.creatingNewNote = false;
    this.newNoteLoading = false;

    this.render();
  }

  resetFilters = () => {
    this.searchTerm = "";
    this.offset = 0;
  };

  toggleNewNoteLoading = () => {
    this.newNoteLoading = !this.newNoteLoading;
    this.render();
  };

  toggleCreatingNote = () => {
    this.resetFilters();
    this.creatingNewNote = !this.creatingNewNote;
    this.render();
  };

  newNote = async (e) => {
    e.preventDefault();
    this.toggleNewNoteLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.user_id = state$1.user.id;
    formProps.project_id = state$1.currentProject.id;
    formProps.location_id = this.locationId ? this.locationId : null;
    formProps.character_id = this.characterId ? this.characterId : null;
    formProps.item_id = this.itemId ? this.itemId : null;
    formProps.lore_id = this.loreId ? this.loreId : null;

    await postThing("/api/add_note", formProps);
    this.toggleNewNoteLoading();
  };

  renderCreateNewNote = async () => {
    this.domComponent.append(
      createElement("div", { class: "component-title" }, "Create new note"),
      createElement(
        "form",
        {},
        [
          createElement("label", { for: "title" }, "Title"),
          createElement("br"),
          createElement("input", {
            id: "title",
            name: "title",
            placeholder: "Title",
            required: true,
          }),
          createElement("label", { for: "description" }, "Description"),
          createElement("textarea", {
            id: "description",
            name: "description",
            required: true,
            cols: "30",
            rows: "7",
          }),
          createElement("br"),
          createElement("button", { type: "submit" }, "Create"),
        ],
        {
          type: "submit",
          event: async (e) => {
            this.creatingNewNote = false;
            await this.newNote(e);
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Cancel", {
        type: "click",
        event: this.toggleCreatingNote,
      })
    );
  };

  renderNoteElems = async () => {
    let endpoint = `/api/get_notes/${state$1.currentProject.id}/${this.limit}/${this.offset}/${this.searchTerm}`;
    if (this.altEndpoint) endpoint = this.altEndpoint;
    
    let notesList = await getThings(endpoint);
    if (!notesList) notesList = [];
    
    return notesList.map((note) => {
      const elem = createElement("div", {
        class: "sub-view-component",
      });
      if (this.standAlone) elem.className = "component";
      
      new Note({
        domComponent: elem,
        parentRender: this.render,
        id: note.id,
        projectId: note.project_id,
        title: note.title,
        description: note.description,
        dateCreated: note.date_created,
        locationId: note.location_id,
        characterId: note.character_id,
        itemId: note.item_id,
      });

      return elem;
    });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.newNoteLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Please wait while we create your note...")
      );
    }

    if (this.creatingNewNote) {
      return this.renderCreateNewNote();
    }

    if (this.standAlone) {
      return this.domComponent.append(
        createElement("div", { class: "view-options-container" }, [
          createElement("button", { class: "new-btn" }, "+ Note", {
            type: "click",
            event: this.toggleCreatingNote,
          }),
          searchElement("Search Notes", this),
        ]),
        createElement("hr"),
        ...(await this.renderNoteElems()),
        createElement("br"),
        createElement("a", { style: "align-self: center;" }, "More", {
          type: "click",
          event: async (e) => {
            this.offset += state$1.config.queryOffset;
            e.target.before(...(await this.renderNoteElems()));
          },
        })
      );
    }

    this.domComponent.append(
      createElement("div", { class: "single-item-subheading" }, [
        "Personal Notes",
        createElement("button", { style: "align-self: flex-end;" }, "+ Note", {
          type: "click",
          event: () => {
            this.toggleCreatingNote();
          },
        }),
      ]),
      createElement("div", { class: "sub-view" }, [
        ...(await this.renderNoteElems()),
      ]),
      createElement("br")
    );
  };
}

async function renderLoreList(type, id, navigate) {
  const loreRelations = await getThings(
    `/api/get_lore_relations_by_${type}/${id}`
  );
  if (!loreRelations.length)
    return [createElement("small", { style: "margin-left: 5px;" }, "None...")];

  return await Promise.all(
    loreRelations.map(async (relation) => {
      const lore = await getThings(`/api/get_lore/${relation.lore_id}`);

      if (lore) {
        const elem = createElement(
          "a",
          {
            class: "small-clickable",
            style: "margin: 3px",
          },
          lore.title,
          {
            type: "click",
            event: () =>
              navigate({
                title: "single-lore",
                sidebar: true,
                params: { content: lore },
              }),
          }
        );

        return elem;
      }
    })
  );
}

class SingleLocationView {
  constructor(props) {
    this.navigate = props.navigate;
    this.location = props.params.content;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.creatingSubLocation = false;
    this.addParentLocation = false;
    this.edit = false;
    this.uploadingImage = false;
    this.parentLocationLoading = false;
    this.subLocationLoading = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  toggleParentLocationLoading = () => {
    this.parentLocationLoading = !this.parentLocationLoading;
    this.render();
  };

  toggleSubLocationLoading = () => {
    this.subLocationLoading = !this.subLocationLoading;
    this.render();
  };

  toggleCreatingSubLocation = () => {
    this.creatingSubLocation = !this.creatingSubLocation;
    this.render();
  };

  toggleAddParentLocation = () => {
    this.addParentLocation = !this.addParentLocation;
    this.render();
  };

  toggleUploadingImage = () => {
    this.uploadingImage = !this.uploadingImage;
    this.render();
  };

  saveLocationForParent = async (e) => {
    this.toggleParentLocationLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    //transform to parent location id
    formProps.parent_location_id = formProps.location_id;
    if (formProps.parent_location_id == 0) delete formProps.parent_location_id;
    delete formProps.location_id;

    if (formProps.parent_location_id) {
      formProps.is_sub = true;
      // Update UI
      this.location.parent_location_id = formProps.parent_location_id;
      this.location.is_sub = true;

      await postThing(`/api/edit_location/${this.location.id}`, formProps);
    }

    this.toggleParentLocationLoading();
  };

  renderAddParentLocation = async () => {
    this.domComponent.append(
      createElement(
        "div",
        { class: "component-title" },
        `Select parent-location for ${this.location.title}`
      ),
      createElement("br"),
      createElement(
        "form",
        {},
        [
          await locationSelect(null, this.location),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: async (e) => {
            e.preventDefault();
            this.addParentLocation = false;
            await this.saveLocationForParent(e);
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Cancel", {
        type: "click",
        event: this.toggleAddParentLocation,
      })
    );
  };

  newSubLocation = async (e) => {
    this.toggleSubLocationLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    const projectId = state$1.currentProject.id;
    formProps.project_id = projectId;
    formProps.is_sub = true;
    formProps.parent_location_id = this.location.id;
    if (formProps.type === "None") formProps.type = null;

    await postThing("/api/add_location", formProps);
    this.toggleSubLocationLoading();
  };

  renderCreateSubLocation = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      `Create new sub-location for ${this.location.title}`
    );
    const form = createElement(
      "form",
      {},
      [
        createElement("div", {}, "Type Select (Optional)"),
        locationTypeSelect(null, null),
        createElement("br"),
        createElement("label", { for: "title" }, "Title"),
        createElement("br"),
        createElement("input", {
          id: "title",
          name: "title",
          placeholder: "Location Title",
          required: true,
        }),
        createElement("label", { for: "description" }, "Description"),
        createElement("textarea", {
          id: "description",
          name: "description",
        }),
        createElement("br"),
        createElement("button", { type: "submit" }, "Create"),
      ],
      {
        type: "submit",
        event: async (e) => {
          e.preventDefault();
          this.creatingSubLocation = false;
          await this.newSubLocation(e);
        },
      }
    );

    const cancelButton = createElement(
      "button",
      { class: "btn-red" },
      "Cancel"
    );
    cancelButton.addEventListener("click", () => {
      this.toggleCreatingSubLocation();
    });

    this.domComponent.append(
      titleOfForm,
      form,
      createElement("br"),
      cancelButton
    );
  };

  renderSubLocations = async () => {
    let subLocations = await getThings(
      `/api/get_sublocations/${this.location.id}`
    );
    if (!subLocations) subLocations = [];

    const subLocationsMap = subLocations.map((location) => {
      const elem = createElement(
        "a",
        {
          class: "small-clickable",
          style: "margin: 3px",
        },
        location.title,
        {
          type: "click",
          event: () => {
            this.navigate({
              title: "single-location",
              sidebar: true,
              params: { content: location },
            });
          },
        }
      );
      return elem;
    });

    if (subLocationsMap.length) return subLocationsMap;
    else return [createElement("small", {}, "None...")];
  };

  renderCharacters = async () => {
    let charactersByLocation = await getThings(
      `/api/get_characters_by_location/${this.location.id}`
    );
    if (!charactersByLocation) charactersByLocation = [];

    const elemMap = charactersByLocation.map((character) => {
      const elem = createElement(
        "a",
        {
          class: "small-clickable",
          style: "margin: 3px",
        },
        character.title,
        {
          type: "click",
          event: () =>
            this.navigate({
              title: "single-character",
              sidebar: true,
              params: { content: character },
            }),
        }
      );

      return elem;
    });

    if (elemMap.length) return elemMap;
    else return [createElement("small", {}, "None...")];
  };

  renderItems = async () => {
    let itemsByLocation = await getThings(
      `/api/get_items_by_location/${this.location.id}`
    );
    if (!itemsByLocation) itemsByLocation = [];

    const elemMap = itemsByLocation.map((item) => {
      const elem = createElement(
        "a",
        {
          class: "small-clickable",
          style: "margin: 3px",
        },
        item.title,
        {
          type: "click",
          event: () =>
            this.navigate({
              title: "single-item",
              sidebar: true,
              params: { content: item },
            }),
        }
      );

      return elem;
    });

    if (elemMap.length) return elemMap;
    else return [createElement("small", {}, "None...")];
  };

  renderParentLocation = async () => {
    let parentLocation = null;
    if (this.location.parent_location_id) {
      parentLocation = await getThings(
        `/api/get_location/${this.location.parent_location_id}`
      );
    }

    if (parentLocation) {
      return createElement(
        "a",
        { class: "small-clickable", style: "margin: 3px" },
        parentLocation.title,
        {
          type: "click",
          event: () =>
            this.navigate({
              title: "single-location",
              sidebar: true,
              params: { content: parentLocation },
            }),
        }
      );
    } else {
      if (state$1.currentProject.isEditor === false) {
        return createElement("small", {}, "None...");
      }
      return createElement("button", {}, "🔗 Parent-Location", {
        type: "click",
        event: this.toggleAddParentLocation,
      });
    }
  };

  renderLocationType = () => {
    if (this.location.type) {
      return createElement(
        "small",
        { style: "color: var(--light-gray); margin-left: 5px;" },
        this.location.type
      );
    } else return createElement("div", { style: "display: none;" });
  };

  renderSubLocationsPlusButtonOrNull = () => {
    if (state$1.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else {
      return createElement("a", { style: "align-self: flex-end;" }, "+", {
        type: "click",
        event: this.toggleCreatingSubLocation,
      });
    }
  };

  saveLocation = async (e, description) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      this.toggleUploadingImage();
      const newImage = await uploadImage(
        formProps.image,
        state$1.currentProject.id,
        this.location.image_id
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
        this.location.image_id = newImage.id;
      }
      delete formProps.image;
      this.uploadingImage = false;
    }

    // update UI
    this.location.title = formProps.title;
    this.location.description = formProps.description;
    this.location.type = formProps.type;
    this.toggleEdit();

    // send data to update in db
    await postThing(`/api/edit_location/${this.location.id}`, formProps);
  };

  renderRemoveImage = async () => {
    if (this.location.image_id) {
      const imageSource = await getPresignedForImageDownload(
        this.location.image_id
      );

      return createElement(
        "div",
        { style: "display: flex; align-items: baseline;" },
        [
          createElement("img", {
            src: imageSource.url,
            width: 100,
            height: "auto",
          }),
          createElement(
            "div",
            {
              style: "color: var(--red1); cursor: pointer;",
            },
            "ⓧ",
            {
              type: "click",
              event: (e) => {
                e.preventDefault();
                if (
                  window.confirm("Are you sure you want to delete this image?")
                ) {
                  postThing(`/api/edit_location/${this.location.id}`, {
                    image_id: null,
                  });
                  deleteThing(
                    `/api/remove_image/${state$1.currentProject.id}/${this.location.image_id}`
                  );
                  e.target.parentElement.remove();
                  this.location.image_id = null;
                }
              },
            }
          ),
        ]
      );
    } else return createElement("div", { style: "visibility: none;" });
  };

  renderEdit = async () => {
    if (this.uploadingImage) {
      return this.domComponent.append(
        renderLoadingWithMessage("Uploading your image...")
      );
    }

    const richText = new RichText({
      value: this.location.description,
    });

    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("div", {}, "Type Select (Optional)"),
          locationTypeSelect(null, this.location.type),
          createElement("br"),
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.location.title,
          }),
          createElement("br"),
          createElement("label", { for: "description" }, "Description"),
          richText,
          createElement("br"),
          createElement(
            "label",
            { for: "image", class: "file-input" },
            "Add/Change Image"
          ),
          await this.renderRemoveImage(),
          createElement("input", {
            id: "image",
            name: "image",
            type: "file",
            accept: "image/*",
          }),
          createElement("br"),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: (e) => {
            e.preventDefault();
            this.saveLocation(e, richText.children[1].innerHTML);
          },
        }
      )
    );
  };

  renderEditButtonOrNull = () => {
    if (state$1.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else {
      return createElement(
        "a",
        { class: "small-clickable", style: "margin-left: 3px;" },
        "Edit",
        {
          type: "click",
          event: this.toggleEdit,
        }
      );
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    if (this.parentLocationLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage(
          "Please wait while we update your location data..."
        )
      );
    }

    if (this.subLocationLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage(
          "Please wait while we create your new location..."
        )
      );
    }

    if (this.creatingSubLocation) {
      return await this.renderCreateSubLocation();
    }

    if (this.addParentLocation) {
      return await this.renderAddParentLocation();
    }

    const noteManagerElem = createElement("div");
    new NoteManager({
      domComponent: noteManagerElem,
      altEndpoint: `/api/get_notes_by_location/${this.location.id}`,
      locationId: this.location.id,
    });

    const descriptionComponent = createElement("div", { class: "description" });
    descriptionComponent.innerHTML = this.location.description;

    // append
    this.domComponent.append(
      createElement("div", { class: "single-item-title-container" }, [
        createElement("div", { class: "single-item-title" }, [
          this.location.title,
          this.renderLocationType(),
        ]),
        createElement("img", {
          src: "/assets/location.svg",
          width: 45,
          height: 45,
        }),
      ]),
      this.renderEditButtonOrNull(),
      createElement("br"),
      createElement("div", { class: "single-item-main-section" }, [
        createElement("div", {}, [
          createElement(
            "div",
            { class: "single-item-subheading" },
            "Description"
          ),
          descriptionComponent,
        ]),
        createElement("div", { class: "single-info-box" }, [
          createElement(
            "div",
            { class: "single-info-box-subheading" },
            "Characters"
          ),
          ...(await this.renderCharacters()),
          createElement("br"),
          createElement(
            "div",
            { class: "single-info-box-subheading" },
            "Items"
          ),
          ...(await this.renderItems()),
          createElement("br"),
          createElement("div", { class: "single-info-box-subheading" }, "Lore"),
          ...(await renderLoreList(
            "location",
            this.location.id,
            this.navigate
          )),
          createElement("br"),
          createElement(
            "div",
            { class: "single-info-box-subheading" },
            "Parent Location"
          ),
          await this.renderParentLocation(),
          createElement("br"),
          createElement("div", { class: "single-info-box-subheading" }, [
            "Sub-Locations",
            this.renderSubLocationsPlusButtonOrNull(),
          ]),
          ...(await this.renderSubLocations()),
          createElement("br"),
        ]),
      ]),
      createElement("br"),
      await renderImageLarge(this.location.image_id),
      createElement("br"),
      createElement("br"),
      noteManagerElem
    );
  };
}

class Counter {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "component";

    this.id = props.id;
    this.title = props.title;
    this.currentCount = props.currentCount;
    this.projectId = props.projectId;

    this.parentRender = props.parentRender;

    this.edit = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  saveCounter = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    this.currentCount = formProps.current_count;
    this.title = formProps.title;

    await postThing(
      `/api/edit_counter/${this.id}`,
      formProps
    );
  };

  renderEdit = async () => {
    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.title,
          }),
          createElement("br"),
          createElement("label", { for: "current_count" }, "Current Count"),
          createElement("input", {
            type: "number",
            id: "current_count",
            name: "current_count",
            value: this.currentCount,
          }),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: (e) => {
            e.preventDefault();
            this.saveCounter(e);
            this.toggleEdit();
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Remove Counter", {
        type: "click",
        event: () => {
          if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
            deleteThing(`/api/remove_counter/${this.id}`);
            this.toggleEdit();
            this.domComponent.remove();
          }
        },
      })
    );
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        createElement("div", { class: "title-edit" }, [
          this.title,
          createElement("div", { class: "edit-btn" }, "[Edit]", {
            type: "click",
            event: this.toggleEdit,
          }),
        ]),
        createElement("img", {
          src: "/assets/counter.svg",
          width: 30,
          height: 30,
        }),
      ]),
      createElement("div", { style: "display: flex;" }, [
        createElement("div", { style: "margin-right: 5px;" }, "Current Count:"),
        createElement(
          "div",
          { style: "color: var(--green); margin-right: 20px;" },
          this.currentCount
        ),
        createElement("button", { class: "move-btn" }, "▼", {
          type: "click",
          event: () => {
            this.currentCount--;
            this.render();
            postThing(`/api/edit_counter/${this.id}`, {
              current_count: this.currentCount,
            });
          },
        }),
        createElement("button", { class: "move-btn" }, "▲", {
          type: "click",
          event: () => {
            this.currentCount++;
            this.render();
            postThing(`/api/edit_counter/${this.id}`, {
              current_count: this.currentCount,
            });
          },
        }),
      ]),
    );
  };
}

class CountersView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.newCounterLoading = false;

    this.render();
  }

  toggleNewCounterLoading = () => {
    this.newCounterLoading = !this.newCounterLoading;
    this.render();
  };

  newCounter = async () => {
    if (!state$1.counters) return;
    this.toggleNewCounterLoading();
    await postThing("/api/add_counter", {
      user_id: state$1.user.id,
      project_id: state$1.currentProject.id,
      title: `My Counter ${state$1.counters.length + 1}`,
      current_count: 1,
    });
    this.toggleNewCounterLoading();
  };

  renderCounterElems = async () => {
    const counterData = await getThings(
      `/api/get_counters/${state$1.currentProject.id}`
    );
    if (counterData) state$1.counters = counterData;
    const map = counterData.map((counter) => {
      // create element
      const elem = createElement("div", {
        id: `counter-component-${counter.id}`,
      });

      new Counter({
        domComponent: elem,
        parentRender: this.render,
        id: counter.id,
        title: counter.title,
        currentCount: counter.current_count,
        projectId: counter.project_id,
      });

      return elem;
    });

    if (map.length) return map;
    else return [createElement("div", {}, "None...")];
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.newCounterLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage(
          "Please wait while we create your new counter..."
        )
      );
    }

    // append
    this.domComponent.append(
      createElement("button", { class: "new-btn" }, "+ Counter", {
        type: "click",
        event: async () => {
          await this.newCounter();
        },
      }),
      createElement("hr"),
      ...(await this.renderCounterElems())
    );
  };
}

function characterTypeSelect(onChangeCallback, currentType) {
  function renderCharacterTypeSelectOptions() {
    const types = [
      "Player",
      "NPC",
      "Creature",
      "Monster",
      "Robot",
      "Person",
      "Entity",
      "Spirit",
      "Deity",
    ];
    const typeList = [];
    types.forEach((type) => {
      const elem = createElement("option", { value: type }, type);
      if (currentType && currentType === type) elem.selected = true;
      typeList.push(elem);
    });
    return typeList;
  }

  return createElement(
    "select",
    { id: "type", name: "type", required: false },
    [
      createElement("option", { value: "None" }, "None"),
      ...renderCharacterTypeSelectOptions(),
    ],
    {type: "change", event: (e) => {
      if(onChangeCallback) onChangeCallback(e.target.value);
    }}
  );
}

class Character {
  constructor(props) {
    this.domComponent = props.domComponent;

    this.character = props.character;
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.title = props.title;
    this.projectId = props.projectId;
    this.locationId = props.locationId;
    this.type = props.type;

    this.navigate = props.navigate;
    this.parentRender = props.parentRender;
    this.handleTypeFilterChange = props.handleTypeFilterChange
      ? props.handleTypeFilterChange
      : null;

    this.edit = false;
    this.uploadingImage = false;
    this.imageId = props.imageId;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  toggleUploadingImage = () => {
    this.uploadingImage = !this.uploadingImage;
    this.render();
  };

  saveCharacter = async (e, description) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      this.toggleUploadingImage();
      const newImage = await uploadImage(
        formProps.image,
        state$1.currentProject.id,
        this.imageId
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
        this.imageId = newImage.id;
        this.character.image_id = newImage.id;
      }
      delete formProps.image;
      this.uploadingImage = false;
    }
    // update UI
    this.title = formProps.title;
    this.character.title = formProps.title;
    this.description = formProps.description;
    this.character.description = formProps.description;
    this.type = formProps.type;
    this.character.type = formProps.type;
    this.toggleEdit();

    await postThing(`/api/edit_character/${this.id}`, formProps);
  };

  renderRemoveImage = async () => {
    if (this.imageId) {
      const imageSource = await getPresignedForImageDownload(this.imageId);

      return createElement(
        "div",
        { style: "display: flex; align-items: baseline;" },
        [
          createElement("img", {
            src: imageSource.url,
            width: 100,
            height: "auto",
          }),
          createElement(
            "div",
            {
              style: "color: var(--red1); cursor: pointer;",
            },
            "ⓧ",
            {
              type: "click",
              event: (e) => {
                e.preventDefault();
                if (
                  window.confirm("Are you sure you want to delete this image?")
                ) {
                  postThing(`/api/edit_character/${this.id}`, {
                    image_id: null,
                  });
                  deleteThing(
                    `/api/remove_image/${state$1.currentProject.id}/${this.imageId}`
                  );
                  e.target.parentElement.remove();
                  this.imageId = null;
                }
              },
            }
          ),
        ]
      );
    } else return createElement("div", { style: "visibility: none;" });
  };

  renderEdit = async () => {
    if (this.uploadingImage) {
      return this.domComponent.append(
        renderLoadingWithMessage("Uploading your image...")
      );
    }

    const richText = new RichText({
      value: this.description,
    });

    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("div", {}, "Type Select (Optional)"),
          characterTypeSelect(null, this.type),
          createElement("br"),
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.title,
          }),
          createElement("label", { for: "description" }, "Description"),
          richText,
          createElement("br"),
          createElement(
            "label",
            { for: "image", class: "file-input" },
            "Add/Change Image"
          ),
          await this.renderRemoveImage(),
          createElement("input", {
            id: "image",
            name: "image",
            type: "file",
            accept: "image/*",
          }),
          createElement("br"),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: (e) => {
            e.preventDefault();
            this.saveCharacter(e, richText.children[1].innerHTML);
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Remove Character", {
        type: "click",
        event: () => {
          if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
            deleteThing(`/api/remove_character/${this.id}`);
            this.toggleEdit();
            this.domComponent.remove();
          }
        },
      })
    );
  };

  renderCharacterType = () => {
    if (this.type) {
      return createElement("a", { class: "small-clickable" }, this.type, {
        type: "click",
        event: () => {
          if (this.handleTypeFilterChange) {
            this.handleTypeFilterChange(this.type);
          }
        },
      });
    } else return createElement("div", { style: "display: none;" });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    const descriptionComponent = createElement("div", { class: "description" });
    descriptionComponent.innerHTML = this.description;

    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        await listItemTitle(this.title, this.toggleEdit),
        this.renderCharacterType(),
        await renderImageSmallOrPlaceholder(
          this.imageId,
          "/assets/character.svg"
        ),
      ]),
      descriptionComponent,
      createElement("br"),
      createElement("button", {}, "Open", {
        type: "click",
        event: () =>
          this.navigate({
            title: "single-character",
            sidebar: true,
            params: { content: this.character },
          }),
      })
    );
  };
}

class CharactersView {
  constructor(props) {
    this.navigate = props.navigate;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.searchTerm = "";
    this.filter = null;
    this.limit = state$1.config.queryLimit;
    this.offset = 0;

    this.creatingCharacter = false;
    this.newCharacterLoading = false;

    this.render();
  }

  resetFilters = () => {
    this.searchTerm = "";
    this.filter = null;
    this.offset = 0;
  };

  toggleCreatingCharacter = () => {
    this.creatingCharacter = !this.creatingCharacter;
    this.render();
  };

  toggleNewCharacterLoading = () => {
    this.newCharacterLoading = !this.newCharacterLoading;
    this.render();
  };

  getCharacters = async () => {
    let url = `/api/get_characters/${state$1.currentProject.id}/${this.limit}/${this.offset}`;
    if (
      !this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `/api/get_characters_keyword/${state$1.currentProject.id}/${this.limit}/${this.offset}/${this.searchTerm}`;
    if (
      this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `/api/get_characters_filter_keyword/${state$1.currentProject.id}/${this.limit}/${this.offset}/${this.filter}/${this.searchTerm}`;
    if (this.filter && (this.searchTerm === "" || this.searchTerm === " "))
      url = `/api/get_characters_filter/${state$1.currentProject.id}/${this.limit}/${this.offset}/${this.filter}`;

    return await getThings(url);
  };

  newCharacter = async (e, description) => {
    this.toggleNewCharacterLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;
    const projectId = state$1.currentProject.id;
    formProps.project_id = projectId;
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image && formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      const newImage = await uploadImage(
        formProps.image,
        state$1.currentProject.id,
        this.imageId
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
      }
      delete formProps.image;
    }

    await postThing("/api/add_character", formProps);
    this.toggleNewCharacterLoading();
  };

  renderCreatingCharacter = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new character"
    );

    const richText = new RichText({});

    const form = createElement("form", {}, [
      createElement("div", {}, "Type Select (Optional)"),
      characterTypeSelect(null, null),
      createElement("br"),
      createElement("label", { for: "title" }, "Title"),
      createElement("input", {
        id: "title",
        name: "title",
        placeholder: "Character Title",
        required: true,
      }),
      createElement("label", { for: "description" }, "Description"),
      richText,
      createElement("br"),
      createElement(
        "label",
        { for: "image", class: "file-input" },
        "Upload Image"
      ),
      createElement("input", {
        id: "image",
        name: "image",
        type: "file",
        accept: "image/*",
      }),
      createElement("br"),
      createElement("br"),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.creatingCharacter = false;
      await this.newCharacter(e, richText.children[1].innerHTML);
    });

    const cancelButton = createElement(
      "button",
      { class: "btn-red" },
      "Cancel"
    );
    cancelButton.addEventListener("click", () => {
      this.toggleCreatingCharacter();
    });

    this.domComponent.append(
      titleOfForm,
      createElement("br"),
      form,
      createElement("br"),
      cancelButton
    );
  };

  renderCharactersElems = async () => {
    let characterData = await this.getCharacters();

    const charactersMap = characterData.map((character) => {
      // create element
      const elem = createElement("div", {
        id: `character-component-${character.id}`,
        class: "component",
      });

      new Character({
        domComponent: elem,
        character: character,
        id: character.id,
        title: character.title,
        description: character.description,
        projectId: character.project_id,
        locationId: character.location_id,
        type: character.type,
        imageId: character.image_id,
        navigate: this.navigate,
        parentRender: this.render,
        handleTypeFilterChange: this.handleTypeFilterChange,
      });

      return elem;
    });

    if (charactersMap.length) return charactersMap;
    else return [createElement("div", {}, "None...")];
  };

  handleTypeFilterChange = (value) => {
    if (value === "None") value = null;
    this.filter = value;
    this.offset = 0;
    this.render();
  };

  renderAddButtonOrNull = () => {
    if (state$1.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else
      return createElement("button", { class: "new-btn" }, "+ Character", {
        type: "click",
        event: this.toggleCreatingCharacter,
      });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creatingCharacter) {
      return this.renderCreatingCharacter();
    }

    if (this.newCharacterLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage(
          "Please wait while we create your character..."
        )
      );
    }

    // append
    this.domComponent.append(
      createElement(
        "div",
        {
          class: "view-options-container",
        },
        [
          this.renderAddButtonOrNull(),
          createElement("div", { class: "view-filter-options-container" }, [
            createElement(
              "div",
              { style: "display: flex; flex-direction: column;" },
              [
                createElement("small", {}, "Filter by type"),
                characterTypeSelect(this.handleTypeFilterChange, this.filter),
              ]
            ),
            createElement("br"),
            searchElement("Search Characters", this),
          ]),
        ]
      ),
      createElement("hr"),
      ...(await this.renderCharactersElems()),
      createElement("a", { style: "align-self: center;" }, "More", {
        type: "click",
        event: async (e) => {
          this.offset += state$1.config.queryOffset;
          e.target.before(...(await this.renderCharactersElems()));
        },
      })
    );
  };
}

class CurrentLocationComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "current-location-component";
    this.module = props.module;
    this.moduleType = props.moduleType;
    this.navigate = props.navigate;
    this.editingCurrentLocation = false;

    this.render();
  }

  toggleEditingCurrentLocation = () => {
    this.editingCurrentLocation = !this.editingCurrentLocation;
    this.render();
  };

  renderEditCurrentLocationButtonOrNull = () => {
    // dont render if user is not an editor
    if (state$1.currentProject.isEditor === false)
      return createElement("div", { style: "invisibility: hidden;" });

    if (!this.editingCurrentLocation) {
      return createElement(
        "a",
        {
          class: "small-clickable",
          style: "align-self: flex-end;",
        },
        "Edit",
        {
          type: "click",
          event: this.toggleEditingCurrentLocation,
        }
      );
    } else return createElement("div", { style: "invisibility: hidden;" });
  };

  updateCurrentLocation = (newLocationId) => {
    postThing(`/api/edit_${this.moduleType}/${this.module.id}`, {
      location_id: newLocationId,
    });
  };

  renderCurrentLocation = async () => {
    let location = null;
    if (this.module.location_id) {
      location = await getThings(
        `/api/get_location/${this.module.location_id}`
      );
    }

    if (this.editingCurrentLocation) {
      return createElement(
        "div",
        { style: "display: flex; flex-direction: column;" },
        await locationSelect(
          this.module.location_id,
          null,
          (newLocationId) => {
            this.module.location_id = newLocationId;
            this.toggleEditingCurrentLocation();
            this.updateCurrentLocation(newLocationId);
          }
        )
      );
    }

    if (!location) {
      return createElement("small", {}, "None...");
    } else {
      return createElement(
        "a",
        { class: "small-clickable", style: "margin: 3px;" },
        location.title,
        {
          type: "click",
          event: () =>
            this.navigate({
              title: "single-location",
              sidebar: true,
              params: { content: location },
            }),
        }
      );
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      createElement("div", { class: "single-info-box-subheading" }, [
        "Current Location",
        this.renderEditCurrentLocationButtonOrNull(),
      ]),
      await this.renderCurrentLocation()
    );
  };
}

class SingleCharacterView {
  constructor(props) {
    this.navigate = props.navigate;
    this.character = props.params.content;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.edit = false;
    this.uploadingImage = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  toggleUploadingImage = () => {
    this.uploadingImage = !this.uploadingImage;
    this.render();
  };

  renderCharacterType = () => {
    if (this.character.type) {
      return createElement(
        "small",
        { style: "color: var(--light-gray); margin-left: 5px;" },
        this.character.type
      );
    } else return createElement("div", { style: "display: none;" });
  };

  renderItems = async () => {
    let itemsByCharacter = await getThings(
      `/api/get_items_by_character/${this.character.id}`
    );
    if (!itemsByCharacter) itemsByCharacter = [];

    const elemMap = itemsByCharacter.map((item) => {
      const elem = createElement(
        "a",
        {
          class: "small-clickable",
          style: "margin: 3px",
        },
        item.title,
        {
          type: "click",
          event: () =>
            this.navigate({
              title: "single-item",
              sidebar: true,
              params: { content: item },
            }),
        }
      );

      return elem;
    });

    if (elemMap.length) return elemMap;
    else
      return [
        createElement("small", { style: "margin-left: 5px;" }, "None..."),
      ];
  };

  saveCharacter = async (e, description) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      this.toggleUploadingImage();
      const newImage = await uploadImage(
        formProps.image,
        state$1.currentProject.id,
        this.character.image_id
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
        this.character.image_id = newImage.id;
      }
      delete formProps.image;
      this.uploadingImage = false;
    }
    // update UI
    this.character.title = formProps.title;
    this.character.description = formProps.description;
    this.character.type = formProps.type;
    this.toggleEdit();

    await postThing(`/api/edit_character/${this.character.id}`, formProps);
  };

  renderRemoveImage = async () => {
    if (this.character.image_id) {
      const imageSource = await getPresignedForImageDownload(
        this.character.image_id
      );

      return createElement(
        "div",
        { style: "display: flex; align-items: baseline;" },
        [
          createElement("img", {
            src: imageSource.url,
            width: 100,
            height: "auto",
          }),
          createElement(
            "div",
            {
              style: "color: var(--red1); cursor: pointer;",
            },
            "ⓧ",
            {
              type: "click",
              event: (e) => {
                e.preventDefault();
                if (
                  window.confirm("Are you sure you want to delete this image?")
                ) {
                  postThing(`/api/edit_character/${this.character.id}`, {
                    image_id: null,
                  });
                  deleteThing(
                    `/api/remove_image/${state$1.currentProject.id}/${this.character.image_id}`
                  );
                  e.target.parentElement.remove();
                  this.character.image_id = null;
                }
              },
            }
          ),
        ]
      );
    } else return createElement("div", { style: "visibility: none;" });
  };

  renderEdit = async () => {
    if (this.uploadingImage) {
      return this.domComponent.append(
        renderLoadingWithMessage("Uploading your image...")
      );
    }

    const richText = new RichText({
      value: this.character.description,
    });

    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("div", {}, "Type Select (Optional)"),
          characterTypeSelect(null, this.character.type),
          createElement("br"),
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.character.title,
          }),
          createElement("label", { for: "description" }, "Description"),
          richText,
          createElement("br"),
          createElement(
            "label",
            { for: "image", class: "file-input" },
            "Add/Change Image"
          ),
          await this.renderRemoveImage(),
          createElement("input", {
            id: "image",
            name: "image",
            type: "file",
            accept: "image/*",
          }),
          createElement("br"),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: (e) => {
            e.preventDefault();
            this.saveCharacter(e, richText.children[1].innerHTML);
          },
        }
      )
    );
  };

  renderEditButtonOrNull = () => {
    if (state$1.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else {
      return createElement(
        "a",
        { class: "small-clickable", style: "margin-left: 3px;" },
        "Edit",
        {
          type: "click",
          event: this.toggleEdit,
        }
      );
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    const currentLocationComponent = createElement("div", {});
    new CurrentLocationComponent({
      domComponent: currentLocationComponent,
      module: this.character,
      moduleType: "character",
      navigate: this.navigate,
    });

    const noteManagerElem = createElement("div");
    new NoteManager({
      domComponent: noteManagerElem,
      altEndpoint: `/api/get_notes_by_character/${this.character.id}`,
      characterId: this.character.id,
    });

    const descriptionComponent = createElement("div", { class: "description" });
    descriptionComponent.innerHTML = this.character.description;

    // append
    this.domComponent.append(
      createElement("div", { class: "single-item-title-container" }, [
        createElement("div", { class: "single-item-title" }, [
          this.character.title,
          this.renderCharacterType(),
        ]),
        createElement("img", {
          src: "/assets/character.svg",
          width: 45,
          height: 45,
        }),
      ]),
      this.renderEditButtonOrNull(),
      createElement("br"),
      createElement("div", { class: "single-item-main-section" }, [
        createElement("div", {}, [
          createElement(
            "div",
            { class: "single-item-subheading" },
            "Description:"
          ),
          descriptionComponent,
        ]),
        createElement("div", { class: "single-info-box" }, [
          currentLocationComponent,
          createElement("br"),
          createElement(
            "div",
            { class: "single-info-box-subheading" },
            "Items"
          ),
          ...(await this.renderItems()),
          createElement("br"),
          createElement("div", { class: "single-info-box-subheading" }, "Lore"),
          ...(await renderLoreList(
            "character",
            this.character.id,
            this.navigate
          )),
          createElement("br"),
        ]),
      ]),
      createElement("br"),
      await renderImageLarge(this.character.image_id),
      createElement("br"),
      createElement("br"),
      noteManagerElem
    );
  };
}

function itemTypeSelect(onChangeCallback, currentType) {
  function renderItemTypeSelectOptions() {
    const types = [
      "Weapon",
      "Tool",
      "Magic",
      "Material",
      "Natural",
      "Clothing",
      "Ingredient",
      "Mineral",
      "Biological",
      "Food",
      "Artifact",
      "Component",
      "Structure",
      "Unknown"
    ];
    const typeList = [];
    types.forEach((type) => {
      const elem = createElement("option", { value: type }, type);
      if (currentType && currentType === type) elem.selected = true;
      typeList.push(elem);
    });
    return typeList;
  }

  return createElement(
    "select",
    { id: "type", name: "type", required: false },
    [
      createElement("option", { value: "None" }, "None"),
      ...renderItemTypeSelectOptions(),
    ],
    {type: "change", event: (e) => {
      if(onChangeCallback) onChangeCallback(e.target.value);
    }}
  );
}

class Item {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.item = props.item;
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.title = props.title;
    this.projectId = props.projectId;
    this.locationId = props.locationId;
    this.characterId = props.characterId;
    this.type = props.type;
    this.imageId = props.imageId;

    this.navigate = props.navigate;
    this.parentRender = props.parentRender;
    this.handleTypeFilterChange = props.handleTypeFilterChange
      ? props.handleTypeFilterChange
      : null;

    this.edit = false;
    this.uploadingImage = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  toggleUploadingImage = () => {
    this.uploadingImage = !this.uploadingImage;
    this.render();
  };

  saveItem = async (e, description) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      this.toggleUploadingImage();
      const newImage = await uploadImage(
        formProps.image,
        state$1.currentProject.id,
        this.imageId
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
        this.imageId = newImage.id;
        this.item.image_id = newImage.id;
      }
      delete formProps.image;
      this.uploadingImage = false;
    }

    // update UI
    this.title = formProps.title;
    this.item.title = formProps.title;
    this.description = formProps.description;
    this.item.description = formProps.description;
    this.type = formProps.type;
    this.item.type = formProps.type;
    this.toggleEdit();

    await postThing(`/api/edit_item/${this.id}`, formProps);
  };

  renderRemoveImage = async () => {
    if (this.imageId) {
      const imageSource = await getPresignedForImageDownload(this.imageId);

      return createElement(
        "div",
        { style: "display: flex; align-items: baseline;" },
        [
          createElement("img", {
            src: imageSource.url,
            width: 100,
            height: "auto",
          }),
          createElement(
            "div",
            {
              style: "color: var(--red1); cursor: pointer;",
            },
            "ⓧ",
            {
              type: "click",
              event: (e) => {
                e.preventDefault();
                if (
                  window.confirm("Are you sure you want to delete this image?")
                ) {
                  postThing(`/api/edit_item/${this.id}`, {
                    image_id: null,
                  });
                  deleteThing(
                    `/api/remove_image/${state$1.currentProject.id}/${this.imageId}`
                  );
                  e.target.parentElement.remove();
                  this.imageId = null;
                }
              },
            }
          ),
        ]
      );
    } else return createElement("div", { style: "visibility: none;" });
  };

  renderEdit = async () => {
    if (this.uploadingImage) {
      return this.domComponent.append(
        renderLoadingWithMessage("Uploading your image...")
      );
    }

    const richText = new RichText({
      value: this.description,
    });

    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("div", {}, "Type Select (Optional)"),
          itemTypeSelect(null, this.type),
          createElement("br"),
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.title,
          }),
          createElement("label", { for: "description" }, "Description"),
          richText,
          createElement("br"),
          createElement(
            "label",
            { for: "image", class: "file-input" },
            "Add/Change Image"
          ),
          await this.renderRemoveImage(),
          createElement("input", {
            id: "image",
            name: "image",
            type: "file",
            accept: "image/*",
          }),
          createElement("br"),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: (e) => {
            e.preventDefault();
            this.saveItem(e, richText.children[1].innerHTML);
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Remove Item", {
        type: "click",
        event: () => {
          if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
            deleteThing(`/api/remove_item/${this.id}`);
            this.toggleEdit();
            this.domComponent.remove();
          }
        },
      })
    );
  };

  renderItemType = () => {
    if (this.type) {
      return createElement("a", { class: "small-clickable" }, this.type, {
        type: "click",
        event: () => {
          if (this.handleTypeFilterChange) {
            this.handleTypeFilterChange(this.type);
          }
        },
      });
    } else return createElement("div", { style: "display: none;" });
  };

  renderImage = async () => {
    if (this.imageId) {
      const imageSource = await getPresignedForImageDownload(this.imageId);
      if (imageSource) {
        return createElement("img", {
          src: imageSource.url,
          width: 30,
          height: 30,
        });
      } else {
        return createElement("img", {
          src: "/assets/item.svg",
          width: 30,
          height: 30,
        });
      }
    } else {
      return createElement("img", {
        src: "/assets/item.svg",
        width: 30,
        height: 30,
      });
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    const descriptionComponent = createElement("div", { class: "description" });
    descriptionComponent.innerHTML = this.description;

    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        await listItemTitle(this.title, this.toggleEdit),
        this.renderItemType(),
        await renderImageSmallOrPlaceholder(this.imageId, "/assets/item.svg"),
      ]),
      descriptionComponent,
      createElement("br"),
      createElement("button", {}, "Open", {
        type: "click",
        event: () =>
          this.navigate({
            title: "single-item",
            sidebar: true,
            params: { content: this.item },
          }),
      })
    );
  };
}

class ItemsView {
  constructor(props) {
    this.navigate = props.navigate;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";
    this.searchTerm = "";

    this.searchTerm = "";
    this.filter = null;
    this.limit = state$1.config.queryLimit;
    this.offset = 0;

    this.creatingItem = false;
    this.newItemLoading = false;

    this.render();
  }

  resetFilters = () => {
    this.searchTerm = "";
    this.filter = null;
    this.offset = 0;
  };

  toggleCreatingItem = () => {
    this.creatingItem = !this.creatingItem;
    this.render();
  };

  toggleNewItemLoading = () => {
    this.newItemLoading = !this.newItemLoading;
    this.render();
  };

  getItems = async () => {
    let url = `/api/get_items/${state$1.currentProject.id}/${this.limit}/${this.offset}`;
    if (
      !this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `/api/get_items_keyword/${state$1.currentProject.id}/${this.limit}/${this.offset}/${this.searchTerm}`;
    if (
      this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `/api/get_items_filter_keyword/${state$1.currentProject.id}/${this.limit}/${this.offset}/${this.filter}/${this.searchTerm}`;
    if (this.filter && (this.searchTerm === "" || this.searchTerm === " "))
      url = `/api/get_items_filter/${state$1.currentProject.id}/${this.limit}/${this.offset}/${this.filter}`;

    return await getThings(url);
  };

  newItem = async (e, description) => {
    this.toggleNewItemLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;
    const projectId = state$1.currentProject.id;
    formProps.project_id = projectId;
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image && formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      const newImage = await uploadImage(
        formProps.image,
        state$1.currentProject.id,
        this.imageId
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
      }
      delete formProps.image;
    }

    await postThing("/api/add_item", formProps);
    this.toggleNewItemLoading();
  };

  renderCreatingItem = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new item"
    );

    const richText = new RichText({});

    const form = createElement("form", {}, [
      createElement("div", {}, "Type Select (Optional)"),
      itemTypeSelect(null, null),
      createElement("br"),
      createElement("label", { for: "title" }, "Title"),
      createElement("input", {
        id: "title",
        name: "title",
        placeholder: "Item Title",
        required: true,
      }),
      createElement("label", { for: "description" }, "Description"),
      richText,
      createElement("br"),
      createElement(
        "label",
        { for: "image", class: "file-input" },
        "Upload Image"
      ),
      createElement("input", {
        id: "image",
        name: "image",
        type: "file",
        accept: "image/*",
      }),
      createElement("br"),
      createElement("br"),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.creatingItem = false;
      await this.newItem(e, richText.children[1].innerHTML);
    });

    const cancelButton = createElement(
      "button",
      { class: "btn-red" },
      "Cancel"
    );
    cancelButton.addEventListener("click", () => {
      this.toggleCreatingItem();
    });

    this.domComponent.append(
      titleOfForm,
      createElement("br"),
      form,
      createElement("br"),
      cancelButton
    );
  };

  renderItemsElems = async () => {
    let itemData = await this.getItems();

    const itemsMap = itemData.map((item) => {
      // create element
      const elem = createElement("div", {
        id: `item-component-${item.id}`,
        class: "component",
      });

      new Item({
        domComponent: elem,
        item: item,
        id: item.id,
        title: item.title,
        description: item.description,
        projectId: item.project_id,
        locationId: item.location_id,
        characterId: item.character_id,
        type: item.type,
        imageId: item.image_id,
        navigate: this.navigate,
        parentRender: this.render,
        handleTypeFilterChange: this.handleTypeFilterChange,
      });

      return elem;
    });

    if (itemsMap.length) return itemsMap;
    else return [createElement("div", {}, "None...")];
  };

  handleTypeFilterChange = (value) => {
    if (value === "None") value = null;
    this.filter = value;
    this.offset = 0;
    this.render();
  };

  renderAddButtonOrNull = () => {
    if (state$1.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else
      return createElement("button", { class: "new-btn" }, "+ Item", {
        type: "click",
        event: this.toggleCreatingItem,
      });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creatingItem) {
      return this.renderCreatingItem();
    }

    if (this.newItemLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Please wait while we create your item...")
      );
    }

    // append
    this.domComponent.append(
      createElement(
        "div",
        {
          class: "view-options-container",
        },
        [
          this.renderAddButtonOrNull(),
          createElement("div", { class: "view-filter-options-container" }, [
            createElement(
              "div",
              { style: "display: flex; flex-direction: column;" },
              [
                createElement("small", {}, "Filter by type"),
                itemTypeSelect(this.handleTypeFilterChange, this.filter),
              ]
            ),
            searchElement("Search Items", this),
          ]),
        ]
      ),
      createElement("hr"),
      ...(await this.renderItemsElems()),
      createElement("a", { style: "align-self: center;" }, "More", {
        type: "click",
        event: async (e) => {
          this.offset += state$1.config.queryOffset;
          e.target.before(...(await this.renderItemsElems()));
        },
      })
    );
  };
}

async function characterSelect(
  selectedCharacter,
  onChangeCallback
) {
  async function renderCharacterSelectOptions() {
    let characters = await getThings(
      `/api/get_characters/${state$1.currentProject.id}/100/0`
    );

    const characterElemsList = [];

    characters.forEach((character) => {
      const elem = createElement(
        "option",
        { value: character.id },
        character.title
      );
      if (selectedCharacter == character.id) elem.selected = true;
      characterElemsList.push(elem);
    });

    return characterElemsList;
  }

  return createElement(
    "select",
    { id: "character_id", name: "character_id", required: false },
    [
      createElement("option", { value: 0 }, "None"),
      ...(await renderCharacterSelectOptions()),
    ],
    {
      type: "change",
      event: (e) => {
        if (onChangeCallback) onChangeCallback(e.target.value);
      },
    }
  );
}

class CurrentCharacterComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "current-location-component";
    this.module = props.module;
    this.moduleType = props.moduleType;
    this.navigate = props.navigate;

    this.editingCurrentCharacter = false;

    this.render();
  }

  toggleEditingCurrentCharacter = () => {
    this.editingCurrentCharacter = !this.editingCurrentCharacter;
    this.render();
  };

  renderEditCurrentCharacterButtonOrNull = () => {
    // dont render if user is not an editor
    if (state$1.currentProject.isEditor === false)
      return createElement("div", { style: "invisibility: hidden;" });

    if (!this.editingCurrentCharacter) {
      return createElement(
        "a",
        {
          class: "small-clickable",
          style: "align-self: flex-end;",
        },
        "Edit",
        {
          type: "click",
          event: this.toggleEditingCurrentCharacter,
        }
      );
    } else return createElement("div", { style: "invisibility: hidden;" });
  };

  updateCurrentCharacter = (newCharacterId) => {
    postThing(`/api/edit_${this.moduleType}/${this.module.id}`, {
      character_id: newCharacterId,
    });
  };

  renderCurrentCharacter = async () => {
    let character = null;
    if (this.module.character_id) {
      character = await getThings(
        `/api/get_character/${this.module.character_id}`
      );
    }

    if (this.editingCurrentCharacter) {
      return createElement(
        "div",
        { style: "display: flex; flex-direction: column;" },
        await characterSelect(this.module.character_id, (newCharacterId) => {
          this.module.character_id = newCharacterId;
          this.toggleEditingCurrentCharacter();
          this.updateCurrentCharacter(newCharacterId);
        })
      );
    }

    if (!character) {
      return createElement("small", {}, "None...");
    } else {
      return createElement(
        "a",
        { class: "small-clickable", style: "margin: 3px;" },
        character.title,
        {
          type: "click",
          event: () =>
            this.navigate({
              title: "single-character",
              sidebar: true,
              params: { content: character },
            }),
        }
      );
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      createElement("div", { class: "single-info-box-subheading" }, [
        "With Character",
        this.renderEditCurrentCharacterButtonOrNull(),
      ]),
      await this.renderCurrentCharacter()
    );
  };
}

class SingleItemView {
  constructor(props) {
    this.navigate = props.navigate;
    this.item = props.params.content;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.edit = false;
    this.uploadingImage = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  renderItemType = () => {
    if (this.item.type) {
      return createElement(
        "small",
        { style: "color: var(--light-gray); margin-left: 5px;" },
        this.item.type
      );
    } else return createElement("div", { style: "display: none;" });
  };

  toggleUploadingImage = () => {
    this.uploadingImage = !this.uploadingImage;
    this.render();
  };

  saveItem = async (e, description) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      this.toggleUploadingImage();
      const newImage = await uploadImage(
        formProps.image,
        state$1.currentProject.id,
        this.item.image_id
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
        this.item.image_id = newImage.id;
      }
      delete formProps.image;
      this.uploadingImage = false;
    }

    // update UI
    this.item.title = formProps.title;
    this.item.description = formProps.description;
    this.item.type = formProps.type;
    this.toggleEdit();

    await postThing(`/api/edit_item/${this.item.id}`, formProps);
  };

  renderRemoveImage = async () => {
    if (this.item.image_id) {
      const imageSource = await getPresignedForImageDownload(
        this.item.image_id
      );

      return createElement(
        "div",
        { style: "display: flex; align-items: baseline;" },
        [
          createElement("img", {
            src: imageSource.url,
            width: 100,
            height: "auto",
          }),
          createElement(
            "div",
            {
              style: "color: var(--red1); cursor: pointer;",
            },
            "ⓧ",
            {
              type: "click",
              event: (e) => {
                e.preventDefault();
                if (
                  window.confirm("Are you sure you want to delete this image?")
                ) {
                  postThing(`/api/edit_item/${this.item.id}`, {
                    image_id: null,
                  });
                  deleteThing(
                    `/api/remove_image/${state$1.currentProject.id}/${this.item.image_id}`
                  );
                  e.target.parentElement.remove();
                  this.item.image_id = null;
                }
              },
            }
          ),
        ]
      );
    } else return createElement("div", { style: "visibility: none;" });
  };

  renderEdit = async () => {
    if (this.uploadingImage) {
      return this.domComponent.append(
        renderLoadingWithMessage("Uploading your image...")
      );
    }

    const richText = new RichText({
      value: this.item.description,
    });

    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("div", {}, "Type Select (Optional)"),
          itemTypeSelect(null, this.item.type),
          createElement("br"),
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.item.title,
          }),
          createElement("label", { for: "description" }, "Description"),
          richText,
          createElement("br"),
          createElement(
            "label",
            { for: "image", class: "file-input" },
            "Add/Change Image"
          ),
          await this.renderRemoveImage(),
          createElement("input", {
            id: "image",
            name: "image",
            type: "file",
            accept: "image/*",
          }),
          createElement("br"),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: (e) => {
            e.preventDefault();
            this.saveItem(e, richText.children[1].innerHTML);
          },
        }
      )
    );
  };

  renderEditButtonOrNull = () => {
    if (state$1.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else {
      return createElement(
        "a",
        { class: "small-clickable", style: "margin-left: 3px;" },
        "Edit",
        {
          type: "click",
          event: this.toggleEdit,
        }
      );
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    const currentLocationComponent = createElement("div", {});
    new CurrentLocationComponent({
      domComponent: currentLocationComponent,
      module: this.item,
      moduleType: "item",
      navigate: this.navigate,
    });

    const currentCharacterComponent = createElement("div", {});
    new CurrentCharacterComponent({
      domComponent: currentCharacterComponent,
      module: this.item,
      moduleType: "item",
      navigate: this.navigate,
    });

    const noteManagerElem = createElement("div");
    new NoteManager({
      domComponent: noteManagerElem,
      altEndpoint: `/api/get_notes_by_item/${this.item.id}`,
      itemId: this.item.id,
    });

    const descriptionComponent = createElement("div", { class: "description" });
    descriptionComponent.innerHTML = this.item.description;

    // append
    this.domComponent.append(
      createElement("div", { class: "single-item-title-container" }, [
        createElement("div", { class: "single-item-title" }, [
          this.item.title,
          this.renderItemType(),
        ]),
        createElement("img", {
          src: "/assets/item.svg",
          width: 45,
          height: 45,
        }),
      ]),
      this.renderEditButtonOrNull(),
      createElement("br"),
      createElement("div", { class: "single-item-main-section" }, [
        createElement("div", {}, [
          createElement(
            "div",
            { class: "single-item-subheading" },
            "Description:"
          ),
          descriptionComponent,
        ]),
        createElement("div", { class: "single-info-box" }, [
          currentLocationComponent,
          createElement("br"),
          currentCharacterComponent,
          createElement("br"),
          createElement("div", { class: "single-info-box-subheading" }, "Lore"),
          ...(await renderLoreList("item", this.item.id, this.navigate)),
          createElement("br"),
        ]),
      ]),
      createElement("br"),
      await renderImageLarge(this.item.image_id),
      createElement("br"),
      createElement("br"),
      noteManagerElem
    );
  };
}

class Hamburger {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.id = "hamburger";
    this.domComponent.className = "hamburger";
    this.sidebar = props.sidebar;

    this.domComponent.addEventListener("click", this.toggle);
  }

  hide = () => {
    this.domComponent.innerHTML = "";
  };

  toggle = () => {
    if (this.sidebar.isVisible) {
      this.sidebar.close();
    } else {
      this.sidebar.open();
    }
  };

  render = () => {
    this.domComponent.innerHTML = "";

    this.domComponent.append(
      createElement(
        "img",
        {
          height: "40px",
          width: "40px",
          src: "/assets/sidebar.svg",
          class: "flipXAxis",
        },
        null
      )
    );
  };
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

class Navigate {
  constructor(props) {
    this.appRender = props.appRender;
    // this.previousRoutes = [];
    this.currentRoute = null;

    window.addEventListener("popstate", (e) => {
      const route = e.state;
      this.currentRoute = route;
      this.appRender();
    });
  }

  getDisplayTitle(route) {
    let displayTitle = capitalizeFirstLetter(route.title);
    if (route.params && route.params.content && route.params.content.title) {
      displayTitle = route.params.content.title;
    }
    return displayTitle;
  }

  back = () => {
    history.back();
  };

  navigate = (route) => {
    if (history.state) route.applicationState = state$1;
    route.displayTitle = this.getDisplayTitle(route);
    history.pushState(route, null, `${window.location.pathname}?view=${route.title}`);
    this.currentRoute = route;
    this.appRender();
  };
}

function loreTypeSelect(onChangeCallback, currentType) {
  function renderLoreTypeSelectOptions() {
    const types = [
      "History",
      "Event",
      "Mythology",
      "Magic",
      "Background",
      "Story",
      "Culture",
      "Group",
      "Society",
      "Organization",
      "Nature",
      "Industry",
      "Economy",
      "Religion",
      "Mystery",
      "Personal",
      "Quality",
      "Attribute"
    ];
    const typeList = [];
    types.forEach((type) => {
      const elem = createElement("option", { value: type }, type);
      if (currentType && currentType === type) elem.selected = true;
      typeList.push(elem);
    });
    return typeList;
  }

  return createElement(
    "select",
    { id: "type", name: "type", required: false },
    [
      createElement("option", { value: "None" }, "None"),
      ...renderLoreTypeSelectOptions(),
    ],
    {type: "change", event: (e) => {
      if(onChangeCallback) onChangeCallback(e.target.value);
    }}
  );
}

async function itemSelect(
  selectedItem,
  onChangeCallback
) {
  async function renderItemSelectOptions() {
    let items = await getThings(
      `/api/get_items/${state$1.currentProject.id}/100/0`
    );

    const itemElemsList = [];

    items.forEach((item) => {
      const elem = createElement(
        "option",
        { value: item.id },
        item.title
      );
      if (selectedItem == item.id) elem.selected = true;
      itemElemsList.push(elem);
    });

    return itemElemsList;
  }

  return createElement(
    "select",
    { id: "item_id", name: "item_id", required: false },
    [
      createElement("option", { value: 0 }, "None"),
      ...(await renderItemSelectOptions()),
    ],
    {
      type: "change",
      event: (e) => {
        if (onChangeCallback) onChangeCallback(e.target.value);
      },
    }
  );
}

class SingleLoreView {
  constructor(props) {
    this.navigate = props.navigate;
    this.lore = props.params.content;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.edit = false;
    this.uploadingImage = false;
    this.managing = false;
    this.manageType = "";
    this.manageLoading = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  toggleManaging = (type) => {
    if (type) this.manageType = type;
    this.managing = !this.managing;
    this.render();
  };

  toggleManageLoading = () => {
    this.manageLoading = !this.manageLoading;
    this.render();
  };

  addLoreRelation = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.lore_id = this.lore.id;
    if (Object.values(formProps)[0] != 0) {
      this.toggleManageLoading();
      await postThing(`/api/add_lore_relation`, formProps);
      this.toggleManageLoading();
    }
  };

  renderLoreRelationList = async (type) => {
    const loreRelations = await getThings(
      `/api/get_lore_relations_by_lore/${type}/${this.lore.id}`
    );

    if (!loreRelations.length) return [createElement("small", {}, "None...")];

    return await Promise.all(
      loreRelations.map(async (relation) => {
        let url = "/api";
        let navigateComponentTitle = "";
        switch (type) {
          case "locations":
            url += `/get_location/${relation.location_id}`;
            navigateComponentTitle = "single-location";
            break;
          case "characters":
            url += `/get_character/${relation.character_id}`;
            navigateComponentTitle = "single-character";
            break;
          case "items":
            url += `/get_item/${relation.item_id}`;
            navigateComponentTitle = "single-item";
            break;
        }
        const endpoint = url;
        const item = await getThings(endpoint);
        if (item) {
          if (this.managing) {
            const elem = createElement(
              "div",
              { style: "margin-left: 10px; display: flex;" },
              [
                item.title,
                createElement(
                  "div",
                  {
                    style:
                      "color: var(--red1); margin-left: 10px; cursor: pointer;",
                  },
                  "ⓧ",
                  {
                    type: "click",
                    event: () => {
                      deleteThing(`/api/remove_lore_relation/${relation.id}`);
                      elem.remove();
                    },
                  }
                ),
              ]
            );
            return elem;
          } else {
            const elem = createElement(
              "a",
              {
                class: "small-clickable",
                style: "margin: 3px",
              },
              item.title,
              {
                type: "click",
                event: () => {
                  this.navigate({
                    title: navigateComponentTitle,
                    sidebar: true,
                    params: { content: item },
                  });
                },
              }
            );
            return elem;
          }
        }
      })
    );
  };

  renderAddSelect = async () => {
    switch (this.manageType) {
      case "locations":
        return await locationSelect();
      case "characters":
        return await characterSelect();
      case "items":
        return await itemSelect();
    }
  };

  renderManaging = async () => {
    if (this.manageLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Please wait while we update your lore...")
      );
    }

    this.domComponent.append(
      createElement("h1", {}, `Manage Lore ${this.manageType}`),
      createElement("hr"),
      createElement("h2", {}, `Current ${this.manageType}`),
      ...(await this.renderLoreRelationList(this.manageType)),
      createElement("hr"),
      createElement("h2", {}, `Add ${this.manageType}`),
      createElement(
        "form",
        {},
        [
          await this.renderAddSelect(),
          createElement("br"),
          createElement("button", { class: "new-btn", type: "submit" }, "Add"),
        ],
        {
          type: "submit",
          event: async (e) => {
            e.preventDefault();
            await this.addLoreRelation(e);
          },
        }
      ),
      createElement("hr"),
      createElement("button", {}, "Done", {
        type: "click",
        event: this.toggleManaging,
      })
    );
  };

  renderLoreType = () => {
    if (this.lore.type) {
      return createElement(
        "small",
        { style: "color: var(--light-gray); margin-left: 5px;" },
        this.lore.type
      );
    } else return createElement("div", { style: "display: none;" });
  };

  toggleUploadingImage = () => {
    this.uploadingImage = !this.uploadingImage;
    this.render();
  };

  saveLore = async (e, description) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      this.toggleUploadingImage();
      const newImage = await uploadImage(
        formProps.image,
        state$1.currentProject.id,
        this.lore.image_id
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
        this.lore.image_id = newImage.id;
      }
      delete formProps.image;
      this.uploadingImage = false;
    }

    // update UI
    this.lore.title = formProps.title;
    this.lore.description = formProps.description;
    this.lore.type = formProps.type;
    this.toggleEdit();

    await postThing(`/api/edit_lore/${this.lore.id}`, formProps);
  };

  renderRemoveImage = async () => {
    if (this.lore.image_id) {
      const imageSource = await getPresignedForImageDownload(
        this.lore.image_id
      );

      return createElement(
        "div",
        { style: "display: flex; align-items: baseline;" },
        [
          createElement("img", {
            src: imageSource.url,
            width: 100,
            height: "auto",
          }),
          createElement(
            "div",
            {
              style: "color: var(--red1); cursor: pointer;",
            },
            "ⓧ",
            {
              type: "click",
              event: (e) => {
                e.preventDefault();
                if (
                  window.confirm("Are you sure you want to delete this image?")
                ) {
                  postThing(`/api/edit_lore/${this.lore.id}`, {
                    image_id: null,
                  });
                  deleteThing(
                    `/api/remove_image/${state$1.currentProject.id}/${this.lore.image_id}`
                  );
                  e.target.parentElement.remove();
                  this.lore.image_id = null;
                }
              },
            }
          ),
        ]
      );
    } else return createElement("div", { style: "visibility: none;" });
  };

  renderEdit = async () => {
    if (this.uploadingImage) {
      return this.domComponent.append(
        renderLoadingWithMessage("Uploading your image...")
      );
    }

    const richText = new RichText({
      value: this.lore.description,
    });

    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("div", {}, "Type Select (Optional)"),
          loreTypeSelect(null, this.lore.type),
          createElement("br"),
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.lore.title,
          }),
          createElement("br"),
          createElement("label", { for: "description" }, "Description"),
          richText,
          createElement("br"),
          createElement(
            "label",
            { for: "image", class: "file-input" },
            "Add/Change Image"
          ),
          await this.renderRemoveImage(),
          createElement("input", {
            id: "image",
            name: "image",
            type: "file",
            accept: "image/*",
          }),
          createElement("br"),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: (e) => {
            e.preventDefault();
            this.saveLore(e, richText.children[1].innerHTML);
          },
        }
      )
    );
  };

  renderManageButtonOrNull = (type) => {
    if (state$1.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else {
      return createElement(
        "a",
        { class: "small-clickable", style: "align-self: flex-end;" },
        "Manage",
        {
          type: "click",
          event: () => this.toggleManaging(type),
        }
      );
    }
  };

  renderEditButtonOrNull = () => {
    if (state$1.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else {
      return createElement(
        "a",
        { class: "small-clickable", style: "margin-left: 3px;" },
        "Edit",
        {
          type: "click",
          event: this.toggleEdit,
        }
      );
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    if (this.managing) {
      return this.renderManaging();
    }

    const noteManagerElem = createElement("div");
    new NoteManager({
      domComponent: noteManagerElem,
      altEndpoint: `/api/get_notes_by_lore/${this.lore.id}`,
      loreId: this.lore.id,
    });

    const descriptionComponent = createElement("div", { class: "description" });
    descriptionComponent.innerHTML = this.lore.description;

    // append
    this.domComponent.append(
      createElement("div", { class: "single-item-title-container" }, [
        createElement("div", { class: "single-item-title" }, [
          this.lore.title,
          this.renderLoreType(),
        ]),
        createElement("img", {
          src: "/assets/lore.svg",
          width: 45,
          height: 45,
        }),
      ]),
      this.renderEditButtonOrNull(),
      createElement("br"),
      createElement("div", { class: "single-item-main-section" }, [
        createElement("div", {}, [
          createElement(
            "div",
            { class: "single-item-subheading" },
            "Description:"
          ),
          descriptionComponent,
        ]),
        createElement("div", { class: "single-info-box" }, [
          createElement("div", { class: "single-info-box-subheading" }, [
            "Locations",
            this.renderManageButtonOrNull("locations"),
          ]),
          ...(await this.renderLoreRelationList("locations")),
          createElement("br"),
          createElement("div", { class: "single-info-box-subheading" }, [
            "Characters",
            this.renderManageButtonOrNull("characters"),
          ]),
          ...(await this.renderLoreRelationList("characters")),
          createElement("br"),
          createElement("div", { class: "single-info-box-subheading" }, [
            "Items",
            this.renderManageButtonOrNull("items"),
          ]),
          ...(await this.renderLoreRelationList("items")),
          createElement("br"),
        ]),
      ]),
      createElement("br"),
      await renderImageLarge(this.lore.image_id),
      createElement("br"),
      createElement("br"),
      noteManagerElem
    );
  };
}

class Lore {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.lore = props.lore;
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.title = props.title;
    this.projectId = props.projectId;
    this.type = props.type;
    this.imageId = props.imageId;

    this.navigate = props.navigate;
    this.parentRender = props.parentRender;
    this.handleTypeFilterChange = props.handleTypeFilterChange
      ? props.handleTypeFilterChange
      : null;

    this.edit = false;
    this.uploadingImage = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  toggleUploadingImage = () => {
    this.uploadingImage = !this.uploadingImage;
    this.render();
  };

  saveLore = async (e, description) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      this.toggleUploadingImage();
      const newImage = await uploadImage(
        formProps.image,
        state$1.currentProject.id,
        this.imageId
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
        this.imageId = newImage.id;
        this.lore.image_id = newImage.id;
      }
      delete formProps.image;
      this.uploadingImage = false;
    }

    // update UI
    this.title = formProps.title;
    this.lore.title = formProps.title;
    this.description = formProps.description;
    this.lore.description = formProps.description;
    this.type = formProps.type;
    this.lore.type = formProps.type;
    this.toggleEdit();

    await postThing(`/api/edit_lore/${this.id}`, formProps);
  };

  renderRemoveImage = async () => {
    if (this.imageId) {
      const imageSource = await getPresignedForImageDownload(this.imageId);

      return createElement(
        "div",
        { style: "display: flex; align-items: baseline;" },
        [
          createElement("img", {
            src: imageSource.url,
            width: 100,
            height: "auto",
          }),
          createElement(
            "div",
            {
              style: "color: var(--red1); cursor: pointer;",
            },
            "ⓧ",
            {
              type: "click",
              event: (e) => {
                e.preventDefault();
                if (
                  window.confirm("Are you sure you want to delete this image?")
                ) {
                  postThing(`/api/edit_lore/${this.id}`, {
                    image_id: null,
                  });
                  deleteThing(
                    `/api/remove_image/${state$1.currentProject.id}/${this.imageId}`
                  );
                  e.target.parentElement.remove();
                  this.imageId = null;
                }
              },
            }
          ),
        ]
      );
    } else return createElement("div", { style: "visibility: none;" });
  };

  renderEdit = async () => {
    if (this.uploadingImage) {
      return this.domComponent.append(
        renderLoadingWithMessage("Uploading your image...")
      );
    }

    const richText = new RichText({
      value: this.description,
    });

    this.domComponent.append(
      createElement(
        "form",
        {},
        [
          createElement("div", {}, "Type Select (Optional)"),
          loreTypeSelect(null, this.type),
          createElement("br"),
          createElement("label", { for: "title" }, "Title"),
          createElement("input", {
            id: "title",
            name: "title",
            value: this.title,
          }),
          createElement("label", { for: "description" }, "Description"),
          richText,
          createElement("br"),
          createElement(
            "label",
            { for: "image", class: "file-input" },
            "Add/Change Image"
          ),
          await this.renderRemoveImage(),
          createElement("input", {
            id: "image",
            name: "image",
            type: "file",
            accept: "image/*",
          }),
          createElement("br"),
          createElement("br"),
          createElement("button", { type: "submit" }, "Done"),
        ],
        {
          type: "submit",
          event: (e) => {
            e.preventDefault();
            this.saveLore(e, richText.children[1].innerHTML);
          },
        }
      ),
      createElement("br"),
      createElement("button", { class: "btn-red" }, "Remove Lore", {
        type: "click",
        event: () => {
          if (window.confirm(`Are you sure you want to delete ${this.title}`)) {
            deleteThing(`/api/remove_lore/${this.id}`);
            this.toggleEdit();
            this.domComponent.remove();
          }
        },
      })
    );
  };

  renderLoreType = () => {
    if (this.type) {
      return createElement("a", { class: "small-clickable" }, this.type, {
        type: "click",
        event: () => {
          if (this.handleTypeFilterChange) {
            this.handleTypeFilterChange(this.type);
          }
        },
      });
    } else return createElement("div", { style: "display: none;" });
  };

  renderImage = async () => {
    if (this.imageId) {
      const imageSource = await getPresignedForImageDownload(this.imageId);
      if (imageSource) {
        return createElement("img", {
          src: imageSource.url,
          width: 30,
          height: 30,
        });
      } else {
        return createElement("img", {
          src: "/assets/lore.svg",
          width: 30,
          height: 30,
        });
      }
    } else {
      return createElement("img", {
        src: "/assets/lore.svg",
        width: 30,
        height: 30,
      });
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    const descriptionComponent = createElement("div", { class: "description" });
    descriptionComponent.innerHTML = this.description;

    this.domComponent.append(
      createElement("div", { class: "component-title" }, [
        await listItemTitle(this.title, this.toggleEdit),
        this.renderLoreType(),
        await renderImageSmallOrPlaceholder(this.imageId, "/assets/lore.svg"),
      ]),
      descriptionComponent,
      createElement("br"),
      createElement("button", {}, "Open", {
        type: "click",
        event: () =>
          this.navigate({
            title: "single-lore",
            sidebar: true,
            params: { content: this.lore },
          }),
      })
    );
  };
}

class LoresView {
  constructor(props) {
    this.navigate = props.navigate;
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";
    this.searchTerm = "";

    this.searchTerm = "";
    this.filter = null;
    this.limit = state$1.config.queryLimit;
    this.offset = 0;

    this.creatingLore = false;
    this.newLoreLoading = false;

    this.render();
  }

  resetFilters = () => {
    this.searchTerm = "";
    this.filter = null;
    this.offset = 0;
  };

  toggleCreatingLore = () => {
    this.creatingLore = !this.creatingLore;
    this.render();
  };

  toggleNewLoreLoading = () => {
    this.newLoreLoading = !this.newLoreLoading;
    this.render();
  };

  getLores = async () => {
    let url = `/api/get_lores/${state$1.currentProject.id}/${this.limit}/${this.offset}`;
    if (
      !this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `/api/get_lores_keyword/${state$1.currentProject.id}/${this.limit}/${this.offset}/${this.searchTerm}`;
    if (
      this.filter &&
      this.searchTerm &&
      this.searchTerm !== "" &&
      this.searchTerm !== " "
    )
      url = `/api/get_lores_filter_keyword/${state$1.currentProject.id}/${this.limit}/${this.offset}/${this.filter}/${this.searchTerm}`;
    if (this.filter && (this.searchTerm === "" || this.searchTerm === " "))
      url = `/api/get_lores_filter/${state$1.currentProject.id}/${this.limit}/${this.offset}/${this.filter}`;

    return await getThings(url);
  };

  newLore = async (e, description) => {
    this.toggleNewLoreLoading();
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.description = description;
    const projectId = state$1.currentProject.id;
    formProps.project_id = projectId;
    if (formProps.type === "None") formProps.type = null;
    if (formProps.image && formProps.image.size === 0) delete formProps.image;

    // if there is an image
    if (formProps.image) {
      // upload to bucket
      const newImage = await uploadImage(
        formProps.image,
        state$1.currentProject.id,
        this.imageId
      );
      // if success update formProps and set imageRef for UI
      if (newImage) {
        formProps.image_id = newImage.id;
      }
      delete formProps.image;
    }

    await postThing("/api/add_lore", formProps);
    this.toggleNewLoreLoading();
  };

  renderCreatingLore = async () => {
    const titleOfForm = createElement(
      "div",
      { class: "component-title" },
      "Create new lore"
    );

    const richText = new RichText({});

    const form = createElement("form", {}, [
      createElement("div", {}, "Type Select (Optional)"),
      loreTypeSelect(null, null),
      createElement("br"),
      createElement("label", { for: "title" }, "Title"),
      createElement("input", {
        id: "title",
        name: "title",
        placeholder: "Lore Title",
        required: true,
      }),
      createElement("label", { for: "description" }, "Description"),
      richText,
      createElement("br"),
      createElement(
        "label",
        { for: "image", class: "file-input" },
        "Upload Image"
      ),
      createElement("input", {
        id: "image",
        name: "image",
        type: "file",
        accept: "image/*",
      }),
      createElement("br"),
      createElement("br"),
      createElement("button", { type: "submit" }, "Create"),
    ]);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.creatingLore = false;
      await this.newLore(e, richText.children[1].innerHTML);
    });

    const cancelButton = createElement(
      "button",
      { class: "btn-red" },
      "Cancel"
    );
    cancelButton.addEventListener("click", () => {
      this.toggleCreatingLore();
    });

    this.domComponent.append(
      titleOfForm,
      createElement("br"),
      form,
      createElement("br"),
      cancelButton
    );
  };

  renderLoresElems = async () => {
    let loreData = await this.getLores();

    const loresMap = loreData.map((lore) => {
      // create element
      const elem = createElement("div", {
        id: `lore-component-${lore.id}`,
        class: "component",
      });

      new Lore({
        domComponent: elem,
        lore: lore,
        id: lore.id,
        title: lore.title,
        description: lore.description,
        projectId: lore.project_id,
        type: lore.type,
        imageId: lore.image_id,
        navigate: this.navigate,
        parentRender: this.render,
        handleTypeFilterChange: this.handleTypeFilterChange,
      });

      return elem;
    });

    if (loresMap.length) return loresMap;
    else return [createElement("div", {}, "None...")];
  };

  handleTypeFilterChange = (value) => {
    if (value === "None") value = null;
    this.filter = value;
    this.offset = 0;
    this.render();
  };

  renderAddButtonOrNull = () => {
    if (state$1.currentProject.isEditor === false) {
      return createElement("div", { style: "visibility: hidden;" });
    } else
      return createElement("button", { class: "new-btn" }, "+ Lore", {
        type: "click",
        event: this.toggleCreatingLore,
      });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.creatingLore) {
      return this.renderCreatingLore();
    }

    if (this.newLoreLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage("Please wait while we create your lore...")
      );
    }

    // append
    this.domComponent.append(
      createElement(
        "div",
        {
          class: "view-options-container",
        },
        [
          this.renderAddButtonOrNull(),
          createElement("div", { class: "view-filter-options-container" }, [
            createElement(
              "div",
              { style: "display: flex; flex-direction: column;" },
              [
                createElement("small", {}, "Filter by type"),
                loreTypeSelect(this.handleTypeFilterChange, this.filter),
              ]
            ),
            searchElement("Search Lore", this),
          ]),
        ]
      ),
      createElement("hr"),
      ...(await this.renderLoresElems()),
      createElement("a", { style: "align-self: center;" }, "More", {
        type: "click",
        event: async (e) => {
          this.offset += state$1.config.queryOffset;
          e.target.before(...(await this.renderLoresElems()));
        },
      })
    );
  };
}

class EventsView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";

    this.searchTerm = "";
    this.limit = state$1.config.queryLimit;
    this.offset = 0;

    this.render();
  }

  renderEventElems = async () => {
    let endpoint = `/api/get_events/${state$1.currentProject.id}/${this.limit}/${this.offset}`;

    let eventsList = await getThings(endpoint);
    console.log(eventsList);
    console.log(state$1.currentProject.id);
    if (!eventsList) return (eventsList = [createElement("div", {}, "None")]);

    return eventsList.map((event) => {
      const elem = createElement(
        "div",
        {
          style: "display: flex; flex-direction: row; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--blue); padding: 5px;",
        },
        [
          createElement("div", { style: "" }, [event.title]),
          createElement(
            "small",
            {},
            new Date(event.date_created).toLocaleDateString("en-US", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })
          ),
          // createElement("div", { class: "description" }, event.description),
          // createElement("br")
        ]
      );

      return elem;
    });
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    // append
    this.domComponent.append(
      createElement("hr"),
      createElement(
        "small",
        { style: "align-self: center;" },
        "* Events are generated from activity such as items moving to a new location"
      ),
      createElement("br"),
      createElement("br"),
      ...(await this.renderEventElems()),
      createElement("br"),
      createElement("br"),
      createElement("a", { style: "align-self: center;" }, "More", {
        type: "click",
        event: async (e) => {
          this.offset += state$1.config.queryOffset;
          e.target.before(...(await this.renderEventElems()));
        },
      })
    );
  };
}

async function playerCharacterSelect() {
  async function renderPlayerCharacterOptions() {
    let players = await getThings(`/api/get_5e_characters_by_user`);

    const playerElemList = [];

    players.forEach((player) => {
      const elem = createElement(
        "option",
        { value: player.id },
        player.name
      );
      playerElemList.push(elem);
    });

    return playerElemList;
  }

  return createElement(
    "select",
    { id: "player_id", name: "player_id", required: false },
    [
      createElement("option", { value: 0 }, "None"),
      ...(await renderPlayerCharacterOptions()),
    ]
  );
}

class PlayersView {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "standard-view";
    this.navigate = props.navigate;

    this.connect = false;
    this.connectLoading = false;

    this.render();
  }

  toggleConnect = () => {
    this.connect = !this.connect;
    this.render();
  };

  toggleConnectLoading = () => {
    this.connectLoading = !this.connectLoading;
    this.render();
  };

  addConnection = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.project_id = state$1.currentProject.id;
    if (Object.values(formProps)[0] != 0) {
      this.toggleConnectLoading();
      await postThing(`/api/add_project_player`, formProps);
      this.toggleConnectLoading();
    }
  };

  renderCurrentConnections = async () => {
    const projectPlayerIds = await getThings(
      `/api/get_project_players_by_project/${state$1.currentProject.id}`
    );
    if (!projectPlayerIds.length)
      return [createElement("small", {}, "None...")];

    let myPlayerCharacters = await getThings(`/api/get_5e_characters_by_user`);
    return await Promise.all(
      myPlayerCharacters
        .filter((pc) => {
          for (var pp of projectPlayerIds) {
            return pp.player_id === pc.id;
          }
        })
        .map(async (player) => {
          if (player) {
            const projectPlayerId = projectPlayerIds.filter(
              (pp) => player.id === pp.player_id
            )[0].id;
            const elem = createElement(
              "div",
              { style: "margin-left: 10px; display: flex;" },
              [
                player.name,
                createElement(
                  "div",
                  {
                    style:
                      "color: var(--red1); margin-left: 10px; cursor: pointer;",
                  },
                  "ⓧ",
                  {
                    type: "click",
                    event: () => {
                      deleteThing(
                        `/api/remove_project_player/${projectPlayerId}`
                      );
                      elem.remove();
                    },
                  }
                ),
              ]
            );
            return elem;
          }
        })
    );
  };

  renderConnect = async () => {
    if (this.connectLoading) {
      return this.domComponent.append(
        renderLoadingWithMessage(
          "Please wait while we setup your connection..."
        )
      );
    }

    this.domComponent.append(
      createElement("div", {}, [
        createElement("h1", {}, `Connect Players`),
        createElement("hr"),
        createElement("h2", {}, "Current connections"),
        ...(await this.renderCurrentConnections()),
        createElement("hr"),
        createElement("h2", {}, "Add connections"),
        createElement(
          "form",
          {},
          [
            await playerCharacterSelect(),
            createElement("br"),
            createElement(
              "button",
              { class: "new-btn", type: "submit" },
              "Add"
            ),
          ],
          {
            type: "submit",
            event: async (e) => {
              e.preventDefault();
              await this.addConnection(e);
            },
          }
        ),
        createElement("hr"),
        createElement("button", {}, "Done", {
          type: "click",
          event: () => {
            this.toggleConnect();
          },
        }),
      ])
    );
  };

  renderCharacterList = async () => {
    // get project players list
    const projectPlayers = await getThings(
      `/api/get_project_players_by_project/${state$1.currentProject.id}`
    );
    // if not the creator of this project only view your own characters
    if (state$1.currentProject.wasJoined) {
      const sheetData = await getThings("/api/get_5e_characters_by_user");
      if (!sheetData.length) {
        return [createElement("div", {}, "*You have not linked a player yet.")];
      }
      const sheetMap = sheetData
        .filter((characterSheet) => {
          for (var projectPlayer of projectPlayers) {
            if (projectPlayer.player_id === characterSheet.id) return characterSheet;
          }
        })
        .map((characterSheet) => {
          const elem = createElement("div");
          new PlayerComponent({
            domComponent: elem,
            sheet: characterSheet,
            navigate: this.navigate,
          });
          return elem;
        });
      if (!sheetMap.length) {
        return [createElement("div", {}, "*You have not linked a player yet.")];
      } else return sheetMap;
    } else {
      // show all connected characters
      if (!projectPlayers.length) {
        return [createElement("div", {}, "*No players have been linked yet.")];
      }
      return await Promise.all(
        projectPlayers.map(async (projectPlayer) => {
          const characterSheet = await getThings(
            `/api/get_5e_character_general/${projectPlayer.player_id}`
          );
          const elem = createElement("div");
          new PlayerComponent({
            domComponent: elem,
            sheet: characterSheet,
            navigate: this.navigate,
          });
          return elem;
        })
      );
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (this.connect) {
      return this.renderConnect();
    }

    this.domComponent.append(
      createElement("button", {}, "🔗 Player Character", {
        type: "click",
        event: this.toggleConnect,
      }),
      createElement("hr"),
      createElement("br"),
      ...(await this.renderCharacterList())
    );
  };
}

class PlayerComponent {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "project-btn-container";
    this.sheet = props.sheet;
    this.navigate = props.navigate;

    this.edit = false;

    this.render();
  }

  toggleEdit = () => {
    this.edit = !this.edit;
    this.render();
  };

  renderEdit = async () => {
    this.domComponent.append(createElement("div", {}, []));
  };

  render = () => {
    this.domComponent.innerHTML = "";

    if (this.edit) {
      return this.renderEdit();
    }

    this.domComponent.append(
      createElement(
        "div",
        {
          class: "project-button",
          style:
            "flex-direction: row; align-items: center; justify-content: space-between;",
        },
        [
          createElement(
            "div",
            {
              style:
                "display: flex; align-items: center; justify-content: center;",
            },
            createElement("h1", {}, this.sheet.name)
          ),
          createElement(
            "div",
            { style: "display: flex; flex-direction: column;" },
            [
              createElement(
                "small",
                {},
                `Race: ${this.sheet.race ? this.sheet.race : "None"}`
              ),
              createElement(
                "small",
                {},
                `Class: ${this.sheet.class ? this.sheet.class : "None"}`
              ),
              createElement(
                "small",
                {},
                `Level: ${this.sheet.level ? this.sheet.level : "None"}`
              ),
              createElement(
                "small",
                {},
                `EXP: ${this.sheet.exp ? this.sheet.exp : "None"}`
              ),
            ]
          ),
        ],
        {
          type: "click",
          event: () => {
            this.navigate({
              title: "single-player",
              sidebar: true,
              params: { content: this.sheet },
            });
          },
        }
      )
      // createElement(
      //   "img",
      //   {
      //     class: "icon",
      //     src: "/assets/gears.svg",
      //   },
      //   null,
      //   {
      //     type: "click",
      //     event: this.toggleEdit,
      //   }
      // )
    );
  };
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
          createElement("div", { class: "cp-content-container-row" }, [
            createElement("small", {}, "Casting Time"),
            createElement(
              "input",
              {
                class: "cp-input-gen input-small",
                name: "casting_time",
                value: spell.casting_time ? spell.casting_time : "",
              },
              null,
              {
                type: "focusout",
                event: (e) => {
                  e.preventDefault();
                  postThing(`/api/edit_5e_character_spell/${spell.id}`, {
                    casting_time: e.target.value,
                  });
                },
              }
            ),
          ]),
          createElement("div", { class: "cp-content-container-row" }, [
            createElement("small", {}, "Duration"),
            createElement(
              "input",
              {
                class: "cp-input-gen input-small",
                name: "duration",
                value: spell.duration ? spell.duration : "",
              },
              null,
              {
                type: "focusout",
                event: (e) => {
                  e.preventDefault();
                  postThing(`/api/edit_5e_character_spell/${spell.id}`, {
                    duration: e.target.value,
                  });
                },
              }
            ),
          ]),
          createElement("div", { class: "cp-content-container-row" }, [
            createElement("small", {}, "Range"),
            createElement(
              "input",
              {
                class: "cp-input-gen input-small",
                name: "range",
                value: spell.range ? spell.range : "",
              },
              null,
              {
                type: "focusout",
                event: (e) => {
                  e.preventDefault();
                  postThing(`/api/edit_5e_character_spell/${spell.id}`, {
                    range: e.target.value,
                  });
                },
              }
            ),
          ]),
          createElement("div", { class: "cp-content-container-row" }, [
            createElement("small", {}, "Damage Type"),
            createElement(
              "input",
              {
                class: "cp-input-gen input-small",
                name: "damage_type",
                value: spell.damage_type ? spell.damage_type : "",
              },
              null,
              {
                type: "focusout",
                event: (e) => {
                  e.preventDefault();
                  postThing(`/api/edit_5e_character_spell/${spell.id}`, {
                    damage_type: e.target.value,
                  });
                },
              }
            ),
          ]),
          createElement("div", { class: "cp-content-container-row" }, [
            createElement("small", {}, "Components"),
            createElement(
              "input",
              {
                class: "cp-input-gen input-small",
                name: "components",
                value: spell.components ? spell.components : "",
              },
              null,
              {
                type: "focusout",
                event: (e) => {
                  e.preventDefault();
                  postThing(`/api/edit_5e_character_spell/${spell.id}`, {
                    components: e.target.value,
                  });
                },
              }
            ),
          ]),
          createElement("br"),
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
          createElement("hr"),
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

class App {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.domComponent.className = "app";

    // save view instantiations
    this.views = {
      projects: null,
      notes: null,
      counters: null,
      clocks: null,
      calendars: null,
      items: null,
      characters: null,
      locations: null,
      lores: null,
      players: null,
    };

    this.sidebar;
    this.hamburger;
    this.navigate = new Navigate({ appRender: this.render });
    // begin
    this.init();
  }

  init = async () => {
    // setup sidebar
    this.instantiateSidebar();
    this.instantiateHamburger();
    // navigate to first view or refresh to current view
    if (history.state) {
      this.navigate.navigate(history.state);
    } else this.navigate.navigate({ title: "app", sidebar: false, params: {} });
  };

  instantiateSidebar = () => {
    const sidebarElem = createElement("div", {});
    // SIDEBAR
    const sidebar = new SideBar({
      domComponent: sidebarElem,
      navigate: this.navigate,
      mainRoutes: [
        {
          id: "sidebar-locations",
          title: "locations",
          displayTitle: "Locations",
          params: {},
        },
        {
          id: "sidebar-characters",
          title: "characters",
          displayTitle: "Characters",
          params: {},
        },
        {
          id: "sidebar-players",
          title: "players",
          displayTitle: "Players",
          params: {},
        },
        {
          id: "sidebar-items",
          title: "items",
          displayTitle: "Items",
          params: {},
        },
        {
          id: "sidebar-lore",
          title: "lore",
          displayTitle: "Lore",
          params: {},
        },
        {
          id: "sidebar-events",
          title: "events",
          displayTitle: "Events",
          params: {},
        },
        {
          id: "sidebar-clocks",
          title: "clocks",
          displayTitle: "Clocks",
          params: {},
        },
        {
          id: "sidebar-calendars",
          title: "calendars",
          displayTitle: "Calendars",
          params: {},
        },
      ],
      secondRoutes: [
        {
          id: "sidebar-notes",
          title: "notes",
          displayTitle: "Notes",
          params: {},
        },
        {
          id: "sidebar-counters",
          title: "counters",
          displayTitle: "Counters",
          params: {},
        },
      ],
    });
    this.sidebar = sidebar;
  };

  instantiateHamburger = () => {
    const hamburgerElem = createElement("div", {});
    // SIDEBAR
    const hamburger = new Hamburger({
      domComponent: hamburgerElem,
      sidebar: this.sidebar,
    });
    this.hamburger = hamburger;
  };

  renderPlayersView = ({ navigate }) => {
    if (this.views.players) {
      return this.domComponent.appendChild(this.views.players.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new PlayersView({ domComponent: element, navigate });
    this.views.players = view;
  };

  renderSinglePlayerView = ({ navigate, params }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new FiveEPlayerSheet({ domComponent: element, navigate, params });
  };

  renderLocationsView = ({ navigate }) => {
    if (this.views.locations) {
      return this.domComponent.appendChild(this.views.locations.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new LocationsView({ domComponent: element, navigate });
    this.views.locations = view;
  };

  renderSingleLocationView = ({ navigate, params }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new SingleLocationView({ domComponent: element, navigate, params });
  };

  renderCharactersView = ({ navigate }) => {
    if (this.views.characters) {
      return this.domComponent.appendChild(this.views.characters.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new CharactersView({ domComponent: element, navigate });
    this.views.characters = view;
  };

  renderSingleCharacterView = ({ navigate, params }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new SingleCharacterView({ domComponent: element, navigate, params });
  };

  renderItemsView = ({ navigate }) => {
    if (this.views.items) {
      return this.domComponent.appendChild(this.views.items.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new ItemsView({ domComponent: element, navigate });
    this.views.items = view;
  };

  renderSingleItemView = ({ navigate, params }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new SingleItemView({ domComponent: element, navigate, params });
  };

  renderLoresView = ({ navigate }) => {
    if (this.views.lores) {
      return this.domComponent.appendChild(this.views.lores.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new LoresView({ domComponent: element, navigate });
    this.views.lores = view;
  };

  renderSingleLoreView = ({ navigate, params }) => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new SingleLoreView({ domComponent: element, navigate, params });
  };

  renderCalendersView = () => {
    if (this.views.calendars) {
      return this.domComponent.appendChild(this.views.calendars.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new CalendarView({ domComponent: element });
    this.views.calendars = view;
  };

  renderClocksView = () => {
    if (this.views.clocks) {
      return this.domComponent.appendChild(this.views.clocks.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new ClocksView({ domComponent: element });
    this.views.clocks = view;
  };

  renderCountersView = () => {
    if (this.views.counters) {
      return this.domComponent.appendChild(this.views.counters.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new CountersView({ domComponent: element });
    this.views.counters = view;
  };

  renderNotesView = () => {
    if (this.views.notes) {
      return this.domComponent.appendChild(this.views.notes.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new NoteManager({
      domComponent: element,
      standAlone: true,
    });
    this.views.notes = view;
  };

  renderEventsView = () => {
    const element = createElement("div");
    this.domComponent.appendChild(element);
    new EventsView({
      domComponent: element,
      standAlone: true,
    });
  };

  renderProjectsView = ({ navigate }) => {
    if (this.views.projects) {
      return this.domComponent.appendChild(this.views.projects.domComponent);
    }
    const element = createElement("div");
    this.domComponent.appendChild(element);
    const view = new ProjectsView({
      domComponent: element,
      navigate,
    });
    this.views.projects = view;
  };

  renderModulesView = () => {
    this.domComponent.appendChild(
      createElement(
        "div",
        { class: "standard-view" },
        createElement(
          "h2",
          { style: "align-self: center;" },
          "Select a module from the sidebar ➔"
        )
      )
    );
    this.sidebar.open();
  };

  renderSidebarAndHamburger = () => {
    this.domComponent.append(
      this.sidebar.domComponent,
      this.hamburger.domComponent
    );
    this.sidebar.render();
    this.hamburger.render();
  };

  hideSidebarAndHamburger = () => {
    this.sidebar.hide();
    this.hamburger.hide();
  };

  render = async () => {
    // clear
    this.domComponent.innerHTML = "";
    // handle sidebar
    if (this.navigate.currentRoute.sidebar) {
      this.renderSidebarAndHamburger();
      if (this.sidebar.isVisible) {
        this.sidebar.open();
      }
    }
    // routing
    switch (this.navigate.currentRoute.title) {
      case "players":
        return this.renderPlayersView({ navigate: this.navigate.navigate });
      case "single-player":
        return this.renderSinglePlayerView({
          navigate: this.navigate.navigate,
          params: this.navigate.currentRoute.params,
        });
      case "clocks":
        return this.renderClocksView();
      case "counters":
        return this.renderCountersView();
      case "notes":
        return this.renderNotesView();
      case "events":
        return this.renderEventsView();
      case "calendars":
        return this.renderCalendersView();
      case "locations":
        return this.renderLocationsView({ navigate: this.navigate.navigate });
      case "single-location":
        return this.renderSingleLocationView({
          navigate: this.navigate.navigate,
          params: this.navigate.currentRoute.params,
        });
      case "characters":
        return this.renderCharactersView({ navigate: this.navigate.navigate });
      case "single-character":
        return this.renderSingleCharacterView({
          navigate: this.navigate.navigate,
          params: this.navigate.currentRoute.params,
        });
      case "items":
        return this.renderItemsView({ navigate: this.navigate.navigate });
      case "single-item":
        return this.renderSingleItemView({
          navigate: this.navigate.navigate,
          params: this.navigate.currentRoute.params,
        });
      case "lore":
        return this.renderLoresView({ navigate: this.navigate.navigate });
      case "single-lore":
        return this.renderSingleLoreView({
          navigate: this.navigate.navigate,
          params: this.navigate.currentRoute.params,
        });
      case "main":
        return this.renderModulesView();
      default:
        return this.renderProjectsView({ navigate: this.navigate.navigate });
    }
  };
}

const app = new App({ domComponent: document.getElementById("app") });

export { app as default };
