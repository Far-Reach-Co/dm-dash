import { Router, Request, Response, NextFunction } from "express";
import {
  DndFiveEGeneral,
  get5eCharGeneralUserIdQuery,
  get5eCharNamesQuery,
} from "../api/queries/5eCharGeneral";
import { DndFiveEPro } from "../api/queries/5eCharPro";
import { DndFiveEBackground } from "../api/queries/5eCharBack";
import { DndFiveESpellSlots } from "../api/queries/5eCharSpellSlots";
import { DndFiveEEquipment } from "../api/queries/5eCharEquipment";
import {
  get5eSheetDocumentQuery,
  sync5eSheetGeneralSectionQuery,
} from "../api/queries/5eSheetDocument";
import { getPlayerUserByUserAndPlayerQuery } from "../api/queries/playerUsers";
import { getPlayerInviteByUUIDQuery } from "../api/queries/playerInvites";
import { getProjectQuery } from "../api/queries/projects";
import { getProjectUserByUserAndProjectQuery } from "../api/queries/projectUsers";
import { requireUserOrRedirect } from "../lib/authz";
import { upsertRecentlyViewed } from "../api/queries/recentlyViewed";

const router = Router();

interface CharacterClassRow {
  id: number;
  general_id: number;
  class: string | null;
  subclass: string | null;
  hit_dice_type: string | null;
  total_hit_dice: number | null;
  current_hit_dice: number | null;
}

interface CharacterAttackRow {
  id: number;
  general_id: number;
  title: string | null;
  description: string | null;
  range: string | null;
  damage_type: string | null;
  bonus: string | null;
  duration: string | null;
}

interface CharacterSpellRow {
  id: number;
  general_id: number;
  title: string | null;
  description: string | null;
  type: string | null;
  casting_time: string | null;
  duration: string | null;
  range: string | null;
  components: string | null;
  damage_type: string | null;
}

interface CharacterFeatRow {
  id: number;
  general_id: number;
  type: string | null;
  title: string | null;
  description: string | null;
}

interface CharacterOtherProLangRow {
  id: number;
  general_id: number;
  type: string | null;
  proficiency: string | null;
}

interface CharacterSpellGroup {
  type: string;
  spells: CharacterSpellRow[];
}

interface SheetAccessResult {
  userId: string | number;
  playerSheetId: string;
  playerSheetName: string;
  projectId: string | null;
  inviteId: string | null;
}

interface CharacterSheetExportData {
  general: DndFiveEGeneral;
  proficiencies: DndFiveEPro | null;
  background: DndFiveEBackground | null;
  spellSlots: DndFiveESpellSlots | null;
  classes: CharacterClassRow[];
  attacks: CharacterAttackRow[];
  spells: CharacterSpellRow[];
  spellGroups: CharacterSpellGroup[];
  feats: CharacterFeatRow[];
  equipment: DndFiveEEquipment[];
  otherProLangs: CharacterOtherProLangRow[];
}

function buildSheetHref(
  playerSheetId: string,
  projectId: string | null,
  inviteId: string | null,
): string {
  const params = new URLSearchParams({ id: playerSheetId });
  if (projectId) params.set("project", projectId);
  if (!projectId && inviteId) params.set("invite", inviteId);
  return `/5eplayer?${params.toString()}`;
}

function buildExportHref(
  playerSheetId: string,
  projectId: string | null,
  inviteId: string | null,
): string {
  const params = new URLSearchParams({ id: playerSheetId });
  if (projectId) params.set("project", projectId);
  if (!projectId && inviteId) params.set("invite", inviteId);
  return `/5eplayer/export?${params.toString()}`;
}

function buildExportJsonHref(
  playerSheetId: string,
  projectId: string | null,
  inviteId: string | null,
): string {
  const params = new URLSearchParams({ id: playerSheetId });
  if (projectId) params.set("project", projectId);
  if (!projectId && inviteId) params.set("invite", inviteId);
  return `/5eplayer/export/json?${params.toString()}`;
}

function toSafeFilenamePart(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return normalized || "character-sheet";
}

function toOrdinal(level: number): string {
  if (level === 1) return "1st";
  if (level === 2) return "2nd";
  if (level === 3) return "3rd";
  return `${level}th`;
}

