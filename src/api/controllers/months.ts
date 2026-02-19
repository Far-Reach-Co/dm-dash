import { Request, Response, NextFunction } from "express";
import {
  addMonthQuery,
  getMonthsQuery,
  removeMonthQuery,
  editMonthQuery,
} from "../queries/months.js";
import {
  requireProjectEditorAccess,
  requireProjectMemberAccess,
  resolveProjectIdByCalendarId,
  resolveProjectIdByMonthId,
} from "./accessControl";

async function addMonth(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = await resolveProjectIdByCalendarId(req.body.calendar_id);
    await requireProjectEditorAccess(req, projectId);
    const data = await addMonthQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getMonths(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = await resolveProjectIdByCalendarId(req.params.calendar_id);
    await requireProjectMemberAccess(req, projectId);
    const data = await getMonthsQuery(req.params.calendar_id);
    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeMonth(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = await resolveProjectIdByMonthId(req.params.id);
    await requireProjectEditorAccess(req, projectId);
    await removeMonthQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editMonth(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = await resolveProjectIdByMonthId(req.params.id);
    await requireProjectEditorAccess(req, projectId);
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
