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
const users_1 = require("./api/queries/users");
const _5eCharGeneral_1 = require("./api/queries/5eCharGeneral");
const tableViews_1 = require("./api/queries/tableViews");
const playerUsers_1 = require("./api/queries/playerUsers");
const projects_1 = require("./api/queries/projects");
const projectUsers_1 = require("./api/queries/projectUsers");
const projectPlayers_1 = require("./api/queries/projectPlayers");
const playerInvites_1 = require("./api/queries/playerInvites");
const projectInvites_1 = require("./api/queries/projectInvites");
const calendars_1 = require("./api/queries/calendars");
const csrf = require("csurf");
const csrfMiddleware = csrf();
var router = (0, express_1.Router)();
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
        if (req.session.user) {
            res.redirect("/dash");
        }
        else {
            res.render("index", { auth: req.session.user });
        }
    }
    catch (err) {
        next(err);
    }
});
router.get("/login", csrfMiddleware, (req, res, next) => {
    try {
        const csrfToken = req.csrfToken();
        res.render("login", { auth: req.session.user, csrfToken });
    }
    catch (err) {
        next(err);
    }
});
router.get("/register", csrfMiddleware, (req, res, next) => {
    try {
        const csrfToken = req.csrfToken();
        res.render("register", { auth: req.session.user, csrfToken });
    }
    catch (err) {
        next(err);
    }
});
router.get("/forgotpassword", csrfMiddleware, (req, res, next) => {
    try {
        const csrfToken = req.csrfToken();
        res.render("forgotpassword", { auth: req.session.user, csrfToken });
    }
    catch (err) {
        next(err);
    }
});
router.get("/resetpassword", csrfMiddleware, (req, res, next) => {
    try {
        const csrfToken = req.csrfToken();
        res.render("resetpassword", { auth: req.session.user, csrfToken });
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
router.get("/preaethrend", (req, res, next) => {
    try {
        res.render("preaethrend", { auth: req.session.user });
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
router.get("/invite", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.session.user)
            return res.redirect("forbidden");
        if (!req.query.invite)
            return res.render("invite", {
                auth: req.session.user,
                error: "Can't find invite",
            });
        const inviteUUID = req.query.invite;
        const inviteData = yield (0, projectInvites_1.getProjectInviteByUUIDQuery)(inviteUUID);
        if (!inviteData.rows.length)
            return res.render("invite", {
                auth: req.session.user,
                error: "Can't find invite",
            });
        const invite = inviteData.rows[0];
        const projectData = yield (0, projects_1.getProjectQuery)(invite.project_id);
        if (!projectData.rows.length)
            return res.render("invite", {
                auth: req.session.user,
                error: "Can't find the wyrld related to this invite",
            });
        const project = projectData.rows[0];
        if (project.user_id == req.session.user)
            return res.render("invite", {
                auth: req.session.user,
                error: "You already own this wyrld",
            });
        const projectUserData = yield (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(req.session.user, project.id);
        if (projectUserData.rows.length)
            return res.render("invite", {
                auth: req.session.user,
                error: "You already joined this wyrld",
            });
        yield (0, projectUsers_1.addProjectUserQuery)({
            project_id: invite.project_id,
            user_id: req.session.user,
            is_editor: false,
        });
        const tableData = yield (0, tableViews_1.getTableViewsByProjectQuery)(project.id);
        const players = [];
        const projectPlayers = yield (0, projectPlayers_1.getProjectPlayersByProjectQuery)(project.id);
        for (var player of projectPlayers.rows) {
            const charData = yield (0, _5eCharGeneral_1.get5eCharGeneralQuery)(player.player_id);
            players.push(charData.rows[0]);
        }
        res.redirect("wyrld");
    }
    catch (err) {
        next(err);
    }
}));
router.get("/account", csrfMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.session.user)
            return res.redirect("/login");
        const csrfToken = req.csrfToken();
        const { rows } = yield (0, users_1.getUserByIdQuery)(req.session.user);
        res.render("account", {
            auth: req.session.user,
            user: rows[0],
            csrfToken,
        });
    }
    catch (err) {
        next(err);
    }
}));
router.get("/dashboard", (req, res, next) => {
    try {
        res.render("dashboard", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5eplayer", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.session.user)
            return res.redirect("/login");
        if (!req.query.id)
            return res.redirect("/dash");
        const playerSheetid = req.query.id;
        const playerSheetUserIdData = yield (0, _5eCharGeneral_1.get5eCharGeneralUserIdQuery)(playerSheetid);
        const playerSheetUserId = playerSheetUserIdData.rows[0].user_id;
        if (playerSheetUserId != req.session.user) {
            const playerUserData = yield (0, playerUsers_1.getPlayerUserByUserAndPlayerQuery)(req.session.user, playerSheetid);
            if (!playerUserData.rows.length) {
                if (!req.query.project) {
                    const invite = req.query.invite;
                    if (!invite) {
                        return res.render("forbidden", { auth: req.session.user });
                    }
                    const inviteData = yield (0, playerInvites_1.getPlayerInviteByUUIDQuery)(invite);
                    if (!inviteData.rows.length) {
                        return res.render("forbidden", { auth: req.session.user });
                    }
                    else {
                        return res.render("5eplayer", { auth: req.session.user });
                    }
                }
                const projectId = req.query.project;
                const projectData = yield (0, projects_1.getProjectQuery)(projectId);
                if (!projectData.rows.length)
                    return res.render("forbidden", { auth: req.session.user });
                const project = projectData.rows[0];
                if (req.session.user != project.user_id) {
                    const projectUserData = yield (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(req.session.user, projectId);
                    if (!projectUserData.rows.length)
                        return res.render("forbidden", { auth: req.session.user });
                    const projectUser = projectUserData.rows[0];
                    if (!projectUser.is_editor) {
                        return res.render("forbidden", { auth: req.session.user });
                    }
                    else {
                        return res.render("5eplayer", { auth: req.session.user });
                    }
                }
                else {
                    return res.render("5eplayer", { auth: req.session.user });
                }
            }
            else {
                return res.render("5eplayer", { auth: req.session.user });
            }
        }
        else {
            return res.render("5eplayer", { auth: req.session.user });
        }
    }
    catch (err) {
        next(err);
    }
}));
router.get("/dash", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.session.user)
            return res.redirect("/login");
        const tableData = yield (0, tableViews_1.getTableViewsByUserQuery)(req.session.user);
        const charData = yield (0, _5eCharGeneral_1.get5eCharsGeneralByUserQuery)(req.session.user);
        const sharedCharData = [];
        const playerUsersData = yield (0, playerUsers_1.getPlayerUsersQuery)(req.session.user);
        if (playerUsersData.rows.length) {
            for (const playerUser of playerUsersData.rows) {
                const puCharData = yield (0, _5eCharGeneral_1.get5eCharGeneralQuery)(playerUser.player_id);
                sharedCharData.push(puCharData.rows[0]);
            }
        }
        const projectData = yield (0, projects_1.getProjectsQuery)(req.session.user);
        const sharedProjectList = [];
        const projectUserData = yield (0, projectUsers_1.getProjectUsersQuery)(req.session.user);
        for (const projectUser of projectUserData.rows) {
            const sharedProjectData = yield (0, projects_1.getProjectQuery)(projectUser.project_id);
            sharedProjectList.push(sharedProjectData.rows[0]);
        }
        res.render("dash", {
            auth: req.session.user,
            tables: tableData.rows,
            sheets: charData.rows,
            sharedSheets: sharedCharData,
            projects: projectData.rows,
            sharedProjects: sharedProjectList,
        });
    }
    catch (err) {
        next(err);
    }
}));
router.get("/wyrld", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.session.user)
            return res.redirect("/login");
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const projectData = yield (0, projects_1.getProjectQuery)(projectId);
        const project = projectData.rows[0];
        let projectAuth = true;
        if (req.session.user != project.user_id) {
            const projectUserData = yield (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(req.session.user, projectId);
            if (!projectUserData.rows.length) {
                return res.render("forbidden", { auth: req.session.user });
            }
            const projectUser = projectUserData.rows[0];
            projectAuth = projectUser.is_editor;
        }
        const tableData = yield (0, tableViews_1.getTableViewsByProjectQuery)(projectId);
        const players = [];
        const projectPlayers = yield (0, projectPlayers_1.getProjectPlayersByProjectQuery)(projectId);
        for (var player of projectPlayers.rows) {
            const charData = yield (0, _5eCharGeneral_1.get5eCharGeneralQuery)(player.player_id);
            players.push(charData.rows[0]);
        }
        const calendars = yield (0, calendars_1.getCalendarsQuery)(projectId);
        res.render("wyrld", {
            auth: req.session.user,
            projectAuth,
            project: project,
            tables: tableData.rows,
            sheets: players,
            calendars: calendars.rows,
        });
    }
    catch (err) {
        next(err);
    }
}));
router.get("/wyrldsettings", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.session.user)
            return res.redirect("/forbidden");
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const projectData = yield (0, projects_1.getProjectQuery)(projectId);
        const project = projectData.rows[0];
        if (project.user_id != req.session.user) {
            return res.redirect("/forbidden");
        }
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
        if (!req.session.user)
            return res.redirect("/forbidden");
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const projectData = yield (0, projects_1.getProjectQuery)(projectId);
        const project = projectData.rows[0];
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
router.get("/newsheet", (req, res, next) => {
    try {
        if (!req.session.user)
            return res.redirect("/forbidden");
        res.render("newsheet", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/newtable", (req, res, next) => {
    try {
        if (!req.session.user)
            return res.redirect("/forbidden");
        res.render("newtable", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/newwyrldtable", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.session.user)
            return res.redirect("/forbidden");
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const projectData = yield (0, projects_1.getProjectQuery)(projectId);
        const project = projectData.rows[0];
        if (req.session.user != project.user_id) {
            const projectUserData = yield (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(req.session.user, projectId);
            if (!projectUserData.rows.length) {
                return res.render("forbidden", { auth: req.session.user });
            }
            else {
                const projectUser = projectUserData.rows[0];
                if (!projectUser.is_editor) {
                    return res.render("forbidden", { auth: req.session.user });
                }
                else {
                    res.render("newwyrldtable", {
                        auth: req.session.user,
                        projectId: project.id,
                    });
                }
            }
        }
        else {
            res.render("newwyrldtable", {
                auth: req.session.user,
                projectId: project.id,
            });
        }
    }
    catch (err) {
        next(err);
    }
}));
router.get("/newwyrldcalendar", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.session.user)
            return res.redirect("/forbidden");
        if (!req.query.id)
            return res.redirect("/dash");
        const projectId = req.query.id;
        const projectData = yield (0, projects_1.getProjectQuery)(projectId);
        const project = projectData.rows[0];
        if (req.session.user != project.user_id) {
            const projectUserData = yield (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(req.session.user, projectId);
            if (!projectUserData.rows.length) {
                return res.render("forbidden", { auth: req.session.user });
            }
            else {
                const projectUser = projectUserData.rows[0];
                if (!projectUser.is_editor) {
                    return res.render("forbidden", { auth: req.session.user });
                }
                else {
                    res.render("newwyrldcalendar", {
                        auth: req.session.user,
                        projectId: project.id,
                    });
                }
            }
        }
        else {
            res.render("newwyrldcalendar", {
                auth: req.session.user,
                projectId: project.id,
            });
        }
    }
    catch (err) {
        next(err);
    }
}));
router.get("/newwyrld", (req, res, next) => {
    try {
        if (!req.session.user)
            return res.redirect("/forbidden");
        res.render("newwyrld", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
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
        if (!table.project_id) {
            return res.render("vtt", { auth: req.session.user, projectAuth: false });
        }
        const projectData = yield (0, projects_1.getProjectQuery)(table.project_id);
        if (!projectData.rows.length) {
            return res.render("404", { auth: req.session.user });
        }
        const project = projectData.rows[0];
        if (!req.session.user) {
            return res.render("forbidden", { auth: req.session.user });
        }
        if (project.user_id == req.session.user) {
            return res.render("vtt", { auth: req.session.user, projectAuth: true });
        }
        const projectUserData = yield (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(req.session.user, project.id);
        if (!projectUserData.rows.length) {
            return res.render("forbidden", { auth: req.session.user });
        }
        const projectUser = projectUserData.rows[0];
        return res.render("vtt", {
            auth: req.session.user,
            projectAuth: projectUser.is_editor,
        });
    }
    catch (err) {
        next(err);
    }
}));
router.get("/logout", (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect("/");
    });
});
router.get("/forbidden", (req, res, next) => {
    try {
        res.render("forbidden", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.use((req, res, next) => {
    res.status(404).render("404", { auth: req.session.user });
});
module.exports = router;
