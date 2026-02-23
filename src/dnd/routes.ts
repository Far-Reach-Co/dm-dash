import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { rateLimit } from "express-rate-limit";
import { searchSrd } from "./srd/mistral.js";
import { srdData } from "./srd/data.js";

const router = Router();

const CLASS_TABLE_PARTIALS = new Set([
  "barbarian",
  "bard",
  "cleric",
  "druid",
  "fighter",
  "monk",
  "paladin",
  "ranger",
  "rogue",
  "sorcerer",
  "warlock",
  "wizard",
]);

const DND_API_BASE = "https://www.dnd5eapi.co";

let equipmentDataCache: any[] | null = null;
let magicItemsDataCache: any[] | null = null;
let spellsDataCache: any[] | null = null;
let monstersDataCache: any[] | null = null;
let classesDataCache: any[] | null = null;
let featuresDataCache: any[] | null = null;
let racesDataCache: any[] | null = null;
let backgroundsDataCache: any[] | null = null;
let traitsDataCache: any[] | null = null;
let subracesDataCache: any[] | null = null;

let equipmentMapCache: Map<string, any> | null = null;
let magicItemsMapCache: Map<string, any> | null = null;
let spellsMapCache: Map<string, any> | null = null;
let monstersMapCache: Map<string, any> | null = null;
let classesMapCache: Map<string, any> | null = null;
let featuresMapCache: Map<string, any> | null = null;
let racesMapCache: Map<string, any> | null = null;
let backgroundsMapCache: Map<string, any> | null = null;
let traitsMapCache: Map<string, any> | null = null;
let subracesMapCache: Map<string, any> | null = null;

function getEquipmentData(): any[] {
  if (!equipmentDataCache) equipmentDataCache = srdData["equipment"] || [];
  return equipmentDataCache;
}

function getMagicItemsData(): any[] {
  if (!magicItemsDataCache) magicItemsDataCache = srdData["magic-items"] || [];
  return magicItemsDataCache;
}

function getSpellsData(): any[] {
  if (!spellsDataCache) spellsDataCache = srdData["spells"] || [];
  return spellsDataCache;
}

function getMonstersData(): any[] {
  if (!monstersDataCache) monstersDataCache = srdData["monsters"] || [];
  return monstersDataCache;
}

function getClassesData(): any[] {
  if (!classesDataCache) classesDataCache = srdData["classes"] || [];
  return classesDataCache;
}

function getFeaturesData(): any[] {
  if (!featuresDataCache) featuresDataCache = srdData["features"] || [];
  return featuresDataCache;
}

function getRacesData(): any[] {
  if (!racesDataCache) racesDataCache = srdData["races"] || [];
  return racesDataCache;
}

function getBackgroundsData(): any[] {
  if (!backgroundsDataCache) backgroundsDataCache = srdData["backgrounds"] || [];
  return backgroundsDataCache;
}

function getTraitsData(): any[] {
  if (!traitsDataCache) traitsDataCache = srdData["traits"] || [];
  return traitsDataCache;
}

function getSubracesData(): any[] {
  if (!subracesDataCache) subracesDataCache = srdData["subraces"] || [];
  return subracesDataCache;
}

function getEquipmentMap(): Map<string, any> {
  if (!equipmentMapCache) {
    equipmentMapCache = new Map(
      getEquipmentData().map((entry: any) => [entry.index, entry]),
    );
  }
  return equipmentMapCache;
}

function getMagicItemsMap(): Map<string, any> {
  if (!magicItemsMapCache) {
    magicItemsMapCache = new Map(
      getMagicItemsData().map((entry: any) => [entry.index, entry]),
    );
  }
  return magicItemsMapCache;
}

function getSpellsMap(): Map<string, any> {
  if (!spellsMapCache) {
    spellsMapCache = new Map(
      getSpellsData().map((entry: any) => [entry.index, entry]),
    );
  }
  return spellsMapCache;
}

function getMonstersMap(): Map<string, any> {
  if (!monstersMapCache) {
    monstersMapCache = new Map(
      getMonstersData().map((entry: any) => [entry.index, entry]),
    );
  }
  return monstersMapCache;
}

