import { Request, Response, NextFunction } from "express";
import { getImagesQuery, type Image } from "../queries/images.js";
import { getSignedUrls } from "./s3";
import {
  buildGuestSandboxCapabilities,
  createGuestSandbox,
  getGuestSandboxTtlSeconds,
  requireGuestSandboxAccess,
  saveGuestSandboxData,
  touchGuestSandbox,
} from "../../lib/guestSandbox.js";
import { badRequestError } from "../../lib/httpErrors";

const DEFAULT_LIMIT = 60;
const MIN_LIMIT = 1;
const MAX_LIMIT = 120;
const MIN_OFFSET = 0;

function parsePaginationInt(
  raw: unknown,
  fallback: number,
  min: number,
  max: number,
) {
  const value = Number(raw);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

type GuestImageSort = "newest" | "name" | "size";

function parseImageSort(raw: unknown): GuestImageSort {
  if (raw === "name" || raw === "size") return raw;
  return "newest";
}

function parseImageLibraryQuery(query: Request["query"]) {
  return {
    limit: parsePaginationInt(query.limit, DEFAULT_LIMIT, MIN_LIMIT, MAX_LIMIT),
    offset: parsePaginationInt(
      query.offset,
      0,
      MIN_OFFSET,
      Number.MAX_SAFE_INTEGER,
    ),
    search: normalizeSearch(query.q),
    sort: parseImageSort(query.sort),
  };
}

function normalizeSearch(raw: unknown) {
  if (typeof raw !== "string") return "";
  return raw.trim().toLowerCase();
}

function sortImages(images: Image[], sort: GuestImageSort) {
  if (sort === "name") {
    return [...images].sort((a, b) =>
      a.original_name.localeCompare(b.original_name),
    );
  }
  if (sort === "size") {
    return [...images].sort((a, b) => b.size - a.size);
  }
  return [...images].sort((a, b) => b.id - a.id);
}

function getStarterImageIds(record: { starter_image_ids?: unknown }) {
  if (!Array.isArray(record.starter_image_ids)) return [];
  return record.starter_image_ids
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0)
    .map((value) => Math.trunc(value));
}

function mapGuestTableImages(
  sandboxId: string,
  page: Image[],
  signedUrls: Record<string, string>,
) {
  return page.map((img) => ({
    id: `guest-table-image-${sandboxId}-${img.id}`,
    image_id: img.id,
    original_name: img.original_name,
    size: img.size,
    file_name: img.file_name,
    notes: img.notes,
    src: signedUrls[img.id],
    folder_id: null,
    record_id: null,
    record_title: null,
    record_desc: null,
  }));
}

async function startGuestSandbox(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (typeof req.body?.image_ids !== "undefined") {
      throw badRequestError("image_ids is not allowed for guest sandboxes");
    }
    const record = await createGuestSandbox(req, {
      title: req.body?.title,
    });
    res.status(201).send({
      uuid: record.id,
      redirect: `/vtt?guest_uuid=${record.id}`,
      expires_in_seconds: getGuestSandboxTtlSeconds(),
    });
  } catch (err) {
    next(err);
  }
}

async function getGuestSandboxView(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const record = await requireGuestSandboxAccess(req, req.params.uuid);
    await touchGuestSandbox(record.id);
    const starterImageIds = getStarterImageIds(record);
    res.send({
      id: record.id,
      uuid: record.id,
      title: record.title,
      mode: record.mode,
      data: record.data || { objects: [] },
      is_public: false,
      project_id: null,
      user_id: null,
      is_guest_sandbox: true,
      guest_sandbox_id: record.id,
      starter_image_ids: starterImageIds,
      data_save_url: `/api/edit_guest_sandbox_data/${record.id}`,
      capabilities: buildGuestSandboxCapabilities(),
    });
  } catch (err) {
    next(err);
  }
}

async function editGuestSandboxData(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const record = await requireGuestSandboxAccess(req, req.params.uuid);
    if (typeof req.body?.data === "undefined") {
      throw badRequestError("Missing sandbox data");
    }
    await saveGuestSandboxData(record.id, req.body.data);
    res.status(200).send({ message: "Saved" });
  } catch (err) {
    next(err);
  }
}

async function getGuestSandboxImages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const record = await requireGuestSandboxAccess(req, req.params.uuid);
    await touchGuestSandbox(record.id);
    const { limit, offset, search, sort } = parseImageLibraryQuery(req.query);
    const imageIds = getStarterImageIds(record);
    if (!imageIds.length) {
      res.send({
        images: [],
        total: 0,
        limit,
        offset: 0,
      });
      return;
    }

    const allImages = (await getImagesQuery(imageIds)).rows;
    const filtered = search
      ? allImages.filter((img) =>
          String(img.original_name || "").toLowerCase().includes(search),
        )
      : allImages;
    const sorted = sortImages(filtered, sort);

    const page = sorted.slice(offset, offset + limit);
    const nextOffset = offset + page.length;

    const signedUrls = await getSignedUrls(page);
    const responseImages = mapGuestTableImages(record.id, page, signedUrls);

    res.send({
      images: responseImages,
      total: sorted.length,
      limit,
      offset: nextOffset,
    });
  } catch (err) {
    next(err);
  }
}

async function getGuestSandboxImageCounts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const record = await requireGuestSandboxAccess(req, req.params.uuid);
    await touchGuestSandbox(record.id);
    const total = getStarterImageIds(record).length;
    res.send({
      total,
      unsorted: total,
      by_folder: {},
    });
  } catch (err) {
    next(err);
  }
}

export {
  startGuestSandbox,
  getGuestSandboxView,
  editGuestSandboxData,
  getGuestSandboxImages,
  getGuestSandboxImageCounts,
};
