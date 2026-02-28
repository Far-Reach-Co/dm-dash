function normalizeId(value) {
  if (value === null || typeof value === "undefined") return null;
  const stringValue = String(value).trim();
  return stringValue ? stringValue : null;
}

function normalizeAuthState(payload) {
  const rawScopeName = payload?.scope_name ?? payload?.scopeName;
  const scopeName =
    typeof rawScopeName === "string" && rawScopeName.trim()
      ? rawScopeName.trim()
      : "My Library";
  const rawScopeType = payload?.scope_type ?? payload?.scopeType;
  const scopeType = rawScopeType === "project" ? "project" : "user";

  return {
    userId: normalizeId(payload?.user_id ?? payload?.userId),
    projectId: normalizeId(payload?.project_id ?? payload?.projectId),
    userIsPro: !!(payload?.user_is_pro ?? payload?.userIsPro),
    canUseLibraryPacks: !!(
      payload?.can_use_library_packs ?? payload?.canUseLibraryPacks
    ),
    scopeName,
    scopeType,
  };
}

let state = normalizeAuthState(null);
let loadedScopeKey = null;
let inFlight = null;

function getScopeKey(projectId) {
  const normalizedProjectId = normalizeId(projectId);
  return normalizedProjectId ? `project:${normalizedProjectId}` : "user";
}

function buildEndpoint(projectId) {
  const normalizedProjectId = normalizeId(projectId);
  if (!normalizedProjectId) {
    return "/api/get_frontend_auth_state";
  }
  const params = new URLSearchParams();
  params.set("project_id", normalizedProjectId);
  return `/api/get_frontend_auth_state?${params.toString()}`;
}

export function getFrontendAuthState() {
  return { ...state };
}

export async function loadFrontendAuthState(
  { projectId = null, force = false } = {},
) {
  const scopeKey = getScopeKey(projectId);
  if (!force && loadedScopeKey === scopeKey) {
    return getFrontendAuthState();
  }
  if (!force && inFlight && inFlight.scopeKey === scopeKey) {
    return await inFlight.promise;
  }

  const promise = (async () => {
    try {
      const res = await fetch(buildEndpoint(projectId), { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Auth state request failed with status ${res.status}`);
      }
      const data = await res.json();
      state = normalizeAuthState(data);
      loadedScopeKey = scopeKey;
      return getFrontendAuthState();
    } catch (err) {
      console.error(err);
      state = normalizeAuthState({
        project_id: normalizeId(projectId),
      });
      loadedScopeKey = scopeKey;
      return getFrontendAuthState();
    }
  })();

  inFlight = { scopeKey, promise };
  try {
    return await promise;
  } finally {
    if (inFlight && inFlight.scopeKey === scopeKey) {
      inFlight = null;
    }
  }
}
