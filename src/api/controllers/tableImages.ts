import {
  addTableImageQuery,
  getTableImagesQuery,
  getTableImageQuery,
  removeTableImageQuery,
  editTableImageQuery,
} from "../queries/tableImages";
import { Request, Response, NextFunction } from "express";

async function addTableImage(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await addTableImageQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getTableImages(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getTableImagesQuery(req.params.project_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeTableImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await removeTableImageQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editTableImage(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editTableImageQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export { getTableImages, addTableImage, removeTableImage, editTableImage };
