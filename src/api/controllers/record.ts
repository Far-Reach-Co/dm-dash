import { Request, Response, NextFunction } from "express";
import {
  addRecordByProjectQuery,
  addRecordByUserQuery,
  editRecordQuery,
  getRecordsByProjectQuery,
  getRecordsByUserQuery,
  removeRecordQuery,
} from "../queries/record";
import { logEventAsync, EventType } from "../../lib/eventLogger";
import {
  getRecordOrThrow,
  requireApiUser,
  requireProjectEditorAccess,
  requireProjectMemberAccess,
  requireRecordEditAccess,
  requireRecordViewAccess,
} from "./accessControl";

interface addRecordByUserRequest extends Request {
  body: {
    title: string;
    description: string;
    is_public: boolean;
  };
}

async function addRecordByUser(
  req: addRecordByUserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = requireApiUser(req);

    const data = await addRecordByUserQuery({
      user_id: userId,
      title: req.body.title,
      description: req.body.description,
      is_public: req.body.is_public ? true : false,
    });
    const record = data.rows[0];
    // Log record creation event
    logEventAsync({
      userId,
      eventType: EventType.RECORD_CREATED,
      eventData: { recordId: record.id, title: record.title },
      req,
    });
    res.status(201).send(record);
  } catch (err) {
    next(err);
  }
}

interface addRecordByProjectRequest extends Request {
  body: {
    title: string;
    description: string;
    is_public: boolean;
  };
}

async function addRecordByProject(
  req: addRecordByProjectRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = requireApiUser(req);
    if (!req.params.project_id) throw new Error("No project ID in params");
    await requireProjectEditorAccess(req, req.params.project_id);

    const data = await addRecordByProjectQuery({
      project_id: req.params.project_id,
      title: req.body.title,
      description: req.body.description,
      is_public: req.body.is_public ? true : false,
    });
    const record = data.rows[0];
    // Log record creation event
    logEventAsync({
      userId,
      projectId: req.params.project_id,
      eventType: EventType.RECORD_CREATED,
      eventData: { recordId: record.id, title: record.title },
      req,
    });
    res.status(201).send(record);
  } catch (err) {
    next(err);
  }
}

async function getRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await getRecordOrThrow(req.params.id);
    await requireRecordViewAccess(req, record);
    res.send(record);
  } catch (err) {
    next(err);
  }
}

async function getRecordsByUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = requireApiUser(req);

    const recordData = await getRecordsByUserQuery(userId);
    const records = recordData.rows;

    res.send(records);
  } catch (err) {
    next(err);
  }
}

async function getRecordsByProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await requireProjectMemberAccess(req, req.params.project_id);
    const recordData = await getRecordsByProjectQuery(req.params.project_id);
    const records = recordData.rows;

    res.send(records);
  } catch (err) {
    next(err);
  }
}

async function editRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const existingRecord = await getRecordOrThrow(req.params.id);
    await requireRecordEditAccess(req, existingRecord);
    const payload: Record<string, unknown> = {};
    if (typeof req.body.title !== "undefined") payload.title = req.body.title;
    if (typeof req.body.description !== "undefined") {
      payload.description = req.body.description;
    }
    if (typeof req.body.is_public !== "undefined") {
      payload.is_public =
        req.body.is_public === true ||
        req.body.is_public === "true" ||
        req.body.is_public === "on";
    }
    const data = await editRecordQuery(req.params.id, payload);
    const record = data.rows[0];

    res.status(200).send(record);
  } catch (err) {
    next(err);
  }
}

async function removeRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await getRecordOrThrow(req.params.id);
    await requireRecordEditAccess(req, record);
    await removeRecordQuery(req.params.id);

    res.setHeader("HX-Redirect", "/dash");
    res.send();
  } catch (err) {
    next(err);
  }
}

export {
  addRecordByProject,
  addRecordByUser,
  getRecordsByUser,
  getRecordsByProject,
  getRecord,
  editRecord,
  removeRecord,
};
