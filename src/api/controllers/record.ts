import { Request, Response, NextFunction } from "express";
import {
  addRecordByProjectQuery,
  addRecordByUserQuery,
  editRecordQuery,
  getRecordQuery,
  removeRecordQuery,
} from "../queries/record";

interface addRecordByUserRequest extends Request {
  body: {
    user_id: string | number;
  };
}

async function addRecordByUser(
  req: addRecordByUserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await addRecordByUserQuery(req.body.user_id);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

interface addRecordByProjectRequest extends Request {
  body: {
    project_id: string | number;
  };
}

async function addRecordByProject(
  req: addRecordByProjectRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await addRecordByProjectQuery(req.body.project_id);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const recordData = await getRecordQuery(req.params.id);
    const record = recordData.rows[0];

    res.send(record);
  } catch (err) {
    next(err);
  }
}

async function editRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editRecordQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function removeRecord(req: Request, res: Response, next: NextFunction) {
  try {
    await removeRecordQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export {
  addRecordByProject,
  addRecordByUser,
  getRecord,
  editRecord,
  removeRecord,
};
