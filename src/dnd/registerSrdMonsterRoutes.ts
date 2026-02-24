import { Request, Response, NextFunction, Router } from "express";
import {
  DND_API_BASE,
  getMonsterCrOptions,
  getMonstersData,
  getMonstersMap,
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
}
