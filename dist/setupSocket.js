"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setupSocketHandlers;
const socket_io_1 = require("socket.io");
const socketUsers_js_1 = require("./lib/socketUsers.js");
const dice_js_1 = require("./lib/dice.js");
const mistral_js_1 = require("./dnd/srd/mistral.js");
const markdownToChat_js_1 = require("./lib/markdownToChat.js");
const setupApp_1 = require("./setupApp");
const tableViews_1 = require("./api/queries/tableViews");
const tableAuthz_1 = require("./lib/tableAuthz");
const guestSandbox_1 = require("./lib/guestSandbox");
function parseTableRoomToUUID(tableRoom) {
    if (typeof tableRoom !== "string")
        return "";
    return tableRoom.replace(/^table-/, "").trim();
}
function authorizeSocketTable(socket, tableRoomOrUUID, mode, capability) {
    return __awaiter(this, void 0, void 0, function* () {
        const tableUUID = parseTableRoomToUUID(tableRoomOrUUID);
        if (!tableUUID)
            return false;
        try {
            const reqForAuth = socket.request;
            const tableData = yield (0, tableViews_1.getTableViewByUUIDQuery)(tableUUID);
            const table = tableData.rows[0];
            if (table) {
                const auth = yield (0, tableAuthz_1.requireTablePermission)(reqForAuth, table, mode);
                if (capability)
                    (0, tableAuthz_1.assertTableCapability)(auth, capability);
                return true;
            }
            yield (0, guestSandbox_1.requireGuestSandboxAccess)(reqForAuth, tableUUID);
            const guestCapabilities = (0, tableAuthz_1.buildGuestSandboxCapabilities)();
            (0, tableAuthz_1.assertTableCapabilities)(guestCapabilities, mode, capability);
            return true;
        }
        catch (_err) {
            return false;
        }
    });
}
function broadcastTableChangeToAuthorizedSockets(io, sourceTableRoom, targetTableUUID, excludeSocketId) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!sourceTableRoom || !targetTableUUID)
            return;
        const socketsInRoom = yield io.in(sourceTableRoom).fetchSockets();
        for (const roomSocket of socketsInRoom) {
            if (excludeSocketId && roomSocket.id === excludeSocketId)
                continue;
            const canViewTargetTable = yield authorizeSocketTable(roomSocket, String(targetTableUUID), "view");
            if (!canViewTargetTable)
                continue;
            roomSocket.emit("table-change", targetTableUUID);
        }
    });
}
function setupSocketHandlers(server) {
    const io = new socket_io_1.Server(server);
    io.use((socket, next) => {
        (0, setupApp_1.sessionMiddleware)(socket.request, {}, next);
    });
    io.on("connection", (socket) => {
        socket.on("table-joined", (_a) => __awaiter(this, [_a], void 0, function* ({ table, username }) {
            try {
                const canViewTable = yield authorizeSocketTable(socket, table, "view");
                if (!canViewTable)
                    return;
                const user = yield (0, socketUsers_js_1.userJoin)(socket.id, username, table);
                socket.join(table);
                io.to(table).emit("table-join", `Hello ${username}`);
                io.to(user.table).emit("current-users", yield (0, socketUsers_js_1.getTableUsers)(table));
            }
            catch (err) {
                console.log("SOCKET ERROR", err);
            }
        }));
        socket.on("get-messages", (_a) => __awaiter(this, [_a], void 0, function* ({ table }) {
            const canViewTable = yield authorizeSocketTable(socket, table, "view");
            if (!canViewTable)
                return;
            io.to(table).emit("table-messages", yield (0, socketUsers_js_1.getChatLog)(table));
        }));
        socket.on("grid-toggled", (_a) => __awaiter(this, [_a], void 0, function* ({ table, gridState }) {
            const canManageGrid = yield authorizeSocketTable(socket, table, "edit", "canManageGrid");
            if (!canManageGrid)
                return;
            socket.broadcast.to(table).emit("grid-toggle", gridState);
        }));
        socket.on("grid-resized", (_a) => __awaiter(this, [_a], void 0, function* ({ table, gridState, }) {
            const canManageGrid = yield authorizeSocketTable(socket, table, "edit", "canManageGrid");
            if (!canManageGrid)
                return;
            socket.broadcast.to(table).emit("grid-resize", gridState);
        }));
        socket.on("table-changed", (_a) => __awaiter(this, [_a], void 0, function* ({ table, newTableUUID }) {
            try {
                if (!table || !newTableUUID)
                    return;
                const currentTableUUID = parseTableRoomToUUID(table);
                if (!currentTableUUID)
                    return;
                const canChangeCurrentTable = yield authorizeSocketTable(socket, currentTableUUID, "edit", "canChangeTable");
                if (!canChangeCurrentTable)
                    return;
                const canViewTargetTable = yield authorizeSocketTable(socket, String(newTableUUID), "view");
                if (!canViewTargetTable)
                    return;
                yield broadcastTableChangeToAuthorizedSockets(io, table, String(newTableUUID), socket.id);
            }
            catch (err) {
                console.log("Blocked unauthorized table-changed event", err);
            }
        }));
        socket.on("image-added", (_a) => __awaiter(this, [_a], void 0, function* ({ table, image }) {
            const canEditTableData = yield authorizeSocketTable(socket, table, "view", "canEditTableData");
            if (!canEditTableData)
                return;
            socket.broadcast.to(table).emit("image-add", image);
        }));
        socket.on("image-removed", (_a) => __awaiter(this, [_a], void 0, function* ({ table, id }) {
            const canDeleteObjects = yield authorizeSocketTable(socket, table, "edit", "canDeleteCanvasObjects");
            if (!canDeleteObjects)
                return;
            socket.broadcast.to(table).emit("image-remove", id);
        }));
        socket.on("image-moved", (_a) => __awaiter(this, [_a], void 0, function* ({ table, image }) {
            const canEditTableData = yield authorizeSocketTable(socket, table, "view", "canEditTableData");
            if (!canEditTableData)
                return;
            socket.broadcast.to(table).emit("image-move", image);
        }));
        socket.on("object-changed-layer", (_a) => __awaiter(this, [_a], void 0, function* ({ table, id }) {
            const canManageLayers = yield authorizeSocketTable(socket, table, "edit", "canManageLayers");
            if (!canManageLayers)
                return;
            socket.broadcast.to(table).emit("object-change-layer", id);
        }));
        socket.on("indicator-animation", (_a) => __awaiter(this, [_a], void 0, function* ({ table, x, y, }) {
            const canViewTable = yield authorizeSocketTable(socket, table, "view");
            if (!canViewTable)
                return;
            socket.broadcast.to(table).emit("run-indicator-animation", { x, y });
        }));
        socket.on("pin-added", (_a) => __awaiter(this, [_a], void 0, function* ({ table, pin }) {
            const canManagePins = yield authorizeSocketTable(socket, table, "edit", "canManagePins");
            if (!canManagePins)
                return;
            socket.broadcast.to(table).emit("pin-add", pin);
        }));
        socket.on("location-pins-updated", (_a) => __awaiter(this, [_a], void 0, function* ({ table }) {
            const canManagePins = yield authorizeSocketTable(socket, table, "edit", "canManagePins");
            if (!canManagePins)
                return;
            socket.broadcast.to(table).emit("reload-location-pins");
        }));
        socket.on("disconnect", () => __awaiter(this, void 0, void 0, function* () {
            const user = yield (0, socketUsers_js_1.userLeave)(socket.id);
            if (user) {
                io.to(user.table).emit("current-users", yield (0, socketUsers_js_1.getTableUsers)(user.table));
            }
        }));
        socket.on("new-message", (_a) => __awaiter(this, [_a], void 0, function* ({ table, content }) {
            var _b;
            try {
                const canViewTable = yield authorizeSocketTable(socket, table, "view");
                if (!canViewTable)
                    return;
                const user = yield (0, socketUsers_js_1.getCurrentUser)(socket.id);
                if (!user) {
                    console.log("Failure to fetch current user for new message on socket chat system");
                    return;
                }
                if (content.startsWith("/")) {
                    const match = content.match(/^\/(\w+)\s*(.*)$/);
                    const command = (_b = match === null || match === void 0 ? void 0 : match[1]) === null || _b === void 0 ? void 0 : _b.toLowerCase();
                    const tail = ((match === null || match === void 0 ? void 0 : match[2]) || "").trim();
                    switch (command) {
                        case "roll": {
                            if (!tail) {
                                content =
                                    "Usage: /roll <NdS[ +/- modifiers]>\nEx: /roll 2d6 + 4 + 2";
                                break;
                            }
                            const diceRes = (0, dice_js_1.calculateDiceRollResponse)(tail);
                            content = diceRes;
                            break;
                        }
                        case "5e": {
                            if (!tail) {
                                content =
                                    "Usage: /5e <question>\nEx: /5e what spells deal fire damage at level 3?";
                                break;
                            }
                            content = yield (0, mistral_js_1.searchSrd)(tail);
                            content = (0, markdownToChat_js_1.markdownToChat)(content);
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
                yield (0, socketUsers_js_1.appendMessageToChatLog)(table, messageObject);
                io.to(table).emit("message", messageObject);
            }
            catch (err) {
                console.log("Error handling message event:", err);
            }
        }));
    });
    return io;
}
