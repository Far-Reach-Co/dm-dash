export function buildSheetHref(
  playerSheetId: string,
  projectId: string | null,
  inviteId: string | null,
): string {
  const params = new URLSearchParams({ id: playerSheetId });
  if (projectId) params.set("project", projectId);
  if (!projectId && inviteId) params.set("invite", inviteId);
  return `/5eplayer?${params.toString()}`;
}

export function buildExportHref(
  playerSheetId: string,
  projectId: string | null,
  inviteId: string | null,
): string {
  const params = new URLSearchParams({ id: playerSheetId });
  if (projectId) params.set("project", projectId);
  if (!projectId && inviteId) params.set("invite", inviteId);
  return `/5eplayer/export?${params.toString()}`;
}

export function buildExportJsonHref(
  playerSheetId: string,
  projectId: string | null,
  inviteId: string | null,
): string {
  const params = new URLSearchParams({ id: playerSheetId });
  if (projectId) params.set("project", projectId);
  if (!projectId && inviteId) params.set("invite", inviteId);
  return `/5eplayer/export/json?${params.toString()}`;
}

export function toSafeFilenamePart(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return normalized || "character-sheet";
}
