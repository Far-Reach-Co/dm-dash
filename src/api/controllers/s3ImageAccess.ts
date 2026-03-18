import { Request } from "express";
import {
  getTableImagesByImageQuery,
  getTableImagesByProjectQuery,
  getTableImagesByUserQuery,
} from "../queries/tableImages";
import {
  isImageInInstalledPacksByProjectQuery,
  isImageInInstalledPacksByUserQuery,
} from "../queries/libraryPacks";
import { requireGuestSandboxAccess } from "../../lib/guestSandbox.js";
import {
  badRequestError,
  forbiddenError,
  getOptionalTableEditAuth,
  notFoundError,
  parsePositiveInt,
  requireTablePermissionById,
} from "./tableResourceUtils";
import { getProjectRole, requireApiUser } from "./accessControl";

export async function getOptionalTableAuthForImageMutation(req: Request) {
  return await getOptionalTableEditAuth(req, "canManageImageAssets");
}

export async function ensureImageLinkedToProject(
  imageId: string | number,
  projectId: string | number,
) {
  const rows = (await getTableImagesByProjectQuery(projectId)).rows;
  const linked = rows.some(
    (row) => String(row.image_id) === String(imageId),
  );
  if (!linked) throw notFoundError("Image not found in this project");
}

export async function ensureImageLinkedToUser(
  imageId: string | number,
  userId: string | number,
) {
  const rows = (await getTableImagesByUserQuery(userId)).rows;
  const linked = rows.some(
    (row) => String(row.image_id) === String(imageId),
  );
  if (!linked) throw notFoundError("Image not found in your library");
}

async function ensureImageEditableWithoutTableContext(
  req: Request,
  imageId: string | number,
) {
  const userId = requireApiUser(req);
  const tableImages = (await getTableImagesByImageQuery(imageId)).rows;
  if (!tableImages.length) throw notFoundError("Image not found");

  const checkedProjects = new Map<string, boolean>();
  for (const tableImage of tableImages) {
    if (tableImage.user_id) {
      if (String(tableImage.user_id) === String(userId)) return;
      continue;
    }
    if (!tableImage.project_id) continue;
    const key = String(tableImage.project_id);
    if (!checkedProjects.has(key)) {
      const access = await getProjectRole(req, tableImage.project_id);
      checkedProjects.set(key, access.isEditor);
    }
    if (checkedProjects.get(key)) return;
  }

  throw forbiddenError();
}

export async function ensureImageEditableWithOptionalTableContext(
  req: Request,
  imageId: string | number,
) {
  const tableAuth = await getOptionalTableAuthForImageMutation(req);
  if (!tableAuth) {
    await ensureImageEditableWithoutTableContext(req, imageId);
    return;
  }

  if (tableAuth.table.project_id) {
    await ensureImageLinkedToProject(imageId, tableAuth.table.project_id);
    return;
  }

  if (tableAuth.table.user_id) {
    await ensureImageLinkedToUser(imageId, tableAuth.table.user_id);
    return;
  }

  throw forbiddenError();
}

function getStarterImageIdsFromRecord(record: { starter_image_ids?: unknown }) {
  if (!Array.isArray(record.starter_image_ids)) return [];
  return record.starter_image_ids
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0)
    .map((value) => Math.trunc(value));
}

export type ImageViewScope =
  | { kind: "guestSandbox"; allowedImageIds: Set<number> }
  | {
      kind: "tableProject";
      projectId: string | number;
      tableDataImageIds: Set<number>;
    }
  | {
      kind: "tableUser";
      userId: string | number;
      tableDataImageIds: Set<number>;
    }
  | { kind: "user"; userId: string | number };

