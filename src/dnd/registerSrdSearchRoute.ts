import { Request, Response, NextFunction, Router } from "express";
import { rateLimit } from "express-rate-limit";
import { searchSrd } from "./srd/mistral.js";

const srdSearchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many search requests, please try again later" },
});

export function registerSrdSearchRoute(router: Router) {
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
}
