import { Request, Response, NextFunction, Router } from "express";
import { rateLimit } from "express-rate-limit";
import { searchSrd } from "./srd/mistral.js";
import { createSrdQuestionEvent } from "../api/queries/srdQuestionEvents.js";
import logger from "../lib/logger.js";

const srdSearchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many search requests, please try again later" },
});

function readHeader(req: Request, headerName: string, maxLength = 120): string | null {
  const value = req.get(headerName);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.length) return null;
  return trimmed.slice(0, maxLength);
}

function resolveSearchSource(req: Request): string {
  const explicitSource = readHeader(req, "x-srd-source", 80);
  if (explicitSource) return explicitSource;
  return "dm_dash_web";
}

export function registerSrdSearchRoute(router: Router) {
  router.post(
    "/5e/srd/search",
    srdSearchLimiter,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const requestId = (req as Request & { id?: string | number }).id;
        const { query, short } = req.body;
        if (!query || typeof query !== "string") {
          res.status(400).json({ message: "Query is required" });
          return;
        }
        const trimmed = query.trim();
        if (trimmed.length < 3 || trimmed.length > 500) {
          res.status(400).json({ message: "Query must be between 3 and 500 characters" });
          return;
        }
        const answer = await searchSrd(trimmed, short === true);
        createSrdQuestionEvent({
          source: resolveSearchSource(req),
          queryText: trimmed,
          answerText: answer,
          isShort: short === true,
          requestId:
            readHeader(req, "x-srd-request-id", 120) ||
            readHeader(req, "x-request-id", 120) ||
            (requestId ? String(requestId).slice(0, 120) : null),
          sourceUserId: readHeader(req, "x-srd-user-id", 120),
          sourceGuildId: readHeader(req, "x-srd-guild-id", 120),
          clientIp: req.ip || req.socket?.remoteAddress || null,
          userAgent: req.get("user-agent") || null,
          metadataJson: {
            route: "/dnd/5e/srd/search",
            method: req.method,
          },
        }).catch((err) => {
          logger.warn(
            {
              err,
              source: req.get("x-srd-source") || "dm_dash_web",
              requestId: requestId ? String(requestId) : null,
            },
            "Failed to persist SRD question event",
          );
        });
        res.json({ answer });
      } catch (err) {
        next(err);
      }
    },
  );
}
