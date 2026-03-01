import createElement from "../lib/salt-lib/createElement.js";
import { apiGet, apiPost } from "../lib/apiUtils.js";
import { handleApiFailure } from "../lib/apiUiFeedback.js";
import { loadFrontendAuthState } from "../lib/frontendAuthState.js";
import FiveEPlayerSheet from "../components/character_sheet/5ePlayerSheet.js";
import Component from "../lib/salt-lib/Component.js";

function toObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value;
}

function normalizeSheetDocToLegacyGeneralData(sheetDoc, fallbackId) {
  const sheet = toObject(sheetDoc?.sheet);
  const general = toObject(sheet.general);
  const proficiencies = toObject(sheet.proficiencies);
  const background = toObject(sheet.background);
  const rawSpellSlots = toObject(sheet.spellSlots || sheet.spell_slots);
  const spellSlots = { ...rawSpellSlots };

  // Handle historic typo keys in some datasets.
  if (spellSlots.eigth_total != null && spellSlots.eighth_total == null) {
    spellSlots.eighth_total = spellSlots.eigth_total;
  }
  if (spellSlots.eigth_expended != null && spellSlots.eighth_expended == null) {
    spellSlots.eighth_expended = spellSlots.eigth_expended;
  }

  const id = Number(sheetDoc?.id || general.id || fallbackId);
  return {
    id: Number.isFinite(id) ? id : Number(fallbackId),
    ...general,
    name: general.name || sheetDoc?.name || "Unnamed Character",
    user_id: general.user_id,
    proficiencies,
    background,
    spell_slots: spellSlots,
  };
}

function ensureLegacyGeneralDataShape(generalData, fallbackId) {
  const normalized = toObject(generalData);
  const proficiencies = toObject(normalized.proficiencies);
  const background = toObject(normalized.background);
  const spellSlots = toObject(normalized.spell_slots || normalized.spellSlots);

  if (spellSlots.eigth_total != null && spellSlots.eighth_total == null) {
    spellSlots.eighth_total = spellSlots.eigth_total;
  }
  if (spellSlots.eigth_expended != null && spellSlots.eighth_expended == null) {
    spellSlots.eighth_expended = spellSlots.eigth_expended;
  }

  const id = Number(normalized.id || fallbackId);
  return {
    ...normalized,
    id: Number.isFinite(id) ? id : Number(fallbackId),
    proficiencies,
    background,
    spell_slots: spellSlots,
  };
}

class InitSheet extends Component {
  constructor() {
    const appElem = document.getElementById("app");
    if (!appElem) {
      throw new Error("InitSheet requires #app");
    }

    super({ domElem: appElem });

    this.currentUserId = null;
    this.generalData = null;
    this.loadErrorId = null;
  }

  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  removeInitialSpinner = () => {
    const spinner = document.getElementById("initial-spinner");
    if (spinner) spinner.remove();
  };

  setLoadError = (id) => {
    this.generalData = null;
    this.loadErrorId = id ?? null;
  };

  renderLoadError = (id) => {
    const query = id ? `?id=${encodeURIComponent(String(id))}` : "";

    return createElement(
      "div",
      {
        style: {
          maxWidth: "720px",
          margin: "48px auto",
          padding: "20px",
          border: "1px solid var(--blue-muted)",
          borderRadius: "8px",
          background: "var(--blue-main)",
        },
      },
      [
        createElement(
          "h2",
          { style: { marginBottom: "8px" } },
          "Unable to Load Character Sheet",
        ),
        createElement(
          "p",
          { style: { marginBottom: "16px" } },
          "The page could not load sheet data right now. This can happen during rapid refreshes or a temporary API failure.",
        ),
        createElement(
          "div",
          { style: { display: "flex", gap: "12px", flexWrap: "wrap" } },
          [
            createElement(
              "button",
              { className: "modal-form-button" },
              "Retry",
              {
                type: "click",
                event: () => {
                  window.location.href = `/5eplayer${query}`;
                },
              },
            ),
            createElement(
              "button",
              { className: "modal-form-button" },
              "Back To Dashboard",
              {
                type: "click",
                event: () => {
                  window.location.href = "/dash";
                },
              },
            ),
          ],
        ),
      ],
    );
  };

