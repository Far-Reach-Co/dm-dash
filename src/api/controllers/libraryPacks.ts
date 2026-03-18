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

type ProjectScopeAccessMode = "member" | "editor";

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

async function getPackActorContext(req: Request): Promise<{
  userId: string | number;
  userIsPro: boolean;
}> {
  const userId = requireApiUser(req);
  const userData = await getUserByIdQuery(userId);
  return {
    userId,
    userIsPro: !!userData.rows[0]?.is_pro,
  };
}

async function buildUserPackScope(req: Request): Promise<PackScopeAccess> {
  const actor = await getPackActorContext(req);
  return {
    ...actor,
    scopeProjectId: null,
    scopeProjectIsPro: false,
  };
}

async function buildProjectPackScope(
  req: Request,
  projectId: string | number,
  accessMode: ProjectScopeAccessMode = "member",
) {
  const actor = await getPackActorContext(req);
  const role =
    accessMode === "editor"
      ? await requireProjectEditorAccess(req, projectId)
      : await requireProjectMemberAccess(req, projectId);

  return {
    role,
    scope: {
      ...actor,
      scopeProjectId: projectId,
      scopeProjectIsPro: !!role.project?.is_pro,
    } satisfies PackScopeAccess,
  };
}

async function buildPackScopeFromQuery(req: Request): Promise<PackScopeAccess> {
  const actor = await getPackActorContext(req);
  const scopeProjectRaw =
    typeof req.query.project_id === "string" ? req.query.project_id : "";
  if (!scopeProjectRaw.trim()) {
    return {
      ...actor,
      scopeProjectId: null,
      scopeProjectIsPro: false,
    };
  }

  const scopeProjectId = parsePositiveInt(scopeProjectRaw, "project_id");
  const role = await requireProjectMemberAccess(req, scopeProjectId);
  return {
    ...actor,
    scopeProjectId,
    scopeProjectIsPro: !!role.project?.is_pro,
  };
}

async function requireUserPackScope(req: Request) {
  const scope = await buildUserPackScope(req);
  assertCanUsePackFeatureForScope(scope);
  return scope;
}

async function requireProjectPackScope(
  req: Request,
  projectId: string | number,
  accessMode: ProjectScopeAccessMode = "member",
) {
  const access = await buildProjectPackScope(req, projectId, accessMode);
  assertCanUsePackFeatureForScope(access.scope);
  return access;
}

