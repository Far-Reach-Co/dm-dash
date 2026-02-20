import {
  getTableViewsByProjectQuery,
  removeTableViewQuery,
  editTableViewQuery,
  addTableViewByProjectQuery,
  addTableViewByUserQuery,
  getTableViewsByUserQuery,
} from "../queries/tableViews.js";
import { Request, Response, NextFunction } from "express";
import { userSubscriptionStatus } from "../../lib/enums.js";
import { getUserByIdQuery } from "../queries/users.js";
import { getProjectQuery } from "../queries/projects.js";
import { logEventAsync, EventType } from "../../lib/eventLogger";
import {
  assertTableCapability,
  buildTableCapabilities,
  normalizeTableMode,
  parseRequestedTableMode,
  requireTablePermission,
  withTableCapabilities,
} from "../../lib/tableAuthz";
import { getProjectAccess, requireProjectEditor } from "../../lib/authz";
import {
  forbiddenError,
  getTableViewByUUIDOrThrow,
  requireTablePermissionById,
} from "./tableResourceUtils";

function getTitle(value: unknown) {
  if (typeof value === "string" && value.trim()) return value.trim();
  return "New Campaign";
}

function parseIsPublic(value: unknown) {
  if (typeof value === "boolean") return value;
  if (value === "on" || value === "true") return true;
  if (value === "off" || value === "false") return false;
  return null;
}

function sanitizeTablePatch(body: any) {
  const payload: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) {
    payload.title = body.title.trim();
  }
  const isPublic = parseIsPublic(body.is_public);
  if (isPublic !== null) payload.is_public = isPublic;
  if (typeof body.mode !== "undefined") {
    payload.mode = parseRequestedTableMode(body.mode);
  }
  return payload;
}

async function addTableViewByProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    await requireProjectEditor(req, req.params.project_id);

    const tableViewsData = await getTableViewsByProjectQuery(
      req.params.project_id
    );
    if (tableViewsData.rows.length >= 10) {
      const projectData = await getProjectQuery(req.params.project_id);
      if (!projectData.rows[0].is_pro) {
        throw { status: 402, message: userSubscriptionStatus.projectIsNotPro };
      }
    }

    const title = getTitle(req.body.title);
    const mode = parseRequestedTableMode(req.body.mode);
    const data = await addTableViewByProjectQuery({
      title,
      project_id: req.params.project_id,
      mode,
    });
    // Log table creation event
    logEventAsync({
      userId: req.session.user,
      projectId: req.params.project_id,
      eventType: EventType.TABLE_CREATED,
      eventData: { tableId: data.rows[0].id, title },
      req,
    });
    res.status(201).json({
      redirect: `/vtt?uuid=${data.rows[0].uuid}&project=${req.params.project_id}`,
    });
  } catch (err) {
    next(err);
  }
}

async function addTableViewByUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    const tableViewsData = await getTableViewsByUserQuery(req.session.user);
    if (tableViewsData.rows.length >= 10) {
      const userData = await getUserByIdQuery(req.session.user);
      if (!userData.rows[0].is_pro) {
        throw { status: 402, message: userSubscriptionStatus.userIsNotPro };
      }
    }
    const title = getTitle(req.body.title);
    const mode = parseRequestedTableMode(req.body.mode);
    const data = await addTableViewByUserQuery({
      user_id: req.session.user,
      title,
      mode,
    });
    // Log table creation event
    logEventAsync({
      userId: req.session.user,
      eventType: EventType.TABLE_CREATED,
      eventData: { tableId: data.rows[0].id, title },
      req,
    });
    res.status(201).json({ redirect: `/vtt?uuid=${data.rows[0].uuid}` });
  } catch (err) {
    next(err);
  }
}

async function getTableViewsByProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const access = await getProjectAccess(req, req.params.project_id);
    if (!access) {
      throw forbiddenError();
    }
    const data = await getTableViewsByProjectQuery(req.params.project_id);
    const tableRows = access.isEditor
      ? data.rows
      : data.rows.filter((row) => {
          const mode = normalizeTableMode(row.mode);
          return row.is_public || mode === "sandbox";
        });
    const response = tableRows.map((row) =>
      {
        const mode = normalizeTableMode(row.mode);
        const capabilities = buildTableCapabilities(
          mode,
          access.isEditor || mode === "sandbox",
        );
        if (mode === "sandbox" && !access.isEditor) {
          capabilities.canManageTableSettings = false;
        }
        return withTableCapabilities(row, capabilities);
      },
    );
    res.send(response);
  } catch (err) {
    next(err);
  }
}

async function getTableViewsByUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    const data = await getTableViewsByUserQuery(req.session.user);
    const response = data.rows.map((row) =>
      withTableCapabilities(
        row,
        buildTableCapabilities(normalizeTableMode(row.mode), true),
      ),
    );
    res.send(response);
  } catch (err) {
    next(err);
  }
}

async function getTableView(req: Request, res: Response, next: NextFunction) {
  try {
    const { table: tableView, auth } = await requireTablePermissionById(
      req,
      req.params.id,
      "view",
    );
    res.send(withTableCapabilities(tableView, auth.capabilities));
  } catch (err) {
    next(err);
  }
}

async function getTableViewByUUID(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tableView = await getTableViewByUUIDOrThrow(req.params.uuid);
    const auth = await requireTablePermission(req, tableView, "view");
    res.send(withTableCapabilities(tableView, auth.capabilities));
  } catch (err) {
    next(err);
  }
}

async function removeTableView(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await requireTablePermissionById(req, req.params.id, "edit");
    await removeTableViewQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editTableViewData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { auth } = await requireTablePermissionById(req, req.params.id, "view");
    assertTableCapability(auth, "canEditTableData");
    const data = await editTableViewQuery(req.params.id, {
      data: req.body.data,
    });
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function editTableView(req: Request, res: Response, next: NextFunction) {
  try {
    const { table: tableView, auth } = await requireTablePermissionById(
      req,
      req.params.id,
      "edit",
    );
    const payload = sanitizeTablePatch(req.body);
    if (!Object.keys(payload).length) {
      res.status(200).send(withTableCapabilities(tableView, auth.capabilities));
      return;
    }
    assertTableCapability(auth, "canManageTableSettings");
    const data = await editTableViewQuery(req.params.id, payload);
    const updatedMode = normalizeTableMode(data.rows[0].mode);
    const updatedCapabilities = buildTableCapabilities(updatedMode, auth.canEdit);
    res.status(200).send(
      withTableCapabilities(data.rows[0], updatedCapabilities),
    );
  } catch (err) {
    next(err);
  }
}

export {
  addTableViewByProject,
  addTableViewByUser,
  getTableViewsByUser,
  getTableViewsByProject,
  getTableViewByUUID,
  getTableView,
  removeTableView,
  editTableViewData,
  editTableView,
};
