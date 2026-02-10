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
const projectUsers_1 = require("../api/queries/projectUsers");
const projectPlayers_1 = require("../api/queries/projectPlayers");
const projectInvites_1 = require("../api/queries/projectInvites");
const _5eCharGeneral_1 = require("../api/queries/5eCharGeneral");
const calendars_1 = require("../api/queries/calendars");
const record_1 = require("../api/queries/record");
const users_1 = require("../api/queries/users");
const utils_1 = require("../lib/utils");
const authz_1 = require("../lib/authz");
const router = (0, express_1.Router)();
router.get("/wyrld", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!(0, authz_1.requireUserOrRedirect)(req, res, "/login"))
            return;
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const project = yield (0, authz_1.requireProjectMemberOrRedirect)(req, res, projectId, "/forbidden");
        if (!project)
            return;
        let projectAuth = true;
        if (req.session.user != project.user_id) {
            const projectUserData = yield (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(req.session.user, projectId);
            const projectUser = projectUserData.rows[0];
            projectAuth = (_a = projectUser === null || projectUser === void 0 ? void 0 : projectUser.is_editor) !== null && _a !== void 0 ? _a : false;
        }
        const tableData = yield (0, tableViews_1.getTableViewsByProjectQuery)(projectId);
        const players = [];
        const projectPlayers = yield (0, projectPlayers_1.getProjectPlayersByProjectQuery)(projectId);
        for (var player of projectPlayers.rows) {
            const charData = yield (0, _5eCharGeneral_1.get5eCharGeneralQuery)(player.player_id);
            players.push(charData.rows[0]);
        }
        const calendars = yield (0, calendars_1.getCalendarsQuery)(projectId);
        const recordsData = yield (0, record_1.getRecordsByProjectQuery)(project.id);
        const usedDataFormatted = (0, utils_1.humanFileSize)(project.used_data_in_bytes);
        let inviteLink = null;
        let inviteId = null;
        if (projectAuth) {
            const inviteData = yield (0, projectInvites_1.getProjectInviteByProjectQuery)(projectId);
            if (inviteData.rows.length > 0) {
                const invite = inviteData.rows[0];
                inviteId = invite.id;
                inviteLink = `${req.protocol}://${req.get("host")}/invite?invite=${invite.uuid}`;
            }
        }
        res.render("wyrld", {
            auth: req.session.user,
            projectAuth,
            project: project,
            tables: tableData.rows,
            sheets: players,
            calendars: calendars.rows,
            records: recordsData.rows,
            usedDataFormatted,
            inviteLink,
            inviteId,
        });
    }
    catch (err) {
        next(err);
    }
}));
router.get("/wyrldsettings", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(0, authz_1.requireUserOrRedirect)(req, res, "/forbidden"))
            return;
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const project = yield (0, authz_1.requireProjectOwnerOrRedirect)(req, res, projectId, "/forbidden");
        if (!project)
            return;
        const projectInviteData = yield (0, projectInvites_1.getProjectInviteByProjectQuery)(project.id);
        let inviteLink = null;
        let inviteId = null;
        if (projectInviteData.rows.length) {
            const invite = projectInviteData.rows[0];
            inviteLink = `${req.protocol}://${req.get("host")}/invite?invite=${invite.uuid}`;
            inviteId = invite.id;
        }
        const projectUsersData = yield (0, projectUsers_1.getProjectUsersByProjectQuery)(project.id);
        const usersList = [];
        for (const projectUser of projectUsersData.rows) {
            const userData = yield (0, users_1.getUserByIdQuery)(projectUser.user_id);
            const user = userData.rows[0];
            user.project_user_id =
                projectUser.id;
            user.is_editor =
                projectUser.is_editor;
            usersList.push(user);
        }
        return res.render("wyrldsettings", {
            auth: req.session.user,
            inviteLink,
            inviteId,
            project,
            users: usersList,
            projectId: project.id,
        });
    }
    catch (err) {
        next(err);
    }
}));
router.get("/sharedwyrldsettings", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(0, authz_1.requireUserOrRedirect)(req, res, "/forbidden"))
            return;
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const project = yield (0, authz_1.requireProjectMemberOrRedirect)(req, res, projectId, "/forbidden");
        if (!project)
            return;
        const projectUserData = yield (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(req.session.user, project.id);
        if (!projectUserData.rows.length)
            return res.redirect("/forbidden");
        const projectUser = projectUserData.rows[0];
        return res.render("sharedwyrldsettings", {
            auth: req.session.user,
            projectUserId: projectUser.id,
            project,
        });
    }
    catch (err) {
        next(err);
    }
}));
router.get("/newwyrldtable", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(0, authz_1.requireUserOrRedirect)(req, res, "/forbidden"))
            return;
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const project = yield (0, authz_1.requireProjectEditorOrRedirect)(req, res, projectId, "/forbidden");
        if (!project)
            return;
        res.render("newwyrldtable", {
            auth: req.session.user,
            projectId: project.id,
        });
    }
    catch (err) {
        next(err);
    }
}));
router.get("/newwyrldcalendar", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(0, authz_1.requireUserOrRedirect)(req, res, "/forbidden"))
            return;
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const project = yield (0, authz_1.requireProjectEditorOrRedirect)(req, res, projectId, "/forbidden");
        if (!project)
            return;
        res.render("newwyrldcalendar", {
            auth: req.session.user,
            projectId: project.id,
        });
    }
    catch (err) {
        next(err);
    }
}));
router.get("/newwyrldrecord", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(0, authz_1.requireUserOrRedirect)(req, res, "/forbidden"))
            return;
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const project = yield (0, authz_1.requireProjectEditorOrRedirect)(req, res, projectId, "/forbidden");
        if (!project)
            return;
        res.render("newwyrldrecord", {
            auth: req.session.user,
            projectId: project.id,
        });
    }
    catch (err) {
        next(err);
    }
}));
router.get("/newwyrld", (req, res, next) => {
    try {
        if (!(0, authz_1.requireUserOrRedirect)(req, res, "/forbidden"))
            return;
        res.render("newwyrld", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
