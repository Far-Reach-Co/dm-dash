import fs from "fs";
import path from "path";
import fetch from "node-fetch";

import {
  SRD_POPULAR_PAGES_FILE_PATH,
  type SrdPopularPageLink,
  type SrdPopularPagesData,
  type SrdPopularPagesSection,
} from "../dnd/srdPopularPages";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEARCH_ANALYTICS_ENDPOINT_BASE = "https://www.googleapis.com/webmasters/v3/sites/";
const SRD_PATH_PREFIX = "/dnd/5e/srd/";

type SectionKey = "spells" | "equipment" | "monsters" | "rules";

type OAuthRefreshCredentials = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

type SearchAnalyticsRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type SearchAnalyticsResponse = {
  rows?: SearchAnalyticsRow[];
};

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

function parseFlagValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function parseIntFlag(flag: string, fallback: number, min: number, max: number): number {
  const raw = parseFlagValue(flag);
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(parsed)));
}

function getRequiredString(value: string | undefined, name: string): string {
  const trimmed = String(value || "").trim();
  if (!trimmed) throw new Error(`${name} is required.`);
  return trimmed;
}

function loadOAuthRefreshCredentials(): OAuthRefreshCredentials {
  return {
    clientId: getRequiredString(process.env.GSC_OAUTH_CLIENT_ID, "GSC_OAUTH_CLIENT_ID"),
    clientSecret: getRequiredString(
      process.env.GSC_OAUTH_CLIENT_SECRET,
      "GSC_OAUTH_CLIENT_SECRET",
    ),
    refreshToken: getRequiredString(
      process.env.GSC_OAUTH_REFRESH_TOKEN,
      "GSC_OAUTH_REFRESH_TOKEN",
    ),
  };
}

function dayWindowUtc(days: number, lagDays: number): { startDate: string; endDate: string } {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const now = new Date();
  const todayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
  );
  const endDate = new Date(todayUtc.getTime() - lagDays * DAY_MS);
  const startDate = new Date(endDate.getTime() - (days - 1) * DAY_MS);
  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
  };
}

function normalizeSrdPath(raw: string): string | null {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return null;

  let pathname = trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      pathname = new URL(trimmed).pathname;
    } catch {
      return null;
    }
  }

  if (!pathname.startsWith("/")) return null;
  const normalized = pathname.replace(/\/+$/, "");
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

async function getAccessTokenFromRefreshToken(
  credentials: OAuthRefreshCredentials,
): Promise<string> {
  const tokenBody = new URLSearchParams();
  tokenBody.set("grant_type", "refresh_token");
  tokenBody.set("client_id", credentials.clientId);
  tokenBody.set("client_secret", credentials.clientSecret);
  tokenBody.set("refresh_token", credentials.refreshToken);

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: tokenBody.toString(),
  });

  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(`OAuth refresh token exchange failed (${response.status}): ${bodyText}`);
  }

  let tokenData: any;
  try {
    tokenData = JSON.parse(bodyText);
  } catch {
    throw new Error("Failed to parse OAuth token response JSON.");
  }

  const accessToken = String(tokenData.access_token || "").trim();
  if (!accessToken) {
    throw new Error("OAuth refresh response did not include access_token.");
  }
  return accessToken;
}

async function querySearchAnalytics(params: {
  accessToken: string;
  siteUrl: string;
  startDate: string;
  endDate: string;
  rowLimit: number;
}): Promise<SearchAnalyticsRow[]> {
  const endpoint = `${SEARCH_ANALYTICS_ENDPOINT_BASE}${encodeURIComponent(params.siteUrl)}/searchAnalytics/query`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${params.accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      startDate: params.startDate,
      endDate: params.endDate,
      dimensions: ["page"],
      rowLimit: params.rowLimit,
      type: "web",
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
    }),
  });

  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(`Search Analytics query failed (${response.status}): ${bodyText}`);
  }

  let payload: SearchAnalyticsResponse;
  try {
    payload = JSON.parse(bodyText) as SearchAnalyticsResponse;
  } catch {
    throw new Error("Failed to parse Search Analytics response JSON.");
  }

  return Array.isArray(payload.rows) ? payload.rows : [];
}

function toFiniteNumber(value: unknown): number | undefined {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : undefined;
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

  const credentials = loadOAuthRefreshCredentials();
  const accessToken = await getAccessTokenFromRefreshToken(credentials);
  const rows = await querySearchAnalytics({
    accessToken,
    siteUrl,
    startDate,
    endDate,
    rowLimit,
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