function parseSpellLevel(type: string): number | null {
  const normalized = type.toLowerCase().trim();
  if (!normalized) return null;
  if (normalized.includes("cantrip")) return 0;

  const directNumberMatch = normalized.match(/\b([1-9])(?:st|nd|rd|th)?\b/);
  if (directNumberMatch) return Number(directNumberMatch[1]);

  const levelNumberMatch = normalized.match(/\blevel\s*([1-9])\b/);
  if (levelNumberMatch) return Number(levelNumberMatch[1]);

  const wordToLevel: Record<string, number> = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8,
    ninth: 9,
  };

  for (const [word, level] of Object.entries(wordToLevel)) {
    if (normalized.includes(word)) return level;
  }

  return null;
}

function getSpellTypeBucket(type: string | null): {
  key: string;
  label: string;
  order: number;
} {
  const raw = type?.trim() || "";
  const parsedLevel = parseSpellLevel(raw);

  if (parsedLevel === 0) {
    return { key: "cantrip", label: "Cantrip", order: 0 };
  }

  if (parsedLevel && parsedLevel >= 1 && parsedLevel <= 9) {
    return {
      key: `level-${parsedLevel}`,
      label: `${toOrdinal(parsedLevel)} Level`,
      order: parsedLevel,
    };
  }

  const fallback = raw || "Other";
  return {
    key: `other-${fallback.toLowerCase()}`,
    label: fallback,
    order: 100,
  };
}

function groupSpellsByType(spells: CharacterSpellRow[]): CharacterSpellGroup[] {
  const grouped = new Map<
    string,
    { label: string; order: number; spells: CharacterSpellRow[] }
  >();

  for (const spell of spells) {
    const bucket = getSpellTypeBucket(spell.type);
    const group = grouped.get(bucket.key) || {
      label: bucket.label,
      order: bucket.order,
      spells: [],
    };
    group.spells.push(spell);
    grouped.set(bucket.key, group);
  }

  return Array.from(grouped.values())
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.label.localeCompare(b.label);
    })
    .map((group) => ({
      type: group.label,
      spells: group.spells.sort((a, b) => (a.id || 0) - (b.id || 0)),
    }));
}

async function resolvePlayerSheetAccess(
  req: Request,
  res: Response,
): Promise<SheetAccessResult | null> {
  const userId = requireUserOrRedirect(req, res, "/login");
  if (!userId) return null;

  if (!req.query.id) {
    res.redirect("/dash");
    return null;
  }

  const playerSheetId = String(req.query.id);
  const projectId = req.query.project ? String(req.query.project) : null;
  const inviteId = req.query.invite ? String(req.query.invite) : null;

  const playerSheetUserIdData = await get5eCharGeneralUserIdQuery(playerSheetId);
  const playerSheetUser = playerSheetUserIdData.rows[0];
  if (!playerSheetUser) {
    res.redirect("/dash");
    return null;
  }
  const playerSheetUserId = playerSheetUser.user_id;

  const playerSheetNameData = await get5eCharNamesQuery([playerSheetId]);
  const playerSheetNameRow = playerSheetNameData.rows[0];
  if (!playerSheetNameRow?.name) {
    res.redirect("/dash");
    return null;
  }
  const playerSheetName = playerSheetNameRow.name;

  if (playerSheetUserId == userId) {
    return { userId, playerSheetId, playerSheetName, projectId, inviteId };
  }

  const playerUserData = await getPlayerUserByUserAndPlayerQuery(
    userId,
    playerSheetId,
  );
  if (playerUserData.rows.length) {
    return { userId, playerSheetId, playerSheetName, projectId, inviteId };
  }

  if (!projectId) {
    const invite = inviteId || "";
    if (!invite) {
      res.render("forbidden", { auth: userId });
      return null;
    }
    const inviteData = await getPlayerInviteByUUIDQuery(invite);
    if (!inviteData.rows.length) {
      res.render("forbidden", { auth: userId });
      return null;
    }
    return { userId, playerSheetId, playerSheetName, projectId, inviteId };
  }

  const projectData = await getProjectQuery(projectId);
  if (!projectData.rows.length) {
    res.render("forbidden", { auth: userId });
    return null;
  }
  const project = projectData.rows[0];
  if (userId == project.user_id) {
    return { userId, playerSheetId, playerSheetName, projectId, inviteId };
  }

  const projectUserData = await getProjectUserByUserAndProjectQuery(
    userId,
    projectId,
  );
  if (!projectUserData.rows.length) {
    res.render("forbidden", { auth: userId });
    return null;
  }
  const projectUser = projectUserData.rows[0];
  if (!projectUser.is_editor) {
    res.render("forbidden", { auth: userId });
    return null;
  }

  return { userId, playerSheetId, playerSheetName, projectId, inviteId };
}

