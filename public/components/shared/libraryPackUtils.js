import { getFrontendAuthState } from "../../lib/frontendAuthState.js";

export function getCurrentUserId() {
  const authState = getFrontendAuthState();
  return authState.userId ? String(authState.userId) : null;
}

export function getPackVisibilityLabel(pack) {
  if (pack?.visibility === "public_pro") return "Public Pro";
  if (pack?.visibility === "project") return "Wyrld";
  return "Private";
}

export function getPackTags(pack) {
  return Array.isArray(pack?.tags) ? pack.tags.filter(Boolean) : [];
}

export function formatPackTags(input, max = 6) {
  const tags = Array.isArray(input) ? input : getPackTags(input);
  if (!tags.length) return "No tags";
  return tags.slice(0, max).join(", ");
}

export function isPackLockedForScope(pack) {
  return !!pack?.is_locked_for_scope;
}

export function getPackLockLabel(pack) {
  if (pack?.lock_reason === "PROJECT_IS_NOT_PRO") return "Pro Wyrld";
  return "Pro User";
}

export function getPackLockMessage(pack) {
  if (pack?.lock_reason === "PROJECT_IS_NOT_PRO") {
    return "Requires Pro Wyrld in this scope.";
  }
  return "Requires Pro User in this scope.";
}

export function isPackOwnedByScope(
  pack,
  { projectId = null, userId = getCurrentUserId() } = {},
) {
  const scopeProjectId = projectId ? String(projectId) : null;
  if (scopeProjectId) {
    if (pack?.owner_project_id !== null && typeof pack?.owner_project_id !== "undefined") {
      return String(pack.owner_project_id) === scopeProjectId;
    }
    return false;
  }

  const scopeUserId = userId ? String(userId) : null;
  if (!scopeUserId) return false;
  if (pack?.owner_user_id !== null && typeof pack?.owner_user_id !== "undefined") {
    return String(pack.owner_user_id) === scopeUserId;
  }
  return false;
}
