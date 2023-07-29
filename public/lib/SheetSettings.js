import createElement from "./createElement.js";
import { deleteThing, getThings, postThing } from "./apiUtils.js";
import projectSelect from "./projectSelect.js";
import {
  fallbackCopyTextToClipboard,
  copyTextToClipboard,
} from "../lib/clipboard.js";

export default class SheetSettings {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.generalData = props.generalData;

    this.render();
  }

  addInviteLink = async () => {
    try {
      const res = await fetch(
        `${window.location.origin}/api/add_player_invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            player_id: this.generalData.id,
          }),
        }
      );
      if (res.status === 201) {
        this.render();
      } else throw new Error();
    } catch (err) {
      console.log(err);
      alert("There was a problem creating your invite link");
    }
  };

  renderInviteLinkComponent = async () => {
    const playerInvite = await getThings(
      `/api/get_player_invite_by_player/${this.generalData.id}`
    );
    if (!playerInvite) {
      return [
        createElement("br"),
        createElement("h2", {}, "Share Invite Link"),
        createElement("br"),
        createElement("button", {}, "+ Invite Link", {
          type: "click",
          event: () => {
            this.addInviteLink();
          },
        }),
        createElement(
          "div",
          { class: "hint" },
          "*Create an invite link to allow other users to view and edit your character sheet."
        ),
        createElement("br"),
        createElement(
          "div",
          { style: "display: flex; flex-direction: column;" },
          [
            createElement("button", { class: "btn-red" }, "Revoke Access", {
              type: "click",
              event: () => {
                deleteThing(
                  `/api/remove_player_users_by_player/${this.generalData.id}`
                );
              },
            }),
            createElement(
              "div",
              { class: "hint" },
              "*Revoke all permissions to independant users from invites"
            ),
          ]
        ),
      ];
    } else {
      const inviteLink = `${window.location.origin}/5eplayer?id=${this.generalData.id}&invite=${playerInvite.uuid}`;

      const inviteLinkButton = createElement(
        "button",
        { style: "margin-right: var(--main-distance);" },
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
      removeInviteButton.addEventListener("click", async () => {
        if (
          window.confirm(`Are you sure you want to delete the invite link?`)
        ) {
          await deleteThing(`/api/remove_player_invite/${playerInvite.id}`);
          this.render();
        }
      });

      return [
        createElement("br"),
        createElement("h2", {}, "Share Invite Link"),
        createElement("br"),
        createElement(
          "small",
          { style: "color: var(--blue6); margin-bottom: 3px;" },
          inviteLink
        ),
        createElement("div", { style: "display: flex; flex-direction: row;" }, [
          inviteLinkButton,
          createElement(
            "div",
            { style: "display: flex; flex-direction: column;" },
            [
              removeInviteButton,
              createElement(
                "div",
                { class: "hint" },
                "*Invite will no longer be used to gain access to this sheet"
              ),
            ]
          ),
        ]),
        createElement("br"),
        createElement(
          "div",
          { style: "display: flex; flex-direction: column;" },
          [
            createElement("button", { class: "btn-red" }, "Revoke Access", {
              type: "click",
              event: () => {
                deleteThing(
                  `/api/remove_player_users_by_player/${this.generalData.id}`
                );
              },
            }),
            createElement(
              "div",
              { class: "hint" },
              "*Revoke all permissions to independant users from invites"
            ),
          ]
        ),
      ];
    }
  };

  renderCurrentConnections = async () => {
    const projectPlayerIds = await getThings(
      `/api/get_project_players_by_player/${this.generalData.id}`
    );
    if (!projectPlayerIds.length)
      return [createElement("small", {}, "None...")];

    return await Promise.all(
      projectPlayerIds.map(async (projectPlayer) => {
        const project = await getThings(
          `/api/get_project/${projectPlayer.project_id}`
        );
        if (project) {
          const elem = createElement(
            "div",
            {
              style:
                "margin-left: var(--main-distance); display: flex; align-items: center;",
            },
            [
              createElement(
                "div",
                { class: "highlighted-item" },
                project.title
              ),
              createElement(
                "div",
                {
                  style:
                    "color: var(--red1); margin-left: var(--main-distance); cursor: pointer;",
                  title: "Remove connection",
                },
                "ⓧ",
                {
                  type: "click",
                  event: async () => {
                    deleteThing(
                      `/api/remove_project_player/${projectPlayer.id}`
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

  addConnection = async (e) => {
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    formProps.player_id = this.generalData.id;
    if (Object.values(formProps)[0] != 0) {
      await postThing(`/api/add_project_player`, formProps);
    }
  };

  render = async () => {
    this.domComponent.innerHTML = "";

    if (USERID != this.generalData.user_id) {
      return this.domComponent.append(
        createElement("div", {}, [
          createElement("button", { class: "btn-red" }, "Disconnect", {
            type: "click",
            event: async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (
                window.confirm(
                  `Are you sure you want to disconnect ${this.generalData.name}`
                )
              ) {
                await deleteThing(
                  `/api/remove_player_user_by_user_and_player${this.generalData.id}`
                );
                window.location.pathname = "/dash";
              }
            },
          }),
          createElement(
            "div",
            { class: "hint" },
            "*Disconnecting removes your ability to view and edit this character sheet"
          ),
        ])
      );
    }

    if (this.connect) {
      return this.renderConnect();
    }

    this.domComponent.append(
      ...(await this.renderInviteLinkComponent()),
      createElement("hr"),
      createElement("h2", {}, `Wyrld Connections`),
      createElement(
        "div",
        { class: "hint" },
        "*Connect your player character sheet to allow the Dms in your wyrld to view and edit"
      ),
      createElement("br"),
      createElement("h3", {}, "Current Wyrlds"),
      createElement(
        "div",
        { class: "hint" },
        "*Your character sheet is currently connected to these wyrlds"
      ),
      ...(await this.renderCurrentConnections()),
      createElement("br"),
      createElement("h3", {}, "Add a wyrld"),
      createElement(
        "div",
        { class: "hint" },
        "*Choose from the list of your created/joined wyrlds to connect your player sheet to"
      ),
      createElement("br"),
      createElement(
        "form",
        { class: "flex-row" },
        [
          await projectSelect(),
          createElement(
            "button",
            {
              class: "new-btn",
              type: "submit",
              title: "Add your sheet to this wyrld",
              style: "margin-left: var(--main-distance);",
            },
            "Add"
          ),
        ],
        {
          type: "submit",
          event: async (e) => {
            e.preventDefault();
            await this.addConnection(e);
            this.render();
          },
        }
      ),
      createElement("hr"),
      createElement("button", { class: "btn-red" }, "Delete Character", {
        type: "click",
        event: async (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (
            window.confirm(
              `Are you sure you want to delete ${this.generalData.name}`
            )
          ) {
            await deleteThing(
              `/api/remove_5e_character/${this.generalData.id}`
            );
            window.location.pathname = "/dash";
          }
        },
      })
    );
  };
}
