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

function badRequest(message: string) {
  const err: any = new Error(message);
  err.status = 400;
  return err;
}

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

function normalizeSearch(raw: unknown) {
  if (typeof raw !== "string") return "";
  return raw.trim().toLowerCase();
}

function sortImages(
  images: Image[],
  sort: string,
) {
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

async function startGuestSandbox(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (typeof req.body?.image_ids !== "undefined") {
      throw badRequest("image_ids is not allowed for guest sandboxes");
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
      starter_image_ids: record.starter_image_ids || [],
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
      throw badRequest("Missing sandbox data");
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

    const imageIds = Array.isArray(record.starter_image_ids)
      ? record.starter_image_ids
      : [];
    if (!imageIds.length) {
      res.send({
        images: [],
        total: 0,
        limit: parsePaginationInt(req.query.limit, 60, 1, 120),
        offset: 0,
      });
      return;
    }

    const allImages = (await getImagesQuery(imageIds)).rows;
    const search = normalizeSearch(req.query.q);
    const sort = typeof req.query.sort === "string" ? req.query.sort : "newest";

    const filtered = search
      ? allImages.filter((img) =>
          String(img.original_name || "").toLowerCase().includes(search),
        )
      : allImages;
    const sorted = sortImages(filtered, sort);

    const limit = parsePaginationInt(req.query.limit, 60, 1, 120);
    const start = parsePaginationInt(req.query.offset, 0, 0, Number.MAX_SAFE_INTEGER);
    const page = sorted.slice(start, start + limit);
    const nextOffset = start + page.length;

    const signedUrls = await getSignedUrls(page as any);

    const responseImages = page.map((img) => ({
      id: `guest-table-image-${record.id}-${img.id}`,
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
    const total = Array.isArray(record.starter_image_ids)
      ? record.starter_image_ids.length
      : 0;
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