async function getCharacterSheetExportData(
  playerSheetId: string,
): Promise<CharacterSheetExportData | null> {
  let sheetDocumentData = await get5eSheetDocumentQuery(playerSheetId);
  const sheetRow = sheetDocumentData.rows[0];
  if (!sheetRow) return null;

  const isRecordObject = (value: unknown): value is Record<string, unknown> =>
    !!value && typeof value === "object" && !Array.isArray(value);
  const asObjectOrNull = <T>(value: unknown): T | null =>
    isRecordObject(value) ? (value as T) : null;
  const asArray = <T>(value: unknown): T[] =>
    Array.isArray(value) ? (value as T[]) : [];

  let document = isRecordObject(sheetRow.sheet_data) ? sheetRow.sheet_data : null;
  const hasGeneralSection = !!(document && isRecordObject(document.general));
  if (!hasGeneralSection) {
    sheetDocumentData = await sync5eSheetGeneralSectionQuery(playerSheetId);
    const refreshed = sheetDocumentData.rows[0];
    document = refreshed && isRecordObject(refreshed.sheet_data) ? refreshed.sheet_data : null;
  }
  if (!document) return null;

  const general = asObjectOrNull<DndFiveEGeneral>(document.general);
  if (!general) return null;

  const spells = asArray<CharacterSpellRow>(document.spells);

  return {
    general,
    proficiencies: asObjectOrNull<DndFiveEPro>(document.proficiencies),
    background: asObjectOrNull<DndFiveEBackground>(document.background),
    spellSlots: asObjectOrNull<DndFiveESpellSlots>(document.spellSlots),
    classes: asArray<CharacterClassRow>(document.classes),
    attacks: asArray<CharacterAttackRow>(document.attacks),
    spells,
    spellGroups: groupSpellsByType(spells),
    feats: asArray<CharacterFeatRow>(document.feats),
    equipment: asArray<DndFiveEEquipment>(document.equipment),
    otherProLangs: asArray<CharacterOtherProLangRow>(document.otherProLangs),
  };
}

router.get(
  "/5eplayer",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const access = await resolvePlayerSheetAccess(req, res);
      if (!access) return;

      upsertRecentlyViewed(access.userId, "sheet", access.playerSheetId);
      res.render("5eplayer", {
        auth: access.userId,
        playerSheetName: access.playerSheetName,
        exportHref: buildExportHref(
          access.playerSheetId,
          access.projectId,
          access.inviteId,
        ),
        jsonExportHref: buildExportJsonHref(
          access.playerSheetId,
          access.projectId,
          access.inviteId,
        ),
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5eplayer/export/json",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const access = await resolvePlayerSheetAccess(req, res);
      if (!access) return;

      const exportData = await getCharacterSheetExportData(access.playerSheetId);
      if (!exportData) return res.redirect("/dash");

      const datePart = new Date().toISOString().slice(0, 10);
      const safeName = toSafeFilenamePart(access.playerSheetName);
      const fileName = `${safeName}-${datePart}.json`;

      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

      return res.status(200).send(
        JSON.stringify(
          {
            schemaVersion: "1.0.0",
            exportType: "dnd5e_character_sheet",
            exportedAt: new Date().toISOString(),
            app: "dm-dash",
            sheet: {
              id: access.playerSheetId,
              name: access.playerSheetName,
              projectId: access.projectId,
            },
            data: exportData,
          },
          null,
          2,
        ),
      );
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5eplayer/export",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const access = await resolvePlayerSheetAccess(req, res);
      if (!access) return;

      const exportData = await getCharacterSheetExportData(access.playerSheetId);
      if (!exportData) return res.redirect("/dash");

      res.render("5eplayer-export", {
        auth: access.userId,
        playerSheetName: access.playerSheetName,
        sheetHref: buildSheetHref(
          access.playerSheetId,
          access.projectId,
          access.inviteId,
        ),
        printHref: `${buildExportHref(
          access.playerSheetId,
          access.projectId,
          access.inviteId,
        )}&print=1`,
        autoPrint: req.query.print === "1",
        exportData,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/newsheet", (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = requireUserOrRedirect(req, res, "/forbidden");
    if (!userId) return;
    res.render("newsheet", {
      auth: userId,
      wyrld_id: req.query.wyrld_id || null,
      wyrld_title: req.query.wyrld_title || null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
