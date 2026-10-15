import { detectCategories, type SrdEdition } from "./data.js";
import { findNamedSourceEntry } from "./indexer.js";

const DETAIL_CATEGORIES = new Set([
  "backgrounds", "classes", "damage-types", "equipment", "features",
  "magic-items", "monsters", "races", "spells",
]);

function entryHref(category: string, index: string, edition: SrdEdition): string {
  const base = `/dnd/5e/srd/${category}`;
  const detail = DETAIL_CATEGORIES.has(category) ? `/${encodeURIComponent(index)}` : "";
  const query = edition === "2024" ? "?edition=2024" : "";
  const anchor = detail ? "" : `#${encodeURIComponent(index)}`;
  return `${base}${detail}${query}${anchor}`;
}

function sourceText(entry: any, category: string, short: boolean): string {
  const facts: string[] = [];
  if (category === "spells") {
    facts.push(`Level ${entry.level ?? "?"} ${entry.school?.name || "spell"}`);
    for (const [label, value] of [
      ["Casting Time", entry.casting_time], ["Range", entry.range],
      ["Components", (entry.components || []).join(", ")], ["Duration", entry.duration],
    ]) if (value) facts.push(`${label}: ${value}`);
  } else if (category === "monsters") {
    facts.push(`AC: ${Array.isArray(entry.armor_class) ? entry.armor_class.map((item: any) => item.value).join("/") : entry.armor_class ?? "?"}`);
    facts.push(`HP: ${entry.hit_points ?? "?"}`);
    facts.push(`CR: ${entry.challenge_rating ?? "?"}`);
  } else if (category === "classes") {
    if (entry.hit_die) facts.push(`Hit Die: d${entry.hit_die}`);
    if (entry.saving_throws?.length) facts.push(`Saving Throws: ${entry.saving_throws.map((item: any) => item.name).join(", ")}`);
  }
  const raw = entry.description ?? entry.desc ?? entry.summary ?? "";
  const description = (Array.isArray(raw) ? raw.join("\n\n") : String(raw)).trim();
  const limit = short ? 2200 : 4000;
  const excerpt = description.length > limit
    ? `${description.slice(0, limit).trimEnd()}…\n\nRead the linked entry for the full text.`
    : description;
  return [...facts, excerpt].filter(Boolean).join("\n\n") || "Open the linked entry for its full rules text.";
}

export function buildSourceComparison(query: string, short = false): string {
  const categories = detectCategories(query);
  const results = (["2014", "2024"] as const).map((edition) => ({
    edition,
    match: findNamedSourceEntry(query, edition, categories),
  }));
  if (results.every(({ match }) => !match)) {
    return "I couldn't identify one clearly named SRD entry to compare. Name a specific spell, feature, monster, class, or item.";
  }
  return results.map(({ edition, match }) => {
    if (!match) return `**${edition} SRD:** No clearly named matching entry found.`;
    const { category, entry } = match;
    const link = `[${entry.name}](${entryHref(category, entry.index, edition)})`;
    return `**${edition} SRD — ${link}**\n\n${sourceText(entry, category, short)}`;
  }).join("\n\n---\n\n");
}
