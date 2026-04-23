import { Request, Response, NextFunction } from "express";
import {
  addRecordImageQuery,
  getRecordImageByRecordAndImageQuery,
  getRecordImageQuery,
  getRecordImagesByImageQuery,
  getRecordImagesByRecordQuery,
  removeRecordImageQuery,
} from "../queries/recordImage";
import {
  getRecordOrThrow,
  requireRecordEditAccess,
  requireRecordViewAccess,
} from "./accessControl";
import { deleteImagesIfOrphaned } from "../../lib/imageLifecycle";
import { cleanupDeletedImageAssets } from "./imageCleanup";
import type { Record as RecordRow } from "../queries/record";

interface addRecordImageRequest extends Request {
  body: {
    record_id: number | string;
    image_id: number | string;
  };
}

function recordImageNotFound() {
  return { status: 404, message: "Record image not found" };
}

async function getRecordImageOrThrow(recordImageId: number | string) {
  const data = await getRecordImageQuery(recordImageId);
  const recordImage = data.rows[0];
  if (!recordImage) throw recordImageNotFound();
  return recordImage;
}

async function findExistingRecordImageLink(
  recordId: number | string,
  imageId: number | string,
) {
  const existingData = await getRecordImageByRecordAndImageQuery(recordId, imageId);
  return existingData.rows[0] || null;
}

async function findOrCreateRecordImageLink(
  recordId: number | string,
  imageId: number | string,
) {
  const existingRecordImage = await findExistingRecordImageLink(recordId, imageId);
  if (existingRecordImage) return { recordImage: existingRecordImage, created: false };

  try {
    const data = await addRecordImageQuery({
      record_id: recordId,
      image_id: imageId,
    });
    return { recordImage: data.rows[0], created: true };
  } catch (err: any) {
    if (err?.code === "23505") {
      const retryRecordImage = await findExistingRecordImageLink(recordId, imageId);
      if (retryRecordImage) {
        return { recordImage: retryRecordImage, created: false };
      }
    }
    throw err;
  }
}

async function getVisibleRecordImageRowsForImage(
  req: Request,
  imageId: number | string,
) {
  const data = await getRecordImagesByImageQuery(imageId);
  const visibleRows = [];

  for (const row of data.rows) {
    const record = await getRecordOrThrow(row.record_id);
    try {
      await requireRecordViewAccess(req, record);
      visibleRows.push(row);
    } catch {
      // no-op, skip records viewer cannot access
    }
  }

  return visibleRows;
}

async function getEditableRecordImageByImageOrThrow(
  req: Request,
  imageId: number | string,
) {
  const recordImage = (await getRecordImagesByImageQuery(imageId)).rows[0];
  if (!recordImage) throw recordImageNotFound();
  const record = await getRecordOrThrow(recordImage.record_id);
  await requireRecordEditAccess(req, record);
  return { recordImage, record };
}

function resolveRecordOwnerScope(record: RecordRow) {
  if (record.project_id) {
    return {
      type: "project" as const,
      projectId: record.project_id,
    };
  }
  if (record.user_id) {
    return {
      type: "user" as const,
      userId: record.user_id,
    };
  }
  return null;
}

async function addRecordImage(
  req: addRecordImageRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const record = await getRecordOrThrow(req.body.record_id);
    await requireRecordEditAccess(req, record);
    const { recordImage, created } = await findOrCreateRecordImageLink(
      req.body.record_id,
      req.body.image_id,
    );
    if (!recordImage) throw { status: 500, message: "Failed to link record image" };

    res.status(created ? 201 : 200).send(recordImage);
  } catch (err) {
    next(err);
  }
}

async function getRecordImage(req: Request, res: Response, next: NextFunction) {
  try {
    const recordImage = await getRecordImageOrThrow(req.params.id);
    const record = await getRecordOrThrow(recordImage.record_id);
    await requireRecordViewAccess(req, record);
    res.send(recordImage);
  } catch (err) {
    next(err);
  }
}

async function getRecordImagesByRecord(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const record = await getRecordOrThrow(req.params.record_id);
    await requireRecordViewAccess(req, record);
    const data = await getRecordImagesByRecordQuery(req.params.record_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function getRecordImagesByImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const visibleRows = await getVisibleRecordImageRowsForImage(
      req,
      req.params.image_id,
    );
    res.send(visibleRows);
  } catch (err) {
    next(err);
  }
}

async function removeRecordImageByImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { recordImage, record } = await getEditableRecordImageByImageOrThrow(
      req,
      req.params.image_id,
    );
    await removeRecordImageQuery(recordImage.id);
    const deletedImages = await deleteImagesIfOrphaned({
      imageIds: [recordImage.image_id],
      ownerScope: resolveRecordOwnerScope(record),
    });
    await cleanupDeletedImageAssets(deletedImages);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export {
  getRecordImage,
  addRecordImage,
  removeRecordImageByImage,
  getRecordImagesByImage,
  getRecordImagesByRecord,
};
