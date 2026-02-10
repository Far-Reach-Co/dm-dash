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
exports.getProjects = getProjects;
exports.getProject = getProject;
exports.addProject = addProject;
exports.removeProject = removeProject;
exports.editProjectTitle = editProjectTitle;
const projects_js_1 = require("../queries/projects.js");
const projectInvites_js_1 = require("../queries/projectInvites.js");
const projectUsers_js_1 = require("../queries/projectUsers.js");
const images_js_1 = require("../queries/images.js");
const s3_js_1 = require("./s3.js");
const tableViews_js_1 = require("../queries/tableViews.js");
const tableImages_js_1 = require("../queries/tableImages.js");
const users_js_1 = require("../queries/users.js");
const enums_js_1 = require("../../lib/enums.js");
const eventLogger_1 = require("../../lib/eventLogger");
function addProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const projectsByUserData = yield (0, projects_js_1.getProjectsQuery)(req.session.user);
            if (projectsByUserData.rows.length >= 2) {
                const userData = yield (0, users_js_1.getUserByIdQuery)(req.session.user);
                if (!userData.rows[0].is_pro)
                    throw { status: 402, message: enums_js_1.userSubscriptionStatus.userIsNotPro };
            }
            req.body.user_id = req.session.user;
            const data = yield (0, projects_js_1.addProjectQuery)(req.body);
            yield (0, tableViews_js_1.addTableViewByProjectQuery)({
                project_id: data.rows[0].id,
                title: "First Wyrld Table",
            });
            (0, eventLogger_1.logEventAsync)({
                userId: req.session.user,
                projectId: data.rows[0].id,
                eventType: eventLogger_1.EventType.PROJECT_CREATED,
                eventData: { title: data.rows[0].title },
                req,
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
                project.date_joined = projectUser.date_joined;
                project.is_editor = projectUser.is_editor;
            }
            res.send(project);
        }
        catch (err) {
            next(err);
        }
    });
}
function getProjects(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const userId = req.session.user;
            const projectsData = yield (0, projects_js_1.getProjectsQuery)(userId);
            const ownedProjects = projectsData.rows;
            const ownedIds = new Set(ownedProjects.map((p) => String(p.id)));
            const projectUserData = yield (0, projectUsers_js_1.getProjectUsersQuery)(userId);
            const projectUsers = (projectUserData === null || projectUserData === void 0 ? void 0 : projectUserData.rows) || [];
            const joinedProjectIds = projectUsers
                .map((pu) => pu.project_id)
                .filter((id) => !ownedIds.has(String(id)));
            let joinedProjects = [];
            if (joinedProjectIds.length) {
                const joinedProjectsData = yield (0, projects_js_1.getProjectsByIdsQuery)(joinedProjectIds);
                joinedProjects = joinedProjectsData.rows;
                const projectUserByProjectId = new Map(projectUsers.map((pu) => [String(pu.project_id), pu]));
                for (const project of joinedProjects) {
                    const projectUser = projectUserByProjectId.get(String(project.id));
                    if (projectUser) {
                        project.was_joined = true;
                        project.project_user_id = projectUser.id;
                        project.date_joined =
                            projectUser.date_joined;
                        project.is_editor = projectUser.is_editor;
                    }
                }
            }
            const allProjects = ownedProjects.concat(joinedProjects);
            if (allProjects.length) {
                const inviteData = yield (0, projectInvites_js_1.getProjectInvitesByProjectIdsQuery)(allProjects.map((p) => p.id));
                const inviteByProjectId = new Map();
                for (const invite of inviteData.rows) {
                    const key = String(invite.project_id);
                    if (!inviteByProjectId.has(key)) {
                        inviteByProjectId.set(key, invite);
                    }
                }
                for (const project of allProjects) {
                    const invite = inviteByProjectId.get(String(project.id));
                    if (invite)
                        project.project_invite = invite;
                }
            }
            res.send(allProjects);
        }
        catch (err) {
            next(err);
        }
    });
}
function removeProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const projectData = yield (0, projects_js_1.getProjectQuery)(req.params.id);
            const project = projectData.rows[0];
            if (req.session.user != project.user_id)
                throw new Error("User is not owner");
            const tableImages = yield (0, tableImages_js_1.getTableImagesByProjectQuery)(req.params.id);
            for (const tableImage of tableImages.rows) {
                const imageData = yield (0, images_js_1.getImageQuery)(tableImage.image_id);
                const image = imageData.rows[0];
                yield (0, s3_js_1.removeImageFromBucket)("wyrld/images", image);
                yield (0, tableImages_js_1.removeTableImageQuery)(tableImage.id);
            }
            const tableViews = yield (0, tableViews_js_1.getTableViewsByProjectQuery)(req.params.id);
            for (const tableView of tableViews.rows) {
                yield (0, tableViews_js_1.removeTableViewQuery)(tableView.id);
            }
            yield (0, projects_js_1.removeProjectQuery)(req.params.id);
            res.setHeader("HX-Redirect", "/dash");
            res.send();
        }
        catch (err) {
            next(err);
        }
    });
}
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
