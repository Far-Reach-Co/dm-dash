import {
  addClockQuery,
  getClocksQuery,
  getClockQuery,
  removeClockQuery,
  editClockQuery,
} from "../queries/clocks";
import { Request, Response, NextFunction } from "express";

async function addClock(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await addClockQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getClocks(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getClocksQuery(req.params.project_id);

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeClock(req: Request, res: Response, next: NextFunction) {
  try {
    await removeClockQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editClock(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editClockQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export { getClocks, addClock, removeClock, editClock };
