"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const csrf_1 = require("./csrf");
const router = (0, express_1.Router)();
router.get("/login", csrf_1.csrfMiddleware, (req, res, next) => {
    try {
        res.clearCookie("frcsession", {
            httpOnly: true,
            sameSite: "lax",
        });
        const csrfToken = res.locals.csrfToken;
        res.render("login", { auth: req.session.user, csrfToken });
    }
    catch (err) {
        next(err);
    }
});
router.get("/register", csrf_1.csrfMiddleware, (req, res, next) => {
    try {
        const csrfToken = res.locals.csrfToken;
        res.render("register", { auth: req.session.user, csrfToken });
    }
    catch (err) {
        next(err);
    }
});
router.get("/forgotpassword", csrf_1.csrfMiddleware, (req, res, next) => {
    try {
        const csrfToken = res.locals.csrfToken;
        res.render("forgotpassword", { auth: req.session.user, csrfToken });
    }
    catch (err) {
        next(err);
    }
});
router.get("/resetpassword", csrf_1.csrfMiddleware, (req, res, next) => {
    try {
        const csrfToken = res.locals.csrfToken;
        res.render("resetpassword", { auth: req.session.user, csrfToken });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
