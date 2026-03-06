import { Request, Response, NextFunction, Router } from "express";
import { srdData } from "./srd/data.js";
import {
  getBackgroundsData,
  getBackgroundsMap,
  getClassesData,
  getClassesMap,
  getEquipmentData,
  getEquipmentMap,
  getFeatureClassOptions,
  getFeaturesData,
  getFeaturesMap,
  getMagicItemsData,
  getMagicItemsMap,
  getRacesData,
  getRacesMap,
  getSpellsData,
  getSubracesMap,
  getTraitsMap,
  sortByName,
  toClassTablePartial,
} from "./srdCatalog";
import { getSrdPopularPagesData } from "./srdPopularPages";

export function registerSrdContentRoutes(router: Router) {
  router.get(
    "/5e/srd/contents",
    (req: Request, res: Response, next: NextFunction) => {
      try {
        res.render("dnd/5e/srd/contents", {
          auth: req.session.user,
          showSrdGrowthRail: false,
          popularPages: getSrdPopularPagesData(),
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
}
