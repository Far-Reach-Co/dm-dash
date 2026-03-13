import fs from "fs";
import path from "path";

import {
  SRD_POPULAR_PAGES_FILE_PATH,
  type SrdPopularPageLink,
  type SrdPopularPagesData,
  type SrdPopularPagesSection,
} from "../dnd/srdPopularPages";
import {
  dayWindowUtc,
  getAccessTokenFromServiceAccount,
  getRequiredString,
  loadServiceAccountCredentials,
  normalizePathname,
  querySearchAnalytics,
  toFiniteNumber,
  type SearchAnalyticsRow,
} from "../lib/googleSearchConsole";
import { hasFlag, parseFlagValue, parseIntFlag } from "./lib/cliFlags";

const SRD_PATH_PREFIX = "/dnd/5e/srd/";

type SectionKey = "spells" | "equipment" | "monsters" | "rules";

const SECTION_TITLES: Record<SectionKey, string> = {
  spells: "Spells",
  equipment: "Equipment",
  monsters: "Monsters",
  rules: "Rules Reference",
};

const INDEX_PAGE_TITLES: Record<string, string> = {
  contents: "Contents",
  "ability-scores": "Ability Scores",
  alignments: "Alignments",
  backgrounds: "Backgrounds",
  classes: "Classes",
  conditions: "Conditions",
  "damage-types": "Damage Types",
  equipment: "Equipment + Magic Items",
  feats: "Feats",
  features: "Features",
  languages: "Languages",
  monsters: "Monsters",
  races: "Races",
  skills: "Skills",
  spells: "Spells",
  "weapon-properties": "Weapon Properties",
  "magic-items": "Magic Items",
};

function normalizeSrdPath(raw: string): string | null {
  const normalized = normalizePathname(raw);
  if (!normalized) return null;
  const href = normalized || "/";
  if (href === "/dnd/5e/srd") return "/dnd/5e/srd/contents";
  if (!href.startsWith(SRD_PATH_PREFIX)) return null;
  return href;
}

function titleCaseSlug(value: string): string {
  return String(value || "")
    .trim()
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCrLabel(slug: string): string {
  if (slug === "1-8") return "1/8";
  if (slug === "1-4") return "1/4";
  if (slug === "1-2") return "1/2";
  return slug;
}

function classifySection(pathname: string): SectionKey | null {
  if (pathname === "/dnd/5e/srd/spells" || pathname.startsWith("/dnd/5e/srd/spells/")) {
    return "spells";
  }
  if (
    pathname === "/dnd/5e/srd/equipment" ||
    pathname.startsWith("/dnd/5e/srd/equipment/") ||
    pathname.startsWith("/dnd/5e/srd/magic-items/")
  ) {
    return "equipment";
  }
  if (pathname === "/dnd/5e/srd/monsters" || pathname.startsWith("/dnd/5e/srd/monsters/")) {
    return "monsters";
  }
  if (pathname.startsWith(SRD_PATH_PREFIX)) {
    return "rules";
  }
  return null;
}

function displayNameFromPath(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, "");
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length < 4) return "SRD";

  const srdParts = parts.slice(3);
  const section = srdParts[0];
  const rest = srdParts.slice(1);

  if (section === "spells") {
    if (rest[0] === "level" && rest[1]) {
      return rest[1] === "0" ? "Cantrips" : `Level ${rest[1]} Spells`;
    }
    if (rest[0] === "school" && rest[1]) {
      return `${titleCaseSlug(rest[1])} Spells`;
    }
    if (rest[0] === "class" && rest[1]) {
      return `${titleCaseSlug(rest[1])} Spells`;
    }
    if (rest[0]) return titleCaseSlug(rest[0]);
  }

  if (section === "monsters") {
    if (rest[0] === "type" && rest[1]) {
      return `${titleCaseSlug(rest[1])} Monsters`;
    }
    if (rest[0] === "cr" && rest[1]) {
      return `CR ${formatCrLabel(rest[1])} Monsters`;
    }
    if (rest[0]) return titleCaseSlug(rest[0]);
  }

  if (section === "classes" && rest[0]) return `${titleCaseSlug(rest[0])} Class`;
  if (section === "races" && rest[0]) return `${titleCaseSlug(rest[0])} Race`;
  if (section === "backgrounds" && rest[0]) return `${titleCaseSlug(rest[0])} Background`;
  if (section === "features" && rest[0]) return titleCaseSlug(rest[0]);
  if (section === "equipment" && rest[0]) return titleCaseSlug(rest[0]);
  if (section === "magic-items" && rest[0]) return titleCaseSlug(rest[0]);

  if (!rest.length) {
    return INDEX_PAGE_TITLES[section] || titleCaseSlug(section);
  }

  return titleCaseSlug(rest[rest.length - 1]);
}