async function requireQueryPackScope(req: Request) {
  const scope = await buildPackScopeFromQuery(req);
  assertCanUsePackFeatureForScope(scope);
  return scope;
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

function getPackDescription(value: unknown) {
  return typeof value === "string" ? value : "";
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

async function getEditableLibraryPackOrThrow(
  req: Request,
  packId: string | number,
) {
  const pack = await getLibraryPackByIdOrThrow(packId);
  await assertCanEditLibraryPack(req, pack);
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

async function getViewableLibraryPackOrThrow(
  req: Request,
  packId: string | number,
  scope: PackScopeAccess,
) {
  const pack = await getLibraryPackByIdOrThrow(packId);
  const canView = await canViewLibraryPack(req, pack, scope);
  if (!canView) throw { status: 403, message: "Forbidden" };
  return pack;
}

function getCreatePackVisibility(
  value: unknown,
  ownerType: "user" | "project",
): LibraryPackVisibility {
  const visibility = parsePackVisibility(value);
  if (ownerType === "project" && visibility === "private") {
    return "project";
  }
  return visibility;
}

function buildCreatePackInput(
  body: Request["body"],
  ownerType: "user" | "project",
) {
  return {
    title: getPackTitle(body.title),
    description: getPackDescription(body.description),
    tags: parsePackTags(body.tags),
    visibility: getCreatePackVisibility(body.visibility, ownerType),
    is_pro_only: true,
    is_published: !!body.is_published,
  };
}

function buildEditPackPayload(body: Request["body"]) {
  const payload: Record<string, unknown> = {};
  if (typeof body.title === "string" && body.title.trim()) {
    payload.title = body.title.trim();
  }
  if (typeof body.description === "string") {
    payload.description = body.description;
  }
  if (typeof body.tags !== "undefined") {
    payload.tags = parsePackTags(body.tags);
  }
  if (typeof body.visibility !== "undefined") {
    payload.visibility = parsePackVisibility(body.visibility);
  }
  if (typeof body.is_published !== "undefined") {
    payload.is_published = !!body.is_published;
  }
  return payload;
}

function assertPackNotAlreadyOwnedByScope(
  pack: LibraryPack,
  scope: PackScopeAccess,
) {
  if (scope.scopeProjectId) {
    if (
      pack.owner_project_id &&
      String(pack.owner_project_id) === String(scope.scopeProjectId)
    ) {
      throw { status: 409, message: "Pack is already owned by this scope" };
    }
    return;
  }

  if (pack.owner_user_id && String(pack.owner_user_id) === String(scope.userId)) {
    throw { status: 409, message: "Pack is already owned by this user" };
  }
}

function assertPackInstallableForScope(
  pack: LibraryPack,
  scope: PackScopeAccess,
) {
  assertPackNotAlreadyOwnedByScope(pack, scope);

  if (isPackProGated(pack) && !hasScopeProAccess(scope)) {
    throw { status: 402, message: getScopeLockReason(scope) };
  }
}

async function getDiscoverableProjectIds(userId: string | number) {
  const [projectUsersData, ownedProjectsData] = await Promise.all([
    getProjectUsersQuery(userId),
    getProjectsQuery(userId),
  ]);

  return Array.from(
    new Set([
      ...projectUsersData.rows.map((row) => row.project_id),
      ...ownedProjectsData.rows.map((row) => row.id),
    ]),
  );
}

async function addLibraryPackByUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const scope = await requireUserPackScope(req);
    const data = await addLibraryPackByUserQuery({
      owner_user_id: scope.userId,
      ...buildCreatePackInput(req.body, "user"),
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
    await requireProjectPackScope(req, req.params.project_id, "editor");
    const data = await addLibraryPackByProjectQuery({
      owner_project_id: req.params.project_id,
      ...buildCreatePackInput(req.body, "project"),
    });
    res.status(201).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function editLibraryPack(req: Request, res: Response, next: NextFunction) {
  try {
    const pack = await getEditableLibraryPackOrThrow(req, req.params.id);
    const payload = buildEditPackPayload(req.body);

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
    await getEditableLibraryPackOrThrow(req, req.params.id);
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
    const pack = await getEditableLibraryPackOrThrow(req, req.body.pack_id);

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

    await getEditableLibraryPackOrThrow(req, packImage.pack_id);

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
    const scope = await requireQueryPackScope(req);
    const pack = await getViewableLibraryPackOrThrow(
      req,
      req.params.pack_id,
      scope,
    );

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
    const imageId = parsePositiveInt(req.params.image_id, "image_id");
    const userId = requireApiUser(req);
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
    const scope = await requireQueryPackScope(req);
    const projectIds = await getDiscoverableProjectIds(scope.userId);
    const limit = Math.min(parseInt(String(req.query.limit || 50), 10) || 50, 100);
    const offset = parseInt(String(req.query.offset || 0), 10) || 0;
    const q = typeof req.query.q === "string" ? req.query.q : "";
    const publishedOnly =
      String(req.query.published || "").toLowerCase() === "true";

    const data = await discoverLibraryPacksQuery({
      userId: scope.userId,
      projectIds,
      scopeProjectId: scope.scopeProjectId,
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
    const scope = await requireUserPackScope(req);
    const pack = await getViewableLibraryPackOrThrow(
      req,
      req.params.pack_id,
      scope,
    );
    assertPackInstallableForScope(pack, scope);

    const data = await addLibraryPackInstallByUserQuery({
      owner_user_id: scope.userId,
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
    const { scope } = await requireProjectPackScope(
      req,
      req.params.project_id,
      "editor",
    );
    const pack = await getViewableLibraryPackOrThrow(
      req,
      req.params.pack_id,
      scope,
    );
    assertPackInstallableForScope(pack, scope);

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
    const scope = await requireUserPackScope(req);
    const data = await getInstalledLibraryPacksByUserQuery(scope.userId);
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
    const scope = await requireUserPackScope(req);
    const data = await getOwnedLibraryPacksByUserQuery(scope.userId);
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
    const { scope } = await requireProjectPackScope(
      req,
      req.params.project_id,
      "member",
    );
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
    const { scope } = await requireProjectPackScope(
      req,
      req.params.project_id,
      "member",
    );
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
