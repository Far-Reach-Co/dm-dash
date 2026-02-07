import createElement from "../../components/createElement.js";
import { deleteThing, getThings, postThing } from "../../lib/apiUtils.js";
import projectSelect from "../../components/projectSelect.js";
import { copyTextToClipboard } from "../../lib/clipboard.js";

export default class SheetSettings {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.generalData = props.generalData;

    this.render();
  }

  addInviteLink = async () => {
    try {
      const res = await fetch(`/api/add_player_invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_id: this.generalData.id,
        }),
      });
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
      `/api/get_player_invite_by_player/${this.generalData.id}`,
    );
    if (!playerInvite) {
      return createElement("div", { class: "form-section" }, [
        createElement("h2", { class: "text-orange" }, "Share Invite Link"),
        createElement(
          "small",
          {},
          "Create an invite link to allow other users to view and edit your character sheet.",
        ),
        createElement("div", { class: "form-actions" }, [
          createElement("button", {}, "+ Invite Link", {
            type: "click",
            event: () => {
              this.addInviteLink();
            },
          }),
          createElement("button", { class: "btn-red" }, "Revoke Access", {
            type: "click",
            event: () => {
              deleteThing(
                `/api/remove_player_users_by_player/${this.generalData.id}`,
              );
            },
          }),
        ]),
        createElement(
          "small",
          { class: "hint" },
          "Revoke Access removes all permissions from invited users.",
        ),
      ]);
    } else {
      const inviteLink = `${window.location.origin}/5eplayer?id=${this.generalData.id}&invite=${playerInvite.uuid}`;

      const inviteLinkButton = createElement("button", {}, "Copy Link");
      inviteLinkButton.addEventListener("click", () => {
        copyTextToClipboard(inviteLink);
      });

      const removeInviteButton = createElement(
        "button",
        { class: "btn-red" },
        "Delete Link",
      );
      removeInviteButton.addEventListener("click", async () => {
        if (
          window.confirm(`Are you sure you want to delete the invite link?`)
        ) {
          await deleteThing(`/api/remove_player_invite/${playerInvite.id}`);
          this.render();
        }
      });

      return createElement("div", { class: "form-section" }, [
        createElement("h2", { class: "text-orange" }, "Share Invite Link"),
        createElement(
          "small",
          { class: "text-blue6", style: "word-break: break-all;" },
          inviteLink,
        ),
        createElement("div", { class: "form-actions" }, [
          inviteLinkButton,
          removeInviteButton,
        ]),
        createElement(
          "small",
          { class: "hint" },
          "Deleting the link prevents new users from joining via this invite.",
        ),
        createElement("div", { class: "form-actions", style: "margin-top: var(--space-md);" }, [
          createElement("button", { class: "btn-red" }, "Revoke Access", {
            type: "click",
            event: () => {
              deleteThing(
                `/api/remove_player_users_by_player/${this.generalData.id}`,
              );
            },
          }),
        ]),
        createElement(
          "small",
          { class: "hint" },
          "Revoke Access removes all permissions from invited users.",
        ),
      ]);
    }
  };

  renderCurrentConnections = async () => {
    const projectPlayerIds = await getThings(
      `/api/get_project_players_by_player/${this.generalData.id}`,
    );
    if (!projectPlayerIds.length)
      return [createElement("small", {}, "None...")];

    return await Promise.all(
      projectPlayerIds.map(async (projectPlayer) => {
        const project = await getThings(
          `/api/get_project/${projectPlayer.project_id}`,
        );
        if (project) {
          const elem = createElement(
            "div",
            { class: "settings-user-item" },
            [
              createElement("span", {}, project.title),
              createElement(
                "div",
                {
                  class: "text-red cursor-pointer red-x",
                  title: "Remove connection",
                },
                "ⓧ",
                {
                  type: "click",
                  event: async () => {
                    deleteThing(
                      `/api/remove_project_player/${projectPlayer.id}`,
                    );
                    elem.remove();
                  },
                },
              ),
            ],
          );
          return elem;
        }
      }),
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
    this.domComponent.replaceChildren();
    this.domComponent.className = "page-form";
    this.domComponent.style.maxWidth = "480px";

    if (USERID != this.generalData.user_id) {
      return this.domComponent.append(
        createElement("div", { class: "form-section" }, [
          createElement("h2", { class: "text-orange" }, "Disconnect"),
          createElement(
            "small",
            {},
            "Disconnecting removes your ability to view and edit this character sheet.",
          ),
          createElement("div", { class: "form-actions" }, [
            createElement("button", { class: "btn-red" }, "Disconnect", {
              type: "click",
              event: async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (
                  window.confirm(
                    `Are you sure you want to disconnect ${this.generalData.name}`,
                  )
                ) {
                  await deleteThing(
                    `/api/remove_player_user_by_user_and_player${this.generalData.id}`,
                  );
                  window.location.pathname = "/dash";
                }
              },
            }),
          ]),
        ]),
      );
    }

    if (this.connect) {
      return this.renderConnect();
    }

    // Invite Link section
    const inviteSection = await this.renderInviteLinkComponent();

    // Duplicate section
    const duplicateSection = createElement("div", { class: "form-section" }, [
      createElement("h2", { class: "text-orange" }, "Duplicate Sheet"),
      createElement(
        "small",
        {},
        "Duplicate this character sheet with all its details except for settings.",
      ),
      createElement("div", { class: "form-actions" }, [
        createElement("button", {}, "Duplicate", {
          type: "click",
          event: async () => {
            const res = await postThing("/api/duplicate_5e_character", {
              general_id: this.generalData.id,
            });
            if (res.general_id) {
              window.alert(
                "Your character sheet has been successfully duplicated!",
              );
            } else
              window.alert("Something went wrong when attempting to duplicate!");
          },
        }),
      ]),
    ]);

    // Wyrld Connections section
    const connectionsSection = createElement("div", { class: "form-section" }, [
      createElement("h2", { class: "text-orange" }, "Wyrld Connections"),
      createElement(
        "small",
        {},
        "Connect your character sheet to allow the DMs in your wyrld to view and edit.",
      ),
      createElement("h3", { style: "margin-top: var(--space-lg);" }, "Current Wyrlds"),
      ...(await this.renderCurrentConnections()),
      createElement("h3", { style: "margin-top: var(--space-lg);" }, "Add a Wyrld"),
      createElement(
        "small",
        {},
        "Choose from your created or joined wyrlds.",
      ),
      createElement(
        "form",
        { class: "form-actions" },
        [
          await projectSelect(),
          createElement(
            "button",
            {
              class: "new-btn",
              type: "submit",
              title: "Add your sheet to this wyrld",
            },
            "Add",
          ),
        ],
        {
          type: "submit",
          event: async (e) => {
            e.preventDefault();
            await this.addConnection(e);
            this.render();
          },
        },
      ),
    ]);

    // Delete section
    const deleteSection = createElement("div", { class: "form-section" }, [
      createElement("h2", { class: "text-red" }, "Delete Character"),
      createElement(
        "small",
        {},
        "Permanently delete this character sheet and all associated data.",
      ),
      createElement("div", { class: "form-actions" }, [
        createElement("button", { class: "btn-red" }, "Delete Character", {
          type: "click",
          event: async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (
              window.confirm(
                `Are you sure you want to delete ${this.generalData.name}`,
              )
            ) {
              await deleteThing(
                `/api/remove_5e_character/${this.generalData.id}`,
              );
              window.location.pathname = "/dash";
            }
          },
        }),
      ]),
    ]);

    this.domComponent.append(
      inviteSection,
      duplicateSection,
      connectionsSection,
      deleteSection,
    );
  };
}
