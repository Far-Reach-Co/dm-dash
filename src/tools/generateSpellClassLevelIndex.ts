import fs = require("fs");
import path = require("path");
import {
  buildSpellClassLevelIndex,
  SPELL_CLASS_LEVEL_INDEX_FILE,
} from "../dnd/srd/spellClassLevelIndex.js";

const SPELLS_FILE = "5e-srd-spells.json";
const CLASSES_FILE = "5e-srd-classes.json";

function readJsonArray(filePath: string): any[] {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function main() {
  const editionArg = String(process.argv[2] || "2014").trim();
  const edition = editionArg || "2014";
  const dataDir = path.join(__dirname, `../../public/lib/data/${edition}`);

  if (!fs.existsSync(dataDir)) {
    throw new Error(`Data directory not found: ${dataDir}`);
  }

  const classesPath = path.join(dataDir, CLASSES_FILE);
  const spellsPath = path.join(dataDir, SPELLS_FILE);
  const outputPath = path.join(dataDir, SPELL_CLASS_LEVEL_INDEX_FILE);

  if (!fs.existsSync(classesPath)) {
    throw new Error(`Classes file not found: ${classesPath}`);
  }
  if (!fs.existsSync(spellsPath)) {
    throw new Error(`Spells file not found: ${spellsPath}`);
  }

  const classesData = readJsonArray(classesPath);
  const spellsData = readJsonArray(spellsPath);
  const indexData = buildSpellClassLevelIndex(classesData, spellsData, {
    source: `5e SRD ${edition}`,
    generatedAt: new Date().toISOString(),
  });

  fs.writeFileSync(outputPath, `${JSON.stringify(indexData, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${SPELL_CLASS_LEVEL_INDEX_FILE} (${Object.keys(indexData.classes).length} classes, ${spellsData.length} spells)`,
  );
}

main();
