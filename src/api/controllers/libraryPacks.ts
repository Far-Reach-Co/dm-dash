import { Request, Response, NextFunction } from "express";
import { userSubscriptionStatus } from "../../lib/enums";
import { getSignedUrls } from "./s3";
import { getUserByIdQuery } from "../queries/users";
import { getProjectUsersQuery } from "../queries/projectUsers";
import { getProjectsQuery } from "../queries/projects";
import {
  badRequestError,
  notFoundError,
  parsePositiveInt,
} from "./tableResourceUtils";
import {
  requireApiUser,
  requireProjectEditorAccess,
  requireProjectMemberAccess,
} from "./accessControl";
import {
  ensureImageLinkedToProject,
  ensureImageLinkedToUser,
} from "./s3ImageAccess";
import {
  addLibraryPackByProjectQuery,
  addLibraryPackByUserQuery,
  addLibraryPackImageQuery,
  addLibraryPackInstallByProjectQuery,
  addLibraryPackInstallByUserQuery,
  discoverLibraryPacksQuery,
  editLibraryPackQuery,
  getInstalledLibraryPacksByProjectQuery,
  getInstalledLibraryPacksByUserQuery,
  getOwnedLibraryPacksByProjectQuery,
  getOwnedLibraryPacksByUserQuery,
  getLibraryPackMembershipsByImageForProjectQuery,
  getLibraryPackMembershipsByImageForUserQuery,
  getLibraryPackImageQuery,
  getLibraryPackImagesQuery,
  getLibraryPackQuery,
  removeLibraryPackInstallByProjectQuery,
  removeLibraryPackInstallByUserQuery,
  removeLibraryPackImageQuery,
  removeLibraryPackQuery,
  type LibraryPack,
  type LibraryPackForTable,
  type LibraryPackVisibility,
} from "../queries/libraryPacks";

interface PackScopeAccess {
  userId: string | number;
  userIsPro: boolean;
  scopeProjectId: string | number | null;
  scopeProjectIsPro: boolean;
}

interface LibraryPackWithScopeFlags extends LibraryPackForTable {
  is_locked_for_scope: boolean;
  lock_reason: string | null;
  can_install: boolean;
}

function isPackProGated(pack: Pick<LibraryPack, "visibility" | "is_pro_only">) {
  return pack.visibility === "public_pro" || !!pack.is_pro_only;
}

function hasScopeProAccess(scope: PackScopeAccess) {
  return scope.scopeProjectId ? !!scope.scopeProjectIsPro : !!scope.userIsPro;
}

function getScopeLockReason(scope: PackScopeAccess) {
  return scope.scopeProjectId
    ? userSubscriptionStatus.projectIsNotPro
    : userSubscriptionStatus.userIsNotPro;
}

function assertCanUsePackFeatureForScope(scope: PackScopeAccess) {
  if (!hasScopeProAccess(scope)) {
    throw { status: 402, message: getScopeLockReason(scope) };
  }
}

function annotatePacksForScope(
  packs: LibraryPackForTable[],
  scope: PackScopeAccess,
): LibraryPackWithScopeFlags[] {
  const hasProAccess = hasScopeProAccess(scope);
  return packs.map((pack) => {
    const isOwner = !!pack.is_owner;
    const isLockedForScope = !isOwner && isPackProGated(pack) && !hasProAccess;
    const canInstallInScope = !isOwner && !isLockedForScope;
    return {
      ...pack,
      is_locked_for_scope: isLockedForScope,
      lock_reason: isLockedForScope ? getScopeLockReason(scope) : null,
      can_install: canInstallInScope,
    };
  });
}

async function getScopeProjectAccessFromQuery(req: Request): Promise<{
  scopeProjectId: string | number | null;
  scopeProjectIsPro: boolean;
}> {
  const scopeProjectRaw =
    typeof req.query.project_id === "string" ? req.query.project_id : "";
  if (!scopeProjectRaw.trim()) {
    return { scopeProjectId: null, scopeProjectIsPro: false };
  }
  const scopeProjectId = parsePositiveInt(scopeProjectRaw, "project_id");
  const role = await requireProjectMemberAccess(req, scopeProjectId);
  return {
    scopeProjectId,
    scopeProjectIsPro: !!role.project?.is_pro,
  };
}

