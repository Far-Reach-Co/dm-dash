import {
  addCounterQuery,
  getCountersQuery,
  getCounterQuery,
  removeCounterQuery,
  editCounterQuery,
} from "../queries/counters";
import { Request, Response, NextFunction } from "express";

async function addCounter(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await addCounterQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getCounters(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getCountersQuery(req.user.id, req.params.project_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeCounter(req: Request, res: Response, next: NextFunction) {
  try {
    await removeCounterQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editCounter(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editCounterQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export { getCounters, addCounter, removeCounter, editCounter };
