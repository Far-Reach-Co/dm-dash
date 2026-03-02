import { Request, Response, NextFunction, Router } from "express";
import { rateLimit } from "express-rate-limit";
import { createSrdQuestionEvent } from "../api/queries/srdQuestionEvents.js";
import logger from "../lib/logger.js";

const commandEventLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 240,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many command telemetry requests, please try again later" },
});

function readHeader(req: Request, headerName: string, maxLength = 120): string | null {
  const value = req.get(headerName);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.length) return null;
  return trimmed.slice(0, maxLength);
}

function normalizeText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized.length) return null;
  return normalized.slice(0, maxLength);
}

function toPlainMetadataValue(value: unknown): unknown {
  if (value === null) return null;
  if (typeof value === "string") return value.slice(0, 500);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.slice(0, 30).map((v) => toPlainMetadataValue(v));
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>).slice(0, 30)) {
      result[key.slice(0, 80)] = toPlainMetadataValue(val);
    }
    return result;
  }
  return String(value).slice(0, 500);
}

function resolveSource(req: Request): string {
  return readHeader(req, "x-srd-source", 80) || "dm_dash_web_command";
}

export function registerSrdCommandEventRoute(router: Router) {
  router.post(
    "/5e/srd/command-event",
    commandEventLimiter,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const requestId = (req as Request & { id?: string | number }).id;
        const commandName = normalizeText(req.body?.commandName, 80);
        const queryText =
          normalizeText(req.body?.queryText, 500) ||
          (commandName ? `command:${commandName}` : null);

        if (!commandName || !queryText) {
          res.status(400).json({ message: "commandName and queryText are required" });
          return;
        }

        const metadata = {
          route: "/dnd/5e/srd/command-event",
          method: req.method,
          commandName,
          options: toPlainMetadataValue(req.body?.options ?? null),
          rawQueryText: normalizeText(req.body?.rawQueryText, 500),
          commandId: normalizeText(req.body?.commandId, 120),
        };

        createSrdQuestionEvent({
          source: resolveSource(req),
          queryText,
          answerText: null,
          isShort: false,
          requestId:
            readHeader(req, "x-srd-request-id", 120) ||
            readHeader(req, "x-request-id", 120) ||
            (requestId ? String(requestId).slice(0, 120) : null),
          sourceUserId:
            normalizeText(req.body?.userId, 120) || readHeader(req, "x-srd-user-id", 120),
          sourceGuildId:
            normalizeText(req.body?.guildId, 120) || readHeader(req, "x-srd-guild-id", 120),
          clientIp: req.ip || req.socket?.remoteAddress || null,
          userAgent: req.get("user-agent") || null,
          metadataJson: metadata,
        }).catch((err) => {
          logger.warn(
            {
              err,
              source: req.get("x-srd-source") || "dm_dash_web_command",
              requestId: requestId ? String(requestId) : null,
              commandName,
            },
            "Failed to persist SRD command event",
          );
        });

        res.json({ ok: true });
      } catch (err) {
        next(err);
      }
    },
  );
}
