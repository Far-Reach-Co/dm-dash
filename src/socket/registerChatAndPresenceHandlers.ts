import {
  appendMessageToChatLog,
  getChatLog,
  getCurrentUser,
  getTableUsers,
  userJoin,
  userLeave,
} from "../lib/socketUsers.js";
import { calculateDiceRollResponse } from "../lib/dice.js";
import { searchSrd } from "../dnd/srd/mistral.js";
import { markdownToChat } from "../lib/markdownToChat.js";
import type { AuthorizeSocketTable } from "./tableSocketAuth";

export function registerChatAndPresenceHandlers(params: {
  io: any;
  socket: any;
  authorizeSocketTable: AuthorizeSocketTable;
  clearSocketTableAuthCacheForSocket: (socketId: string) => void;
}) {
  const {
    io,
    socket,
    authorizeSocketTable,
    clearSocketTableAuthCacheForSocket,
  } = params;

  socket.on(
    "table-joined",
    async ({ table, username }: { table: string; username: string }) => {
      try {
        const canViewTable = await authorizeSocketTable(socket, table, "view");
        if (!canViewTable) return;

        const user = await userJoin(socket.id, username, table);
        socket.join(table);

        io.to(table).emit("table-join", `Hello ${username}`);
        io.to(user.table).emit("current-users", await getTableUsers(table));
      } catch (err) {
        console.log("SOCKET ERROR", err);
      }
    },
  );

  socket.on("get-messages", async ({ table }: { table: string }) => {
    const canViewTable = await authorizeSocketTable(socket, table, "view");
    if (!canViewTable) return;
    io.to(table).emit("table-messages", await getChatLog(table));
  });

  socket.on("disconnect", async () => {
    clearSocketTableAuthCacheForSocket(socket.id);
    const user = await userLeave(socket.id);

    if (user) {
      io.to(user.table).emit("current-users", await getTableUsers(user.table));
    }
  });

  socket.on(
    "new-message",
    async ({ table, content }: { table: string; content: string }) => {
      try {
        const canViewTable = await authorizeSocketTable(socket, table, "view");
        if (!canViewTable) return;

        const user = await getCurrentUser(socket.id);
        if (!user) {
          console.log(
            "Failure to fetch current user for new message on socket chat system",
          );
          return;
        }

        if (content.startsWith("/")) {
          const match = content.match(/^\/(\w+)\s*(.*)$/);
          const command = match?.[1]?.toLowerCase();
          const tail = (match?.[2] || "").trim();

          switch (command) {
            case "roll": {
              if (!tail) {
                content = "Usage: /roll <NdS[ +/- modifiers]>\nEx: /roll 2d6 + 4 + 2";
                break;
              }
              content = calculateDiceRollResponse(tail);
              break;
            }
            case "5e": {
              if (!tail) {
                content =
                  "Usage: /5e <question>\nEx: /5e what spells deal fire damage at level 3?";
                break;
              }
              content = markdownToChat(await searchSrd(tail));
              break;
            }
            default:
              content = `Unknown command: /${command}`;
          }
        }

        const messageObject = {
          userId: user.id,
          username: user.username,
          content,
          timestamp: new Date().toISOString(),
        };

        await appendMessageToChatLog(table, messageObject);
        io.to(table).emit("message", messageObject);
      } catch (err) {
        console.log("Error handling message event:", err);
      }
    },
  );
}
