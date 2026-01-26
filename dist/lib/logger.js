"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const config_1 = require("../config");
const logger = (0, pino_1.default)({
    level: config_1.isProd ? "info" : "debug",
    transport: config_1.isProd
        ? undefined
        : {
            target: "pino-pretty",
            options: { colorize: true },
        },
});
exports.default = logger;
