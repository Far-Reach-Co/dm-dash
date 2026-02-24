import fs from "fs";
import path from "path";
import zlib from "zlib";
import { SitemapStream, streamToPromise } from "sitemap";

const HOSTNAME = "https://farreachco.com";
const OUTPUT_PATH = path.join(__dirname, "../../public/sitemap.xml");
const OUTPUT_PATH_GZ = path.join(__dirname, "../../public/sitemap.xml.gz");
const DATA_DIR = path.join(__dirname, "../../public/lib/data/2014");

interface SitemapEntry {
  url: string;
  priority: number;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
}

interface DynamicRoute {
  pattern: string;
  dataFile: string;
  priority: number;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
}

const staticPages: SitemapEntry[] = [
  { url: "/", priority: 1.0, changefreq: "monthly" },
  { url: "/about-us", priority: 0.9, changefreq: "monthly" },
  { url: "/what-is-frc", priority: 0.9, changefreq: "monthly" },
  { url: "/resources", priority: 0.9, changefreq: "monthly" },
  { url: "/whats-new", priority: 0.85, changefreq: "weekly" },
  { url: "/pricing", priority: 0.9, changefreq: "monthly" },
  { url: "/wyrlds/public", priority: 0.85, changefreq: "weekly" },
  { url: "/public-wyrlds-guide", priority: 0.8, changefreq: "monthly" },
  { url: "/public-wyrlds-admin-guide", priority: 0.7, changefreq: "monthly" },
  { url: "/wyrld-permissions-guide", priority: 0.75, changefreq: "monthly" },
  { url: "/sandbox-mode-guide", priority: 0.75, changefreq: "monthly" },
  { url: "/radio", priority: 0.9, changefreq: "monthly" },
  { url: "/preaethrend", priority: 0.8, changefreq: "monthly" },
  { url: "/aether-bot", priority: 0.8, changefreq: "monthly" },
  { url: "/vtt-guide", priority: 0.8, changefreq: "monthly" },
  { url: "/privacy-policy", priority: 0.5, changefreq: "yearly" },
  { url: "/terms-of-use", priority: 0.5, changefreq: "yearly" },
  { url: "/attributions", priority: 0.5, changefreq: "yearly" },
  { url: "/dnd/5e/srd/contents", priority: 0.85, changefreq: "monthly" },
  { url: "/dnd/5e/srd/monsters", priority: 0.85, changefreq: "weekly" },
  { url: "/dnd/5e/srd/spells", priority: 0.85, changefreq: "weekly" },
  { url: "/dnd/5e/srd/equipment", priority: 0.8, changefreq: "monthly" },
  { url: "/dnd/5e/srd/classes", priority: 0.8, changefreq: "monthly" },
  { url: "/dnd/5e/srd/races", priority: 0.8, changefreq: "monthly" },
  { url: "/dnd/5e/srd/ability-scores", priority: 0.7, changefreq: "monthly" },
  { url: "/dnd/5e/srd/alignments", priority: 0.7, changefreq: "monthly" },
  { url: "/dnd/5e/srd/backgrounds", priority: 0.7, changefreq: "monthly" },
  { url: "/dnd/5e/srd/conditions", priority: 0.7, changefreq: "monthly" },
  { url: "/dnd/5e/srd/damage-types", priority: 0.7, changefreq: "monthly" },
  { url: "/dnd/5e/srd/feats", priority: 0.7, changefreq: "monthly" },
  { url: "/dnd/5e/srd/features", priority: 0.7, changefreq: "monthly" },
  { url: "/dnd/5e/srd/languages", priority: 0.7, changefreq: "monthly" },
  { url: "/dnd/5e/srd/skills", priority: 0.7, changefreq: "monthly" },
  { url: "/dnd/5e/srd/weapon-properties", priority: 0.7, changefreq: "monthly" },
];

const dynamicRoutes: DynamicRoute[] = [
  {
    pattern: "/dnd/5e/srd/monsters/{index}",
    dataFile: "5e-srd-monsters.json",
    priority: 0.75,
    changefreq: "monthly",
  },
  {
    pattern: "/dnd/5e/srd/spells/{index}",
    dataFile: "5e-srd-spells.json",
    priority: 0.75,
    changefreq: "monthly",
  },
  {
    pattern: "/dnd/5e/srd/equipment/{index}",
    dataFile: "5e-srd-equipment.json",
    priority: 0.7,
    changefreq: "monthly",
  },
  {
    pattern: "/dnd/5e/srd/magic-items/{index}",
    dataFile: "5e-srd-magic-items.json",
    priority: 0.7,
    changefreq: "monthly",
  },
  {
    pattern: "/dnd/5e/srd/classes/{index}",
    dataFile: "5e-srd-classes.json",
    priority: 0.7,
    changefreq: "monthly",
  },
  {
    pattern: "/dnd/5e/srd/races/{index}",
    dataFile: "5e-srd-races.json",
    priority: 0.7,
    changefreq: "monthly",
  },
  {
    pattern: "/dnd/5e/srd/backgrounds/{index}",
    dataFile: "5e-srd-backgrounds.json",
    priority: 0.65,
    changefreq: "monthly",
  },
  {
    pattern: "/dnd/5e/srd/features/{index}",
    dataFile: "5e-srd-features.json",
    priority: 0.65,
    changefreq: "monthly",
  },
];

