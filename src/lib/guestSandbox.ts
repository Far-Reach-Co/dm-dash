import { Request } from "express";
import { randomUUID } from "crypto";
import { createClient } from "redis";
import {
  GUEST_SANDBOX_MAX_DATA_BYTES,
  GUEST_SANDBOX_MAX_IMAGES,
  GUEST_SANDBOX_TTL_SECONDS,
} from "../config";
import logger from "./logger.js";
import db from "../api/dbconfig";
import { badRequestError, notFoundError } from "./httpErrors";
import { buildGuestSandboxCapabilities } from "./tableAuthz";
import { getRedisUrl } from "./redisConfig.js";
import { EventType, logEventAsync } from "./eventLogger";

declare module "express-session" {
  export interface SessionData {
    guest_id?: string;
    guest_sandbox_id?: string;
  }
}

export interface GuestSandboxRecord {
  id: string;
  guest_id: string;
  title: string;
  mode: "sandbox";
  starter_image_ids: number[];
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

const GUEST_SANDBOX_PREFIX = "frc:guest:sandbox:";
const DEFAULT_GUEST_SANDBOX_TITLE = "Sandbox Demo";
const guestSandboxTtlSeconds = Math.max(60, GUEST_SANDBOX_TTL_SECONDS);
const guestSandboxMaxImages = Math.max(1, GUEST_SANDBOX_MAX_IMAGES);
const guestSandboxMaxDataBytes = Math.max(1024, GUEST_SANDBOX_MAX_DATA_BYTES);

const guestSandboxRedisClient = createClient({ url: getRedisUrl() });
guestSandboxRedisClient.on("error", (err) => {
  logger.error({ err }, "Guest sandbox Redis client error");
});

let guestSandboxRedisReady: Promise<any> | null = null;

function getGuestSandboxKey(id: string) {
  return `${GUEST_SANDBOX_PREFIX}${id}`;
}

async function ensureGuestSandboxRedisReady() {
  if (!guestSandboxRedisReady) {
    guestSandboxRedisReady = guestSandboxRedisClient.connect().catch((err) => {
      guestSandboxRedisReady = null;
      throw err;
    });
  }
  await guestSandboxRedisReady;
}

function normalizeStarterImageIds(input: unknown): number[] {
  if (!Array.isArray(input)) return [];
  const ids = input
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
    .map((value) => Math.trunc(value))
    .filter((value) => value > 0);
  return Array.from(new Set(ids)).slice(0, guestSandboxMaxImages);
}

async function loadCuratedGuestImageIds() {
  const query = {
    text: 'select id from public."Image" where is_blocked = false and file_name like $1 order by file_name asc limit $2',
    values: ["guest-token-%", guestSandboxMaxImages],
  };
  const { rows } = await db.query<{ id: number }>(query);
  return rows
    .map((row) => Number(row.id))
    .filter((id) => Number.isFinite(id) && id > 0);
}

function sanitizeTitle(title: unknown) {
  if (typeof title !== "string") return DEFAULT_GUEST_SANDBOX_TITLE;
  const trimmed = title.trim();
  return trimmed.length ? trimmed.slice(0, 120) : DEFAULT_GUEST_SANDBOX_TITLE;
}

function guestSandboxNotFoundError() {
  return notFoundError("Guest sandbox not found");
}

async function writeGuestSandbox(record: GuestSandboxRecord) {
  await ensureGuestSandboxRedisReady();
  await guestSandboxRedisClient.setEx(
    getGuestSandboxKey(record.id),
    guestSandboxTtlSeconds,
    JSON.stringify(record),
  );
}

async function resolveStarterImageIds(input: unknown) {
  const requestedStarterIds = normalizeStarterImageIds(input);
  if (requestedStarterIds.length) {
    return requestedStarterIds;
  }
  return await loadCuratedGuestImageIds();
}

function readSessionUserId(req: Request): string | number | undefined {
  return req.session?.user;
}

export function ensureGuestId(req: Request): string {
  if (!req.session.guest_id) {
    req.session.guest_id = randomUUID();
  }
  return req.session.guest_id;
}

export function getGuestSandboxTtlSeconds() {
  return guestSandboxTtlSeconds;
}

export { buildGuestSandboxCapabilities };

export async function createGuestSandbox(
  req: Request,
  options?: { title?: unknown; starter_image_ids?: unknown },
) {
  const guestId = ensureGuestId(req);
  const existingId = req.session.guest_sandbox_id;
  if (existingId) {
    const existing = await getGuestSandbox(existingId);
    if (existing && String(existing.guest_id) === String(guestId)) {
      logger.info(
        { requestId: req.id, guestSandboxId: existing.id, guestId },
        "Reused existing guest sandbox",
      );
      return existing;
    }
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  const starterImageIds = await resolveStarterImageIds(options?.starter_image_ids);
  if (!starterImageIds.length) {
    throw badRequestError("Guest sandbox has no curated images available");
  }

  const record: GuestSandboxRecord = {
    id,
    guest_id: guestId,
    title: sanitizeTitle(options?.title),
    mode: "sandbox",
    starter_image_ids: starterImageIds,
    data: { objects: [] },
    created_at: now,
    updated_at: now,
  };

  await writeGuestSandbox(record);
  req.session.guest_sandbox_id = id;
  logEventAsync({
    userId: readSessionUserId(req),
    eventType: EventType.GUEST_SANDBOX_STARTED,
    eventData: {
      guestSandboxId: id,
      guestId,
      starterImageCount: starterImageIds.length,
      outcome: "success",
      reason: null,
    },
    req,
  });
  logger.info(
    { requestId: req.id, guestSandboxId: id, guestId, starterImageCount: starterImageIds.length },
    "Created guest sandbox",
  );

  return record;
}

export async function getGuestSandbox(id: string) {
  await ensureGuestSandboxRedisReady();
  const value = await guestSandboxRedisClient.get(getGuestSandboxKey(id));
  if (!value) return null;
  try {
    return JSON.parse(value) as GuestSandboxRecord;
  } catch (err) {
    logger.warn({ err, guestSandboxId: id }, "Invalid guest sandbox payload");
    return null;
  }
}

export async function requireGuestSandboxAccess(req: Request, id: string) {
  const record = await getGuestSandbox(id);
  if (!record) {
    logger.warn(
      { requestId: req.id, guestSandboxId: id },
      "Guest sandbox access denied: not found",
    );
    throw guestSandboxNotFoundError();
  }
  return record;
}

export async function touchGuestSandbox(id: string) {
  await ensureGuestSandboxRedisReady();
  await guestSandboxRedisClient.expire(
    getGuestSandboxKey(id),
    guestSandboxTtlSeconds,
  );
}

export async function saveGuestSandboxData(id: string, data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw badRequestError("Invalid sandbox data");
  }
  const dataJson = JSON.stringify(data);
  if (Buffer.byteLength(dataJson, "utf8") > guestSandboxMaxDataBytes) {
    throw badRequestError("Sandbox data exceeds size limit");
  }

  const record = await getGuestSandbox(id);
  if (!record) {
    throw guestSandboxNotFoundError();
  }
  const updated: GuestSandboxRecord = {
    ...record,
    data: JSON.parse(dataJson),
    updated_at: new Date().toISOString(),
  };

  await writeGuestSandbox(updated);
  return updated;
}
