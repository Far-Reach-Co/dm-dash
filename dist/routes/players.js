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
const _5eCharGeneral_1 = require("../api/queries/5eCharGeneral");
const playerUsers_1 = require("../api/queries/playerUsers");
const playerInvites_1 = require("../api/queries/playerInvites");
const projects_1 = require("../api/queries/projects");
const projectUsers_1 = require("../api/queries/projectUsers");
const authz_1 = require("../lib/authz");
const recentlyViewed_1 = require("../api/queries/recentlyViewed");
const router = (0, express_1.Router)();
router.get("/5eplayer", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = (0, authz_1.requireUserOrRedirect)(req, res, "/login");
        if (!userId)
            return;
        if (!req.query.id)
            return res.redirect("/dash");
        const playerSheetid = req.query.id;
        (0, recentlyViewed_1.upsertRecentlyViewed)(userId, "sheet", playerSheetid);
        const playerSheetUserIdData = yield (0, _5eCharGeneral_1.get5eCharGeneralUserIdQuery)(playerSheetid);
        const playerSheetUserId = playerSheetUserIdData.rows[0].user_id;
        const playerSheetNameData = yield (0, _5eCharGeneral_1.get5eCharNamesQuery)([playerSheetid]);
        const playerSheetName = playerSheetNameData.rows[0].name;
        if (playerSheetUserId != userId) {
            const playerUserData = yield (0, playerUsers_1.getPlayerUserByUserAndPlayerQuery)(userId, playerSheetid);
            if (!playerUserData.rows.length) {
                if (!req.query.project) {
                    const invite = req.query.invite;
                    if (!invite) {
                        return res.render("forbidden", { auth: userId });
                    }
                    const inviteData = yield (0, playerInvites_1.getPlayerInviteByUUIDQuery)(invite);
                    if (!inviteData.rows.length) {
                        return res.render("forbidden", { auth: userId });
                    }
                    else {
                        return res.render("5eplayer", {
                            auth: userId,
                            playerSheetName: playerSheetName,
                        });
                    }
                }
                const projectId = req.query.project;
                const projectData = yield (0, projects_1.getProjectQuery)(projectId);
                if (!projectData.rows.length)
                    return res.render("forbidden", { auth: userId });
                const project = projectData.rows[0];
                if (userId != project.user_id) {
                    const projectUserData = yield (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(userId, projectId);
                    if (!projectUserData.rows.length)
                        return res.render("forbidden", { auth: userId });
                    const projectUser = projectUserData.rows[0];
                    if (!projectUser.is_editor) {
                        return res.render("forbidden", { auth: userId });
                    }
                    else {
                        return res.render("5eplayer", {
                            auth: userId,
                            playerSheetName: playerSheetName,
                        });
                    }
                }
                else {
                    return res.render("5eplayer", {
                        auth: userId,
                        playerSheetName: playerSheetName,
                    });
                }
            }
            else {
                return res.render("5eplayer", {
                    auth: userId,
                    playerSheetName: playerSheetName,
                });
            }
        }
        else {
            return res.render("5eplayer", {
                auth: userId,
                playerSheetName: playerSheetName,
            });
        }
    }
    catch (err) {
        next(err);
    }
}));
router.get("/newsheet", (req, res, next) => {
    try {
        const userId = (0, authz_1.requireUserOrRedirect)(req, res, "/forbidden");
        if (!userId)
            return;
        res.render("newsheet", {
            auth: userId,
            wyrld_id: req.query.wyrld_id || null,
            wyrld_title: req.query.wyrld_title || null,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
