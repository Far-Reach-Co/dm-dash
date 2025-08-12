import { Request, Response, NextFunction } from "express";
import {
  addRecordByProjectQuery,
  addRecordByUserQuery,
  editRecordQuery,
  getRecordQuery,
  getRecordsByProjectQuery,
  getRecordsByUserQuery,
  removeRecordQuery,
} from "../queries/record";

interface addRecordByUserRequest extends Request {
  body: {
    user_id: string | number;
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
    if (!req.session.user) throw new Error("User is not logged in");
    req.body.user_id = req.session.user;

    const data = await addRecordByUserQuery({
      user_id: req.body.user_id,
      title: req.body.title,
      description: req.body.description,
      is_public: req.body.is_public ? true : false,
    });
    const record = data.rows[0];
    res
      .set("HX-Redirect", `/record?id=${record.id}`)
      .send("Form submission was successful.");
  } catch (err) {
    next(err);
  }
}

interface addRecordByProjectRequest extends Request {
  body: {
    project_id: string | number;
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
    if (!req.session.user) throw new Error("User is not logged in");
    if (!req.params.project_id) throw new Error("No project ID in params");

    const data = await addRecordByProjectQuery({
      project_id: req.params.project_id,
      title: req.body.title,
      description: req.body.description,
      is_public: req.body.is_public ? true : false,
    });
    const record = data.rows[0];
    res
      .set(
        "HX-Redirect",
        `/record?id=${record.id}&project_id=${req.params.project_id}`
      )
      .send("Form submission was successful.");
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

async function getRecordsByUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const recordData = await getRecordsByUserQuery(req.params.user_id);
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
    const recordData = await getRecordsByProjectQuery(req.params.project_id);
    const records = recordData.rows;

    res.send(records);
  } catch (err) {
    next(err);
  }
}

async function editRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await editRecordQuery(req.params.id, req.body);
    const record = data.rows[0];

    res.status(200).send(record);
  } catch (err) {
    next(err);
  }
}

async function removeRecord(req: Request, res: Response, next: NextFunction) {
  try {
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
