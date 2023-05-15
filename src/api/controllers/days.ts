import {
  addDayQuery,
  getDaysQuery,
  getDayQuery,
  removeDayQuery,
  editDayQuery,
} from "../queries/days";
import { Request, Response, NextFunction } from "express";

async function addDay(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await addDayQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getDays(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getDaysQuery(req.params.calendar_id);
    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeDay(req: Request, res: Response, next: NextFunction) {
  try {
    await removeDayQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editDay(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editDayQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export { getDays, addDay, removeDay, editDay };
