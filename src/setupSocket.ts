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

export default function setupSocketHandlers(
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
): any {
  const io = new Server(server);

  io.on("connection", (socket: any) => {
    // testing
    socket.on(
      "table-joined",
      async ({ table, username }: { table: string; username: string }) => {
        try {
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
      io.to(table).emit("table-messages", await getChatLog(table));
    });

    // grid
    socket.on(
      "grid-toggled",
      ({ table, gridState }: { table: string; gridState: boolean }) => {
        socket.broadcast.to(table).emit("grid-toggle", gridState);
      }
    );

    socket.on(
      "grid-resized",
      ({
        table,
        gridState,
      }: {
        table: string;
        gridState: { width: string | number; height: string | number };
      }) => {
        socket.broadcast.to(table).emit("grid-resize", gridState);
      }
    );
    // table change
    socket.on(
      "table-changed",
      ({ table, newTableUUID }: { table: string; newTableUUID: string }) => {
        socket.broadcast.to(table).emit("table-change", newTableUUID);
      }
    );
    // update images
    socket.on(
      "image-added",
      ({ table, image }: { table: string; image: any }) => {
        socket.broadcast.to(table).emit("image-add", image);
      }
    );

    socket.on(
      "image-removed",
      ({ table, id }: { table: string; id: string }) => {
        socket.broadcast.to(table).emit("image-remove", id);
      }
    );

    socket.on(
      "image-moved",
      ({ table, image }: { table: string; image: any }) => {
        socket.broadcast.to(table).emit("image-move", image);
      }
    );

    socket.on(
      "object-changed-layer",
      ({ table, id }: { table: string; id: string }) => {
        socket.broadcast.to(table).emit("object-change-layer", id);
      }
    );

    socket.on(
      "indicator-animation",
      ({
        table,
        x,
        y,
      }: {
        table: string;
        x: string | number;
        y: string | number;
      }) => {
        socket.broadcast.to(table).emit("run-indicator-animation", { x, y });
      }
    );

    socket.on(
      "pin-added",
      ({ table, pin }: { table: string; pin: any }) => {
        socket.broadcast.to(table).emit("pin-add", pin);
      }
    );

    socket.on(
      "location-pins-updated",
      ({ table }: { table: string }) => {
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
