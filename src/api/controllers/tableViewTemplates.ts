import { Request, Response, NextFunction } from "express";
import { requireProjectEditor, requireUser } from "../../lib/authz";
import { normalizeTableMode } from "../../lib/tableAuthz";
import type { TableMode } from "../../lib/tableAuthz";
import { editTableViewQuery } from "../queries/tableViews.js";
import {
  addTableViewTemplateByProjectQuery,
  addTableViewTemplateByUserQuery,
  getTableViewTemplateQuery,
  getTableViewTemplatesByProjectQuery,
  getTableViewTemplatesByUserQuery,
  removeTableViewTemplateQuery,
  TableViewTemplate,
} from "../queries/tableViewTemplates.js";
import {
  badRequestError,
  notFoundError,
  requireTablePermissionById,
} from "./tableResourceUtils.js";

function getTemplateTitle(rawTitle: unknown, fallbackTitle: string) {
  if (typeof rawTitle === "string" && rawTitle.trim()) return rawTitle.trim();
  return `${fallbackTitle} Template`;
}

function normalizeTableData(rawData: unknown): Record<string, unknown> {
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) {
    return {};
  }
  return rawData as Record<string, unknown>;
}

function mapTemplateResponse(template: TableViewTemplate) {
  return {
    ...template,
    scope: template.project_id ? "project" : "user",
  };
}

async function getTemplateByIdOrThrow(templateId: string | number) {
  const templateData = await getTableViewTemplateQuery(templateId);
  const template = templateData.rows[0];
  if (!template) throw notFoundError("Table template not found");
  return template;
}

async function assertTemplateManageAccess(req: Request, template: TableViewTemplate) {
  const userId = requireUser(req);
  if (template.user_id) {
    if (String(template.user_id) !== String(userId)) {
      throw badRequestError("Template does not belong to current user");
    }
    return;
  }
  if (template.project_id) {
    await requireProjectEditor(req, template.project_id);
    return;
  }
  throw badRequestError("Invalid template scope");
}

async function addTableViewTemplateByUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireUser(req);
    const tableViewId = req.params.table_view_id;
    const { table, auth } = await requireTablePermissionById(req, tableViewId, "view");
    if (!auth.capabilities.canManageTableSettings) {
      throw badRequestError("Insufficient permission to save table template");
    }
    if (!table.user_id || String(table.user_id) !== String(userId)) {
      throw badRequestError("Only the table owner can save user templates");
    }

    const title = getTemplateTitle(req.body?.title, table.title || "Table");
    const mode: TableMode = normalizeTableMode(table.mode);
    const tableData = normalizeTableData(table.data);

    const data = await addTableViewTemplateByUserQuery({
      user_id: userId,
      source_table_view_id: table.id,
      title,
      mode,
      table_data: tableData,
    });
    res.status(201).send(mapTemplateResponse(data.rows[0]));
  } catch (err) {
    next(err);
  }
}

async function addTableViewTemplateByProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tableViewId = req.params.table_view_id;
    const projectId = req.params.project_id;
    await requireProjectEditor(req, projectId);
    const { table, auth } = await requireTablePermissionById(req, tableViewId, "view");
    if (!auth.capabilities.canManageTableSettings) {
      throw badRequestError("Insufficient permission to save table template");
    }
    if (!table.project_id || String(table.project_id) !== String(projectId)) {
      throw badRequestError("Table does not belong to this project");
    }

    const title = getTemplateTitle(req.body?.title, table.title || "Table");
    const mode: TableMode = normalizeTableMode(table.mode);
    const tableData = normalizeTableData(table.data);

    const data = await addTableViewTemplateByProjectQuery({
      project_id: projectId,
      source_table_view_id: table.id,
      title,
      mode,
      table_data: tableData,
    });
    res.status(201).send(mapTemplateResponse(data.rows[0]));
  } catch (err) {
    next(err);
  }
}

async function getTableViewTemplatesByUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireUser(req);
    const data = await getTableViewTemplatesByUserQuery(userId);
    res.status(200).send(data.rows.map(mapTemplateResponse));
  } catch (err) {
    next(err);
  }
}

async function getTableViewTemplatesByProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await requireProjectEditor(req, req.params.project_id);
    const data = await getTableViewTemplatesByProjectQuery(req.params.project_id);
    res.status(200).send(data.rows.map(mapTemplateResponse));
  } catch (err) {
    next(err);
  }
}

async function applyTableViewTemplate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const templateId = req.params.id;
    const tableViewId = req.body?.table_view_id;
    if (!tableViewId) {
      throw badRequestError("table_view_id is required");
    }

    const template = await getTemplateByIdOrThrow(templateId);
    await assertTemplateManageAccess(req, template);

    const { table, auth } = await requireTablePermissionById(req, tableViewId, "view");
    if (!auth.capabilities.canManageTableSettings) {
      throw badRequestError("Insufficient permission to load table template");
    }

    if (template.project_id) {
      if (!table.project_id || String(table.project_id) !== String(template.project_id)) {
        throw badRequestError("Project templates can only be applied to tables in the same project");
      }
    }

    const updated = await editTableViewQuery(String(table.id), {
      data: normalizeTableData(template.data),
      mode: normalizeTableMode(template.mode),
    });
    res.status(200).send(updated.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function removeTableViewTemplate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const template = await getTemplateByIdOrThrow(req.params.id);
    await assertTemplateManageAccess(req, template);
    await removeTableViewTemplateQuery(template.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export {
  addTableViewTemplateByUser,
  addTableViewTemplateByProject,
  getTableViewTemplatesByUser,
  getTableViewTemplatesByProject,
  applyTableViewTemplate,
  removeTableViewTemplate,
};
