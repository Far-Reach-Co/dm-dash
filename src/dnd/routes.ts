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
  }
);

router.get(
  "/5e/srd/ability-scores",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // get json data
      const data = fs.readFileSync(
        path.join(
          __dirname,
          "../../public/lib/data/5e-srd-ability-scores.json"
        ),
        "utf8"
      );
      res.render("dnd/5e/srd/abilityscores", {
        auth: req.session.user,
        data: JSON.parse(data),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/5e/srd/alignments",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // get json data
      const data = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-alignments.json"),
        "utf8"
      );
      res.render("dnd/5e/srd/alignments", {
        auth: req.session.user,
        data: JSON.parse(data),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/5e/srd/backgrounds",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // get json data
      const data = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-backgrounds.json"),
        "utf8"
      );
      res.render("dnd/5e/srd/backgrounds", {
        auth: req.session.user,
        data: JSON.parse(data),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/5e/srd/equipment",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // get json data
      const categoryData = fs.readFileSync(
        path.join(
          __dirname,
          "../../public/lib/data/5e-srd-equipment-categories.json"
        ),
        "utf8"
      );
      const equipmentData = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-equipment.json"),
        "utf8"
      );
      const magicItemsData = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-magic-items.json"),
        "utf8"
      );
      res.render("dnd/5e/srd/equipment", {
        auth: req.session.user,
        categoryData: JSON.parse(categoryData),
        equipmentData: JSON.parse(equipmentData),
        magicItemsData: JSON.parse(magicItemsData),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/5e/srd/damage-types",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // get json data
      const data = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-damage-types.json"),
        "utf8"
      );
      res.render("dnd/5e/srd/damagetypes", {
        auth: req.session.user,
        data: JSON.parse(data),
      });
    } catch (err) {
      next(err);
    }
  }
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
  }
);

router.get(
  "/5e/srd/conditions",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // get json data
      const data = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-conditions.json"),
        "utf8"
      );
      res.render("dnd/5e/srd/conditions", {
        auth: req.session.user,
        data: JSON.parse(data),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/5e/srd/feats",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // get json data
      const data = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-feats.json"),
        "utf8"
      );
      res.render("dnd/5e/srd/feats", {
        auth: req.session.user,
        data: JSON.parse(data),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/5e/srd/features",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // get json data
      const data = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-features.json"),
        "utf8"
      );
      res.render("dnd/5e/srd/features", {
        auth: req.session.user,
        data: JSON.parse(data),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/5e/srd/languages",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // get json data
      const data = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-languages.json"),
        "utf8"
      );
      res.render("dnd/5e/srd/languages", {
        auth: req.session.user,
        data: JSON.parse(data),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/5e/srd/magic-schools",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // get json data
      const data = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-magic-schools.json"),
        "utf8"
      );
      res.render("dnd/5e/srd/magicschools", {
        auth: req.session.user,
        data: JSON.parse(data),
      });
    } catch (err) {
      next(err);
    }
  }
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
  }
);

router.get(
  "/5e/srd/skills",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // get json data
      const data = fs.readFileSync(
        path.join(__dirname, "../../public/lib/data/5e-srd-skills.json"),
        "utf8"
      );
      res.render("dnd/5e/srd/skills", {
        auth: req.session.user,
        data: JSON.parse(data),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/5e/srd/weapon-properties",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // get json data
      const data = fs.readFileSync(
        path.join(
          __dirname,
          "../../public/lib/data/5e-srd-weapon-properties.json"
        ),
        "utf8"
      );
      res.render("dnd/5e/srd/weaponproperties", {
        auth: req.session.user,
        data: JSON.parse(data),
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
