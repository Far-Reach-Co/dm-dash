import {
  DndFiveEGeneral,
} from "../api/queries/5eCharGeneral";
import { DndFiveEPro } from "../api/queries/5eCharPro";
import { DndFiveEBackground } from "../api/queries/5eCharBack";
import { DndFiveESpellSlots } from "../api/queries/5eCharSpellSlots";
import { DndFiveEEquipment } from "../api/queries/5eCharEquipment";
import {
  get5eSheetDocumentQuery,
  sync5eSheetGeneralSectionQuery,
} from "../api/queries/5eSheetDocument";

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

export interface CharacterSheetExportData {
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

export async function getCharacterSheetExportData(
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
