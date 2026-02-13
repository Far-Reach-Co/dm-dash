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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tableViews_1 = require("../api/queries/tableViews");
const recentlyViewed_1 = require("../api/queries/recentlyViewed");
const authz_1 = require("../lib/authz");
const router = (0, express_1.Router)();
router.get("/vtt", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.query.uuid)
            return res.render("404", { auth: req.session.user });
        const uuid = req.query.uuid;
        const tableData = yield (0, tableViews_1.getTableViewByUUIDQuery)(uuid);
        if (!tableData.rows.length) {
            return res.render("404", { auth: req.session.user });
        }
        const table = tableData.rows[0];
        const access = yield (0, authz_1.requireTableAccessOrRedirect)(req, res, table, "/forbidden");
        if (!access)
            return;
        if (req.session.user) {
            (0, recentlyViewed_1.upsertRecentlyViewed)(req.session.user, "table", table.id);
        }
        return res.render("vtt", {
            auth: req.session.user,
            projectAuth: access.projectAuth,
        });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
