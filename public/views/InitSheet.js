import { getThings, postThing } from "../lib/apiUtils.js";
import FiveEPlayerSheet from "../components/character_sheet/5ePlayerSheet.js";

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

class InitSheet {
  constructor() {
    this.appComponent = document.getElementById("app");
    this.elem = document.createElement("div");
    this.appComponent.appendChild(this.elem);
    this.init();
  }

  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  removeInitialSpinner = () => {
    const spinner = document.getElementById("initial-spinner");
    if (spinner) spinner.remove();
  };

  renderLoadError = (id) => {
    this.elem.innerHTML = "";
    this.elem.style.maxWidth = "720px";
    this.elem.style.margin = "48px auto";
    this.elem.style.padding = "20px";
    this.elem.style.border = "1px solid var(--blue-muted)";
    this.elem.style.borderRadius = "8px";
    this.elem.style.background = "var(--blue-main)";

    const title = document.createElement("h2");
    title.textContent = "Unable to Load Character Sheet";
    title.style.marginBottom = "8px";

    const body = document.createElement("p");
    body.textContent =
      "The page could not load sheet data right now. This can happen during rapid refreshes or a temporary API failure.";
    body.style.marginBottom = "16px";

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "12px";
    actions.style.flexWrap = "wrap";

    const retryBtn = document.createElement("button");
    retryBtn.className = "modal-form-button";
    retryBtn.textContent = "Retry";
    retryBtn.addEventListener("click", () => {
      const query = id ? `?id=${encodeURIComponent(String(id))}` : "";
      window.location.href = `/5eplayer${query}`;
    });

    const dashBtn = document.createElement("button");
    dashBtn.className = "modal-form-button";
    dashBtn.textContent = "Back To Dashboard";
    dashBtn.addEventListener("click", () => {
      window.location.href = "/dash";
    });

    actions.append(retryBtn, dashBtn);
    this.elem.append(title, body, actions);
    this.removeInitialSpinner();
  };

  loadGeneralData = async (id, maxAttempts = 3) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const sheetDoc = await getThings(`/api/sheets/${id}`);
      if (sheetDoc) {
        const generalData = normalizeSheetDocToLegacyGeneralData(sheetDoc, id);
        return ensureLegacyGeneralDataShape(generalData, id);
      }

      if (attempt < maxAttempts) {
        await this.sleep(200 * attempt);
      }
    }
    return null;
  };

  init = async () => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("id");
    if (!id) {
      if (window.customAlertError) {
        window.customAlertError("Missing character sheet ID");
      }
      this.renderLoadError(id);
      return;
    }

    const generalData = await this.loadGeneralData(id);

    if (!generalData) {
      if (window.customAlertError) {
        window.customAlertError("Unable to load character sheet");
      }
      this.renderLoadError(id);
      return;
    }

    // handle invite
    // don't allow owner to become a playerUser of their own sheet
    if (USERID != generalData.user_id) {
      const invite = searchParams.get("invite");
      if (invite) {
        const inviteValid = await getThings(
          `/api/get_player_invite_by_uuid/${invite}`
        );
        if (inviteValid) {
          // check if user is already a playerUser
          const playerUser = await getThings(
            `/api/get_player_user_by_user_and_player/${id}`
          );
          if (!playerUser) {
            await postThing("/api/add_player_user", { player_id: id });
          }
          // clean params
          searchParams.delete("invite");
          const newRelativePathQuery =
            window.location.pathname + "?" + searchParams.toString();
          history.replaceState(null, "", newRelativePathQuery);
        } else {
          window.customAlertError("Invalid invite link");
          window.location.pathname = "/";
        }
      }
    }

    new FiveEPlayerSheet({
      domComponent: this.elem,
      params: { content: generalData },
    });
    // stop initial spinner
    this.removeInitialSpinner();
  };
}

new InitSheet();
