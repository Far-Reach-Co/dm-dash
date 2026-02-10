import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { rateLimit } from "express-rate-limit";
import { searchSrd } from "./srd/mistral.js";
import { srdData } from "./srd/data.js";

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
  "/5e/srd/backgrounds",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/backgrounds", {
        auth: req.session.user,
        data: srdData["backgrounds"] || [],
      });
    } catch (err) {
      next(err);
    }
  },
);

// Pre-load equipment and magic items data for efficient lookup
const equipmentData: any[] = srdData["equipment"] || [];
const magicItemsData: any[] = srdData["magic-items"] || [];
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
  "/5e/srd/features",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd/5e/srd/features", {
        auth: req.session.user,
        data: srdData["features"] || [],
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
const spellsData: any[] = srdData["spells"] || [];
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

const monstersData: any[] = srdData["monsters"] || [];
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
