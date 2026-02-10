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
const authz_1 = require("../lib/authz");
const router = (0, express_1.Router)();
router.get("/library", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = (0, authz_1.requireUserOrRedirect)(req, res, "/login");
        if (!userId)
            return;
        const projectId = req.query.wyrld || null;
        if (projectId) {
            const project = yield (0, authz_1.requireProjectEditorOrRedirect)(req, res, projectId);
            if (!project)
                return;
        }
        res.render("library", {
            auth: userId,
            projectId,
        });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
