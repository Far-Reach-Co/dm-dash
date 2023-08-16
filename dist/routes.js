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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express_1 = require("express");
var users_1 = require("./api/queries/users");
var _5eCharGeneral_1 = require("./api/queries/5eCharGeneral");
var tableViews_1 = require("./api/queries/tableViews");
var playerUsers_1 = require("./api/queries/playerUsers");
var projects_1 = require("./api/queries/projects");
var projectUsers_1 = require("./api/queries/projectUsers");
var projectPlayers_1 = require("./api/queries/projectPlayers");
var playerInvites_1 = require("./api/queries/playerInvites");
var projectInvites_1 = require("./api/queries/projectInvites");
var calendars_1 = require("./api/queries/calendars");
var csrf = require("csurf");
var csrfMiddleware = csrf();
var router = (0, express_1.Router)();
router.get("/", function (req, res, next) {
    try {
        res.render("index", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/index", function (req, res, next) {
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
router.get("/login", csrfMiddleware, function (req, res, next) {
    try {
        var csrfToken = req.csrfToken();
        res.render("login", { auth: req.session.user, csrfToken: csrfToken });
    }
    catch (err) {
        next(err);
    }
});
router.get("/register", csrfMiddleware, function (req, res, next) {
    try {
        var csrfToken = req.csrfToken();
        res.render("register", { auth: req.session.user, csrfToken: csrfToken });
    }
    catch (err) {
        next(err);
    }
});
router.get("/forgotpassword", csrfMiddleware, function (req, res, next) {
    try {
        var csrfToken = req.csrfToken();
        res.render("forgotpassword", { auth: req.session.user, csrfToken: csrfToken });
    }
    catch (err) {
        next(err);
    }
});
router.get("/resetpassword", csrfMiddleware, function (req, res, next) {
    try {
        var csrfToken = req.csrfToken();
        res.render("resetpassword", { auth: req.session.user, csrfToken: csrfToken });
    }
    catch (err) {
        next(err);
    }
});
router.get("/invite", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var inviteUUID, inviteData, invite, projectData, project, projectUserData, tableData, players, projectPlayers, _i, _a, player, charData, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 11, , 12]);
                if (!req.session.user)
                    return [2, res.redirect("forbidden")];
                if (!req.query.invite)
                    return [2, res.render("invite", {
                            auth: req.session.user,
                            error: "Can't find invite"
                        })];
                inviteUUID = req.query.invite;
                return [4, (0, projectInvites_1.getProjectInviteByUUIDQuery)(inviteUUID)];
            case 1:
                inviteData = _b.sent();
                if (!inviteData.rows.length)
                    return [2, res.render("invite", {
                            auth: req.session.user,
                            error: "Can't find invite"
                        })];
                invite = inviteData.rows[0];
                return [4, (0, projects_1.getProjectQuery)(invite.project_id)];
            case 2:
                projectData = _b.sent();
                if (!projectData.rows.length)
                    return [2, res.render("invite", {
                            auth: req.session.user,
                            error: "Can't find the wyrld related to this invite"
                        })];
                project = projectData.rows[0];
                if (project.user_id == req.session.user)
                    return [2, res.render("invite", {
                            auth: req.session.user,
                            error: "You already own this wyrld"
                        })];
                return [4, (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(req.session.user, project.id)];
            case 3:
                projectUserData = _b.sent();
                if (projectUserData.rows.length)
                    return [2, res.render("invite", {
                            auth: req.session.user,
                            error: "You already joined this wyrld"
                        })];
                return [4, (0, projectUsers_1.addProjectUserQuery)({
                        project_id: invite.project_id,
                        user_id: req.session.user,
                        is_editor: false
                    })];
            case 4:
                _b.sent();
                return [4, (0, tableViews_1.getTableViewsByProjectQuery)(project.id)];
            case 5:
                tableData = _b.sent();
                players = [];
                return [4, (0, projectPlayers_1.getProjectPlayersByProjectQuery)(project.id)];
            case 6:
                projectPlayers = _b.sent();
                _i = 0, _a = projectPlayers.rows;
                _b.label = 7;
            case 7:
                if (!(_i < _a.length)) return [3, 10];
                player = _a[_i];
                return [4, (0, _5eCharGeneral_1.get5eCharGeneralQuery)(player.player_id)];
            case 8:
                charData = _b.sent();
                players.push(charData.rows[0]);
                _b.label = 9;
            case 9:
                _i++;
                return [3, 7];
            case 10:
                res.redirect("wyrld");
                return [3, 12];
            case 11:
                err_1 = _b.sent();
                next(err_1);
                return [3, 12];
            case 12: return [2];
        }
    });
}); });
router.get("/account", csrfMiddleware, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var csrfToken, rows, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.session.user)
                    return [2, res.redirect("/login")];
                csrfToken = req.csrfToken();
                return [4, (0, users_1.getUserByIdQuery)(req.session.user)];
            case 1:
                rows = (_a.sent()).rows;
                res.render("account", {
                    auth: req.session.user,
                    user: rows[0],
                    csrfToken: csrfToken
                });
                return [3, 3];
            case 2:
                err_2 = _a.sent();
                next(err_2);
                return [3, 3];
            case 3: return [2];
        }
    });
}); });
router.get("/dashboard", function (req, res, next) {
    try {
        res.render("dashboard", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5eplayer", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var playerSheetid, playerSheetUserIdData, playerSheetUserId, playerUserData, invite, inviteData, projectId, projectData, project, projectUserData, projectUser, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 13, , 14]);
                if (!req.session.user)
                    return [2, res.redirect("/login")];
                if (!req.query.id)
                    return [2, res.redirect("/dash")];
                playerSheetid = req.query.id;
                return [4, (0, _5eCharGeneral_1.get5eCharGeneralUserIdQuery)(playerSheetid)];
            case 1:
                playerSheetUserIdData = _a.sent();
                playerSheetUserId = playerSheetUserIdData.rows[0].user_id;
                if (!(playerSheetUserId != req.session.user)) return [3, 11];
                return [4, (0, playerUsers_1.getPlayerUserByUserAndPlayerQuery)(req.session.user, playerSheetid)];
            case 2:
                playerUserData = _a.sent();
                if (!!playerUserData.rows.length) return [3, 9];
                if (!!req.query.project) return [3, 4];
                invite = req.query.invite;
                if (!invite) {
                    return [2, res.render("forbidden", { auth: req.session.user })];
                }
                return [4, (0, playerInvites_1.getPlayerInviteByUUIDQuery)(invite)];
            case 3:
                inviteData = _a.sent();
                if (!inviteData.rows.length) {
                    return [2, res.render("forbidden", { auth: req.session.user })];
                }
                else {
                    return [2, res.render("5eplayer", { auth: req.session.user })];
                }
                _a.label = 4;
            case 4:
                projectId = req.query.project;
                return [4, (0, projects_1.getProjectQuery)(projectId)];
            case 5:
                projectData = _a.sent();
                if (!projectData.rows.length)
                    return [2, res.render("forbidden", { auth: req.session.user })];
                project = projectData.rows[0];
                if (!(req.session.user != project.user_id)) return [3, 7];
                return [4, (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(req.session.user, projectId)];
            case 6:
                projectUserData = _a.sent();
                if (!projectUserData.rows.length)
                    return [2, res.render("forbidden", { auth: req.session.user })];
                projectUser = projectUserData.rows[0];
                if (!projectUser.is_editor) {
                    return [2, res.render("forbidden", { auth: req.session.user })];
                }
                else {
                    return [2, res.render("5eplayer", { auth: req.session.user })];
                }
                return [3, 8];
            case 7: return [2, res.render("5eplayer", { auth: req.session.user })];
            case 8: return [3, 10];
            case 9: return [2, res.render("5eplayer", { auth: req.session.user })];
            case 10: return [3, 12];
            case 11: return [2, res.render("5eplayer", { auth: req.session.user })];
            case 12: return [3, 14];
            case 13:
                err_3 = _a.sent();
                next(err_3);
                return [3, 14];
            case 14: return [2];
        }
    });
}); });
router.get("/dash", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var tableData, charData, sharedCharData, playerUsersData, _i, _a, playerUser, puCharData, projectData, sharedProjectList, projectUserData, _b, _c, projectUser, sharedProjectData, err_4;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 14, , 15]);
                if (!req.session.user)
                    return [2, res.redirect("/login")];
                return [4, (0, tableViews_1.getTableViewsByUserQuery)(req.session.user)];
            case 1:
                tableData = _d.sent();
                return [4, (0, _5eCharGeneral_1.get5eCharsGeneralByUserQuery)(req.session.user)];
            case 2:
                charData = _d.sent();
                sharedCharData = [];
                return [4, (0, playerUsers_1.getPlayerUsersQuery)(req.session.user)];
            case 3:
                playerUsersData = _d.sent();
                if (!playerUsersData.rows.length) return [3, 7];
                _i = 0, _a = playerUsersData.rows;
                _d.label = 4;
            case 4:
                if (!(_i < _a.length)) return [3, 7];
                playerUser = _a[_i];
                return [4, (0, _5eCharGeneral_1.get5eCharGeneralQuery)(playerUser.player_id)];
            case 5:
                puCharData = _d.sent();
                sharedCharData.push(puCharData.rows[0]);
                _d.label = 6;
            case 6:
                _i++;
                return [3, 4];
            case 7: return [4, (0, projects_1.getProjectsQuery)(req.session.user)];
            case 8:
                projectData = _d.sent();
                sharedProjectList = [];
                return [4, (0, projectUsers_1.getProjectUsersQuery)(req.session.user)];
            case 9:
                projectUserData = _d.sent();
                _b = 0, _c = projectUserData.rows;
                _d.label = 10;
            case 10:
                if (!(_b < _c.length)) return [3, 13];
                projectUser = _c[_b];
                return [4, (0, projects_1.getProjectQuery)(projectUser.project_id)];
            case 11:
                sharedProjectData = _d.sent();
                sharedProjectList.push(sharedProjectData.rows[0]);
                _d.label = 12;
            case 12:
                _b++;
                return [3, 10];
            case 13:
                res.render("dash", {
                    auth: req.session.user,
                    tables: tableData.rows,
                    sheets: charData.rows,
                    sharedSheets: sharedCharData,
                    projects: projectData.rows,
                    sharedProjects: sharedProjectList
                });
                return [3, 15];
            case 14:
                err_4 = _d.sent();
                next(err_4);
                return [3, 15];
            case 15: return [2];
        }
    });
}); });
router.get("/wyrld", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, projectData, project, projectAuth, projectUserData, projectUser, tableData, players, projectPlayers, _i, _a, player, charData, calendars, err_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 11, , 12]);
                if (!req.session.user)
                    return [2, res.redirect("/login")];
                if (!req.query.id)
                    return [2, res.redirect("/dash")];
                projectId = req.query.id;
                return [4, (0, projects_1.getProjectQuery)(projectId)];
            case 1:
                projectData = _b.sent();
                project = projectData.rows[0];
                projectAuth = true;
                if (!(req.session.user != project.user_id)) return [3, 3];
                return [4, (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(req.session.user, projectId)];
            case 2:
                projectUserData = _b.sent();
                if (!projectUserData.rows.length) {
                    return [2, res.render("forbidden", { auth: req.session.user })];
                }
                projectUser = projectUserData.rows[0];
                projectAuth = projectUser.is_editor;
                _b.label = 3;
            case 3: return [4, (0, tableViews_1.getTableViewsByProjectQuery)(projectId)];
            case 4:
                tableData = _b.sent();
                players = [];
                return [4, (0, projectPlayers_1.getProjectPlayersByProjectQuery)(projectId)];
            case 5:
                projectPlayers = _b.sent();
                _i = 0, _a = projectPlayers.rows;
                _b.label = 6;
            case 6:
                if (!(_i < _a.length)) return [3, 9];
                player = _a[_i];
                return [4, (0, _5eCharGeneral_1.get5eCharGeneralQuery)(player.player_id)];
            case 7:
                charData = _b.sent();
                players.push(charData.rows[0]);
                _b.label = 8;
            case 8:
                _i++;
                return [3, 6];
            case 9: return [4, (0, calendars_1.getCalendarsQuery)(projectId)];
            case 10:
                calendars = _b.sent();
                res.render("wyrld", {
                    auth: req.session.user,
                    projectAuth: projectAuth,
                    project: project,
                    tables: tableData.rows,
                    sheets: players,
                    calendars: calendars.rows
                });
                return [3, 12];
            case 11:
                err_5 = _b.sent();
                next(err_5);
                return [3, 12];
            case 12: return [2];
        }
    });
}); });
router.get("/wyrldsettings", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, projectData, project, projectInviteData, inviteLink, inviteId, invite, projectUsersData, usersList, _i, _a, projectUser, userData, user, err_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 8, , 9]);
                if (!req.session.user)
                    return [2, res.redirect("/forbidden")];
                if (!req.query.id)
                    return [2, res.redirect("/dash")];
                projectId = req.query.id;
                return [4, (0, projects_1.getProjectQuery)(projectId)];
            case 1:
                projectData = _b.sent();
                project = projectData.rows[0];
                if (project.user_id != req.session.user) {
                    return [2, res.redirect("/forbidden")];
                }
                return [4, (0, projectInvites_1.getProjectInviteByProjectQuery)(project.id)];
            case 2:
                projectInviteData = _b.sent();
                inviteLink = null;
                inviteId = null;
                if (projectInviteData.rows.length) {
                    invite = projectInviteData.rows[0];
                    inviteLink = "".concat(req.protocol, "://").concat(req.get("host"), "/invite?invite=").concat(invite.uuid);
                    inviteId = invite.id;
                }
                return [4, (0, projectUsers_1.getProjectUsersByProjectQuery)(project.id)];
            case 3:
                projectUsersData = _b.sent();
                usersList = [];
                _i = 0, _a = projectUsersData.rows;
                _b.label = 4;
            case 4:
                if (!(_i < _a.length)) return [3, 7];
                projectUser = _a[_i];
                return [4, (0, users_1.getUserByIdQuery)(projectUser.user_id)];
            case 5:
                userData = _b.sent();
                user = userData.rows[0];
                user.project_user_id =
                    projectUser.id;
                user.is_editor =
                    projectUser.is_editor;
                usersList.push(user);
                _b.label = 6;
            case 6:
                _i++;
                return [3, 4];
            case 7: return [2, res.render("wyrldsettings", {
                    auth: req.session.user,
                    inviteLink: inviteLink,
                    inviteId: inviteId,
                    project: project,
                    users: usersList,
                    projectId: project.id
                })];
            case 8:
                err_6 = _b.sent();
                next(err_6);
                return [3, 9];
            case 9: return [2];
        }
    });
}); });
router.get("/sharedwyrldsettings", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, projectData, project, projectUserData, projectUser, err_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                if (!req.session.user)
                    return [2, res.redirect("/forbidden")];
                if (!req.query.id)
                    return [2, res.redirect("/dash")];
                projectId = req.query.id;
                return [4, (0, projects_1.getProjectQuery)(projectId)];
            case 1:
                projectData = _a.sent();
                project = projectData.rows[0];
                return [4, (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(req.session.user, project.id)];
            case 2:
                projectUserData = _a.sent();
                if (!projectUserData.rows.length)
                    return [2, res.redirect("/forbidden")];
                projectUser = projectUserData.rows[0];
                return [2, res.render("sharedwyrldsettings", {
                        auth: req.session.user,
                        projectUserId: projectUser.id,
                        project: project
                    })];
            case 3:
                err_7 = _a.sent();
                next(err_7);
                return [3, 4];
            case 4: return [2];
        }
    });
}); });
router.get("/newsheet", function (req, res, next) {
    try {
        if (!req.session.user)
            return res.redirect("/forbidden");
        res.render("newsheet", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/newtable", function (req, res, next) {
    try {
        if (!req.session.user)
            return res.redirect("/forbidden");
        res.render("newtable", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/newwyrldtable", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, projectData, project, projectUserData, projectUser, err_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                if (!req.session.user)
                    return [2, res.redirect("/forbidden")];
                if (!req.query.id)
                    return [2, res.redirect("/dash")];
                projectId = req.query.id;
                return [4, (0, projects_1.getProjectQuery)(projectId)];
            case 1:
                projectData = _a.sent();
                project = projectData.rows[0];
                if (!(req.session.user != project.user_id)) return [3, 3];
                return [4, (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(req.session.user, projectId)];
            case 2:
                projectUserData = _a.sent();
                if (!projectUserData.rows.length) {
                    return [2, res.render("forbidden", { auth: req.session.user })];
                }
                else {
                    projectUser = projectUserData.rows[0];
                    if (!projectUser.is_editor) {
                        return [2, res.render("forbidden", { auth: req.session.user })];
                    }
                    else {
                        res.render("newwyrldtable", {
                            auth: req.session.user,
                            projectId: project.id
                        });
                    }
                }
                return [3, 4];
            case 3:
                res.render("newwyrldtable", {
                    auth: req.session.user,
                    projectId: project.id
                });
                _a.label = 4;
            case 4: return [3, 6];
            case 5:
                err_8 = _a.sent();
                next(err_8);
                return [3, 6];
            case 6: return [2];
        }
    });
}); });
router.get("/newwyrldcalendar", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var projectId, projectData, project, projectUserData, projectUser, err_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                if (!req.session.user)
                    return [2, res.redirect("/forbidden")];
                if (!req.query.id)
                    return [2, res.redirect("/dash")];
                projectId = req.query.id;
                return [4, (0, projects_1.getProjectQuery)(projectId)];
            case 1:
                projectData = _a.sent();
                project = projectData.rows[0];
                if (!(req.session.user != project.user_id)) return [3, 3];
                return [4, (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(req.session.user, projectId)];
            case 2:
                projectUserData = _a.sent();
                if (!projectUserData.rows.length) {
                    return [2, res.render("forbidden", { auth: req.session.user })];
                }
                else {
                    projectUser = projectUserData.rows[0];
                    if (!projectUser.is_editor) {
                        return [2, res.render("forbidden", { auth: req.session.user })];
                    }
                    else {
                        res.render("newwyrldcalendar", {
                            auth: req.session.user,
                            projectId: project.id
                        });
                    }
                }
                return [3, 4];
            case 3:
                res.render("newwyrldcalendar", {
                    auth: req.session.user,
                    projectId: project.id
                });
                _a.label = 4;
            case 4: return [3, 6];
            case 5:
                err_9 = _a.sent();
                next(err_9);
                return [3, 6];
            case 6: return [2];
        }
    });
}); });
router.get("/newwyrld", function (req, res, next) {
    try {
        if (!req.session.user)
            return res.redirect("/forbidden");
        res.render("newwyrld", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/vtt", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var uuid, tableData, table, projectData, project, projectUserData, projectUser, err_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                if (!req.query.uuid)
                    return [2, res.render("404", { auth: req.session.user })];
                uuid = req.query.uuid;
                return [4, (0, tableViews_1.getTableViewByUUIDQuery)(uuid)];
            case 1:
                tableData = _a.sent();
                if (!tableData.rows.length) {
                    return [2, res.render("404", { auth: req.session.user })];
                }
                table = tableData.rows[0];
                if (!table.project_id) {
                    return [2, res.render("vtt", { auth: req.session.user, projectAuth: false })];
                }
                return [4, (0, projects_1.getProjectQuery)(table.project_id)];
            case 2:
                projectData = _a.sent();
                if (!projectData.rows.length) {
                    return [2, res.render("404", { auth: req.session.user })];
                }
                project = projectData.rows[0];
                if (!req.session.user) {
                    return [2, res.render("forbidden", { auth: req.session.user })];
                }
                if (project.user_id == req.session.user) {
                    return [2, res.render("vtt", { auth: req.session.user, projectAuth: true })];
                }
                return [4, (0, projectUsers_1.getProjectUserByUserAndProjectQuery)(req.session.user, project.id)];
            case 3:
                projectUserData = _a.sent();
                if (!projectUserData.rows.length) {
                    return [2, res.render("forbidden", { auth: req.session.user })];
                }
                projectUser = projectUserData.rows[0];
                return [2, res.render("vtt", {
                        auth: req.session.user,
                        projectAuth: projectUser.is_editor
                    })];
            case 4:
                err_10 = _a.sent();
                next(err_10);
                return [3, 5];
            case 5: return [2];
        }
    });
}); });
router.get("/logout", function (req, res, next) {
    req.session.destroy(function (err) {
        if (err) {
            return console.log(err);
        }
        res.redirect("/");
    });
});
router.get("/forbidden", function (req, res, next) {
    try {
        res.render("forbidden", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.use(function (req, res, next) {
    res.status(404).render("404", { auth: req.session.user });
});
module.exports = router;