  loadGeneralData = async (id, maxAttempts = 3) => {
    let lastResult = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const sheetDocResult = await apiGet(`/api/sheets/${id}`);
      lastResult = sheetDocResult;
      const sheetDoc = sheetDocResult.ok ? sheetDocResult.data : null;
      if (sheetDoc) {
        const generalData = normalizeSheetDocToLegacyGeneralData(sheetDoc, id);
        return ensureLegacyGeneralDataShape(generalData, id);
      }

      if (attempt < maxAttempts) {
        await this.sleep(200 * attempt);
      }
    }
    if (lastResult && !lastResult.ok) {
      handleApiFailure(lastResult, {
        fallbackMessage: "Unable to load character sheet",
        includeResultMessage: true,
      });
    }
    return null;
  };

  isCurrentUserOwner = (ownerId) => {
    if (!this.currentUserId || ownerId === null || typeof ownerId === "undefined") {
      return false;
    }
    return String(this.currentUserId) === String(ownerId);
  };

  init = async () => {
    let id = null;

    try {
      const authState = await loadFrontendAuthState();
      this.currentUserId = authState.userId;

      const searchParams = new URLSearchParams(window.location.search);
      id = searchParams.get("id");
      if (!id) {
        if (window.customAlertError) {
          window.customAlertError("Missing character sheet ID");
        }
        this.setLoadError(id);
        return;
      }

      const generalData = await this.loadGeneralData(id);

      if (!generalData) {
        if (window.customAlertError) {
          window.customAlertError("Unable to load character sheet");
        }
        this.setLoadError(id);
        return;
      }

      // Handle invite flow: owner should never auto-add themselves as a player user.
      if (!this.isCurrentUserOwner(generalData.user_id)) {
        const invite = searchParams.get("invite");
        if (invite) {
          const inviteValidResult = await apiGet(
            `/api/get_player_invite_by_uuid/${invite}`,
          );
          if (!inviteValidResult.ok) {
            handleApiFailure(inviteValidResult, {
              fallbackMessage: "Failed to validate invite link",
              includeResultMessage: true,
            });
            this.setLoadError(id);
            return;
          }
          const inviteValid = inviteValidResult.ok ? inviteValidResult.data : null;
          if (inviteValid) {
            const playerUserResult = await apiGet(
              `/api/get_player_user_by_user_and_player/${id}`,
            );
            if (!playerUserResult.ok) {
              handleApiFailure(playerUserResult, {
                fallbackMessage: "Failed to verify invite access",
                includeResultMessage: true,
              });
              this.setLoadError(id);
              return;
            }
            const playerUser = playerUserResult.ok ? playerUserResult.data : null;
            if (!playerUser) {
              const addPlayerUserResult = await apiPost("/api/add_player_user", {
                player_id: id,
              });
              if (!addPlayerUserResult.ok) {
                handleApiFailure(addPlayerUserResult, {
                  fallbackMessage: "Failed to join this character sheet",
                  includeResultMessage: true,
                });
                this.setLoadError(id);
                return;
              }
            }

            searchParams.delete("invite");
            const query = searchParams.toString();
            const newRelativePathQuery = query
              ? `${window.location.pathname}?${query}`
              : window.location.pathname;
            history.replaceState(null, "", newRelativePathQuery);
          } else {
            window.customAlertError("Invalid invite link");
            window.location.pathname = "/";
            return;
          }
        }
      }

      this.generalData = generalData;
      this.loadErrorId = null;
    } catch (error) {
      console.error(error);
      this.setLoadError(id);
    } finally {
      // The server template spinner is independent from this component tree.
      this.removeInitialSpinner();
    }
  };

  renderSheet = async () => {
    if (!this.generalData) return [];

    return this.childElem(
      "5e-player-sheet",
      () =>
        new FiveEPlayerSheet({
          domElem: createElement("div"),
          params: { content: this.generalData },
          currentUserId: this.currentUserId,
        }),
      (child) => {
        child.generalData = this.generalData;
        child.currentUserId = this.currentUserId;
      },
    );
  };

  render = async () => {
    if (!this.generalData) {
      return this.renderLoadError(this.loadErrorId);
    }

    return this.renderSheet();
  };
}

new InitSheet();
