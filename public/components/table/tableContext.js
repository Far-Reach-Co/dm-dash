export function getProjectIdFromLocation(search = window.location.search) {
  const searchParams = new URLSearchParams(search);
  return searchParams.get("project");
}

export function buildTableViewQuerySuffix(tableViewId) {
  return tableViewId ? `?table_view_id=${tableViewId}` : "";
}
