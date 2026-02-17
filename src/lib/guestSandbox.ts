import { Request } from "express";
import { randomUUID } from "crypto";
import { createClient } from "redis";
import logger from "./logger.js";
import db from "../api/dbconfig";

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
const GUEST_SANDBOX_TTL_SECONDS = Math.max(
  60,
  Number(process.env.GUEST_SANDBOX_TTL_SECONDS || 12 * 60 * 60),
);
const GUEST_SANDBOX_MAX_IMAGES = Math.max(
  1,
  Number(process.env.GUEST_SANDBOX_MAX_IMAGES || 30),
);
const GUEST_SANDBOX_MAX_DATA_BYTES = Math.max(
  1024,
  Number(process.env.GUEST_SANDBOX_MAX_DATA_BYTES || 2 * 1024 * 1024),
);

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const guestSandboxRedisClient = createClient({ url: redisUrl });
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
  return Array.from(new Set(ids)).slice(0, GUEST_SANDBOX_MAX_IMAGES);
}

async function loadCuratedGuestImageIds() {
  const query = {
    text: 'select id from public."Image" where is_blocked = false and file_name like $1 order by file_name asc limit $2',
    values: ["guest-token-%", GUEST_SANDBOX_MAX_IMAGES],
  };
  const { rows } = await db.query<{ id: number }>(query);
  return rows
    .map((row) => Number(row.id))
    .filter((id) => Number.isFinite(id) && id > 0);
}

function sanitizeTitle(title: unknown) {
  if (typeof title !== "string") return "Sandbox Demo";
  const trimmed = title.trim();
  return trimmed.length ? trimmed.slice(0, 120) : "Sandbox Demo";
}

function badRequest(message: string) {
  const err: any = new Error(message);
  err.status = 400;
  return err;
}

function forbidden() {
  const err: any = new Error("Forbidden");
  err.status = 403;
  return err;
}

function notFound() {
  const err: any = new Error("Guest sandbox not found");
  err.status = 404;
  return err;
}

export function ensureGuestId(req: Request): string {
  if (!req.session.guest_id) {
    req.session.guest_id = randomUUID();
  }
  return req.session.guest_id;
}

export function getGuestSandboxTtlSeconds() {
  return GUEST_SANDBOX_TTL_SECONDS;
}

export function buildGuestSandboxCapabilities() {
  return {
    mode: "sandbox",
    canManagePins: false,
    canUsePinPortals: false,
    canChangeTable: false,
    canManageLayers: true,
    canManageGrid: true,
    canManageImageAssets: false,
    canManageFolders: false,
    canEditImageMetadata: false,
    canDeleteCanvasObjects: true,
    canManageTableSettings: false,
  };
}

export async function createGuestSandbox(
  req: Request,
  options?: { title?: unknown; starter_image_ids?: unknown },
) {
  const guestId = ensureGuestId(req);
  const existingId = req.session.guest_sandbox_id;
  if (existingId) {
    const existing = await getGuestSandbox(existingId);
    if (existing && String(existing.guest_id) === String(guestId)) {
      return existing;
    }
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  const requestedStarterIds = normalizeStarterImageIds(
    options?.starter_image_ids,
  );
  const starterImageIds = requestedStarterIds.length
    ? requestedStarterIds
    : await loadCuratedGuestImageIds();
  if (!starterImageIds.length) {
    throw badRequest("Guest sandbox has no curated images available");
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

  await ensureGuestSandboxRedisReady();
  await guestSandboxRedisClient.setEx(
    getGuestSandboxKey(id),
    GUEST_SANDBOX_TTL_SECONDS,
    JSON.stringify(record),
  );
  req.session.guest_sandbox_id = id;

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
  if (!record) throw notFound();
  const guestId = req.session.guest_id;
  if (!guestId || String(record.guest_id) !== String(guestId)) {
    throw forbidden();
  }
  return record;
}

export async function touchGuestSandbox(id: string) {
  await ensureGuestSandboxRedisReady();
  await guestSandboxRedisClient.expire(
    getGuestSandboxKey(id),
    GUEST_SANDBOX_TTL_SECONDS,
  );
}

export async function saveGuestSandboxData(id: string, data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw badRequest("Invalid sandbox data");
  }
  const dataJson = JSON.stringify(data);
  if (Buffer.byteLength(dataJson, "utf8") > GUEST_SANDBOX_MAX_DATA_BYTES) {
    throw badRequest("Sandbox data exceeds size limit");
  }

  const record = await getGuestSandbox(id);
  if (!record) throw notFound();
  const updated: GuestSandboxRecord = {
    ...record,
    data: JSON.parse(dataJson),
    updated_at: new Date().toISOString(),
  };

  await ensureGuestSandboxRedisReady();
  await guestSandboxRedisClient.setEx(
    getGuestSandboxKey(id),
    GUEST_SANDBOX_TTL_SECONDS,
    JSON.stringify(updated),
  );
  return updated;
}