function loadJson<T = any[]>(dataFile: string): T {
  const filePath = path.join(DATA_DIR, dataFile);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadDataIndexes(dataFile: string): string[] {
  const data = loadJson<Array<{ index: string }>>(dataFile);
  return data.map((item) => item.index);
}

function expandDynamicRoute(route: DynamicRoute): SitemapEntry[] {
  const indexes = loadDataIndexes(route.dataFile);
  return indexes.map((index) => ({
    url: route.pattern.replace("{index}", index),
    priority: route.priority,
    changefreq: route.changefreq,
  }));
}

function toMonsterTypeSlug(typeName: string): string {
  return String(typeName)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toCrSlug(crValue: string): string {
  if (crValue === "0.125") return "1-8";
  if (crValue === "0.25") return "1-4";
  if (crValue === "0.5") return "1-2";
  return crValue;
}

function generateSpellFilterEntries(): SitemapEntry[] {
  const spells = loadJson<Array<any>>("5e-srd-spells.json");
  const levels = new Set<number>();
  const schools = new Set<string>();
  const classes = new Set<string>();

  for (const spell of spells) {
    if (typeof spell.level === "number") levels.add(spell.level);
    if (spell?.school?.index) schools.add(spell.school.index);
    for (const cls of spell.classes || []) {
      if (cls?.index) classes.add(cls.index);
    }
  }

  const entries: SitemapEntry[] = [];

  for (const level of Array.from(levels).sort((a, b) => a - b)) {
    entries.push({
      url: `/dnd/5e/srd/spells/level/${level}`,
      priority: 0.65,
      changefreq: "monthly",
    });
  }

  for (const school of Array.from(schools).sort()) {
    entries.push({
      url: `/dnd/5e/srd/spells/school/${school}`,
      priority: 0.65,
      changefreq: "monthly",
    });
  }

  for (const classIndex of Array.from(classes).sort()) {
    entries.push({
      url: `/dnd/5e/srd/spells/class/${classIndex}`,
      priority: 0.65,
      changefreq: "monthly",
    });
  }

  return entries;
}

function generateMonsterFilterEntries(): SitemapEntry[] {
  const monsters = loadJson<Array<any>>("5e-srd-monsters.json");
  const types = new Set<string>();
  const crValues = new Set<string>();

  for (const monster of monsters) {
    if (monster?.type) types.add(String(monster.type));
    if (monster?.challenge_rating !== undefined && monster?.challenge_rating !== null) {
      crValues.add(String(monster.challenge_rating));
    }
  }

  const entries: SitemapEntry[] = [];

  for (const type of Array.from(types).sort()) {
    entries.push({
      url: `/dnd/5e/srd/monsters/type/${toMonsterTypeSlug(type)}`,
      priority: 0.65,
      changefreq: "monthly",
    });
  }

  for (const cr of Array.from(crValues).sort((a, b) => Number(a) - Number(b))) {
    entries.push({
      url: `/dnd/5e/srd/monsters/cr/${toCrSlug(cr)}`,
      priority: 0.65,
      changefreq: "monthly",
    });
  }

  return entries;
}

async function generateSitemap(): Promise<void> {
  const stream = new SitemapStream({ hostname: HOSTNAME });
  const lastmod = new Date().toISOString();

  const entries: SitemapEntry[] = [
    ...staticPages,
    ...dynamicRoutes.flatMap(expandDynamicRoute),
    ...generateSpellFilterEntries(),
    ...generateMonsterFilterEntries(),
  ];

  const seen = new Set<string>();
  const uniqueEntries = entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });

  console.log(`Generating sitemap with ${uniqueEntries.length} URLs...`);

  for (const entry of uniqueEntries) {
    stream.write({
      url: entry.url,
      lastmod,
      changefreq: entry.changefreq,
      priority: entry.priority,
    });
  }

  stream.end();

  const xml = await streamToPromise(stream);
  const xmlString = xml.toString();

  fs.writeFileSync(OUTPUT_PATH, xmlString);

  const gzipped = zlib.gzipSync(xmlString);
  fs.writeFileSync(OUTPUT_PATH_GZ, gzipped);

  const xmlSizeKB = (xmlString.length / 1024).toFixed(1);
  const gzSizeKB = (gzipped.length / 1024).toFixed(1);

  console.log(`Sitemap generated:`);
  console.log(`  - ${OUTPUT_PATH} (${xmlSizeKB} KB)`);
  console.log(`  - ${OUTPUT_PATH_GZ} (${gzSizeKB} KB)`);
  console.log(`  - ${uniqueEntries.length} total URLs`);
}

generateSitemap().catch((err) => {
  console.error("Failed to generate sitemap:", err);
  process.exit(1);
});
