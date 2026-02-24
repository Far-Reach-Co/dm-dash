import { Server } from "socket.io";
import * as http from "http";
import { sessionMiddleware } from "./setupApp";
import { registerTableInteractionHandlers } from "./socket/registerTableInteractionHandlers";
import { registerChatAndPresenceHandlers } from "./socket/registerChatAndPresenceHandlers";
import { createSocketTableAuth } from "./socket/tableSocketAuth";

export default function setupSocketHandlers(
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
): any {
  const io = new Server(server);
  const tableAuth = createSocketTableAuth(io);

  io.use((socket, next) => {
    sessionMiddleware(socket.request as any, {} as any, next as any);
  });

  io.on("connection", (socket: any) => {
    registerTableInteractionHandlers({
      socket,
      authorizeSocketTable: tableAuth.authorizeSocketTable,
      parseTableRoomToUUID: tableAuth.parseTableRoomToUUID,
      broadcastTableChangeToAuthorizedSockets:
        tableAuth.broadcastTableChangeToAuthorizedSockets,
    });

    registerChatAndPresenceHandlers({
      io,
      socket,
      authorizeSocketTable: tableAuth.authorizeSocketTable,
      clearSocketTableAuthCacheForSocket:
        tableAuth.clearSocketTableAuthCacheForSocket,
    });
  });

  return io;
}
