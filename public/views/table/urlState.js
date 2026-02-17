export function parseInitialTableRoute(search = window.location.search) {
  const searchParams = new URLSearchParams(search);
  const tableUUID = searchParams.get("uuid");
  const guestUUID = searchParams.get("guest_uuid");

  return {
    tableUUID: tableUUID || guestUUID,
    isGuestSandbox: !tableUUID && Boolean(guestUUID),
  };
}

export function getTableViewEndpoint(tableId, isGuestSandbox) {
  return isGuestSandbox
    ? `/api/get_guest_sandbox/${tableId}`
    : `/api/get_table_view_by_uuid/${tableId}`;
}

export function buildTableUrl({
  tableUUID,
  isGuestSandbox,
  pathname = window.location.pathname,
  search = window.location.search,
}) {
  const searchParams = new URLSearchParams(search);
  if (isGuestSandbox) {
    searchParams.delete("uuid");
    searchParams.set("guest_uuid", tableUUID);
  } else {
    searchParams.delete("guest_uuid");
    searchParams.set("uuid", tableUUID);
  }

  return `${pathname}?${searchParams.toString()}`;
}

export function createGuestFallbackUser() {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return { username: `user-${randomNumber}` };
}
