"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_session_1 = __importDefault(require("express-session"));
class RedisSessionStore extends express_session_1.default.Store {
    constructor(options) {
        super();
        this.client = options.client;
        this.prefix = options.prefix || "sess:";
        this.ttlSeconds = options.ttlSeconds || 24 * 60 * 60;
        this.disableTouch = Boolean(options.disableTouch);
    }
    getKey(sid) {
        return `${this.prefix}${sid}`;
    }
    getTtlSeconds(sess) {
        var _a, _b;
        const cookieExpiry = (_a = sess.cookie) === null || _a === void 0 ? void 0 : _a.expires;
        if (cookieExpiry) {
            const expiresAtMs = new Date(cookieExpiry).valueOf();
            if (!Number.isNaN(expiresAtMs)) {
                return Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));
            }
        }
        const cookieMaxAge = (_b = sess.cookie) === null || _b === void 0 ? void 0 : _b.maxAge;
        if (typeof cookieMaxAge === "number") {
            return Math.max(0, Math.ceil(cookieMaxAge / 1000));
        }
        return this.ttlSeconds;
    }
    get(sid, callback) {
        this.client
            .get(this.getKey(sid))
            .then((rawSession) => {
            if (!rawSession) {
                callback(null, null);
                return;
            }
            try {
                callback(null, JSON.parse(rawSession));
            }
            catch (_a) {
                this.destroy(sid, callback);
            }
        })
            .catch((err) => callback(err));
    }
    set(sid, sess, callback) {
        const ttlSeconds = this.getTtlSeconds(sess);
        if (ttlSeconds <= 0) {
            this.destroy(sid, callback);
            return;
        }
        this.client
            .set(this.getKey(sid), JSON.stringify(sess), { EX: ttlSeconds })
            .then(() => callback && callback())
            .catch((err) => callback && callback(err));
    }
    destroy(sid, callback) {
        this.client
            .del(this.getKey(sid))
            .then(() => callback && callback())
            .catch((err) => callback && callback(err));
    }
    touch(sid, sess, callback) {
        if (this.disableTouch) {
            if (callback)
                callback();
            return;
        }
        const ttlSeconds = this.getTtlSeconds(sess);
        if (ttlSeconds <= 0) {
            this.destroy(sid, callback);
            return;
        }
        this.client
            .expire(this.getKey(sid), ttlSeconds)
            .then(() => callback && callback())
            .catch((err) => callback && callback(err));
    }
}
exports.default = RedisSessionStore;