function collectImageIdsFromTableData(data: unknown) {
  const imageIds = new Set<number>();
  const stack: unknown[] = [data];

  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;

    const value = current as { [key: string]: unknown };
    const imageIdRaw = value.imageId ?? value.image_id;
    const imageId = Number(imageIdRaw);
    if (Number.isFinite(imageId) && imageId > 0) {
      imageIds.add(Math.trunc(imageId));
    }

    for (const child of Object.values(value)) {
      if (child && typeof child === "object") {
        stack.push(child);
      }
    }
  }

  return imageIds;
}

export async function resolveImageViewScope(req: Request): Promise<ImageViewScope> {
  const guestUuidRaw = req.body?.guest_uuid ?? req.query?.guest_uuid;
  if (typeof guestUuidRaw !== "undefined" && guestUuidRaw !== null) {
    const guestUuid = String(guestUuidRaw).trim();
    if (!guestUuid) throw badRequestError("guest_uuid is required");
    const guestRecord = await requireGuestSandboxAccess(req, guestUuid);
    return {
      kind: "guestSandbox",
      allowedImageIds: new Set(getStarterImageIdsFromRecord(guestRecord)),
    };
  }

  const tableViewId = parsePositiveInt(
    req.body?.table_view_id ?? req.query?.table_view_id,
    "table_view_id",
    { required: false },
  );
  if (tableViewId !== null) {
    const { table } = await requireTablePermissionById(req, tableViewId, "view");
    const tableDataImageIds = collectImageIdsFromTableData(table.data);
    if (table.project_id) {
      return {
        kind: "tableProject",
        projectId: table.project_id,
        tableDataImageIds,
      };
    }
    if (table.user_id) {
      return { kind: "tableUser", userId: table.user_id, tableDataImageIds };
    }
    throw forbiddenError();
  }

  return { kind: "user", userId: requireApiUser(req) };
}

async function isImageViewableForUser(
  req: Request,
  userId: string | number,
  imageId: string | number,
) {
  const tableImages = (await getTableImagesByImageQuery(imageId)).rows;
  if (!tableImages.length) return false;

  const checkedProjects = new Map<string, boolean>();
  for (const tableImage of tableImages) {
    if (tableImage.user_id) {
      if (String(tableImage.user_id) === String(userId)) return true;
      continue;
    }
    if (!tableImage.project_id) continue;
    const key = String(tableImage.project_id);
    if (!checkedProjects.has(key)) {
      const access = await getProjectRole(req, tableImage.project_id);
      checkedProjects.set(key, access.isMember);
    }
    if (checkedProjects.get(key)) return true;
  }

  return false;
}

export async function ensureImageViewable(
  req: Request,
  imageId: string | number,
  scope: ImageViewScope,
) {
  if (scope.kind === "guestSandbox") {
    const imageIdNumber = Number(imageId);
    if (!scope.allowedImageIds.has(imageIdNumber)) {
      throw forbiddenError();
    }
    return;
  }

  if (scope.kind === "tableProject") {
    const imageIdNumber = Number(imageId);
    if (scope.tableDataImageIds.has(imageIdNumber)) return;
    const isInstalled = (
      await isImageInInstalledPacksByProjectQuery(scope.projectId, imageId)
    ).rows[0]?.is_installed_image;
    if (isInstalled) return;
    await ensureImageLinkedToProject(imageId, scope.projectId);
    return;
  }

  if (scope.kind === "tableUser") {
    const imageIdNumber = Number(imageId);
    if (scope.tableDataImageIds.has(imageIdNumber)) return;
    const isInstalled = (
      await isImageInInstalledPacksByUserQuery(scope.userId, imageId)
    ).rows[0]?.is_installed_image;
    if (isInstalled) return;
    await ensureImageLinkedToUser(imageId, scope.userId);
    return;
  }

  const isViewable = await isImageViewableForUser(req, scope.userId, imageId);
  if (!isViewable) throw forbiddenError();
}

export function getImageOrThrow(imageData: { rows: Array<any> }) {
  const image = imageData.rows[0];
  if (!image) throw notFoundError("Image not found");
  return image;
}
