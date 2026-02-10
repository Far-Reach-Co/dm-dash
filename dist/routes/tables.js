"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authz_1 = require("../lib/authz");
const router = (0, express_1.Router)();
router.get("/newtable", (req, res, next) => {
    try {
        if (!(0, authz_1.requireUserOrRedirect)(req, res, "/forbidden"))
            return;
        res.render("newtable", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
