import fs from "fs";
import path from "path";
import type { Request, Response, NextFunction, Router } from "express";
import { editionIdMatches } from "./editionIdMatches";
import { DND_API_BASE } from "../srdCatalog";

const ROOT = path.join(__dirname, "../../../public/lib/data");
const PREFIX = "/5e/srd/";
const PUBLIC_PREFIX = "/dnd/5e/srd/";
const CATEGORIES: Record<string, string> = {
  "ability-scores": "ability-scores", alignments: "alignments", backgrounds: "backgrounds",
  classes: "classes", conditions: "conditions", "damage-types": "damage-types",
  equipment: "equipment", "magic-items": "magic-items", feats: "feats",
  features: "features", languages: "languages", monsters: "monsters", races: "species",
  skills: "skills", spells: "spells", "weapon-properties": "weapon-properties",
  levels: "levels", subclasses: "subclasses", poisons: "poisons", "weapon-mastery-properties": "weapon-mastery-properties",
};
const DETAIL_VIEWS: Record<string, string> = {
  backgrounds: "background", classes: "class", "damage-types": "damage-type",
  equipment: "equipment-item", "magic-items": "magic-item", features: "feature",
  monsters: "monster", races: "race", spells: "spell",
};
const LIST_VIEWS: Record<string, string> = {
  "ability-scores": "abilityscores", alignments: "alignments", backgrounds: "backgrounds",
  classes: "classes-index", conditions: "conditions", "damage-types": "damagetypes",
  equipment: "equipment", feats: "feats", features: "features", languages: "languages",
  monsters: "monsters", races: "races", skills: "skills", spells: "spells",
  "weapon-properties": "weaponproperties",
};
const cache = new Map<string, any[]>();
function data(edition: "2014" | "2024", category: string): any[] {
  const source = edition === "2024" ? CATEGORIES[category] : category;
  if (!source) return [];
  const key = `${edition}/${source}`;
  if (!cache.has(key)) {
    const file = path.join(ROOT, edition, `5e-srd-${source}.json`);
    cache.set(key, fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : []);
  }
  return cache.get(key)!;
}
function matchEntry(items: any[], index: string): any | undefined {
  return items.find((item) => item.index === index);
}
function label(category: string): string {
  if (category === "races") return "Species";
  if (category === "desc") return "Description";
  return category.replace(/[-_]/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}
function filterHeading(category: string, parts: string[], items: any[]): string | null {
  if (parts.length !== 3 || !items.length) return null;
  const [, filter, value] = parts;
  if (category === "spells") {
    if (filter === "level") return value === "0" ? "Cantrips" : `Level ${value} Spells`;
    if (filter === "school") return `${items[0].school?.name || label(value)} Spells`;
    if (filter === "class") return `${(items[0].classes || []).find((ref: any) => ref.index === value)?.name || label(value)} Spells`;
    if (filter === "damage") return `${items[0].damage?.damage_type?.name || label(value)} Damage Spells`;
  }
  if (category === "monsters") {
    if (filter === "type") return `${label(value)} Monsters`;
    if (filter === "cr") return `CR ${value.replace("-", "/")} Monsters`;
    if (filter === "condition-immunity") return `${(items[0].condition_immunities || []).find((ref: any) => ref.index === value)?.name || label(value)}-Immune Monsters`;
  }
  return null;
}
function normalizedCr(value: string): string {
  return ({ "1-8": "0.125", "1-4": "0.25", "1-2": "0.5" } as Record<string, string>)[value] || value;
}
function filteredItems(category: string, parts: string[], edition: "2014" | "2024"): any[] {
  const items = data(edition, category);
  if (parts.length === 1) return items;
  if (parts.length === 2 && DETAIL_VIEWS[category]) {
    const item = matchEntry(items, parts[1]);
    return item ? [item] : [];
  }
  if (category === "spells" && parts.length === 3) {
    const [, filter, value] = parts;
    if (filter === "level") return items.filter((item) => String(item.level) === value);
    if (filter === "school") return items.filter((item) => item.school?.index === value);
    if (filter === "class") return items.filter((item) => (item.classes || []).some((ref: any) => ref.index === value));
    if (filter === "damage") return items.filter((item) => item.damage?.damage_type?.index === value);
  }
  if (category === "monsters" && parts.length === 3) {
    const [, filter, value] = parts;
    if (filter === "type") return items.filter((item) => String(item.type).toLowerCase().replace(/[^a-z0-9]+/g, "-") === value);
    if (filter === "cr") return items.filter((item) => String(item.challenge_rating) === normalizedCr(value));
    if (filter === "condition-immunity") return items.filter((item) => (item.condition_immunities || []).some((ref: any) => ref.index === value));
  }
  return [];
}
function resolveView(parts: string[]): { view: string; category: string; items: any[]; entry?: any } | null {
  if (parts[0] === "contents" && parts.length === 1) return { view: "contents", category: "contents", items: [] };
  const category = parts[0];
  if (!CATEGORIES[category]) return null;
  const items = filteredItems(category, parts, "2024");
  if (parts.length === 1) {
    const view = LIST_VIEWS[category] || (category === "magic-items" ? "equipment" : null);
    return view ? { view, category, items } : null;
  }
  if (parts.length === 2 && DETAIL_VIEWS[category]) return items.length ? { view: DETAIL_VIEWS[category], category, items, entry: items[0] } : null;
  if (parts.length === 3 && category === "spells") return items.length ? { view: "spells-filter", category, items } : null;
  if (parts.length === 3 && category === "monsters") return items.length ? { view: "monsters-filter", category, items } : null;
  return null;
}
const reverseEditionIdMatches = Object.fromEntries(
  Object.entries(editionIdMatches).map(([category, matches]) => [
    category,
    Object.fromEntries(Object.entries(matches).map(([oldId, newId]) => [newId, oldId])),
  ]),
) as Record<string, Record<string, string>>;

function counterpartParts(parts: string[], edition: "2014" | "2024"): string[] {
  if (parts.length !== 2 || !DETAIL_VIEWS[parts[0]]) return parts;
  const matches = edition === "2024" ? editionIdMatches : reverseEditionIdMatches;
  const mappedId = matches[parts[0]]?.[parts[1]];
  return mappedId ? [parts[0], mappedId] : parts;
}

function editionUrl(req: Request, parts: string[], edition: "2014" | "2024"): string {
  const url = new URL(req.originalUrl, "http://localhost");
  url.pathname = `${PUBLIC_PREFIX}${parts.map(encodeURIComponent).join("/")}`;
  if (edition === "2024") url.searchParams.set("edition", "2024");
  else url.searchParams.delete("edition");
  return url.pathname + url.search + url.hash;
}
function known2014(parts: string[]): boolean {
  if (parts[0] === "contents" && parts.length === 1) return true;
  const category = parts[0];
  if (category === "magic-items" && parts.length === 1) return true;
  return !!CATEGORIES[category] && filteredItems(category, parts, "2014").length > 0;
}
const linkableCategories = new Set(["spells", "monsters", "classes", "backgrounds", "features", "equipment", "magic-items", "races", "damage-types"]);
let referenceLinks: Map<string, string> | null = null;
function referenceHref(ref: any): string | null {
  if (!ref || typeof ref !== "object" || typeof ref.url !== "string") return null;
  if (!referenceLinks) {
    referenceLinks = new Map();
    for (const category of linkableCategories) {
      // Resolve actual source URLs; some do not match their record index.
      for (const entry of data("2024", category)) {
        referenceLinks.set(entry.url, `${PUBLIC_PREFIX}${category}/${encodeURIComponent(entry.index)}?edition=2024`);
      }
    }
  }
  return referenceLinks.get(ref.url) || null;
}
function displayFields(record: any): [string, any][] {
  return Object.entries(record).filter(([key, value]) => !["index", "url", "name", "image", "class_levels", "option_type", "option_set_type"].includes(key) && value !== null && value !== undefined && (!Array.isArray(value) || value.length));
}
export function registerSrdEditionView(router: Router): void {
  router.use((req: Request, res: Response, next: NextFunction) => {
    if (!["GET", "HEAD"].includes(req.method) || !req.path.startsWith(PREFIX)) return next();
    const parts = req.path.slice(PREFIX.length).split("/").filter(Boolean);
    const requested2024 = req.query.edition === "2024";
    const parts2024 = requested2024 ? parts : counterpartParts(parts, "2024");
    const parts2014 = requested2024 ? counterpartParts(parts, "2014") : parts;
    const resolved = resolveView(parts2024);
    const available = !!resolved;
    res.locals.srdEdition = requested2024 ? "2024" : "2014";
    res.locals.srd2024Available = available;
    res.locals.srd2014Available = known2014(parts2014);
    res.locals.srdBaseUrl = editionUrl(req, parts2014, "2014");
    res.locals.srd2024Url = editionUrl(req, parts2024, "2024");
    if (!requested2024) return next();
    if (!available) {
      const mapped = counterpartParts(parts, "2024");
      if (mapped !== parts && resolveView(mapped)) return res.redirect(302, editionUrl(req, mapped, "2024"));
      return res.redirect(302, editionUrl(req, parts, "2014"));
    }
    try {
      const { view, category, items, entry } = resolved!;
      const heading = filterHeading(category, parts, items) || (category === "features" && entry?.class
        ? `${entry.name} 5e: ${entry.class.name} Feature`
        : category === "classes" && entry ? `${entry.name} 5E Class`
        : entry?.name || (category === "contents" ? "D&D 5E SRD Contents" : label(category)));
      const classFeatures = category === "features" && entry?.class
        ? data("2024", "features").filter((feature) => feature.class?.index === entry.class.index).sort((a, b) => (Number(a.level?.name?.match(/\d+$/)?.[0]) || 0) - (Number(b.level?.name?.match(/\d+$/)?.[0]) || 0) || a.name.localeCompare(b.name))
        : [];
      const featurePosition = classFeatures.findIndex((feature) => feature.index === entry?.index);
      res.render(`dnd/5e/srd/${view}`, {
        auth: req.session.user, heading,
        monster: category === "monsters" ? entry : undefined,
        imageBaseUrl: DND_API_BASE,
        relatedDamageTypes: [],
        editionCategory: category, editionItems: items.slice().sort((a, b) => a.name.localeCompare(b.name)),
        editionEntry: entry, editionParts: parts, editionData: data, editionLabel: label,
        editionFields: displayFields, editionReferenceHref: referenceHref,
        editionClassLevels: category === "classes" && entry ? data("2024", "levels").filter((level) => level.class?.index === entry.index && !level.subclass).sort((a, b) => a.level - b.level) : [],
        editionClassFeatures: category === "classes" && entry ? data("2024", "features").filter((feature) => feature.class?.index === entry.index).sort((a, b) => (Number(a.level?.name?.match(/\d+$/)?.[0]) || 0) - (Number(b.level?.name?.match(/\d+$/)?.[0]) || 0) || a.name.localeCompare(b.name)) : [],
        editionClassSubclasses: category === "classes" && entry ? data("2024", "subclasses").filter((subclass) => subclass.class?.index === entry.index) : [],
        editionClassSpellCount: category === "classes" && entry ? data("2024", "spells").filter((spell) => (spell.classes || []).some((ref: any) => ref.index === entry.index)).length : 0,
        editionFeatureLevel: entry?.level?.name?.match(/\d+$/)?.[0],
        editionFeaturePrevious: featurePosition > 0 ? classFeatures[featurePosition - 1] : null,
        editionFeatureNext: featurePosition >= 0 ? classFeatures[featurePosition + 1] || null : null,
        editionFeatureRelated: classFeatures.filter((feature) => feature.index !== entry?.index).slice(0, 8),
        editionCategories: Object.keys(LIST_VIEWS).filter((key) => data("2024", key).length).map((key) => ({ key, label: label(key), count: data("2024", key).length })),
      });
    } catch (error) { next(error); }
  });
}
