import { Router, Request, Response, NextFunction } from "express";
import { humanFileSize } from "../lib/utils";
import { subscriptionPlanLimits } from "../lib/subscription";
import { getProductUpdateCampaigns } from "../lib/productUpdateCampaigns";

const router = Router();

function buildPlanLimitViewModel() {
  return {
    user: {
      freeWyrlds: subscriptionPlanLimits.freeOwnedWyrlds,
      freeTables: subscriptionPlanLimits.freeUserTables,
      freeDataLimit: humanFileSize(subscriptionPlanLimits.freeUserDataBytes),
      proDataLimit: humanFileSize(subscriptionPlanLimits.proUserDataBytes),
    },
    wyrld: {
      freeTables: subscriptionPlanLimits.freeWyrldTables,
      freeCharacterLinks: subscriptionPlanLimits.freeWyrldCharacterLinks,
      freeDataLimit: humanFileSize(subscriptionPlanLimits.freeWyrldDataBytes),
      proDataLimit: humanFileSize(subscriptionPlanLimits.proWyrldDataBytes),
    },
  };
}

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("index", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/index", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("index", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/about-us", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("aboutus", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/what-is-frc", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("what-is-frc", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/resources", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("resources", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/whats-new", (req: Request, res: Response, next: NextFunction) => {
  try {
    const recentCampaigns = getProductUpdateCampaigns().slice(-2).reverse();
    res.render("whats-new", {
      auth: req.session.user,
      campaigns: recentCampaigns,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/radio", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("radio", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/vtt-guide", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("vtt-guide", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/public-wyrlds-guide",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("public-wyrlds-guide", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/pricing", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("pricing", {
      auth: req.session.user,
      planLimits: buildPlanLimitViewModel(),
    });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/public-wyrlds-admin-guide",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("public-wyrlds-admin-guide", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/wyrld-permissions-guide",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("wyrld-permissions-guide", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/sandbox-mode-guide",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("sandbox-mode-guide", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/preaethrend", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("preaethrend", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/attributions", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("attributions", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/privacy-policy", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("privacypolicy", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/terms-of-use", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("termsofuse", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

export default router;
