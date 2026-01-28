import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import path = require("path");
import fs = require("fs");

var router = Router();

// Fifth Edition
// SRD
router.get(
  "/5e/srd/contents",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/contents", {
        auth: req.session.user,
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
      // get json data
      const data = fs.readFileSync(
        path.join(
          __dirname,
          "../../public/lib/data/5e-srd-ability-scores.json",
        ),
        "utf8",
      );
      res.render("dnd/5e/srd/abilityscores", {
        auth: req.session.user,
        data: JSON.parse(data),
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
      // get json data
      const data = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-alignments.json"),
        "utf8",
      );
      res.render("dnd/5e/srd/alignments", {
        auth: req.session.user,
        data: JSON.parse(data),
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
      // get json data
      const data = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-backgrounds.json"),
        "utf8",
      );
      res.render("dnd/5e/srd/backgrounds", {
        auth: req.session.user,
        data: JSON.parse(data),
      });
    } catch (err) {
      next(err);
    }
  },
);

// Pre-load equipment and magic items data for efficient lookup
const equipmentData: any[] = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../../public/lib/data/5e-srd-equipment.json"),
    "utf8",
  ),
);
const magicItemsData: any[] = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../../public/lib/data/5e-srd-magic-items.json"),
    "utf8",
  ),
);
const equipmentMap = new Map(equipmentData.map((e: any) => [e.index, e]));
const magicItemsMap = new Map(magicItemsData.map((m: any) => [m.index, m]));

// Individual equipment page
router.get(
  "/5e/srd/equipment/:index",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = equipmentMap.get(req.params.index);
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
        equipmentData,
        magicItemsData,
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
      const item = magicItemsMap.get(req.params.index);
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
      // get json data
      const data = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-damage-types.json"),
        "utf8",
      );
      res.render("dnd/5e/srd/damagetypes", {
        auth: req.session.user,
        data: JSON.parse(data),
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
      res.render("dnd/5e/srd/classes", {
        auth: req.session.user,
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
      // get json data
      const data = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-conditions.json"),
        "utf8",
      );
      res.render("dnd/5e/srd/conditions", {
        auth: req.session.user,
        data: JSON.parse(data),
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
      // get json data
      const data = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-feats.json"),
        "utf8",
      );
      res.render("dnd/5e/srd/feats", {
        auth: req.session.user,
        data: JSON.parse(data),
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
      // get json data
      const data = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-features.json"),
        "utf8",
      );
      res.render("dnd/5e/srd/features", {
        auth: req.session.user,
        data: JSON.parse(data),
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
      // get json data
      const data = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-languages.json"),
        "utf8",
      );
      res.render("dnd/5e/srd/languages", {
        auth: req.session.user,
        data: JSON.parse(data),
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
      });
    } catch (err) {
      next(err);
    }
  },
);

// Pre-load spells data for efficient lookup
const spellsData: any[] = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../../public/lib/data/5e-srd-spells.json"),
    "utf8",
  ),
);
const spellsMap = new Map(spellsData.map((s: any) => [s.index, s]));

// Individual spell page (must be before /spells to match first)
router.get(
  "/5e/srd/spells/:index",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const spell = spellsMap.get(req.params.index);
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
        spellsData,
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
      // get json data
      const data = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-skills.json"),
        "utf8",
      );
      res.render("dnd/5e/srd/skills", {
        auth: req.session.user,
        data: JSON.parse(data),
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
      // get json data
      const data = fs.readFileSync(
        path.join(
          __dirname,
          "../../public/lib/data/5e-srd-weapon-properties.json",
        ),
        "utf8",
      );
      res.render("dnd/5e/srd/weaponproperties", {
        auth: req.session.user,
        data: JSON.parse(data),
      });
    } catch (err) {
      next(err);
    }
  },
);

const monstersData: any[] = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../../public/lib/data/5e-srd-monsters.json"),
    "utf8",
  ),
);
const monstersMap = new Map(monstersData.map((m: any) => [m.index, m]));
const DND_API_BASE = "https://www.dnd5eapi.co";

// Individual monster page (must be before /monsters to match first)
router.get(
  "/5e/srd/monsters/:index",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const monster = monstersMap.get(req.params.index);
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
        data: monstersData,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
