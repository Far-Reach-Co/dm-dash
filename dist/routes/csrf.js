"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.csrfProtection = exports.csrfMiddleware = void 0;
const csrf_1 = __importDefault(require("csrf"));
const tokens = new csrf_1.default();
const CSRF_COOKIE = "_csrf_secret";
const isProd = process.env.SERVER_ENV === "prod";
const csrfMiddleware = (req, res, next) => {
    let secret = req.cookies[CSRF_COOKIE];
    if (!secret) {
        secret = tokens.secretSync();
        res.cookie(CSRF_COOKIE, secret, {
            httpOnly: true,
            sameSite: "lax",
            secure: isProd,
            path: "/",
        });
    }
    const token = tokens.create(secret);
    res.locals.csrfToken = token;
    next();
};
exports.csrfMiddleware = csrfMiddleware;
const csrfProtection = (req, res, next) => {
    var _a;
    const secret = req.cookies[CSRF_COOKIE];
    const token = ((_a = req.body) === null || _a === void 0 ? void 0 : _a._csrf) || req.headers["x-csrf-token"];
    if (!secret || !token || !tokens.verify(secret, token)) {
        const err = new Error("Invalid CSRF token");
        err.code = "EBADCSRFTOKEN";
        err.status = 403;
        return next(err);
    }
    next();
};
exports.csrfProtection = csrfProtection;
