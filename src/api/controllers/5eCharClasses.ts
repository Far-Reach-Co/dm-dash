import {
  add5eCharClassQuery,
  get5eCharClassQuery,
  get5eCharClassesByGeneralQuery,
  remove5eCharClassQuery,
  edit5eCharClassQuery,
} from "../queries/5eCharClasses";
import { Request, Response, NextFunction } from "express";
import { requireSheetEditAccess, requireSheetViewAccess } from "./accessControl";

interface add5eCharClassRequest extends Request {
  body: {
    general_id: number | string;
  };
}

async function add5eCharClass(
  req: add5eCharClassRequest,
  res: Response,
  next: NextFunction
) {
  try {
    await requireSheetEditAccess(req, req.body.general_id);
    const data = await add5eCharClassQuery({ general_id: req.body.general_id });
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function get5eCharClassesByGeneral(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await requireSheetViewAccess(req, req.params.general_id);
    const data = await get5eCharClassesByGeneralQuery(req.params.general_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function remove5eCharClass(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const classData = await get5eCharClassQuery(req.params.id);
    const classItem = classData.rows[0];
    if (!classItem) throw { status: 404, message: "Class not found" };
    await requireSheetEditAccess(req, classItem.general_id);

    await remove5eCharClassQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function edit5eCharClass(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const classData = await get5eCharClassQuery(req.params.id);
    const classItem = classData.rows[0];
    if (!classItem) throw { status: 404, message: "Class not found" };
    await requireSheetEditAccess(req, classItem.general_id);

    // If the "id" field is found, throw an error
    if (req.body.hasOwnProperty("id")) {
      throw new Error('Request body cannot contain the "id" field');
    }
    if (req.body.hasOwnProperty("general_id")) {
      throw new Error('Request body cannot contain the "general_id" field');
    }
    const data = await edit5eCharClassQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  get5eCharClassesByGeneral,
  add5eCharClass,
  remove5eCharClass,
  edit5eCharClass,
};