function parsePackVisibility(value: unknown): LibraryPackVisibility {
  if (value === "private" || value === "project" || value === "public_pro") {
    return value;
  }
  return "private";
}

function getPackTitle(value: unknown) {
  if (typeof value === "string" && value.trim()) return value.trim();
  throw badRequestError("title is required");
}

function parsePackTags(value: unknown): string[] {
  const rawList =
    typeof value === "string"
      ? value.split(",")
      : Array.isArray(value)
        ? value
        : [];

  const normalized = rawList
    .map((entry) => String(entry || "").trim().toLowerCase())
    .filter(Boolean)
    .map((entry) => entry.slice(0, 40));

  return Array.from(new Set(normalized)).slice(0, 20);
}

async function getLibraryPackByIdOrThrow(packId: string | number) {
  const data = await getLibraryPackQuery(packId);
  const pack = data.rows[0];
  if (!pack) throw notFoundError("Library pack not found");
  return pack;
}

async function assertCanEditLibraryPack(req: Request, pack: LibraryPack) {
  if (pack.owner_user_id) {
    const userId = requireApiUser(req);
    if (String(pack.owner_user_id) !== String(userId)) {
      throw { status: 403, message: "Forbidden" };
    }
    return;
  }
  if (pack.owner_project_id) {
    await requireProjectEditorAccess(req, pack.owner_project_id);
    return;
  }
  throw { status: 403, message: "Forbidden" };
}

async function canViewLibraryPack(
  req: Request,
  pack: LibraryPack,
  scope: PackScopeAccess,
) {
  if (pack.owner_user_id && String(pack.owner_user_id) === String(scope.userId)) {
    return true;
  }

  if (pack.owner_project_id) {
    try {
      await requireProjectMemberAccess(req, pack.owner_project_id);
      return true;
    } catch {
      // continue
    }
  }

  if (
    pack.visibility === "public_pro" &&
    pack.is_published &&
    (!pack.is_pro_only || hasScopeProAccess(scope))
  ) {
    return true;
  }

  return false;
}

