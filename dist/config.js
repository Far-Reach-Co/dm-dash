"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProd = exports.SECRET_KEY = void 0;
exports.SECRET_KEY = process.env.SECRET_KEY;
exports.isProd = process.env.SERVER_ENV === "prod";
