import fs from "fs";
import path from "path";
import https from "https";
import { createHash } from "crypto";
import {
  buildSpellClassLevelIndex,
  SPELL_CLASS_LEVEL_INDEX_FILE,
} from "../dnd/srd/spellClassLevelIndex.js";
import { generateSrdDerivedDatasets } from "./generateSrdDerivedDatasets.js";

const SOURCE_REF = "6f6299e75b4fa56ed882bfb1429f6dc6b4c65330";
const REPO_BASE = `https://raw.githubusercontent.com/5e-bits/5e-database/${SOURCE_REF}/src`;

// Maps remote filename (capitalized) → local filename (lowercase)
const FILES: Record<string, string> = {
  "5e-SRD-Ability-Scores.json": "5e-srd-ability-scores.json",
  "5e-SRD-Alignments.json": "5e-srd-alignments.json",
  "5e-SRD-Backgrounds.json": "5e-srd-backgrounds.json",
  "5e-SRD-Classes.json": "5e-srd-classes.json",
  "5e-SRD-Conditions.json": "5e-srd-conditions.json",
  "5e-SRD-Damage-Types.json": "5e-srd-damage-types.json",
  "5e-SRD-Equipment-Categories.json": "5e-srd-equipment-categories.json",
  "5e-SRD-Equipment.json": "5e-srd-equipment.json",
  "5e-SRD-Feats.json": "5e-srd-feats.json",
  "5e-SRD-Features.json": "5e-srd-features.json",
  "5e-SRD-Languages.json": "5e-srd-languages.json",
  "5e-SRD-Levels.json": "5e-srd-levels.json",
  "5e-SRD-Magic-Items.json": "5e-srd-magic-items.json",
  "5e-SRD-Magic-Schools.json": "5e-srd-magic-schools.json",
  "5e-SRD-Monsters.json": "5e-srd-monsters.json",
  "5e-SRD-Proficiencies.json": "5e-srd-proficiencies.json",
  "5e-SRD-Races.json": "5e-srd-races.json",
  "5e-SRD-Rule-Sections.json": "5e-srd-rule-sections.json",
  "5e-SRD-Rules.json": "5e-srd-rules.json",
  "5e-SRD-Skills.json": "5e-srd-skills.json",
  "5e-SRD-Spells.json": "5e-srd-spells.json",
  "5e-SRD-Subclasses.json": "5e-srd-subclasses.json",
  "5e-SRD-Subraces.json": "5e-srd-subraces.json",
  "5e-SRD-Traits.json": "5e-srd-traits.json",
  "5e-SRD-Weapon-Properties.json": "5e-srd-weapon-properties.json",
};

const CLASSES_FILE = "5e-srd-classes.json";
const SPELLS_FILE = "5e-srd-spells.json";

function readJsonArray(filePath: string): any[] {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected JSON array in ${filePath}`);
  }
  return parsed;
}

function generateSpellClassLevelIndex(outDir: string, edition: string) {
  const classesPath = path.join(outDir, CLASSES_FILE);
  const spellsPath = path.join(outDir, SPELLS_FILE);
  const outputPath = path.join(outDir, SPELL_CLASS_LEVEL_INDEX_FILE);

  const classesData = readJsonArray(classesPath);
  const spellsData = readJsonArray(spellsPath);
  const indexData = buildSpellClassLevelIndex(classesData, spellsData, {
    source: `5e SRD ${edition}`,
    generatedAt: new Date().toISOString(),
  });

  fs.writeFileSync(outputPath, `${JSON.stringify(indexData, null, 2)}\n`, "utf8");
  console.log(
    `Generated ${SPELL_CLASS_LEVEL_INDEX_FILE} (${Object.keys(indexData.classes).length} classes)`,
  );
}

function download(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return download(res.headers.location!).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function main() {
  const edition = process.argv[2] || "2014";
  if (!["2014", "2024"].includes(edition)) {
    console.error(`Usage: npm run srd:download -- [2014|2024]`);
    process.exit(1);
  }

  const files = { ...FILES };
  if (edition === "2024") {
    for (const name of ["Races", "Subraces", "Rules", "Rule-Sections"]) delete files[`5e-SRD-${name}.json`];
    for (const name of ["Species", "Subspecies", "Poisons", "Weapon-Mastery-Properties"]) {
      files[`5e-SRD-${name}.json`] = `5e-srd-${name.toLowerCase()}.json`;
    }
  }
  // Fetch and validate the entire snapshot before touching the installed data.
  const snapshot: Record<string, any[]> = {};
  const contents: Record<string, string> = {};
  for (const [remoteFile, localFile] of Object.entries(files)) {
    const data = await download(`${REPO_BASE}/${edition}/en/${remoteFile}`);
    const records = JSON.parse(data);
    if (!Array.isArray(records) || records.length === 0) throw new Error(`Empty or invalid dataset: ${remoteFile}`);
    const ids = new Set<string>();
    for (const record of records) {
      if (!record.index || (edition === "2024" && !record.name) || ids.has(record.index)) throw new Error(`Missing identity or duplicate index in ${remoteFile}: ${record.index}`);
      ids.add(record.index);
    }
    snapshot[localFile] = records;
    contents[localFile] = data;
    console.log(`${localFile}: ${records.length} records`);
  }
  const urls = new Set(Object.values(snapshot).flat().map((record) => record.url));
  const unresolved = new Set<string>();
  function inspect(value: any) {
    if (!value || typeof value !== "object") return;
    if (typeof value.url === "string" && value.url.startsWith("/api/") && !urls.has(value.url)) unresolved.add(value.url);
    for (const child of Object.values(value)) inspect(child);
  }
  Object.values(snapshot).forEach(inspect);
  const outDir = path.join(__dirname, `../../public/lib/data/${edition}`);
  fs.mkdirSync(outDir, { recursive: true });
  for (const [file, data] of Object.entries(contents)) fs.writeFileSync(path.join(outDir, file), data);
  const manifest = {
    edition, language: "en", source: "5e-bits/5e-database", sourceCommit: SOURCE_REF,
    importedAt: new Date().toISOString(),
    categories: Object.entries(snapshot).map(([file, records]) => ({
      file, count: records.length, sha256: createHash("sha256").update(contents[file]).digest("hex"),
    })),
    unavailableCategories: edition === "2024" ? ["rules", "rule-sections"] : [],
    unresolvedReferences: [...unresolved].sort(),
    completeness: "Source snapshot; not certified complete against the official SRD.",
  };
  fs.writeFileSync(path.join(outDir, "source-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  // The legacy derived datasets assume the 2014 schemas. Never run them on 2024.
  if (edition === "2014") {
    generateSpellClassLevelIndex(outDir, edition);
    generateSrdDerivedDatasets(edition);
  }
  console.log(`Imported ${Object.keys(snapshot).length} categories; ${unresolved.size} unresolved references recorded in source-manifest.json.`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
