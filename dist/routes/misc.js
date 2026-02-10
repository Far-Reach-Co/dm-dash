"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logger_js_1 = __importDefault(require("../lib/logger.js"));
const router = (0, express_1.Router)();
router.get("/logout", (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            logger_js_1.default.error({ err }, "Failed to destroy session");
            return next(err);
        }
        res.redirect("/");
    });
});
router.get("/forbidden", (req, res, next) => {
    try {
        res.render("forbidden", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
