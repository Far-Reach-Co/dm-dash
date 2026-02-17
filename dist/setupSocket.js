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
function parseTableRoomToUUID(tableRoom) {
    if (typeof tableRoom !== "string")
        return "";
    return tableRoom.replace(/^table-/, "").trim();
}
function authorizeSocketTable(socket, tableUUID, mode, capability) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (!tableUUID)
            return false;
        const userId = (_b = (_a = socket.request) === null || _a === void 0 ? void 0 : _a.session) === null || _b === void 0 ? void 0 : _b.user;
        if (!userId)
            return false;
        const tableData = yield (0, tableViews_1.getTableViewByUUIDQuery)(tableUUID);
        const table = tableData.rows[0];
        if (!table)
            return false;
        const reqForAuth = { session: { user: userId } };
        const auth = yield (0, tableAuthz_1.requireTablePermission)(reqForAuth, table, mode);
        if (capability)
            (0, tableAuthz_1.assertTableCapability)(auth, capability);
        return true;
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
            io.to(table).emit("table-messages", yield (0, socketUsers_js_1.getChatLog)(table));
        }));
        socket.on("grid-toggled", ({ table, gridState }) => {
            socket.broadcast.to(table).emit("grid-toggle", gridState);
        });
        socket.on("grid-resized", ({ table, gridState, }) => {
            socket.broadcast.to(table).emit("grid-resize", gridState);
        });
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
                socket.broadcast.to(table).emit("table-change", newTableUUID);
            }
            catch (err) {
                console.log("Blocked unauthorized table-changed event", err);
            }
        }));
        socket.on("image-added", ({ table, image }) => {
            socket.broadcast.to(table).emit("image-add", image);
        });
        socket.on("image-removed", ({ table, id }) => {
            socket.broadcast.to(table).emit("image-remove", id);
        });
        socket.on("image-moved", ({ table, image }) => {
            socket.broadcast.to(table).emit("image-move", image);
        });
        socket.on("object-changed-layer", ({ table, id }) => {
            socket.broadcast.to(table).emit("object-change-layer", id);
        });
        socket.on("indicator-animation", ({ table, x, y, }) => {
            socket.broadcast.to(table).emit("run-indicator-animation", { x, y });
        });
        socket.on("pin-added", ({ table, pin }) => {
            socket.broadcast.to(table).emit("pin-add", pin);
        });
        socket.on("location-pins-updated", ({ table }) => {
            socket.broadcast.to(table).emit("reload-location-pins");
        });
        socket.on("disconnect", () => __awaiter(this, void 0, void 0, function* () {
            const user = yield (0, socketUsers_js_1.userLeave)(socket.id);
            if (user) {
                io.to(user.table).emit("current-users", yield (0, socketUsers_js_1.getTableUsers)(user.table));
            }
        }));
        socket.on("new-message", (_a) => __awaiter(this, [_a], void 0, function* ({ table, content }) {
            var _b;
            try {
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