function getClassesMap(): Map<string, any> {
  if (!classesMapCache) {
    classesMapCache = new Map(
      getClassesData().map((entry: any) => [entry.index, entry]),
    );
  }
  return classesMapCache;
}

function getFeaturesMap(): Map<string, any> {
  if (!featuresMapCache) {
    featuresMapCache = new Map(
      getFeaturesData().map((entry: any) => [entry.index, entry]),
    );
  }
  return featuresMapCache;
}

function getRacesMap(): Map<string, any> {
  if (!racesMapCache) {
    racesMapCache = new Map(
      getRacesData().map((entry: any) => [entry.index, entry]),
    );
  }
  return racesMapCache;
}

function getBackgroundsMap(): Map<string, any> {
  if (!backgroundsMapCache) {
    backgroundsMapCache = new Map(
      getBackgroundsData().map((entry: any) => [entry.index, entry]),
    );
  }
  return backgroundsMapCache;
}

function getTraitsMap(): Map<string, any> {
  if (!traitsMapCache) {
    traitsMapCache = new Map(
      getTraitsData().map((entry: any) => [entry.index, entry]),
    );
  }
  return traitsMapCache;
}

function getSubracesMap(): Map<string, any> {
  if (!subracesMapCache) {
    subracesMapCache = new Map(
      getSubracesData().map((entry: any) => [entry.index, entry]),
    );
  }
  return subracesMapCache;
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

function formatCrLabel(crValue: string): string {
  if (crValue === "0.125") return "1/8";
  if (crValue === "0.25") return "1/4";
  if (crValue === "0.5") return "1/2";
  return crValue;
}

function sortByName<T extends { name: string }>(items: T[]): T[] {
  return items.slice().sort((a, b) => a.name.localeCompare(b.name));
}

function getSpellSchoolOptions(): Array<{ index: string; label: string; count: number }> {
  const counts = new Map<string, { label: string; count: number }>();
  for (const spell of getSpellsData()) {
    if (!spell?.school?.index || !spell?.school?.name) continue;
    const key = spell.school.index;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, { label: spell.school.name, count: 1 });
    }
  }

  return Array.from(counts.entries())
    .map(([index, value]) => ({ index, label: value.label, count: value.count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function getSpellClassOptions(): Array<{ index: string; label: string; count: number }> {
  const counts = new Map<string, { label: string; count: number }>();
  for (const spell of getSpellsData()) {
    for (const cls of spell.classes || []) {
      if (!cls?.index || !cls?.name) continue;
      const existing = counts.get(cls.index);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(cls.index, { label: cls.name, count: 1 });
      }
    }
  }

  return Array.from(counts.entries())
    .map(([index, value]) => ({ index, label: value.label, count: value.count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function getSpellLevelOptions(): Array<{ value: number; label: string; count: number }> {
  const counts = new Map<number, number>();
  for (const spell of getSpellsData()) {
    const level = Number(spell.level);
    if (Number.isNaN(level)) continue;
    counts.set(level, (counts.get(level) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({
      value,
      count,
      label: value === 0 ? "Cantrips" : `Level ${value}`,
    }))
    .sort((a, b) => a.value - b.value);
}

function getMonsterTypeOptions(): Array<{
  type: string;
  slug: string;
  label: string;
  count: number;
}> {
  const counts = new Map<string, number>();
  for (const monster of getMonstersData()) {
    const type = String(monster?.type || "").trim().toLowerCase();
    if (!type) continue;
    counts.set(type, (counts.get(type) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([type, count]) => ({
      type,
      slug: toMonsterTypeSlug(type),
      label: type
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function getMonsterCrOptions(): Array<{
  value: string;
  slug: string;
  label: string;
  count: number;
}> {
  const counts = new Map<string, number>();
  for (const monster of getMonstersData()) {
    const cr = String(monster?.challenge_rating ?? "");
    if (!cr) continue;
    counts.set(cr, (counts.get(cr) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({
      value,
      slug: toCrSlug(value),
      label: formatCrLabel(value),
      count,
      numeric: Number(value),
    }))
    .sort((a, b) => a.numeric - b.numeric)
    .map(({ numeric, ...entry }) => entry);
}

function getFeatureClassOptions(): Array<{ index: string; label: string; count: number }> {
  const counts = new Map<string, { label: string; count: number }>();
  for (const feature of getFeaturesData()) {
    const cls = feature?.class;
    if (!cls?.index || !cls?.name) continue;
    const existing = counts.get(cls.index);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(cls.index, { label: cls.name, count: 1 });
    }
  }

  return Array.from(counts.entries())
    .map(([index, value]) => ({ index, label: value.label, count: value.count }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function toClassTablePartial(classIndex: string): string | null {
  if (!CLASS_TABLE_PARTIALS.has(classIndex)) return null;
  return `partials/tables/${classIndex}`;
}

// Fifth Edition
// SRD
router.get(
  "/5e/srd/contents",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/contents", {
        auth: req.session.user,
        showSrdGrowthRail: false,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5e/srd/ability-scores",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/abilityscores", {
        auth: req.session.user,
        data: srdData["ability-scores"] || [],
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5e/srd/alignments",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/alignments", {
        auth: req.session.user,
        data: srdData["alignments"] || [],
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5e/srd/backgrounds/:index",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const background = getBackgroundsMap().get(req.params.index);
      if (!background) {
        return res.status(404).render("404", { auth: req.session.user });
      }
      res.render("dnd/5e/srd/background", {
        auth: req.session.user,
        background,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5e/srd/backgrounds",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/backgrounds", {
        auth: req.session.user,
        data: sortByName(getBackgroundsData()),
      });
    } catch (err) {
      next(err);
    }
  },
);

// Individual equipment page
router.get(
  "/5e/srd/equipment/:index",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = getEquipmentMap().get(req.params.index);
      if (!item) {
        return res.status(404).render("404", { auth: req.session.user });
      }
      res.render("dnd/5e/srd/equipment-item", {
        auth: req.session.user,
        item,
      });
    } catch (err) {
      next(err);
    }
  },
);

// Equipment list page
router.get(
  "/5e/srd/equipment",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/equipment", {
        auth: req.session.user,
        equipmentData: sortByName(getEquipmentData()),
        magicItemsData: sortByName(getMagicItemsData()),
      });
    } catch (err) {
      next(err);
    }
  },
);

// Individual magic item page
router.get(
  "/5e/srd/magic-items/:index",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = getMagicItemsMap().get(req.params.index);
      if (!item) {
        return res.status(404).render("404", { auth: req.session.user });
      }
      res.render("dnd/5e/srd/magic-item", {
        auth: req.session.user,
        item,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5e/srd/damage-types",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/damagetypes", {
        auth: req.session.user,
        data: srdData["damage-types"] || [],
      });
    } catch (err) {
      next(err);
    }
  },
);

// Individual class page
router.get(
  "/5e/srd/classes/:index",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const classData = getClassesMap().get(req.params.index);
      if (!classData) {
        return res.status(404).render("404", { auth: req.session.user });
      }

      const classFeatures = getFeaturesData().filter(
        (feature: any) => feature?.class?.index === classData.index,
      );

      const baseFeatures = classFeatures
        .filter((feature: any) => !feature.subclass)
        .sort(
          (a: any, b: any) =>
            Number(a.level) - Number(b.level) || a.name.localeCompare(b.name),
        );

      const subclassFeatureGroups = new Map<string, { name: string; features: any[] }>();
      for (const feature of classFeatures.filter((item: any) => item.subclass)) {
        const key = feature.subclass.index;
        const existing = subclassFeatureGroups.get(key);
        if (existing) {
          existing.features.push(feature);
        } else {
          subclassFeatureGroups.set(key, {
            name: feature.subclass.name,
            features: [feature],
          });
        }
      }

      const subclassFeatures = Array.from(subclassFeatureGroups.entries())
        .map(([index, value]) => ({
          index,
          name: value.name,
          features: value.features.sort(
            (a, b) => Number(a.level) - Number(b.level) || a.name.localeCompare(b.name),
          ),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      const classSpellCount = getSpellsData().filter((spell: any) =>
        (spell.classes || []).some((cls: any) => cls.index === classData.index),
      ).length;

      res.render("dnd/5e/srd/class", {
        auth: req.session.user,
        classData,
        tablePartial: toClassTablePartial(classData.index),
        baseFeatures,
        subclassFeatures,
        classSpellCount,
      });
    } catch (err) {
      next(err);
    }
  },
);

// Class index page
router.get(
  "/5e/srd/classes",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/classes-index", {
        auth: req.session.user,
        classesData: sortByName(getClassesData()),
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5e/srd/conditions",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/conditions", {
        auth: req.session.user,
        data: srdData["conditions"] || [],
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5e/srd/feats",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/feats", {
        auth: req.session.user,
        data: srdData["feats"] || [],
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5e/srd/features/:index",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const feature = getFeaturesMap().get(req.params.index);
      if (!feature) {
        return res.status(404).render("404", { auth: req.session.user });
      }

      const classFeatures = getFeaturesData()
        .filter((item: any) => item?.class?.index === feature.class?.index)
        .sort(
          (a: any, b: any) =>
            Number(a.level) - Number(b.level) || a.name.localeCompare(b.name),
        );

      const currentIdx = classFeatures.findIndex((item: any) => item.index === feature.index);
      const previousFeature = currentIdx > 0 ? classFeatures[currentIdx - 1] : null;
      const nextFeature =
        currentIdx >= 0 && currentIdx < classFeatures.length - 1
          ? classFeatures[currentIdx + 1]
          : null;

      const relatedFeatures = classFeatures
        .filter((item: any) => item.index !== feature.index)
        .slice(0, 15);

      const subclassFeatures = feature.subclass
        ? classFeatures
            .filter((item: any) => item?.subclass?.index === feature.subclass.index)
            .filter((item: any) => item.index !== feature.index)
        : [];

      res.render("dnd/5e/srd/feature", {
        auth: req.session.user,
        feature,
        previousFeature,
        nextFeature,
        relatedFeatures,
        subclassFeatures,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5e/srd/features",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = getFeaturesData()
        .slice()
        .sort(
          (a: any, b: any) =>
            String(a.class?.name || "").localeCompare(String(b.class?.name || "")) ||
            Number(a.level) - Number(b.level) ||
            a.name.localeCompare(b.name),
        );

      res.render("dnd/5e/srd/features", {
        auth: req.session.user,
        data,
        featureClassOptions: getFeatureClassOptions(),
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5e/srd/languages",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/languages", {
        auth: req.session.user,
        data: srdData["languages"] || [],
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5e/srd/races/:index",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const race = getRacesMap().get(req.params.index);
      if (!race) {
        return res.status(404).render("404", { auth: req.session.user });
      }

      const traitsMap = getTraitsMap();
      const traitDetails = (race.traits || [])
        .map((ref: any) => traitsMap.get(ref.index))
        .filter(Boolean);

      const subracesMap = getSubracesMap();
      const subraceDetails = (race.subraces || [])
        .map((ref: any) => subracesMap.get(ref.index))
        .filter(Boolean)
        .map((subrace: any) => ({
          ...subrace,
          traitDetails: (subrace.racial_traits || [])
            .map((ref: any) => traitsMap.get(ref.index))
            .filter(Boolean),
        }));

      res.render("dnd/5e/srd/race", {
        auth: req.session.user,
        race,
        traitDetails,
        subraceDetails,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5e/srd/races",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/races", {
        auth: req.session.user,
        data: sortByName(getRacesData()),
      });
    } catch (err) {
      next(err);
    }
  },
);

// Spell index pages: level
router.get(
  "/5e/srd/spells/level/:level",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const level = Number(req.params.level);
      if (!Number.isInteger(level) || level < 0 || level > 9) {
        return res.status(404).render("404", { auth: req.session.user });
      }

      const spellsData = sortByName(
        getSpellsData().filter((spell: any) => Number(spell.level) === level),
      );

      const levelLabel = level === 0 ? "Cantrips" : `Level ${level} Spells`;

      res.render("dnd/5e/srd/spells-filter", {
        auth: req.session.user,
        spellsData,
        title: `D&D 5E ${levelLabel} - SRD Spell Index | Far Reach Co.`,
        description: `Browse ${spellsData.length} D&D 5E ${levelLabel.toLowerCase()} from the SRD with full rules text, casting details, and quick links.`,
        heading: levelLabel,
        intro: `All SRD ${levelLabel.toLowerCase()} in one indexable page.`,
        canonicalPath: `/dnd/5e/srd/spells/level/${level}`,
        spellLevelOptions: getSpellLevelOptions(),
        spellSchoolOptions: getSpellSchoolOptions(),
        spellClassOptions: getSpellClassOptions(),
      });
    } catch (err) {
      next(err);
    }
  },
);

// Spell index pages: school
router.get(
  "/5e/srd/spells/school/:school",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const schoolOptions = getSpellSchoolOptions();
      const school = schoolOptions.find((option) => option.index === req.params.school);
      if (!school) {
        return res.status(404).render("404", { auth: req.session.user });
      }

      const spellsData = sortByName(
        getSpellsData().filter((spell: any) => spell.school?.index === school.index),
      );

      res.render("dnd/5e/srd/spells-filter", {
        auth: req.session.user,
        spellsData,
        title: `D&D 5E ${school.label} Spells - SRD Spell Index | Far Reach Co.`,
        description: `Browse ${spellsData.length} D&D 5E ${school.label.toLowerCase()} spells from the SRD with full descriptions and casting details.`,
        heading: `${school.label} Spells`,
        intro: `SRD spells in the ${school.label.toLowerCase()} school.`,
        canonicalPath: `/dnd/5e/srd/spells/school/${school.index}`,
        spellLevelOptions: getSpellLevelOptions(),
        spellSchoolOptions: schoolOptions,
        spellClassOptions: getSpellClassOptions(),
      });
    } catch (err) {
      next(err);
    }
  },
);

// Spell index pages: class
router.get(
  "/5e/srd/spells/class/:classIndex",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const classOptions = getSpellClassOptions();
      const classOption = classOptions.find(
        (option) => option.index === req.params.classIndex,
      );

      if (!classOption) {
        return res.status(404).render("404", { auth: req.session.user });
      }

      const spellsData = sortByName(
        getSpellsData().filter((spell: any) =>
          (spell.classes || []).some((cls: any) => cls.index === classOption.index),
        ),
      );

      res.render("dnd/5e/srd/spells-filter", {
        auth: req.session.user,
        spellsData,
        title: `D&D 5E ${classOption.label} Spell List - SRD | Far Reach Co.`,
        description: `Browse ${spellsData.length} D&D 5E spells available to ${classOption.label} in the SRD with full spell details and links.`,
        heading: `${classOption.label} Spell List`,
        intro: `All SRD spells tagged for ${classOption.label}.`,
        canonicalPath: `/dnd/5e/srd/spells/class/${classOption.index}`,
        spellLevelOptions: getSpellLevelOptions(),
        spellSchoolOptions: getSpellSchoolOptions(),
        spellClassOptions: classOptions,
      });
    } catch (err) {
      next(err);
    }
  },
);

// Individual spell page (must be before /spells to match first)
router.get(
  "/5e/srd/spells/:index",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const spell = getSpellsMap().get(req.params.index);
      if (!spell) {
        return res.status(404).render("404", { auth: req.session.user });
      }
      res.render("dnd/5e/srd/spell", {
        auth: req.session.user,
        spell,
      });
    } catch (err) {
      next(err);
    }
  },
);

// Spell list page
router.get(
  "/5e/srd/spells",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/spells", {
        auth: req.session.user,
        spellsData: sortByName(getSpellsData()),
        spellLevelOptions: getSpellLevelOptions(),
        spellSchoolOptions: getSpellSchoolOptions(),
        spellClassOptions: getSpellClassOptions(),
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5e/srd/skills",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/skills", {
        auth: req.session.user,
        data: srdData["skills"] || [],
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/5e/srd/weapon-properties",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/weaponproperties", {
        auth: req.session.user,
        data: srdData["weapon-properties"] || [],
      });
    } catch (err) {
      next(err);
    }
  },
);

// Monster index pages: type
router.get(
  "/5e/srd/monsters/type/:type",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestedSlug = toMonsterTypeSlug(req.params.type);
      const typeOptions = getMonsterTypeOptions();
      const typeOption = typeOptions.find((option) => option.slug === requestedSlug);

      if (!typeOption) {
        return res.status(404).render("404", { auth: req.session.user });
      }

      if (req.params.type !== typeOption.slug) {
        return res.redirect(301, `/dnd/5e/srd/monsters/type/${typeOption.slug}`);
      }

      const data = sortByName(
        getMonstersData().filter(
          (monster: any) => String(monster.type || "").toLowerCase() === typeOption.type,
        ),
      );

      res.render("dnd/5e/srd/monsters-filter", {
        auth: req.session.user,
        data,
        title: `D&D 5E ${typeOption.label} Monsters - SRD | Far Reach Co.`,
        description: `Browse ${data.length} D&D 5E ${typeOption.label.toLowerCase()} monsters in the SRD with full stat blocks and actions.`,
        heading: `${typeOption.label} Monsters`,
        intro: `All SRD monsters of type ${typeOption.label.toLowerCase()}.`,
        canonicalPath: `/dnd/5e/srd/monsters/type/${typeOption.slug}`,
        monsterTypeOptions: typeOptions,
        monsterCrOptions: getMonsterCrOptions(),
      });
    } catch (err) {
      next(err);
    }
  },
);

// Monster index pages: challenge rating
router.get(
  "/5e/srd/monsters/cr/:cr",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const crOptions = getMonsterCrOptions();
      const raw = String(req.params.cr || "").toLowerCase();
      const crOption = crOptions.find((option) => option.slug === raw || option.value === raw);

      if (!crOption) {
        return res.status(404).render("404", { auth: req.session.user });
      }

      if (raw !== crOption.slug) {
        return res.redirect(301, `/dnd/5e/srd/monsters/cr/${crOption.slug}`);
      }

      const data = sortByName(
        getMonstersData().filter(
          (monster: any) => String(monster.challenge_rating) === crOption.value,
        ),
      );

      res.render("dnd/5e/srd/monsters-filter", {
        auth: req.session.user,
        data,
        title: `D&D 5E CR ${crOption.label} Monsters - SRD | Far Reach Co.`,
        description: `Browse ${data.length} D&D 5E monsters with Challenge Rating ${crOption.label} from the SRD.`,
        heading: `CR ${crOption.label} Monsters`,
        intro: `All SRD monsters with challenge rating ${crOption.label}.`,
        canonicalPath: `/dnd/5e/srd/monsters/cr/${crOption.slug}`,
        monsterTypeOptions: getMonsterTypeOptions(),
        monsterCrOptions: crOptions,
      });
    } catch (err) {
      next(err);
    }
  },
);

// Individual monster page (must be before /monsters to match first)
router.get(
  "/5e/srd/monsters/:index",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const monster = getMonstersMap().get(req.params.index);
      if (!monster) {
        return res.status(404).render("404", { auth: req.session.user });
      }
      res.render("dnd/5e/srd/monster", {
        auth: req.session.user,
        monster,
        imageBaseUrl: DND_API_BASE,
      });
    } catch (err) {
      next(err);
    }
  },
);

// Monster list page
router.get(
  "/5e/srd/monsters",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/monsters", {
        auth: req.session.user,
        data: sortByName(getMonstersData()),
        monsterTypeOptions: getMonsterTypeOptions(),
        monsterCrOptions: getMonsterCrOptions(),
      });
    } catch (err) {
      next(err);
    }
  },
);

// SRD AI Search
const srdSearchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many search requests, please try again later" },
});

router.post(
  "/5e/srd/search",
  srdSearchLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string") {
        res.status(400).json({ message: "Query is required" });
        return;
      }
      const trimmed = query.trim();
      if (trimmed.length < 3 || trimmed.length > 500) {
        res.status(400).json({ message: "Query must be between 3 and 500 characters" });
        return;
      }
      const answer = await searchSrd(trimmed);
      res.json({ answer });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
