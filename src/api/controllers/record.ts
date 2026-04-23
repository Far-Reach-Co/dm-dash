import { Request, Response, NextFunction } from "express";
import {
  addRecordByProjectQuery,
  addRecordByUserQuery,
  editRecordQuery,
  getRecordsByProjectQuery,
  getRecordsByUserQuery,
  removeRecordQuery,
  Record as RecordRow,
} from "../queries/record";
import { getRecordImagesByRecordQuery } from "../queries/recordImage";
import { logEventAsync, EventType } from "../../lib/eventLogger";
import { deleteImagesIfOrphaned } from "../../lib/imageLifecycle";
import {
  getRecordOrThrow,
  requireApiUser,
  requireProjectEditorAccess,
  requireProjectMemberAccess,
  requireRecordEditAccess,
  requireRecordViewAccess,
} from "./accessControl";
import { cleanupDeletedImageAssets } from "./imageCleanup";

interface RecordMutationBody {
  title: string;
  description: string;
  is_public: boolean;
}

interface addRecordByUserRequest extends Request {
  body: RecordMutationBody;
}

interface addRecordByProjectRequest extends Request {
  body: RecordMutationBody;
}

type RecordScope =
  | { kind: "user"; userId: string | number }
  | { kind: "project"; userId: string | number; projectId: string | number };

type RecordOwnerScope =
  | { type: "user"; userId: string | number }
  | { type: "project"; projectId: string | number }
  | null;

function buildRecordCreatePayload(body: RecordMutationBody) {
  return {
    title: body.title,
    description: body.description,
    is_public: !!body.is_public,
  };
}

function buildRecordEditPayload(body: Request["body"]) {
  const payload: Record<string, unknown> = {};
  if (typeof body.title !== "undefined") payload.title = body.title;
  if (typeof body.description !== "undefined") {
    payload.description = body.description;
  }
  if (typeof body.is_public !== "undefined") {
    payload.is_public =
      body.is_public === true ||
      body.is_public === "true" ||
      body.is_public === "on";
  }
  return payload;
}

function logRecordCreated(
  req: Request,
  scope: RecordScope,
  record: { id: number | string; title: string },
) {
  logEventAsync({
    userId: scope.userId,
    projectId: scope.kind === "project" ? scope.projectId : undefined,
    eventType: EventType.RECORD_CREATED,
    eventData: { recordId: record.id, title: record.title },
    req,
  });
}

async function createRecordForScope(
  req: Request,
  scope: RecordScope,
  body: RecordMutationBody,
) {
  const payload = buildRecordCreatePayload(body);
  const data =
    scope.kind === "project"
      ? await addRecordByProjectQuery({
          project_id: scope.projectId,
          ...payload,
        })
      : await addRecordByUserQuery({
          user_id: scope.userId,
          ...payload,
        });
  const record = data.rows[0];
  logRecordCreated(req, scope, record);
  return record;
}

async function getRecordListForScope(scope: RecordScope) {
  if (scope.kind === "project") {
    return (await getRecordsByProjectQuery(scope.projectId)).rows;
  }
  return (await getRecordsByUserQuery(scope.userId)).rows;
}

function resolveRecordOwnerScope(record: RecordRow): RecordOwnerScope {
  if (record.project_id) {
    return {
      type: "project",
      projectId: record.project_id,
    };
  }
  if (record.user_id) {
    return {
      type: "user",
      userId: record.user_id,
    };
  }
  return null;
}

async function removeRecordWithOrphanCleanup(record: RecordRow) {
  const recordImageData = await getRecordImagesByRecordQuery(record.id);
  const imageIds = recordImageData.rows.map((recordImage) => recordImage.image_id);

  await removeRecordQuery(record.id);

  const ownerScope = resolveRecordOwnerScope(record);
  const deletedImages = await deleteImagesIfOrphaned({
    imageIds,
    ownerScope,
  });
  await cleanupDeletedImageAssets(deletedImages);
}

async function resolveUserRecordScope(req: Request): Promise<RecordScope> {
  return {
    kind: "user",
    userId: requireApiUser(req),
  };
}

async function resolveProjectRecordScope(req: Request): Promise<RecordScope> {
  const userId = requireApiUser(req);
  await requireProjectEditorAccess(req, req.params.project_id);
  return {
    kind: "project",
    userId,
    projectId: req.params.project_id,
  };
}

async function resolveProjectRecordReadScope(req: Request): Promise<RecordScope> {
  const userId = requireApiUser(req);
  await requireProjectMemberAccess(req, req.params.project_id);
  return {
    kind: "project",
    userId,
    projectId: req.params.project_id,
  };
}

async function addRecordByUser(
  req: addRecordByUserRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const scope = await resolveUserRecordScope(req);
    const record = await createRecordForScope(req, scope, req.body);
    res.status(201).send(record);
  } catch (err) {
    next(err);
  }
}

async function addRecordByProject(
  req: addRecordByProjectRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const scope = await resolveProjectRecordScope(req);
    const record = await createRecordForScope(req, scope, req.body);
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
    const scope = await resolveUserRecordScope(req);
    const records = await getRecordListForScope(scope);
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
    const scope = await resolveProjectRecordReadScope(req);
    const records = await getRecordListForScope(scope);
    res.send(records);
  } catch (err) {
    next(err);
  }
}

async function editRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const existingRecord = await getRecordOrThrow(req.params.id);
    await requireRecordEditAccess(req, existingRecord);
    const payload = buildRecordEditPayload(req.body);
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
    await removeRecordWithOrphanCleanup(record);

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
  removeRecordWithOrphanCleanup,
};
