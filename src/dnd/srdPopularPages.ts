import fs from "fs";
import path from "path";

export type SrdPopularPageLink = {
  href: string;
  name: string;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

export type SrdPopularPagesSection = {
  key: string;
  title: string;
  links: SrdPopularPageLink[];
};

export type SrdPopularPagesData = {
  version: number;
  source: string;
  generatedAt: string;
  siteUrl?: string;
  window?: {
    startDate: string;
    endDate: string;
    days: number;
  };
  sections: SrdPopularPagesSection[];
};

export const SRD_POPULAR_PAGES_FILE_PATH = path.join(
  __dirname,
  "../../public/lib/data/srd-popular-pages.json",
);

const FILE_CACHE_TTL_MS = 60 * 1000;

const DEFAULT_SRD_POPULAR_PAGES: SrdPopularPagesData = {
  version: 1,
  source: "fallback",
  generatedAt: "2026-03-06T00:00:00.000Z",
  sections: [
    {
      key: "spells",
      title: "Spells",
      links: [
        { href: "/dnd/5e/srd/spells/barkskin", name: "Barkskin" },
        { href: "/dnd/5e/srd/spells/hold-person", name: "Hold Person" },
        { href: "/dnd/5e/srd/spells/inflict-wounds", name: "Inflict Wounds" },
        { href: "/dnd/5e/srd/spells/acid-splash", name: "Acid Splash" },
        { href: "/dnd/5e/srd/spells/spare-the-dying", name: "Spare the Dying" },
        { href: "/dnd/5e/srd/spells/hellish-rebuke", name: "Hellish Rebuke" },
        { href: "/dnd/5e/srd/spells/fly", name: "Fly" },
        { href: "/dnd/5e/srd/spells/cure-wounds", name: "Cure Wounds" },
        { href: "/dnd/5e/srd/spells/scorching-ray", name: "Scorching Ray" },
        { href: "/dnd/5e/srd/spells/water-breathing", name: "Water Breathing" },
      ],
    },
    {
      key: "equipment",
      title: "Equipment",
      links: [
        { href: "/dnd/5e/srd/equipment/explorers-pack", name: "Explorer's Pack" },
        {
          href: "/dnd/5e/srd/equipment/potion-of-superior-healing",
          name: "Potion of Superior Healing",
        },
        { href: "/dnd/5e/srd/equipment/shortbow", name: "Shortbow" },
        { href: "/dnd/5e/srd/equipment/rapier", name: "Rapier" },
        { href: "/dnd/5e/srd/equipment/diplomats-pack", name: "Diplomat's Pack" },
        { href: "/dnd/5e/srd/equipment/flail", name: "Flail" },
        { href: "/dnd/5e/srd/equipment/longsword", name: "Longsword" },
        {
          href: "/dnd/5e/srd/equipment/potion-of-greater-healing",
          name: "Potion of Greater Healing",
        },
        {
          href: "/dnd/5e/srd/equipment/dungeoneers-pack",
          name: "Dungeoneer's Pack",
        },
        {
          href: "/dnd/5e/srd/magic-items/ring-of-resistance",
          name: "Ring of Resistance",
        },
      ],
    },
    {
      key: "monsters",
      title: "Monsters",
      links: [
        { href: "/dnd/5e/srd/monsters/flying-snake", name: "Flying Snake" },
        { href: "/dnd/5e/srd/monsters/boar", name: "Boar" },
        { href: "/dnd/5e/srd/monsters/hawk", name: "Hawk" },
        { href: "/dnd/5e/srd/monsters/guard", name: "Guard" },
        { href: "/dnd/5e/srd/monsters/steam-mephit", name: "Steam Mephit" },
        { href: "/dnd/5e/srd/monsters/dire-wolf", name: "Dire Wolf" },
        { href: "/dnd/5e/srd/monsters/goblin", name: "Goblin" },
        { href: "/dnd/5e/srd/monsters/imp", name: "Imp" },
        { href: "/dnd/5e/srd/monsters/skeleton", name: "Skeleton" },
      ],
    },
    {
      key: "rules",
      title: "Rules Reference",
      links: [
        { href: "/dnd/5e/srd/damage-types", name: "Damage Types" },
        { href: "/dnd/5e/srd/languages", name: "Languages" },
        { href: "/dnd/5e/srd/conditions", name: "Conditions" },
      ],
    },
  ],
};

let cachedPopularPagesData: SrdPopularPagesData | null = null;
let cachedPopularPagesExpiresAt = 0;

function clonePopularPagesData(data: SrdPopularPagesData): SrdPopularPagesData {
  return {
    ...data,
    window: data.window ? { ...data.window } : undefined,
    sections: data.sections.map((section) => ({
      ...section,
      links: section.links.map((link) => ({ ...link })),
    })),
  };
}

function normalizeSrdHref(value: string): string | null {
  const raw = String(value || "").trim();
  if (!raw) return null;

  let pathname = raw;
  if (/^https?:\/\//i.test(raw)) {
    try {
      pathname = new URL(raw).pathname;
    } catch {
      return null;
    }
  }

  if (!pathname.startsWith("/")) return null;
  const normalized = pathname.replace(/\/+$/, "");
  const href = normalized || "/";
  if (href === "/dnd/5e/srd") return "/dnd/5e/srd/contents";
  if (!href.startsWith("/dnd/5e/srd/")) return null;
  return href;
}

function toFiniteNumber(value: unknown): number | undefined {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function sanitizePopularPagesData(value: unknown): SrdPopularPagesData | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, any>;
  const source = typeof raw.source === "string" && raw.source.trim()
    ? raw.source.trim()
    : "unknown";
  const generatedAt = typeof raw.generatedAt === "string" && raw.generatedAt.trim()
    ? raw.generatedAt.trim()
    : new Date().toISOString();

  const window =
    raw.window &&
    typeof raw.window === "object" &&
    typeof raw.window.startDate === "string" &&
    typeof raw.window.endDate === "string" &&
    Number.isFinite(Number(raw.window.days))
      ? {
          startDate: raw.window.startDate,
          endDate: raw.window.endDate,
          days: Math.max(1, Math.trunc(Number(raw.window.days))),
        }
      : undefined;

  const sectionsRaw = Array.isArray(raw.sections) ? raw.sections : [];
  const sections: SrdPopularPagesSection[] = [];

  for (const sectionValue of sectionsRaw) {
    if (!sectionValue || typeof sectionValue !== "object") continue;
    const section = sectionValue as Record<string, any>;
    const key = String(section.key || "").trim();
    const title = String(section.title || "").trim();
    if (!key || !title) continue;

    const linksRaw = Array.isArray(section.links) ? section.links : [];
    const links: SrdPopularPageLink[] = [];
    for (const linkValue of linksRaw) {
      if (!linkValue || typeof linkValue !== "object") continue;
      const link = linkValue as Record<string, any>;
      const href = normalizeSrdHref(String(link.href || ""));
      const name = String(link.name || "").trim();
      if (!href || !name) continue;
      links.push({
        href,
        name,
        clicks: toFiniteNumber(link.clicks),
        impressions: toFiniteNumber(link.impressions),
        ctr: toFiniteNumber(link.ctr),
        position: toFiniteNumber(link.position),
      });
    }

    if (!links.length) continue;
    sections.push({
      key,
      title,
      links,
    });
  }

  if (!sections.length) return null;

  return {
    version: Number.isFinite(Number(raw.version)) ? Number(raw.version) : 1,
    source,
    generatedAt,
    siteUrl: typeof raw.siteUrl === "string" ? raw.siteUrl : undefined,
    window,
    sections,
  };
}

function loadPopularPagesDataFromFile(): SrdPopularPagesData | null {
  try {
    const raw = fs.readFileSync(SRD_POPULAR_PAGES_FILE_PATH, "utf8");
    return sanitizePopularPagesData(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function getSrdPopularPagesData(): SrdPopularPagesData {
  const now = Date.now();
  if (cachedPopularPagesData && cachedPopularPagesExpiresAt > now) {
    return clonePopularPagesData(cachedPopularPagesData);
  }

  const fileData = loadPopularPagesDataFromFile();
  cachedPopularPagesData = fileData || clonePopularPagesData(DEFAULT_SRD_POPULAR_PAGES);
  cachedPopularPagesExpiresAt = now + FILE_CACHE_TTL_MS;

  return clonePopularPagesData(cachedPopularPagesData);
}