async function addLibraryPackByUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireApiUser(req);
    const userData = await getUserByIdQuery(userId);
    const user = userData.rows[0];
    if (!user?.is_pro) {
      throw { status: 402, message: userSubscriptionStatus.userIsNotPro };
    }

    const visibility = parsePackVisibility(req.body.visibility);
    const data = await addLibraryPackByUserQuery({
      owner_user_id: userId,
      title: getPackTitle(req.body.title),
      description: typeof req.body.description === "string" ? req.body.description : "",
      tags: parsePackTags(req.body.tags),
      visibility,
      is_pro_only: true,
      is_published: !!req.body.is_published,
    });
    res.status(201).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function addLibraryPackByProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const role = await requireProjectEditorAccess(req, req.params.project_id);
    if (!role.project?.is_pro) {
      throw { status: 402, message: userSubscriptionStatus.projectIsNotPro };
    }

    const visibility =
      parsePackVisibility(req.body.visibility) === "private"
        ? "project"
        : parsePackVisibility(req.body.visibility);

    const data = await addLibraryPackByProjectQuery({
      owner_project_id: req.params.project_id,
      title: getPackTitle(req.body.title),
      description: typeof req.body.description === "string" ? req.body.description : "",
      tags: parsePackTags(req.body.tags),
      visibility,
      is_pro_only: true,
      is_published: !!req.body.is_published,
    });
    res.status(201).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function editLibraryPack(req: Request, res: Response, next: NextFunction) {
  try {
    const pack = await getLibraryPackByIdOrThrow(req.params.id);
    await assertCanEditLibraryPack(req, pack);

    const payload: Record<string, unknown> = {};
    if (typeof req.body.title === "string" && req.body.title.trim()) {
      payload.title = req.body.title.trim();
    }
    if (typeof req.body.description === "string") {
      payload.description = req.body.description;
    }
    if (typeof req.body.tags !== "undefined") {
      payload.tags = parsePackTags(req.body.tags);
    }
    if (typeof req.body.visibility !== "undefined") {
      payload.visibility = parsePackVisibility(req.body.visibility);
    }
    if (typeof req.body.is_published !== "undefined") {
      payload.is_published = !!req.body.is_published;
    }

    if (!Object.keys(payload).length) {
      res.status(200).send(pack);
      return;
    }

    const data = await editLibraryPackQuery(req.params.id, payload);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function removeLibraryPack(req: Request, res: Response, next: NextFunction) {
  try {
    const pack = await getLibraryPackByIdOrThrow(req.params.id);
    await assertCanEditLibraryPack(req, pack);
    const data = await removeLibraryPackQuery(req.params.id);
    res.status(200).send(data.rows[0] || { removed: true });
  } catch (err) {
    next(err);
  }
}

async function addLibraryPackImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const pack = await getLibraryPackByIdOrThrow(req.body.pack_id);
    await assertCanEditLibraryPack(req, pack);

    const imageId = parsePositiveInt(req.body.image_id, "image_id");
    if (pack.owner_project_id) {
      await ensureImageLinkedToProject(imageId, pack.owner_project_id);
    } else if (pack.owner_user_id) {
      await ensureImageLinkedToUser(imageId, pack.owner_user_id);
    } else {
      throw { status: 403, message: "Forbidden" };
    }

    const data = await addLibraryPackImageQuery({
      pack_id: pack.id,
      image_id: imageId,
      sort_order:
        typeof req.body.sort_order === "number" ? req.body.sort_order : 0,
    });
    res.status(201).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function removeLibraryPackImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const packImage = (await getLibraryPackImageQuery(req.params.id)).rows[0];
    if (!packImage) throw notFoundError("Library pack image not found");

    const pack = await getLibraryPackByIdOrThrow(packImage.pack_id);
    await assertCanEditLibraryPack(req, pack);

    const data = await removeLibraryPackImageQuery(req.params.id);
    res.status(200).send(data.rows[0] || { removed: true });
  } catch (err) {
    next(err);
  }
}

async function getLibraryPackImages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireApiUser(req);
    const userData = await getUserByIdQuery(userId);
    const userIsPro = !!userData.rows[0]?.is_pro;
    const scopeProject = await getScopeProjectAccessFromQuery(req);
    const scope: PackScopeAccess = {
      userId,
      userIsPro,
      scopeProjectId: scopeProject.scopeProjectId,
      scopeProjectIsPro: scopeProject.scopeProjectIsPro,
    };
    assertCanUsePackFeatureForScope(scope);

    const pack = await getLibraryPackByIdOrThrow(req.params.pack_id);
    const canView = await canViewLibraryPack(req, pack, scope);
    if (!canView) {
      throw { status: 403, message: "Forbidden" };
    }

    const data = await getLibraryPackImagesQuery(pack.id);
    const imageRows = data.rows.map((row) => ({
      id: row.image_id,
      original_name: row.original_name,
      size: row.size,
      file_name: row.file_name,
      notes: row.notes,
      is_blocked: row.is_blocked,
    }));
    const signedUrls = await getSignedUrls(imageRows);
    const result = data.rows.map((row) => ({
      pack_image_id: row.id,
      pack_id: row.pack_id,
      image_id: row.image_id,
      sort_order: row.sort_order,
      created_at: row.created_at,
      original_name: row.original_name,
      size: row.size,
      file_name: row.file_name,
      notes: row.notes,
      is_blocked: row.is_blocked,
      id: row.image_id,
      src: signedUrls[row.image_id],
    }));

    res.status(200).send(result);
  } catch (err) {
    next(err);
  }
}

async function getLibraryPackMembershipsByImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireApiUser(req);
    const imageId = parsePositiveInt(req.params.image_id, "image_id");
    const projectIdRaw =
      typeof req.query.project_id === "string" ? req.query.project_id : "";
    const projectId = projectIdRaw.trim()
      ? parsePositiveInt(projectIdRaw, "project_id")
      : null;

    if (projectId) {
      await requireProjectEditorAccess(req, projectId);
      const data = await getLibraryPackMembershipsByImageForProjectQuery(
        projectId,
        imageId,
      );
      res.status(200).send(data.rows);
      return;
    }

    const data = await getLibraryPackMembershipsByImageForUserQuery(
      userId,
      imageId,
    );
    res.status(200).send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function discoverLibraryPacks(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireApiUser(req);
    const userData = await getUserByIdQuery(userId);
    const userIsPro = !!userData.rows[0]?.is_pro;

    const [projectUsersData, ownedProjectsData] = await Promise.all([
      getProjectUsersQuery(userId),
      getProjectsQuery(userId),
    ]);
    const projectIds = Array.from(
      new Set([
        ...projectUsersData.rows.map((row) => row.project_id),
        ...ownedProjectsData.rows.map((row) => row.id),
      ]),
    );

    const limit = Math.min(parseInt(String(req.query.limit || 50), 10) || 50, 100);
    const offset = parseInt(String(req.query.offset || 0), 10) || 0;
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const publishedOnly =
      String(req.query.published || "").toLowerCase() === "true";
    const scopeProject = await getScopeProjectAccessFromQuery(req);
    const scope: PackScopeAccess = {
      userId,
      userIsPro,
      scopeProjectId: scopeProject.scopeProjectId,
      scopeProjectIsPro: scopeProject.scopeProjectIsPro,
    };
    assertCanUsePackFeatureForScope(scope);

    const data = await discoverLibraryPacksQuery({
      userId,
      projectIds,
      scopeProjectId: scopeProject.scopeProjectId,
      includePublicPro: true,
      publishedOnly,
      q,
      limit,
      offset,
    });
    res.status(200).send(annotatePacksForScope(data.rows, scope));
  } catch (err) {
    next(err);
  }
}

async function installLibraryPackByUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireApiUser(req);
    const userData = await getUserByIdQuery(userId);
    const userIsPro = !!userData.rows[0]?.is_pro;
    const pack = await getLibraryPackByIdOrThrow(req.params.pack_id);
    const scope: PackScopeAccess = {
      userId,
      userIsPro,
      scopeProjectId: null,
      scopeProjectIsPro: false,
    };
    assertCanUsePackFeatureForScope(scope);

    const canView = await canViewLibraryPack(req, pack, scope);
    if (!canView) throw { status: 403, message: "Forbidden" };

    if (pack.owner_user_id && String(pack.owner_user_id) === String(userId)) {
      throw { status: 409, message: "Pack is already owned by this user" };
    }

    if ((pack.is_pro_only || pack.visibility === "public_pro") && !userIsPro) {
      throw { status: 402, message: userSubscriptionStatus.userIsNotPro };
    }

    const data = await addLibraryPackInstallByUserQuery({
      owner_user_id: userId,
      pack_id: req.params.pack_id,
    });
    res.status(201).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function installLibraryPackByProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const role = await requireProjectEditorAccess(req, req.params.project_id);
    const userId = requireApiUser(req);
    const userData = await getUserByIdQuery(userId);
    const userIsPro = !!userData.rows[0]?.is_pro;
    const pack = await getLibraryPackByIdOrThrow(req.params.pack_id);
    const scope: PackScopeAccess = {
      userId,
      userIsPro,
      scopeProjectId: req.params.project_id,
      scopeProjectIsPro: !!role.project?.is_pro,
    };
    assertCanUsePackFeatureForScope(scope);

    const canView = await canViewLibraryPack(req, pack, scope);
    if (!canView) throw { status: 403, message: "Forbidden" };

    if (
      pack.owner_project_id &&
      String(pack.owner_project_id) === String(req.params.project_id)
    ) {
      throw { status: 409, message: "Pack is already owned by this scope" };
    }

    if (pack.is_pro_only || pack.visibility === "public_pro") {
      if (!role.project?.is_pro) {
        throw { status: 402, message: userSubscriptionStatus.projectIsNotPro };
      }
    }

    const data = await addLibraryPackInstallByProjectQuery({
      owner_project_id: req.params.project_id,
      pack_id: req.params.pack_id,
    });
    res.status(201).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function uninstallLibraryPackByUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireApiUser(req);
    const data = await removeLibraryPackInstallByUserQuery(
      userId,
      req.params.pack_id,
    );
    res.status(200).send(data.rows[0] || { removed: true });
  } catch (err) {
    next(err);
  }
}

