import fs = require("fs");
import path = require("path");
import {
  buildClassRelationships,
  buildDamageTypeRelationships,
  buildEquipmentFacets,
  buildMonsterFacets,
  buildRaceRelationships,
  buildSpellFacets,
  CLASS_RELATIONSHIPS_FILE,
  DAMAGE_TYPE_RELATIONSHIPS_FILE,
  EQUIPMENT_FACETS_FILE,
  MONSTER_FACETS_FILE,
  RACE_RELATIONSHIPS_FILE,
  SPELL_FACETS_FILE,
} from "../dnd/srd/derivedDatasets.js";

const FILES = {
  classes: "5e-srd-classes.json",
  conditions: "5e-srd-conditions.json",
  "damage-types": "5e-srd-damage-types.json",
  equipment: "5e-srd-equipment.json",
  features: "5e-srd-features.json",
  languages: "5e-srd-languages.json",
  "magic-items": "5e-srd-magic-items.json",
  monsters: "5e-srd-monsters.json",
  proficiencies: "5e-srd-proficiencies.json",
  races: "5e-srd-races.json",
  subraces: "5e-srd-subraces.json",
  spells: "5e-srd-spells.json",
  traits: "5e-srd-traits.json",
} as const;

function readJsonArray(filePath: string): any[] {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`Expected JSON array in ${filePath}`);
  }
  return parsed;
}

function loadRequiredData(dataDir: string): Record<string, any[]> {
  const loaded: Record<string, any[]> = {};
  for (const [key, file] of Object.entries(FILES)) {
    const filePath = path.join(dataDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required SRD file not found: ${filePath}`);
    }
    loaded[key] = readJsonArray(filePath);
  }
  return loaded;
}

function writeJsonFile(dataDir: string, filename: string, data: unknown) {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`Wrote ${filename}`);
}

export function generateSrdDerivedDatasets(editionArg?: string) {
  const edition = String(editionArg || "2014").trim() || "2014";
  const dataDir = path.join(__dirname, `../../public/lib/data/${edition}`);

  if (!fs.existsSync(dataDir)) {
    throw new Error(`Data directory not found: ${dataDir}`);
  }

  const generatedAt = new Date().toISOString();
  const meta = {
    source: `5e SRD ${edition}`,
    generatedAt,
  };

  const data = loadRequiredData(dataDir);

  writeJsonFile(
    dataDir,
    DAMAGE_TYPE_RELATIONSHIPS_FILE,
    buildDamageTypeRelationships(
      data["damage-types"],
      data.spells,
      data.monsters,
      meta,
    ),
  );

  writeJsonFile(
    dataDir,
    SPELL_FACETS_FILE,
    buildSpellFacets(data.classes, data.spells, meta),
  );

  writeJsonFile(
    dataDir,
    MONSTER_FACETS_FILE,
    buildMonsterFacets(data.monsters, data.conditions, meta),
  );

  writeJsonFile(
    dataDir,
    RACE_RELATIONSHIPS_FILE,
    buildRaceRelationships(
      data.races,
      data.subraces,
      data.traits,
      data.languages,
      meta,
    ),
  );

  writeJsonFile(
    dataDir,
    EQUIPMENT_FACETS_FILE,
    buildEquipmentFacets(
      data.equipment,
      data["magic-items"],
      data.proficiencies,
      meta,
    ),
  );

  writeJsonFile(
    dataDir,
    CLASS_RELATIONSHIPS_FILE,
    buildClassRelationships(
      data.classes,
      data.features,
      data.proficiencies,
      data.spells,
      meta,
    ),
  );
}

function main() {
  generateSrdDerivedDatasets(process.argv[2]);
}

if (require.main === module) {
  main();
}
