import { isTableActionAllowed } from "../lib/tableAuthz";
import type { TableCapabilities } from "../lib/tableAuthz";
import { resolveTableAccessByUUID } from "../lib/tableAccessEvaluator";

const SOCKET_AUTH_CACHE_TTL_MS = 10 * 1000;

type SocketTableAuthCacheEntry = {
  expiresAt: number;
  viewAllowed: boolean;
  editAllowed: boolean;
  capabilities: TableCapabilities | null;
};

export type AuthorizeSocketTable = (
  socket: any,
  tableRoomOrUUID: string,
  mode: "view" | "edit",
  capability?: keyof TableCapabilities,
) => Promise<boolean>;

export interface SocketTableAuthTools {
  parseTableRoomToUUID: (tableRoom: unknown) => string;
  authorizeSocketTable: AuthorizeSocketTable;
  clearSocketTableAuthCacheForSocket: (socketId: string) => void;
  broadcastTableChangeToAuthorizedSockets: (
    sourceTableRoom: string,
    targetTableUUID: string,
    excludeSocketId?: string,
  ) => Promise<void>;
}

export function createSocketTableAuth(io: any): SocketTableAuthTools {
  const socketTableAuthCache = new Map<string, SocketTableAuthCacheEntry>();

  function parseTableRoomToUUID(tableRoom: unknown): string {
    if (typeof tableRoom !== "string") return "";
    return tableRoom.replace(/^table-/, "").trim();
  }

  function getSocketTableAuthCacheKey(socketId: string, tableUUID: string): string {
    return `${socketId}:${tableUUID}`;
  }

  function getSocketTableAuthCacheEntry(
    cacheKey: string,
  ): SocketTableAuthCacheEntry | null {
    const entry = socketTableAuthCache.get(cacheKey);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      socketTableAuthCache.delete(cacheKey);
      return null;
    }
    return entry;
  }

  function setSocketTableAuthCacheEntry(
    cacheKey: string,
    entry: Omit<SocketTableAuthCacheEntry, "expiresAt">,
  ): SocketTableAuthCacheEntry {
    const nextEntry: SocketTableAuthCacheEntry = {
      ...entry,
      expiresAt: Date.now() + SOCKET_AUTH_CACHE_TTL_MS,
    };
    socketTableAuthCache.set(cacheKey, nextEntry);
    return nextEntry;
  }

  function canUseSocketTableAuthEntry(
    entry: SocketTableAuthCacheEntry,
    mode: "view" | "edit",
    capability?: keyof TableCapabilities,
  ): boolean {
    return isTableActionAllowed(
      {
        canView: entry.viewAllowed,
        canEdit: entry.editAllowed,
        capabilities: entry.capabilities,
      },
      mode,
      capability,
    );
  }

  function clearSocketTableAuthCacheForSocket(socketId: string): void {
    const prefix = `${socketId}:`;
    for (const key of socketTableAuthCache.keys()) {
      if (key.startsWith(prefix)) socketTableAuthCache.delete(key);
    }
  }

  const authorizeSocketTable: AuthorizeSocketTable = async (
    socket: any,
    tableRoomOrUUID: string,
    mode: "view" | "edit",
    capability?: keyof TableCapabilities,
  ) => {
    const tableUUID = parseTableRoomToUUID(tableRoomOrUUID);
    if (!tableUUID) return false;
    const cacheKey = getSocketTableAuthCacheKey(socket.id, tableUUID);
    const cachedAuth = getSocketTableAuthCacheEntry(cacheKey);
    if (cachedAuth) {
      return canUseSocketTableAuthEntry(cachedAuth, mode, capability);
    }

    try {
      const reqForAuth = socket.request as any;
      const access = await resolveTableAccessByUUID(reqForAuth, tableUUID, {
        allowGuestSandbox: true,
      });
      const nextEntry = setSocketTableAuthCacheEntry(cacheKey, {
        viewAllowed: access.canView,
        editAllowed: access.canEdit,
        capabilities: access.capabilities,
      });
      return canUseSocketTableAuthEntry(nextEntry, mode, capability);
    } catch (_err) {
      setSocketTableAuthCacheEntry(cacheKey, {
        viewAllowed: false,
        editAllowed: false,
        capabilities: null,
      });
      return false;
    }
  };

  async function broadcastTableChangeToAuthorizedSockets(
    sourceTableRoom: string,
    targetTableUUID: string,
    excludeSocketId?: string,
  ) {
    if (!sourceTableRoom || !targetTableUUID) return;
    const socketsInRoom = await io.in(sourceTableRoom).fetchSockets();
    for (const roomSocket of socketsInRoom) {
      if (excludeSocketId && roomSocket.id === excludeSocketId) continue;
      const canViewTargetTable = await authorizeSocketTable(
        roomSocket,
        String(targetTableUUID),
        "view",
      );
      if (!canViewTargetTable) continue;
      roomSocket.emit("table-change", targetTableUUID);
    }
  }

  return {
    parseTableRoomToUUID,
    authorizeSocketTable,
    clearSocketTableAuthCacheForSocket,
    broadcastTableChangeToAuthorizedSockets,
  };
}
