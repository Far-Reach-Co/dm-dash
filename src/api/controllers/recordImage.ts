import { Request, Response, NextFunction } from "express";
import {
  addRecordImageQuery,
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

interface addRecordImageRequest extends Request {
  body: {
    record_id: number | string;
    image_id: number | string;
  };
}

async function addRecordImage(
  req: addRecordImageRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const record = await getRecordOrThrow(req.body.record_id);
    await requireRecordEditAccess(req, record);
    const data = await addRecordImageQuery(req.body);
    const recordImage = data.rows[0];

    res.status(201).send(recordImage);
  } catch (err) {
    next(err);
  }
}

async function getRecordImage(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getRecordImageQuery(req.params.id);
    const recordImage = data.rows[0];
    if (!recordImage) throw { status: 404, message: "Record image not found" };
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
    const data = await getRecordImagesByImageQuery(req.params.image_id);
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
    const recordImageData = await getRecordImagesByImageQuery(
      req.params.image_id
    );
    const recordImage = recordImageData.rows[0];
    if (!recordImage) throw { status: 404, message: "Record image not found" };
    const record = await getRecordOrThrow(recordImage.record_id);
    await requireRecordEditAccess(req, record);

    await removeRecordImageQuery(recordImage.id);

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
