import { Request, Response, NextFunction, Router } from "express";
import { rateLimit } from "express-rate-limit";
import { searchSrd } from "./srd/mistral.js";
import { createSrdQuestionEvent } from "../api/queries/srdQuestionEvents.js";
import logger from "../lib/logger.js";
import {
  normalizeSearchContextHint,
  type SearchContextHint,
} from "./srd/context.js";

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

function readBodyText(value: unknown, maxLength = 120): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.length) return null;
  return trimmed.slice(0, maxLength);
}

function normalizeSearchContext(value: unknown): SearchContextHint | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const payload = value as Record<string, unknown>;

  if (payload.enabled === false) return null;

  const normalized = normalizeSearchContextHint({
    path: readBodyText(payload.path, 240),
    category: readBodyText(payload.category, 60),
    index: readBodyText(payload.index, 120),
    title: readBodyText(payload.title, 120),
  });
  if (!normalized) return null;
  return {
    ...(normalized.path ? { path: normalized.path } : {}),
    ...(normalized.category ? { category: normalized.category } : {}),
    ...(normalized.index ? { index: normalized.index } : {}),
    ...(normalized.title ? { title: normalized.title } : {}),
  };
}

export function registerSrdSearchRoute(router: Router) {
  router.post(
    "/5e/srd/search",
    srdSearchLimiter,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const requestId = (req as Request & { id?: string | number }).id;
        const { query, short, context } = req.body || {};
        if (!query || typeof query !== "string") {
          res.status(400).json({ message: "Query is required" });
          return;
        }
        const trimmed = query.trim();
        if (trimmed.length < 3 || trimmed.length > 500) {
          res.status(400).json({ message: "Query must be between 3 and 500 characters" });
          return;
        }
        const normalizedContext = normalizeSearchContext(context);
        const answer = await searchSrd(trimmed, short === true, normalizedContext || undefined);
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
            hasContext: Boolean(normalizedContext),
            contextPath: normalizedContext?.path || null,
            contextCategory: normalizedContext?.category || null,
            contextIndex: normalizedContext?.index || null,
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
