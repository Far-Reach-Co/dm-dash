import createElement from "../../components/createElement.js";
import { apiDelete, apiGet, apiPost } from "../../lib/apiUtils.js";
import { handleApiFailure } from "../../lib/apiUiFeedback.js";
import projectSelect from "../../components/projectSelect.js";
import { copyTextToClipboard } from "../../lib/clipboard.js";

export default class SheetSettings {
  constructor(props) {
    this.domComponent = props.domComponent;
    this.generalData = props.generalData;
    this.currentUserId = props.currentUserId || null;

    this.render();
  }

  isCurrentUserOwner = () => {
    if (!this.currentUserId) return false;
    return String(this.currentUserId) === String(this.generalData.user_id);
  };

  addInviteLink = async () => {
    const res = await apiPost(`/api/add_player_invite`, {
      player_id: this.generalData.id,
    });
    if (res.ok && res.status === 201) {
      this.render();
      return;
    }
    if (!res.ok) {
      handleApiFailure(res, {
        fallbackMessage: "There was a problem creating your invite link",
        includeResultMessage: true,
      });
    }
  };

  renderInviteLinkComponent = async () => {
    const playerInviteResult = await apiGet(
      `/api/get_player_invite_by_player/${this.generalData.id}`,
    );
    const playerInvite = playerInviteResult.ok ? playerInviteResult.data : null;
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
            event: async () => {
              const result = await apiDelete(
                `/api/remove_player_users_by_player/${this.generalData.id}`,
              );
              if (!result.ok) {
                handleApiFailure(result, {
                  fallbackMessage: "Failed to revoke access",
                  includeResultMessage: true,
                });
              }
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
      inviteLinkButton.addEventListener("click", (e) => {
        e.preventDefault();
        copyTextToClipboard(inviteLink);
      });

      const inviteLinkInput = createElement("input", {
        class: "invite-link-input",
        type: "text",
        value: inviteLink,
        readonly: true,
        spellcheck: false,
      });
      inviteLinkInput.addEventListener("click", () => {
        inviteLinkInput.select();
      });

      const removeInviteButton = createElement(
        "button",
        { class: "btn-red" },
        "Delete Link",
      );
      removeInviteButton.addEventListener("click", async () => {
        const confirmed = await window.customConfirm(
          "Are you sure you want to delete the invite link?",
          { confirmText: "Delete", danger: true },
        );
        if (!confirmed) return;

        const result = await apiDelete(`/api/remove_player_invite/${playerInvite.id}`);
        if (!result.ok) {
          handleApiFailure(result, {
            fallbackMessage: "Failed to delete invite link",
            includeResultMessage: true,
          });
          return;
        }
        this.render();
      });

      return createElement("div", { class: "form-section" }, [
        createElement("h2", { class: "text-orange" }, "Share Invite Link"),
        createElement("div", { class: "invite-link-display" }, [
          createElement(
            "small",
            { class: "text-blue6" },
            "Invite URL",
          ),
          inviteLinkInput,
        ]),
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
            event: async () => {
              const result = await apiDelete(
                `/api/remove_player_users_by_player/${this.generalData.id}`,
              );
              if (!result.ok) {
                handleApiFailure(result, {
                  fallbackMessage: "Failed to revoke access",
                  includeResultMessage: true,
                });
              }
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
    const projectPlayerIdsResult = await apiGet(
      `/api/get_project_players_by_player/${this.generalData.id}`,
    );
    if (!projectPlayerIdsResult.ok) {
      handleApiFailure(projectPlayerIdsResult, {
        fallbackMessage: "Failed to load connected Wyrlds",
        includeResultMessage: true,
      });
    }
    const projectPlayerIds =
      projectPlayerIdsResult.ok && Array.isArray(projectPlayerIdsResult.data)
        ? projectPlayerIdsResult.data
        : [];
    if (!projectPlayerIds.length)
      return [createElement("small", {}, "None...")];

    return await Promise.all(
      projectPlayerIds.map(async (projectPlayer) => {
        const projectResult = await apiGet(
          `/api/get_project/${projectPlayer.project_id}`,
        );
        if (!projectResult.ok) {
          handleApiFailure(projectResult, {
            fallbackMessage: "Failed to load Wyrld details",
            includeResultMessage: true,
          });
          return null;
        }
        const project = projectResult.ok ? projectResult.data : null;
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
                    const result = await apiDelete(
                      `/api/remove_project_player/${projectPlayer.id}`,
                    );
                    if (!result.ok) {
                      handleApiFailure(result, {
                        fallbackMessage: "Failed to remove connection",
                        includeResultMessage: true,
                      });
                      return;
                    }
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
      const result = await apiPost(`/api/add_project_player`, formProps);
      if (!result.ok) {
        handleApiFailure(result, {
          fallbackMessage: "Failed to add connection",
          includeResultMessage: true,
        });
      }
    }
  };

  getExportUrls = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const params = new URLSearchParams({
      id: String(this.generalData.id),
    });

    const project = searchParams.get("project");
    const invite = searchParams.get("invite");
    if (project) params.set("project", project);
    if (!project && invite) params.set("invite", invite);

    const pdfUrl =
      typeof EXPORT_HREF === "string" && EXPORT_HREF
        ? EXPORT_HREF
        : `/5eplayer/export?${params.toString()}`;
    const jsonUrl =
      typeof EXPORT_JSON_HREF === "string" && EXPORT_JSON_HREF
        ? EXPORT_JSON_HREF
        : `/5eplayer/export/json?${params.toString()}`;

    return { pdfUrl, jsonUrl };
  };

  renderExportSection = () => {
    const { pdfUrl, jsonUrl } = this.getExportUrls();

    return createElement("div", { class: "form-section" }, [
      createElement("h2", { class: "text-orange" }, "Export"),
      createElement(
        "small",
        {},
        "Download this character as PDF or JSON data.",
      ),
      createElement("div", { class: "form-actions" }, [
        createElement("button", {}, "Export PDF", {
          type: "click",
          event: (e) => {
            e.preventDefault();
            window.open(pdfUrl, "_blank", "noopener,noreferrer");
          },
        }),
        createElement("button", {}, "Export JSON", {
          type: "click",
          event: (e) => {
            e.preventDefault();
            window.open(jsonUrl, "_blank", "noopener,noreferrer");
          },
        }),
      ]),
      createElement(
        "small",
        { class: "hint" },
        "JSON export preserves field keys for future import workflows.",
      ),
    ]);
  };

  render = async () => {
    this.domComponent.replaceChildren();
    this.domComponent.className = "page-form";
    this.domComponent.style.maxWidth = "480px";

    const exportSection = this.renderExportSection();

    if (!this.isCurrentUserOwner()) {
      return this.domComponent.append(
        exportSection,
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
                const confirmed = await window.customConfirm(
                  `Are you sure you want to disconnect ${this.generalData.name}`,
                  { confirmText: "Disconnect", danger: true },
                );
                if (!confirmed) return;

                const result = await apiDelete(
                  `/api/remove_player_user_by_user_and_player/${this.generalData.id}`,
                );
                if (!result.ok) {
                  handleApiFailure(result, {
                    fallbackMessage: "Failed to disconnect character sheet",
                    includeResultMessage: true,
                  });
                  return;
                }
                window.location.pathname = "/dash";
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
            const res = await apiPost("/api/duplicate_5e_character", {
              general_id: this.generalData.id,
            });
            if (res.ok && res.data?.general_id) {
              window.customAlert(
                "Your character sheet has been successfully duplicated!",
              );
            } else {
              handleApiFailure(res, {
                fallbackMessage: "Something went wrong when attempting to duplicate!",
                includeResultMessage: true,
              });
            }
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
            const confirmed = await window.customConfirm(
              `Are you sure you want to delete ${this.generalData.name}`,
              { confirmText: "Delete", danger: true },
            );
            if (!confirmed) return;

            const result = await apiDelete(
              `/api/remove_5e_character/${this.generalData.id}`,
            );
            if (!result.ok) {
              handleApiFailure(result, {
                fallbackMessage: "Failed to delete character",
                includeResultMessage: true,
              });
              return;
            }
            window.location.pathname = "/dash";
          },
        }),
      ]),
    ]);

    this.domComponent.append(
      exportSection,
      inviteSection,
      duplicateSection,
      connectionsSection,
      deleteSection,
    );
  };
}
