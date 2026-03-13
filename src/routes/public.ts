import { Router, Request, Response, NextFunction } from "express";
import { humanFileSize } from "../lib/utils";
import { subscriptionPlanLimits } from "../lib/subscription";
import { getProductUpdateCampaigns } from "../lib/productUpdateCampaigns";

const router = Router();

type ResourceAction = {
  href: string;
  label: string;
  external?: boolean;
  download?: boolean;
  confirmDownload?: string;
  note?: string;
};

type ResourceSection = {
  heading: string;
  paragraphs: string[];
  actions?: ResourceAction[];
};

type ResourceGuide = {
  slug: string;
  pageTitle: string;
  metaDescription: string;
  heading: string;
  subtitle: string;
  summary: string;
  imageSrc?: string;
  imageAlt?: string;
  sections: ResourceSection[];
};

const RESOURCE_GUIDES: Record<string, ResourceGuide> = {
  srd: {
    slug: "srd",
    pageTitle: "D&D 5E SRD Compendium | Far Reach Co.",
    metaDescription:
      "Browse the Far Reach Co. D&D 5E SRD compendium for fast rules lookup: classes, spells, monsters, equipment, and more.",
    heading: "Dungeons & Dragons 5E SRD Compendium",
    subtitle: "V5.1",
    summary:
      "Quick-reference access to core 5E SRD material for faster table play.",
    imageSrc: "/assets/landing/dice.svg",
    imageAlt: "D&D 5E SRD",
    sections: [
      {
        heading: "What This Is",
        paragraphs: [
          "Our SRD utility is designed for quick in-session lookup, not a full replacement for the original publication.",
          "Use it for rapid access to monsters, spells, classes, and equipment while running games online.",
        ],
        actions: [
          {
            href: "/dnd/5e/srd/contents",
            label: "Browse SRD Contents",
          },
        ],
      },
    ],
  },
  tutorials: {
    slug: "tutorials",
    pageTitle: "FRC Tutorials | Far Reach Co.",
    metaDescription:
      "Watch Far Reach Co. tutorials for virtual tabletop workflow, setup guides, and product walkthroughs.",
    heading: "Tutorials",
    subtitle: "YouTube Playlist",
    summary:
      "Video walkthroughs for our virtual tabletop and campaign tooling.",
    sections: [
      {
        heading: "Video Guides",
        paragraphs: [
          "Our YouTube playlist covers setup, workflows, and practical ways to run sessions with the FRC toolset.",
          "This includes virtual tabletop basics and guidance for campaign-oriented features.",
        ],
        actions: [
          {
            href: "https://www.youtube.com/playlist?list=PLbXvAcAjBp22C6lKdWlSd32I_6US4O2wa",
            label: "Watch on YouTube",
            external: true,
          },
          {
            href: "/vtt-guide",
            label: "Open VTT Guide",
          },
        ],
      },
    ],
  },
  "free-assets": {
    slug: "free-assets",
    pageTitle: "Free Token And Map Images | Far Reach Co.",
    metaDescription:
      "Download the Far Reach Co. free token and map starter pack for virtual tabletop sessions.",
    heading: "Free Token And Map Images",
    subtitle: "Starter Pack",
    summary:
      "A free starter ZIP with maps and tokens to get your table running quickly.",
    imageSrc: "/assets/character_knight.png",
    imageAlt: "Free Token and Map Images",
    sections: [
      {
        heading: "Starter Download",
        paragraphs: [
          "This pack includes maps and character tokens intended to help groups start quickly.",
          "Use these assets in your virtual tabletop sessions as a baseline collection.",
        ],
        actions: [
          {
            href: "https://wyrld.s3.us-east-1.amazonaws.com/free-images/FreeTokens_v4.zip",
            label: "Download ZIP",
            download: true,
            confirmDownload: "Download FreeTokens_v4.zip (~15MB)?",
            note: "~15MB",
          },
        ],
      },
    ],
  },
  "character-sheets": {
    slug: "character-sheets",
    pageTitle: "Offline 5E Character Sheets | Far Reach Co.",
    metaDescription:
      "Download printable Far Reach Co. D&D 5E character sheet PDFs in multiple formats.",
    heading: "Offline 5E Character Sheets",
    subtitle: "Printable PDFs",
    summary:
      "Printable versions of our 5E sheet designs for pencil-and-paper play.",
    sections: [
      {
        heading: "Available Downloads",
        paragraphs: [
          "If you prefer offline play, you can download our printable 5E character sheets in multiple variants.",
        ],
        actions: [
          {
            href: "/assets/resources/character_sheets/CharSheetPeli_v01.pdf",
            label: "Color PDF With Peli",
            download: true,
            confirmDownload: "Download CharSheetPeli_v01.pdf?",
          },
          {
            href: "/assets/resources/character_sheets/CharSheetNOPeli_v02.pdf",
            label: "Color PDF Without Peli",
            download: true,
            confirmDownload: "Download CharSheetNOPeli_v02.pdf?",
          },
          {
            href: "/assets/resources/character_sheets/CharSheetNOPeliNOBkgd_v03.pdf",
            label: "Printer-Friendly (No Background)",
            download: true,
            confirmDownload: "Download CharSheetNOPeliNOBkgd_v03.pdf?",
          },
        ],
      },
    ],
  },
  "aether-bot": {
    slug: "aether-bot",
    pageTitle: "Aether Discord Bot Resource | Far Reach Co.",
    metaDescription:
      "Learn about Aether, the Far Reach Co. Discord bot for FRC character sheet integration.",
    heading: "Aether Discord Bot",
    subtitle: "Platform Specific",
    summary:
      "A Discord bot focused on integration with FRC character sheet workflows.",
    imageSrc: "/assets/token_dragon_purple1.png",
    imageAlt: "Aether Discord Bot",
    sections: [
      {
        heading: "What It Does",
        paragraphs: [
          "Aether integrates with the FRC sheet system so players can register and reference sheet data directly in Discord.",
          "The command set and bot details are documented on the dedicated Aether page.",
        ],
        actions: [
          {
            href: "/aether-bot",
            label: "View Aether Documentation",
          },
        ],
      },
    ],
  },
  "discord-5e-bot": {
    slug: "discord-5e-bot",
    pageTitle: "5E Discord Bot Resource | Far Reach Co.",
    metaDescription:
      "Use the 5e Discord bot for dice rolling, SRD lookup, and initiative support.",
    heading: "5E Discord Bot",
    subtitle: "Non-Platform Specific",
    summary:
      "A Discord bot for smooth D&D sessions with dice, SRD lookups, and initiative tools.",
    imageSrc: "/assets/token_dragon_green.webp",
    imageAlt: "5E Discord Bot",
    sections: [
      {
        heading: "Capabilities",
        paragraphs: [
          "Use the bot for dice rolling, official SRD lookups, and initiative flow support in Discord games.",
        ],
        actions: [
          {
            href: "https://5ebot.com",
            label: "Visit 5ebot.com",
            external: true,
          },
        ],
      },
    ],
  },
  aethrend: {
    slug: "aethrend",
    pageTitle: "Aethrend Campaign Setting Resources | Far Reach Co.",
    metaDescription:
      "Explore pre-release Aethrend campaign setting resources from Far Reach Co.",
    heading: "Aethrend",
    subtitle: "Campaign Setting",
    summary:
      "Pre-release setting material for an in-development 5E campaign world.",
    imageSrc: "/assets/resources/aethrend/Aethrend_Background_SkySailor_p1_v1.jpeg",
    imageAlt: "Aethrend Campaign Setting",
    sections: [
      {
        heading: "Pre-Release Content",
        paragraphs: [
          "We are actively building a 5E campaign setting and releasing early material as it becomes available.",
          "You can browse current pre-release content on the Aethrend page.",
        ],
        actions: [
          {
            href: "/preaethrend",
            label: "Browse Pre-Release Content",
          },
        ],
      },
    ],
  },
};

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
    res.redirect(301, "/resources/srd");
  } catch (err) {
    next(err);
  }
});

router.get(
  "/resources/:slug",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const guide = RESOURCE_GUIDES[req.params.slug];
      if (!guide) {
        next();
        return;
      }
      res.render("resource-guide", {
        auth: req.session.user,
        guide,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/aether-bot", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("aetherbot", { auth: req.session.user });
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
  "/virtual-tabletop-for-dnd-5e",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("virtual-tabletop-for-dnd-5e", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/roll20-alternative", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("roll20-alternative", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/library-guide", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("library-guide", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/library-packs-guide",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("library-packs-guide", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/character-sheet-guide",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("character-sheet-guide", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/product-guide", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("product-guide", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/wyrlds", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("wyrlds", { auth: req.session.user });
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

router.get(
  "/simple-virtual-tabletop-no-player-accounts",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("simple-virtual-tabletop-no-player-accounts", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/dnd-5e-character-sheets",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("dnd-5e-character-sheets", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/play-dungeons-and-dragons-online",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("play-dungeons-and-dragons-online", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/community-library-packs",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      res.render("community-library-packs", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
