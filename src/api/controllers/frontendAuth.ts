import { Request, Response, NextFunction } from "express";
import { getUserByIdQuery } from "../queries/users";
import { requireApiUser, requireProjectEditorAccess } from "./accessControl";
import { parsePositiveInt } from "./tableResourceUtils";

async function getFrontendAuthState(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireApiUser(req);
    const userData = await getUserByIdQuery(userId);
    const user = userData.rows[0];
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    const scopeProjectId = parsePositiveInt(req.query.project_id, "project_id", {
      required: false,
    });

    let projectId: string | null = null;
    let canUseLibraryPacks = !!user.is_pro;
    let scopeName = String(user.username || "").trim() || "My Library";
    let scopeType: "user" | "project" = "user";

    if (scopeProjectId) {
      const role = await requireProjectEditorAccess(req, scopeProjectId);
      projectId = String(role.project.id);
      canUseLibraryPacks = !!role.project?.is_pro;
      scopeName = String(role.project?.title || "").trim() || "Wyrld Library";
      scopeType = "project";
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send({
      user_id: String(userId),
      project_id: projectId,
      user_is_pro: !!user.is_pro,
      can_use_library_packs: canUseLibraryPacks,
      scope_name: scopeName,
      scope_type: scopeType,
    });
  } catch (err) {
    return next(err);
  }
}

export { getFrontendAuthState };
