import { Server } from "socket.io";
import * as http from "http";
import {
  userJoin,
  userLeave,
  getCurrentUser,
  getTableUsers,
  getChatLog,
  appendMessageToChatLog,
} from "./lib/socketUsers.js";
import { calculateDiceRollResponse } from "./lib/dice.js";
import { searchSrd } from "./dnd/srd/mistral.js";
import { markdownToChat } from "./lib/markdownToChat.js";
import { sessionMiddleware } from "./setupApp";
import { getTableViewByUUIDQuery } from "./api/queries/tableViews";
import {
  assertTableCapability,
  assertTableCapabilities,
  buildGuestSandboxCapabilities,
  requireTablePermission,
} from "./lib/tableAuthz";
import type { TableCapabilities } from "./lib/tableAuthz";
import { requireGuestSandboxAccess } from "./lib/guestSandbox";

function parseTableRoomToUUID(tableRoom: unknown): string {
  if (typeof tableRoom !== "string") return "";
  return tableRoom.replace(/^table-/, "").trim();
}

async function authorizeSocketTable(
  socket: any,
  tableRoomOrUUID: string,
  mode: "view" | "edit",
  capability?: keyof TableCapabilities,
) {
  const tableUUID = parseTableRoomToUUID(tableRoomOrUUID);
  if (!tableUUID) return false;

  try {
    const reqForAuth = socket.request as any;
    const tableData = await getTableViewByUUIDQuery(tableUUID);
    const table = tableData.rows[0];

    if (table) {
      const auth = await requireTablePermission(reqForAuth, table, mode);
      if (capability) assertTableCapability(auth, capability);
      return true;
    }

    await requireGuestSandboxAccess(reqForAuth, tableUUID);
    const guestCapabilities = buildGuestSandboxCapabilities();
    assertTableCapabilities(guestCapabilities, mode, capability);
    return true;
  } catch (_err) {
    return false;
  }
}

async function broadcastTableChangeToAuthorizedSockets(
  io: any,
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

export default function setupSocketHandlers(
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
): any {
  const io = new Server(server);

  io.use((socket, next) => {
    sessionMiddleware(socket.request as any, {} as any, next as any);
  });

  io.on("connection", (socket: any) => {
    // testing
    socket.on(
      "table-joined",
      async ({ table, username }: { table: string; username: string }) => {
        try {
          const canViewTable = await authorizeSocketTable(socket, table, "view");
          if (!canViewTable) return;

          const user = await userJoin(socket.id, username, table);
          socket.join(table);

          // broadcast when a user connects
          io.to(table).emit("table-join", `Hello ${username}`);

          // send users list
          io.to(user.table).emit("current-users", await getTableUsers(table));
        } catch (err) {
          console.log("SOCKET ERROR", err);
        }
      }
    );

    socket.on("get-messages", async ({ table }: { table: string }) => {
      const canViewTable = await authorizeSocketTable(socket, table, "view");
      if (!canViewTable) return;
      io.to(table).emit("table-messages", await getChatLog(table));
    });

    // grid
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
      }
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
      }
    );
    // table change
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
            io,
            table,
            String(newTableUUID),
            socket.id,
          );
        } catch (err) {
          console.log("Blocked unauthorized table-changed event", err);
        }
      },
    );
    // update images
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
      }
    );

    socket.on(
      "image-removed",
      async ({ table, id }: { table: string; id: string }) => {
        const canDeleteObjects = await authorizeSocketTable(
          socket,
          table,
          "edit",
          "canDeleteCanvasObjects",
        );
        if (!canDeleteObjects) return;
        socket.broadcast.to(table).emit("image-remove", id);
      }
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
      }
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
      }
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
      }
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
      }
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
      }
    );

    // when a user disconnects
    socket.on("disconnect", async () => {
      const user = await userLeave(socket.id);

      if (user) {
        // send users list
        io.to(user.table).emit(
          "current-users",
          await getTableUsers(user.table)
        );
      }
    });
    // Chat system new message
    socket.on(
      "new-message",
      async ({ table, content }: { table: string; content: string }) => {
        try {
          const canViewTable = await authorizeSocketTable(socket, table, "view");
          if (!canViewTable) return;

          // Fetch the user details from Redis or your user management system
          const user = await getCurrentUser(socket.id);
          if (!user) {
            console.log(
              "Failure to fetch current user for new message on socket chat system"
            );
            return;
          }

          // Handle special message cases here including / commands:
          if (content.startsWith("/")) {
            // remove leading "/" and split once for command; keep the tail intact
            const match = content.match(/^\/(\w+)\s*(.*)$/);
            const command = match?.[1]?.toLowerCase();
            const tail = (match?.[2] || "").trim(); // everything after the command

            switch (command) {
              case "roll": {
                if (!tail) {
                  content =
                    "Usage: /roll <NdS[ +/- modifiers]>\nEx: /roll 2d6 + 4 + 2";
                  break;
                }
                const diceRes = calculateDiceRollResponse(tail);
                content = diceRes;
                break;
              }
              case "5e": {
                if (!tail) {
                  content =
                    "Usage: /5e <question>\nEx: /5e what spells deal fire damage at level 3?";
                  break;
                }
                content = await searchSrd(tail);
                content = markdownToChat(content);
                break;
              }
              default:
                content = `Unknown command: /${command}`;
            }
          }

          const messageObject = {
            userId: user.id,
            username: user.username,
            content: content,
            timestamp: new Date().toISOString(),
          };

          // Append message to chat log
          await appendMessageToChatLog(table, messageObject);

          io.to(table).emit("message", messageObject);
        } catch (err) {
          console.log("Error handling message event:", err);
        }
      }
    );
  });

  return io;
}
