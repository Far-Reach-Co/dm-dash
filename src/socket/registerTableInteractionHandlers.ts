import logger from "../lib/logger.js";
import type { AuthorizeSocketTable } from "./tableSocketAuth";

export function registerTableInteractionHandlers(params: {
  socket: any;
  authorizeSocketTable: AuthorizeSocketTable;
  parseTableRoomToUUID: (tableRoom: unknown) => string;
  broadcastTableChangeToAuthorizedSockets: (
    sourceTableRoom: string,
    targetTableUUID: string,
    excludeSocketId?: string,
  ) => Promise<void>;
}) {
  const {
    socket,
    authorizeSocketTable,
    parseTableRoomToUUID,
    broadcastTableChangeToAuthorizedSockets,
  } = params;

  socket.on(
    "grid-toggled",
    async ({ table, gridState }: { table: string; gridState: boolean }) => {
      const canManageGrid = await authorizeSocketTable(
        socket,
        table,
        "edit",
        "canManageGrid",
      );
      if (!canManageGrid) return;
      socket.broadcast.to(table).emit("grid-toggle", gridState);
    },
  );

  socket.on(
    "grid-resized",
    async ({
      table,
      gridState,
    }: {
      table: string;
      gridState: { width: string | number; height: string | number };
    }) => {
      const canManageGrid = await authorizeSocketTable(
        socket,
        table,
        "edit",
        "canManageGrid",
      );
      if (!canManageGrid) return;
      socket.broadcast.to(table).emit("grid-resize", gridState);
    },
  );

  socket.on(
    "table-changed",
    async ({ table, newTableUUID }: { table: string; newTableUUID: string }) => {
      try {
        if (!table || !newTableUUID) return;
        const currentTableUUID = parseTableRoomToUUID(table);
        if (!currentTableUUID) return;

        const canChangeCurrentTable = await authorizeSocketTable(
          socket,
          currentTableUUID,
          "edit",
          "canChangeTable",
        );
        if (!canChangeCurrentTable) return;

        const canViewTargetTable = await authorizeSocketTable(
          socket,
          String(newTableUUID),
          "view",
        );
        if (!canViewTargetTable) return;

        await broadcastTableChangeToAuthorizedSockets(
          table,
          String(newTableUUID),
          socket.id,
        );
      } catch (err) {
        logger.warn(
          { err, socketId: socket.id, table, newTableUUID },
          "Blocked unauthorized table-changed event",
        );
      }
    },
  );

  socket.on(
    "image-added",
    async ({ table, image }: { table: string; image: any }) => {
      const canEditTableData = await authorizeSocketTable(
        socket,
        table,
        "view",
        "canEditTableData",
      );
      if (!canEditTableData) return;
      socket.broadcast.to(table).emit("image-add", image);
    },
  );

  socket.on(
    "image-removed",
    async ({ table, id }: { table: string; id: string }) => {
      const canEditTableData = await authorizeSocketTable(
        socket,
        table,
        "view",
        "canEditTableData",
      );
      if (!canEditTableData) return;
      socket.broadcast.to(table).emit("image-remove", id);
    },
  );

  socket.on(
    "image-moved",
    async ({ table, image }: { table: string; image: any }) => {
      const canEditTableData = await authorizeSocketTable(
        socket,
        table,
        "view",
        "canEditTableData",
      );
      if (!canEditTableData) return;
      socket.broadcast.to(table).emit("image-move", image);
    },
  );

  socket.on(
    "object-changed-layer",
    async ({ table, id }: { table: string; id: string }) => {
      const canManageLayers = await authorizeSocketTable(
        socket,
        table,
        "edit",
        "canManageLayers",
      );
      if (!canManageLayers) return;
      socket.broadcast.to(table).emit("object-change-layer", id);
    },
  );

  socket.on(
    "indicator-animation",
    async ({
      table,
      x,
      y,
    }: {
      table: string;
      x: string | number;
      y: string | number;
    }) => {
      const canViewTable = await authorizeSocketTable(socket, table, "view");
      if (!canViewTable) return;
      socket.broadcast.to(table).emit("run-indicator-animation", { x, y });
    },
  );

  socket.on(
    "pin-added",
    async ({ table, pin }: { table: string; pin: any }) => {
      const canManagePins = await authorizeSocketTable(
        socket,
        table,
        "edit",
        "canManagePins",
      );
      if (!canManagePins) return;
      socket.broadcast.to(table).emit("pin-add", pin);
    },
  );

  socket.on(
    "location-pins-updated",
    async ({ table }: { table: string }) => {
      const canManagePins = await authorizeSocketTable(
        socket,
        table,
        "edit",
        "canManagePins",
      );
      if (!canManagePins) return;
      socket.broadcast.to(table).emit("reload-location-pins");
    },
  );

  socket.on(
    "table-mode-changed",
    async ({ table, mode }: { table: string; mode: string }) => {
      const canManage = await authorizeSocketTable(
        socket,
        table,
        "edit",
        "canManageTableSettings",
      );
      if (!canManage) return;
      socket.broadcast.to(table).emit("table-mode-changed", { mode });
    },
  );
}
