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
const tableImages_1 = require("../api/queries/tableImages");
const authz_1 = require("../lib/authz");
const router = (0, express_1.Router)();
const RECENT_LIMIT = 5;
const sortByDateDesc = (items, getDate) => {
    return [...items].sort((a, b) => {
        const aTime = getDate(a) ? new Date(getDate(a)).getTime() : 0;
        const bTime = getDate(b) ? new Date(getDate(b)).getTime() : 0;
        return bTime - aTime;
    });
};
const sortByTitle = (items, getTitle) => {
    return [...items].sort((a, b) => {
        var _a, _b;
        const aTitle = ((_a = getTitle(a)) !== null && _a !== void 0 ? _a : "").toLowerCase();
        const bTitle = ((_b = getTitle(b)) !== null && _b !== void 0 ? _b : "").toLowerCase();
        return aTitle.localeCompare(bTitle);
    });
};
function loadWyrldData(req, res, userId, projectId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const project = yield (0, authz_1.requireProjectMemberOrRedirect)(req, res, projectId, "/forbidden");
        if (!project)
            return null;
        let projectAuth = true;
        if (userId != project.user_id) {
            const projectUserData = yield (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(userId, projectId);
            const projectUser = projectUserData.rows[0];
            projectAuth = (_a = projectUser === null || projectUser === void 0 ? void 0 : projectUser.is_editor) !== null && _a !== void 0 ? _a : false;
        }
        const tableData = yield (0, tableViews_1.getTableViewsByProjectQuery)(projectId);
        const players = [];
        const projectPlayers = yield (0, projectPlayers_1.getProjectPlayersByProjectQuery)(projectId);
        for (const player of projectPlayers.rows) {
            const charData = yield (0, _5eCharGeneral_1.get5eCharGeneralQuery)(player.player_id);
            players.push(charData.rows[0]);
        }
        const calendars = yield (0, calendars_1.getCalendarsQuery)(projectId);
        const recordsData = yield (0, record_1.getRecordsByProjectQuery)(project.id);
        const imageCountData = yield (0, tableImages_1.getTableImageCountByProjectQuery)(project.id);
        const imageCount = parseInt(imageCountData.rows[0].count);
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
        const tables = tableData.rows;
        const records = recordsData.rows;
        const sheets = players.filter(Boolean);
        const calendarsList = calendars.rows;
        const recentTables = sortByDateDesc(tables, (table) => table.date_created).slice(0, RECENT_LIMIT);
        const recentRecords = sortByDateDesc(records, (record) => record.created_at).slice(0, RECENT_LIMIT);
        const recentSheets = sortByDateDesc(sheets, (sheet) => sheet.created_at).slice(0, RECENT_LIMIT);
        const recentCalendars = sortByDateDesc(calendarsList, (calendar) => calendar.created_at).slice(0, RECENT_LIMIT);
        return {
            projectAuth,
            project,
            tables,
            sheets,
            calendars: calendarsList,
            records,
            imageCount,
            usedDataFormatted,
            inviteLink,
            inviteId,
            recentTables,
            recentRecords,
            recentSheets,
            recentCalendars,
            tablesSorted: sortByTitle(tables, (table) => table.title),
            recordsSorted: sortByTitle(records, (record) => record.title),
            sheetsSorted: sortByTitle(sheets, (sheet) => sheet.name),
            calendarsSorted: sortByTitle(calendarsList, (calendar) => calendar.title),
        };
    });
}
router.get("/wyrld", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = (0, authz_1.requireUserOrRedirect)(req, res, "/login");
        if (!userId)
            return;
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const data = yield loadWyrldData(req, res, userId, projectId);
        if (!data)
            return;
        res.render("wyrld", Object.assign({ auth: userId, section: "overview" }, data));
    }
    catch (err) {
        next(err);
    }
}));
router.get(["/wyrld/tables", "/wyrld/records", "/wyrld/sheets", "/wyrld/calendars"], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = (0, authz_1.requireUserOrRedirect)(req, res, "/login");
        if (!userId)
            return;
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const section = req.path.split("/")[2];
        const data = yield loadWyrldData(req, res, userId, projectId);
        if (!data)
            return;
        res.render("wyrld", Object.assign({ auth: userId, section }, data));
    }
    catch (err) {
        next(err);
    }
}));
router.get("/wyrldsettings", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = (0, authz_1.requireUserOrRedirect)(req, res, "/forbidden");
        if (!userId)
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
            auth: userId,
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
        const userId = (0, authz_1.requireUserOrRedirect)(req, res, "/forbidden");
        if (!userId)
            return;
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const project = yield (0, authz_1.requireProjectMemberOrRedirect)(req, res, projectId, "/forbidden");
        if (!project)
            return;
        const projectUserData = yield (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(userId, project.id);
        if (!projectUserData.rows.length)
            return res.redirect("/forbidden");
        const projectUser = projectUserData.rows[0];
        return res.render("sharedwyrldsettings", {
            auth: userId,
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
        const userId = (0, authz_1.requireUserOrRedirect)(req, res, "/forbidden");
        if (!userId)
            return;
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const project = yield (0, authz_1.requireProjectEditorOrRedirect)(req, res, projectId, "/forbidden");
        if (!project)
            return;
        res.render("newwyrldtable", {
            auth: userId,
            projectId: project.id,
        });
    }
    catch (err) {
        next(err);
    }
}));
router.get("/newwyrldcalendar", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = (0, authz_1.requireUserOrRedirect)(req, res, "/forbidden");
        if (!userId)
            return;
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const project = yield (0, authz_1.requireProjectEditorOrRedirect)(req, res, projectId, "/forbidden");
        if (!project)
            return;
        res.render("newwyrldcalendar", {
            auth: userId,
            projectId: project.id,
        });
    }
    catch (err) {
        next(err);
    }
}));
router.get("/newwyrldrecord", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = (0, authz_1.requireUserOrRedirect)(req, res, "/forbidden");
        if (!userId)
            return;
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const project = yield (0, authz_1.requireProjectEditorOrRedirect)(req, res, projectId, "/forbidden");
        if (!project)
            return;
        res.render("newwyrldrecord", {
            auth: userId,
            projectId: project.id,
        });
    }
    catch (err) {
        next(err);
    }
}));
router.get("/newwyrld", (req, res, next) => {
    try {
        const userId = (0, authz_1.requireUserOrRedirect)(req, res, "/forbidden");
        if (!userId)
            return;
        res.render("newwyrld", { auth: userId });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
