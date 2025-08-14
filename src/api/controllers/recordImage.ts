import { Request, Response, NextFunction } from "express";
import {
  addRecordImageQuery,
  getRecordImageQuery,
  getRecordImagesByImageQuery,
  getRecordImagesByRecordQuery,
  removeRecordImageQuery,
} from "../queries/recordImage";
import { getImageQuery } from "../queries/images";

interface addRecordImageRequest {
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

    res.send(data.rows[0]);
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
    res.send(data.rows);
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
