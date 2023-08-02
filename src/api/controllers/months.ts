import { Request, Response, NextFunction } from "express";
import {
  addMonthQuery,
  getMonthsQuery,
  getMonthQuery,
  removeMonthQuery,
  editMonthQuery,
} from "../queries/months.js";

async function addMonth(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await addMonthQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getMonths(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getMonthsQuery(req.params.calendar_id);
    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeMonth(req: Request, res: Response, next: NextFunction) {
  try {
    await removeMonthQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editMonth(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.body.title) {
      delete req.body.title;
    }
    const data = await editMonthQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export { getMonths, addMonth, removeMonth, editMonth };
