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
exports.editProjectTitle = exports.removeProject = exports.addProject = exports.getProject = exports.getProjects = void 0;
const projects_js_1 = require("../queries/projects.js");
const projectInvites_js_1 = require("../queries/projectInvites.js");
const projectUsers_js_1 = require("../queries/projectUsers.js");
const calendars_js_1 = require("../queries/calendars.js");
const months_js_1 = require("../queries/months.js");
const days_js_1 = require("../queries/days.js");
const images_js_1 = require("../queries/images.js");
const s3_js_1 = require("./s3.js");
const tableViews_js_1 = require("../queries/tableViews.js");
const tableImages_js_1 = require("../queries/tableImages.js");
const projectPlayers_js_1 = require("../queries/projectPlayers.js");
function addProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            req.body.user_id = req.session.user;
            const data = yield (0, projects_js_1.addProjectQuery)(req.body);
            yield (0, tableViews_js_1.addTableViewByProjectQuery)({
                project_id: data.rows[0].id,
                title: "First Wyrld Table",
            });
            res
                .set("HX-Redirect", `/wyrld?id=${data.rows[0].id}`)
                .send("Form submission was successful.");
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addProject = addProject;
function getProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const projectData = yield (0, projects_js_1.getProjectQuery)(req.params.id);
            const project = projectData.rows[0];
            if (!req.session.user)
                throw new Error("User is not logged in");
            const projectUsersData = yield (0, projectUsers_js_1.getProjectUserByUserAndProjectQuery)(req.session.user, project.id);
            if (projectUsersData.rows.length) {
                const projectUser = projectUsersData.rows[0];
                project.was_joined = true;
                project.project_user_id = projectUser.id;
                project.date_joined =
                    projectUser.date_joined;
                project.is_editor = projectUser.is_editor;
            }
            res.send(project);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getProject = getProject;
function getProjects(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const projectsData = yield (0, projects_js_1.getProjectsQuery)(req.session.user);
            const projectUserData = yield (0, projectUsers_js_1.getProjectUsersQuery)(req.session.user);
            if (projectUserData &&
                projectUserData.rows &&
                projectUserData.rows.length) {
                for (var projectUser of projectUserData.rows) {
                    const projectData = yield (0, projects_js_1.getProjectQuery)(projectUser.project_id);
                    if (projectData && projectData.rows && projectData.rows.length) {
                        const project = projectData.rows[0];
                        project.was_joined = true;
                        project.project_user_id =
                            projectUser.id;
                        project.date_joined =
                            projectUser.date_joined;
                        project.is_editor =
                            projectUser.is_editor;
                        projectsData.rows.push(project);
                    }
                }
            }
            for (var project of projectsData.rows) {
                const projectInvites = yield (0, projectInvites_js_1.getProjectInviteByProjectQuery)(project.id);
                if (projectInvites && projectInvites.rows && projectInvites.rows.length)
                    project.project_invite =
                        projectInvites.rows[0];
            }
            res.send(projectsData.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getProjects = getProjects;
function removeProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const projectData = yield (0, projects_js_1.getProjectQuery)(req.params.id);
            const project = projectData.rows[0];
            if (req.session.user != project.user_id)
                throw new Error("User is not owner");
            yield (0, projects_js_1.removeProjectQuery)(req.params.id);
            const calendarData = yield (0, calendars_js_1.getCalendarQuery)(req.params.id);
            calendarData.rows.forEach((calendar) => __awaiter(this, void 0, void 0, function* () {
                yield (0, calendars_js_1.removeCalendarQuery)(calendar.id);
                const monthsData = yield (0, months_js_1.getMonthsQuery)(calendar.id);
                monthsData.rows.forEach((month) => __awaiter(this, void 0, void 0, function* () {
                    yield (0, months_js_1.removeMonthQuery)(month.id);
                }));
                const daysData = yield (0, days_js_1.getDaysQuery)(calendar.id);
                daysData.rows.forEach((day) => __awaiter(this, void 0, void 0, function* () {
                    yield (0, days_js_1.removeDayQuery)(day.id);
                }));
            }));
            const projectInvitesData = yield (0, projectInvites_js_1.getProjectInviteByProjectQuery)(req.params.id);
            projectInvitesData.rows.forEach((invite) => __awaiter(this, void 0, void 0, function* () {
                yield (0, projectInvites_js_1.removeProjectInviteQuery)(invite.id);
            }));
            const projectUsersData = yield (0, projectUsers_js_1.getProjectUsersByProjectQuery)(req.params.id);
            projectUsersData.rows.forEach((user) => __awaiter(this, void 0, void 0, function* () {
                yield (0, projectUsers_js_1.removeProjectUserQuery)(user.id);
            }));
            const projectPlayersData = yield (0, projectPlayers_js_1.getProjectPlayersByProjectQuery)(req.params.id);
            projectPlayersData.rows.forEach((player) => __awaiter(this, void 0, void 0, function* () {
                yield (0, projectPlayers_js_1.removeProjectPlayerQuery)(player.id);
            }));
            const tableImages = yield (0, tableImages_js_1.getTableImagesByProjectQuery)(req.params.id);
            tableImages.rows.forEach((tableImage) => __awaiter(this, void 0, void 0, function* () {
                const imageData = yield (0, images_js_1.getImageQuery)(tableImage.image_id);
                const image = imageData.rows[0];
                yield (0, s3_js_1.removeImage)("wyrld/images", image);
                yield (0, tableImages_js_1.removeTableImageQuery)(tableImage.id);
            }));
            const tableViews = yield (0, tableViews_js_1.getTableViewsByProjectQuery)(req.params.id);
            tableViews.rows.forEach((tableView) => __awaiter(this, void 0, void 0, function* () {
                yield (0, tableViews_js_1.removeTableViewQuery)(tableView.id);
            }));
            res.setHeader("HX-Redirect", "/dash");
            res.send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removeProject = removeProject;
function editProjectTitle(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const projectData = yield (0, projects_js_1.getProjectQuery)(req.params.id);
            const project = projectData.rows[0];
            if (req.session.user != project.user_id)
                throw new Error("User is not owner");
            yield (0, projects_js_1.editProjectQuery)(req.params.id, {
                title: req.body.title,
            });
            res.send("Saved");
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editProjectTitle = editProjectTitle;
