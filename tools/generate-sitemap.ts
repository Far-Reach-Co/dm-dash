import fs from "fs";
import path from "path";
import zlib from "zlib";
import { SitemapStream, streamToPromise } from "sitemap";

const HOSTNAME = "https://farreachco.com";
const OUTPUT_PATH = path.join(__dirname, "../public/sitemap.xml");
const OUTPUT_PATH_GZ = path.join(__dirname, "../public/sitemap.xml.gz");
const DATA_DIR = path.join(__dirname, "../public/lib/data/2014");

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

// Static pages with their priorities
const staticPages: SitemapEntry[] = [
  // Main pages
  { url: "/", priority: 1.0, changefreq: "monthly" },
  { url: "/about-us", priority: 0.9, changefreq: "monthly" },
  { url: "/what-is-frc", priority: 0.9, changefreq: "monthly" },
  { url: "/resources", priority: 0.9, changefreq: "monthly" },
  { url: "/wyrlds/public", priority: 0.85, changefreq: "weekly" },
  { url: "/public-wyrlds-guide", priority: 0.8, changefreq: "monthly" },
  { url: "/public-wyrlds-admin-guide", priority: 0.7, changefreq: "monthly" },
  { url: "/wyrld-permissions-guide", priority: 0.75, changefreq: "monthly" },
  { url: "/sandbox-mode-guide", priority: 0.75, changefreq: "monthly" },
  { url: "/radio", priority: 0.9, changefreq: "monthly" },
  { url: "/preaethrend", priority: 0.8, changefreq: "monthly" },
  { url: "/aether-bot", priority: 0.8, changefreq: "monthly" },
  { url: "/vtt-guide", priority: 0.8, changefreq: "monthly" },
  // Legal
  { url: "/privacy-policy", priority: 0.5, changefreq: "yearly" },
  { url: "/terms-of-use", priority: 0.5, changefreq: "yearly" },
  { url: "/attributions", priority: 0.5, changefreq: "yearly" },
  // SRD index pages
  { url: "/dnd/5e/srd/contents", priority: 0.8, changefreq: "monthly" },
  { url: "/dnd/5e/srd/monsters", priority: 0.8, changefreq: "monthly" },
  { url: "/dnd/5e/srd/spells", priority: 0.8, changefreq: "monthly" },
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
  {
    url: "/dnd/5e/srd/weapon-properties",
    priority: 0.7,
    changefreq: "monthly",
  },
];

// Dynamic routes - each generates URLs from a JSON data file
const dynamicRoutes: DynamicRoute[] = [
  {
    pattern: "/dnd/5e/srd/monsters/{index}",
    dataFile: "5e-srd-monsters.json",
    priority: 0.7,
    changefreq: "monthly",
  },
  {
    pattern: "/dnd/5e/srd/spells/{index}",
    dataFile: "5e-srd-spells.json",
    priority: 0.7,
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
];

function loadDataIndexes(dataFile: string): string[] {
  const filePath = path.join(DATA_DIR, dataFile);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return data.map((item: { index: string }) => item.index);
}

function expandDynamicRoute(route: DynamicRoute): SitemapEntry[] {
  const indexes = loadDataIndexes(route.dataFile);
  return indexes.map((index) => ({
    url: route.pattern.replace("{index}", index),
    priority: route.priority,
    changefreq: route.changefreq,
  }));
}

async function generateSitemap(): Promise<void> {
  const stream = new SitemapStream({ hostname: HOSTNAME });
  const lastmod = new Date().toISOString();

  // Collect all entries
  const entries: SitemapEntry[] = [
    ...staticPages,
    ...dynamicRoutes.flatMap(expandDynamicRoute),
  ];

  console.log(`Generating sitemap with ${entries.length} URLs...`);

  // Write entries to stream
  for (const entry of entries) {
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

  // Write uncompressed version
  fs.writeFileSync(OUTPUT_PATH, xmlString);

  // Write gzipped version
  const gzipped = zlib.gzipSync(xmlString);
  fs.writeFileSync(OUTPUT_PATH_GZ, gzipped);

  const xmlSizeKB = (xmlString.length / 1024).toFixed(1);
  const gzSizeKB = (gzipped.length / 1024).toFixed(1);

  console.log(`Sitemap generated:`);
  console.log(`  - ${OUTPUT_PATH} (${xmlSizeKB} KB)`);
  console.log(`  - ${OUTPUT_PATH_GZ} (${gzSizeKB} KB)`);
  console.log(`  - ${staticPages.length} static pages`);
  console.log(`  - ${entries.length - staticPages.length} dynamic pages`);
}

generateSitemap().catch((err) => {
  console.error("Failed to generate sitemap:", err);
  process.exit(1);
});
