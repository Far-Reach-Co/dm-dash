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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = void 0;
exports.logEvent = logEvent;
exports.logEventAsync = logEventAsync;
const dbconfig_1 = __importDefault(require("../api/dbconfig"));
var EventType;
(function (EventType) {
    EventType["USER_REGISTERED"] = "user.registered";
    EventType["USER_LOGIN"] = "user.login";
    EventType["PROJECT_CREATED"] = "project.created";
    EventType["PROJECT_PLAYER_CREATED"] = "project_player.created";
    EventType["DND_5E_CHARACTER_CREATED"] = "dnd_5e_character.created";
    EventType["PLAYER_USER_CREATED"] = "player_user.created";
    EventType["TABLE_CREATED"] = "table.created";
    EventType["IMAGE_UPLOADED"] = "image.uploaded";
    EventType["IMAGE_DELETED"] = "image.deleted";
    EventType["RECORD_CREATED"] = "record.created";
    EventType["CALENDAR_CREATED"] = "calendar.created";
})(EventType || (exports.EventType = EventType = {}));
function logEvent(params) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { userId, projectId, eventType, eventData, req } = params;
        try {
            const ipAddress = (req === null || req === void 0 ? void 0 : req.ip) || ((_a = req === null || req === void 0 ? void 0 : req.socket) === null || _a === void 0 ? void 0 : _a.remoteAddress) || null;
            const userAgent = (req === null || req === void 0 ? void 0 : req.get("user-agent")) || null;
            yield dbconfig_1.default.query({
                text: `
        INSERT INTO "LogEvent" (user_id, project_id, event_type, event_data, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
                values: [
                    userId || null,
                    projectId || null,
                    eventType,
                    eventData ? JSON.stringify(eventData) : null,
                    ipAddress,
                    userAgent,
                ],
            });
        }
        catch (error) {
            console.error("Failed to log event:", error);
        }
    });
}
function logEventAsync(params) {
    logEvent(params).catch((error) => {
        console.error("Async event logging failed:", error);
    });
}
