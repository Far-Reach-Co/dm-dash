import { Request, Response, NextFunction, Router } from "express";
import {
  getSpellClassOptions,
  getSpellDamageTypeOptions,
  getSpellLevelOptions,
  getSpellRaceAccess,
  getSpellSchoolOptions,
  getSpellsForDamageType,
  getSpellsForClass,
  getSpellsData,
  getSpellsMap,
  sortByName,
} from "./srdCatalog";

export function registerSrdSpellRoutes(router: Router) {
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
          spellDamageTypeOptions: getSpellDamageTypeOptions(),
        });
      } catch (err) {
        next(err);
      }
    },
  );

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
          spellDamageTypeOptions: getSpellDamageTypeOptions(),
        });
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    "/5e/srd/spells/damage/:damageType",
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const damageTypeOptions = getSpellDamageTypeOptions();
        const damageTypeOption = damageTypeOptions.find(
          (option) => option.index === String(req.params.damageType || "").toLowerCase(),
        );

        if (!damageTypeOption) {
          return res.status(404).render("404", { auth: req.session.user });
        }

        const spellsData = sortByName(getSpellsForDamageType(damageTypeOption.index));

        res.render("dnd/5e/srd/spells-filter", {
          auth: req.session.user,
          spellsData,
          title: `D&D 5E ${damageTypeOption.label} Damage Spells - SRD Spell Index | Far Reach Co.`,
          description: `Browse ${spellsData.length} D&D 5E SRD spells that deal ${damageTypeOption.label.toLowerCase()} damage, with full descriptions, levels, and casting details.`,
          heading: `${damageTypeOption.label} Damage Spells`,
          intro: `SRD spells that deal ${damageTypeOption.label.toLowerCase()} damage.`,
          canonicalPath: `/dnd/5e/srd/spells/damage/${damageTypeOption.index}`,
          spellLevelOptions: getSpellLevelOptions(),
          spellSchoolOptions: getSpellSchoolOptions(),
          spellClassOptions: getSpellClassOptions(),
          spellDamageTypeOptions: damageTypeOptions,
        });
      } catch (err) {
        next(err);
      }
    },
  );

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

        const spellsData = sortByName(getSpellsForClass(classOption.index));

        res.render("dnd/5e/srd/spells-filter", {
          auth: req.session.user,
          spellsData,
          title: `D&D 5E ${classOption.label} Spells: Full Spell List | Far Reach Co.`,
          description: `Browse all ${spellsData.length} D&D 5E ${classOption.label.toLowerCase()} spells in the SRD. This ${classOption.label.toLowerCase()} spell list includes cantrips, leveled spells, and links to full rules.`,
          heading: `${classOption.label} Spells`,
          intro: `Use this D&D 5E ${classOption.label.toLowerCase()} spell list to browse every SRD spell available to ${classOption.label}.`,
          canonicalPath: `/dnd/5e/srd/spells/class/${classOption.index}`,
          spellLevelOptions: getSpellLevelOptions(),
          spellSchoolOptions: getSpellSchoolOptions(),
          spellClassOptions: classOptions,
          spellDamageTypeOptions: getSpellDamageTypeOptions(),
        });
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    "/5e/srd/spells/:index",
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const spell = getSpellsMap().get(req.params.index);
        if (!spell) {
          return res.status(404).render("404", { auth: req.session.user });
        }
        const raceAccess = getSpellRaceAccess(spell.index, spell.name);
        res.render("dnd/5e/srd/spell", {
          auth: req.session.user,
          spell,
          raceAccess,
        });
      } catch (err) {
        next(err);
      }
    },
  );

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
          spellDamageTypeOptions: getSpellDamageTypeOptions(),
        });
      } catch (err) {
        next(err);
      }
    },
  );
}
