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
const projectUsers_1 = require("../api/queries/projectUsers");
const projects_1 = require("../api/queries/projects");
const projectInvites_1 = require("../api/queries/projectInvites");
const _5eCharGeneral_1 = require("../api/queries/5eCharGeneral");
const projectPlayers_1 = require("../api/queries/projectPlayers");
const authz_1 = require("../lib/authz");
const router = (0, express_1.Router)();
router.get("/invite", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = (0, authz_1.requireUserOrRedirect)(req, res, "forbidden");
        if (!userId)
            return;
        if (!req.query.invite)
            return res.render("invite", {
                auth: userId,
                error: "Can't find invite",
            });
        const inviteUUID = req.query.invite;
        const inviteData = yield (0, projectInvites_1.getProjectInviteByUUIDQuery)(inviteUUID);
        if (!inviteData.rows.length)
            return res.render("invite", {
                auth: userId,
                error: "Can't find invite",
            });
        const invite = inviteData.rows[0];
        const projectData = yield (0, projects_1.getProjectQuery)(invite.project_id);
        if (!projectData.rows.length)
            return res.render("invite", {
                auth: userId,
                error: "Can't find the wyrld related to this invite",
            });
        const project = projectData.rows[0];
        if (project.user_id == userId)
            return res.render("invite", {
                auth: userId,
                error: "You already own this wyrld",
            });
        const projectUserData = yield (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(userId, project.id);
        if (projectUserData.rows.length)
            return res.render("invite", {
                auth: userId,
                error: "You already joined this wyrld",
            });
        yield (0, projectUsers_1.addProjectUserQuery)({
            project_id: invite.project_id,
            user_id: userId,
            is_editor: false,
        });
        res.redirect(`/wyrld-welcome?id=${project.id}`);
    }
    catch (err) {
        next(err);
    }
}));
router.get("/wyrld-welcome", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = (0, authz_1.requireUserOrRedirect)(req, res, "/login");
        if (!userId)
            return;
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const projectData = yield (0, projects_1.getProjectQuery)(projectId);
        if (!projectData.rows.length)
            return res.redirect("/dash");
        const project = projectData.rows[0];
        const userSheets = yield (0, _5eCharGeneral_1.get5eCharsGeneralByUserQuery)(userId);
        const projectPlayers = yield (0, projectPlayers_1.getProjectPlayersByProjectQuery)(projectId);
        const linkedSheetIds = new Set(projectPlayers.rows.map((pp) => pp.player_id));
        const unlinkedSheets = userSheets.rows.filter((sheet) => !linkedSheetIds.has(sheet.id));
        res.render("wyrld-welcome", {
            auth: userId,
            project,
            unlinkedSheets,
        });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