function buildPopularPagesData(params: {
  rows: SearchAnalyticsRow[];
  siteUrl: string;
  startDate: string;
  endDate: string;
  days: number;
  limitPerSection: number;
}): SrdPopularPagesData {
  const buckets: Record<SectionKey, SrdPopularPageLink[]> = {
    spells: [],
    equipment: [],
    monsters: [],
    rules: [],
  };
  const seen: Record<SectionKey, Set<string>> = {
    spells: new Set(),
    equipment: new Set(),
    monsters: new Set(),
    rules: new Set(),
  };

  const sortedRows = params.rows
    .slice()
    .sort((a, b) => (Number(b.clicks) || 0) - (Number(a.clicks) || 0));

  for (const row of sortedRows) {
    const href = normalizeSrdPath(String(row.keys?.[0] || ""));
    if (!href || href === "/dnd/5e/srd/contents") continue;

    const sectionKey = classifySection(href);
    if (!sectionKey) continue;
    if (seen[sectionKey].has(href)) continue;
    if (buckets[sectionKey].length >= params.limitPerSection) continue;

    seen[sectionKey].add(href);
    buckets[sectionKey].push({
      href,
      name: displayNameFromPath(href),
      clicks: toFiniteNumber(row.clicks),
      impressions: toFiniteNumber(row.impressions),
      ctr: toFiniteNumber(row.ctr),
      position: toFiniteNumber(row.position),
    });
  }

  const sectionOrder: SectionKey[] = ["spells", "equipment", "monsters", "rules"];
  const sections: SrdPopularPagesSection[] = sectionOrder
    .map((key) => ({
      key,
      title: SECTION_TITLES[key],
      links: buckets[key],
    }))
    .filter((section) => section.links.length > 0);

  if (!sections.length) {
    throw new Error("Search Console returned no SRD page rows to build popular pages.");
  }

  return {
    version: 1,
    source: "google-search-console",
    generatedAt: new Date().toISOString(),
    siteUrl: params.siteUrl,
    window: {
      startDate: params.startDate,
      endDate: params.endDate,
      days: params.days,
    },
    sections,
  };
}

async function main() {
  const days = parseIntFlag("--days", 30, 1, 365);
  const lagDays = parseIntFlag("--lag-days", 3, 0, 30);
  const rowLimit = parseIntFlag("--row-limit", 2000, 100, 25000);
  const limitPerSection = parseIntFlag("--limit-per-section", 10, 1, 50);
  const dryRun = hasFlag("--dry-run");

  const outputArg = parseFlagValue("--output");
  const outputPath = outputArg
    ? path.resolve(process.cwd(), outputArg)
    : SRD_POPULAR_PAGES_FILE_PATH;
  const siteUrl = getRequiredString(
    parseFlagValue("--site-url") || process.env.GSC_SITE_URL,
    "GSC_SITE_URL or --site-url",
  );

  const { startDate, endDate } = dayWindowUtc(days, lagDays);
  console.log(
    `Querying Google Search Console for ${siteUrl} from ${startDate} to ${endDate}...`,
  );

  const credentials = loadServiceAccountCredentials();
  const accessToken = await getAccessTokenFromServiceAccount(credentials);
  const rows = await querySearchAnalytics({
    accessToken,
    siteUrl,
    startDate,
    endDate,
    dimensions: ["page"],
    rowLimit,
    dimensionFilterGroups: [
      {
        groupType: "and",
        filters: [
          {
            dimension: "page",
            operator: "contains",
            expression: SRD_PATH_PREFIX,
          },
        ],
      },
    ],
  });
  console.log(`Fetched ${rows.length} rows.`);

  const payload = buildPopularPagesData({
    rows,
    siteUrl,
    startDate,
    endDate,
    days,
    limitPerSection,
  });

  if (dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  const totalLinks = payload.sections.reduce((sum, section) => sum + section.links.length, 0);
  console.log(`Wrote ${totalLinks} links across ${payload.sections.length} sections to ${outputPath}`);
}

main().catch((err) => {
  console.error("Failed to update SRD popular pages from Google Search Console", err);
  process.exitCode = 1;
});