async function uninstallLibraryPackByProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await requireProjectEditorAccess(req, req.params.project_id);
    const data = await removeLibraryPackInstallByProjectQuery(
      req.params.project_id,
      req.params.pack_id,
    );
    res.status(200).send(data.rows[0] || { removed: true });
  } catch (err) {
    next(err);
  }
}

async function getInstalledLibraryPacksByUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireApiUser(req);
    const userData = await getUserByIdQuery(userId);
    const userIsPro = !!userData.rows[0]?.is_pro;
    const scope: PackScopeAccess = {
      userId,
      userIsPro,
      scopeProjectId: null,
      scopeProjectIsPro: false,
    };
    assertCanUsePackFeatureForScope(scope);
    const data = await getInstalledLibraryPacksByUserQuery(userId);
    res.status(200).send(annotatePacksForScope(data.rows, scope));
  } catch (err) {
    next(err);
  }
}

async function getOwnedLibraryPacksByUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireApiUser(req);
    const userData = await getUserByIdQuery(userId);
    const userIsPro = !!userData.rows[0]?.is_pro;
    const scope: PackScopeAccess = {
      userId,
      userIsPro,
      scopeProjectId: null,
      scopeProjectIsPro: false,
    };
    assertCanUsePackFeatureForScope(scope);
    const data = await getOwnedLibraryPacksByUserQuery(userId);
    res.status(200).send(annotatePacksForScope(data.rows, scope));
  } catch (err) {
    next(err);
  }
}

async function getInstalledLibraryPacksByProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const role = await requireProjectMemberAccess(req, req.params.project_id);
    const userId = requireApiUser(req);
    const userData = await getUserByIdQuery(userId);
    const userIsPro = !!userData.rows[0]?.is_pro;
    const scope: PackScopeAccess = {
      userId,
      userIsPro,
      scopeProjectId: req.params.project_id,
      scopeProjectIsPro: !!role.project?.is_pro,
    };
    assertCanUsePackFeatureForScope(scope);
    const data = await getInstalledLibraryPacksByProjectQuery(
      req.params.project_id,
    );
    res.status(200).send(annotatePacksForScope(data.rows, scope));
  } catch (err) {
    next(err);
  }
}

async function getOwnedLibraryPacksByProject(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const role = await requireProjectMemberAccess(req, req.params.project_id);
    const userId = requireApiUser(req);
    const userData = await getUserByIdQuery(userId);
    const userIsPro = !!userData.rows[0]?.is_pro;
    const scope: PackScopeAccess = {
      userId,
      userIsPro,
      scopeProjectId: req.params.project_id,
      scopeProjectIsPro: !!role.project?.is_pro,
    };
    assertCanUsePackFeatureForScope(scope);
    const data = await getOwnedLibraryPacksByProjectQuery(req.params.project_id);
    res.status(200).send(annotatePacksForScope(data.rows, scope));
  } catch (err) {
    next(err);
  }
}

export {
  addLibraryPackByUser,
  addLibraryPackByProject,
  editLibraryPack,
  removeLibraryPack,
  addLibraryPackImage,
  removeLibraryPackImage,
  getLibraryPackImages,
  getLibraryPackMembershipsByImage,
  discoverLibraryPacks,
  installLibraryPackByUser,
  installLibraryPackByProject,
  uninstallLibraryPackByUser,
  uninstallLibraryPackByProject,
  getInstalledLibraryPacksByUser,
  getOwnedLibraryPacksByUser,
  getInstalledLibraryPacksByProject,
  getOwnedLibraryPacksByProject,
};
