import { Request, Response, NextFunction, Router } from "express";
import {
  DND_API_BASE,
  getMonsterConditionImmunityOptions,
  getMonsterCrOptions,
  getMonstersForConditionImmunity,
  getMonstersData,
  getMonstersForMonsterType,
  getMonstersMap,
  getRelatedDamageTypesForMonster,
  getMonsterTypeOptions,
  sortByName,
  toMonsterTypeSlug,
} from "./srdCatalog";

export function registerSrdMonsterRoutes(router: Router) {
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

        const data = sortByName(getMonstersForMonsterType(typeOption.slug));

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
          monsterConditionImmunityOptions: getMonsterConditionImmunityOptions(),
        });
      } catch (err) {
        next(err);
      }
    },
  );

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
          monsterConditionImmunityOptions: getMonsterConditionImmunityOptions(),
        });
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    "/5e/srd/monsters/condition-immunity/:condition",
    (req: Request, res: Response, next: NextFunction) => {
      try {
        const requestedIndex = String(req.params.condition || "").trim().toLowerCase();
        const conditionOptions = getMonsterConditionImmunityOptions();
        const conditionOption = conditionOptions.find(
          (option) => option.index === requestedIndex,
        );

        if (!conditionOption) {
          return res.status(404).render("404", { auth: req.session.user });
        }

        if (req.params.condition !== conditionOption.index) {
          return res.redirect(
            301,
            `/dnd/5e/srd/monsters/condition-immunity/${conditionOption.index}`,
          );
        }

        const data = sortByName(getMonstersForConditionImmunity(conditionOption.index));

        res.render("dnd/5e/srd/monsters-filter", {
          auth: req.session.user,
          data,
          title: `D&D 5E Monsters Immune to the ${conditionOption.label} Condition - SRD | Far Reach Co.`,
          description: `Browse ${data.length} D&D 5E SRD monsters with immunity to the ${conditionOption.label.toLowerCase()} condition.`,
          heading: `Monsters Immune to the ${conditionOption.label} Condition`,
          intro: `SRD monsters with immunity to the ${conditionOption.label.toLowerCase()} condition.`,
          canonicalPath: `/dnd/5e/srd/monsters/condition-immunity/${conditionOption.index}`,
          monsterTypeOptions: getMonsterTypeOptions(),
          monsterCrOptions: getMonsterCrOptions(),
          monsterConditionImmunityOptions: conditionOptions,
          relatedRulesHref: `/dnd/5e/srd/conditions#${conditionOption.index}`,
          relatedRulesLabel: `${conditionOption.label} condition rules`,
        });
      } catch (err) {
        next(err);
      }
    },
  );

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
          relatedDamageTypes: getRelatedDamageTypesForMonster(monster),
        });
      } catch (err) {
        next(err);
      }
    },
  );

  router.get(
    "/5e/srd/monsters",
    (req: Request, res: Response, next: NextFunction) => {
      try {
        res.render("dnd/5e/srd/monsters", {
          auth: req.session.user,
          data: sortByName(getMonstersData()),
          monsterTypeOptions: getMonsterTypeOptions(),
          monsterCrOptions: getMonsterCrOptions(),
          monsterConditionImmunityOptions: getMonsterConditionImmunityOptions(),
        });
      } catch (err) {
        next(err);
      }
    },
  );
}
