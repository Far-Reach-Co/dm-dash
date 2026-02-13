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
exports.upsertRecentlyViewed = upsertRecentlyViewed;
exports.getRecentlyViewedByUser = getRecentlyViewedByUser;
exports.getRecentlyViewedByUserForIds = getRecentlyViewedByUserForIds;
const dbconfig_1 = __importDefault(require("../dbconfig"));
function upsertRecentlyViewed(userId, entityType, entityId) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = {
            text: `
      INSERT INTO public."RecentlyViewed" (user_id, entity_type, entity_id, viewed_at)
      VALUES ($1, $2, $3, now())
      ON CONFLICT (user_id, entity_type, entity_id)
      DO UPDATE SET viewed_at = now()
    `,
            values: [userId, entityType, entityId],
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getRecentlyViewedByUser(userId_1, entityType_1) {
    return __awaiter(this, arguments, void 0, function* (userId, entityType, limit = 5) {
        const query = {
            text: `
      SELECT entity_id FROM public."RecentlyViewed"
      WHERE user_id = $1 AND entity_type = $2
      ORDER BY viewed_at DESC
      LIMIT $3
    `,
            values: [userId, entityType, limit],
        };
        return yield dbconfig_1.default.query(query);
    });
}
function getRecentlyViewedByUserForIds(userId_1, entityType_1, entityIds_1) {
    return __awaiter(this, arguments, void 0, function* (userId, entityType, entityIds, limit = 5) {
        const query = {
            text: `
      SELECT entity_id FROM public."RecentlyViewed"
      WHERE user_id = $1 AND entity_type = $2 AND entity_id = ANY($3)
      ORDER BY viewed_at DESC
      LIMIT $4
    `,
            values: [userId, entityType, entityIds, limit],
        };
        return yield dbconfig_1.default.query(query);
    });
}
