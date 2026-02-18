"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (req, res, next) => {
    try {
        res.render("index", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/index", (req, res, next) => {
    try {
        res.render("index", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/about-us", (req, res, next) => {
    try {
        res.render("aboutus", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/what-is-frc", (req, res, next) => {
    try {
        res.render("what-is-frc", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/resources", (req, res, next) => {
    try {
        res.render("resources", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/radio", (req, res, next) => {
    try {
        res.render("radio", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/vtt-guide", (req, res, next) => {
    try {
        res.render("vtt-guide", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/preaethrend", (req, res, next) => {
    try {
        res.render("preaethrend", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/attributions", (req, res, next) => {
    try {
        res.render("attributions", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/privacy-policy", (req, res, next) => {
    try {
        res.render("privacypolicy", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/terms-of-use", (req, res, next) => {
    try {
        res.render("termsofuse", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
