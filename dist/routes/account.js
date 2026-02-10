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
const users_1 = require("../api/queries/users");
const utils_1 = require("../lib/utils");
const csrf_1 = require("./csrf");
const authz_1 = require("../lib/authz");
const router = (0, express_1.Router)();
router.get("/account", csrf_1.csrfMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(0, authz_1.requireUserOrRedirect)(req, res, "/login"))
            return;
        const csrfToken = res.locals.csrfToken;
        const { rows } = yield (0, users_1.getUserByIdQuery)(req.session.user);
        const usedDataFormatted = (0, utils_1.humanFileSize)(rows[0].used_data_in_bytes);
        res.render("account", {
            auth: req.session.user,
            user: rows[0],
            usedDataFormatted,
            csrfToken,
        });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
