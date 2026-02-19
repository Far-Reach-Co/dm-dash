"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisUrl = getRedisUrl;
function getRedisUrl() {
    var _a;
    const redisUrl = (_a = process.env.REDIS_URL) === null || _a === void 0 ? void 0 : _a.trim();
    if (!redisUrl) {
        throw new Error("REDIS_URL environment variable is required");
    }
    return redisUrl;
}
