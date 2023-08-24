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
exports.editProjectUserIsEditor = exports.removeProjectUser = exports.getProjectUsersByProject = exports.getProjectUserByUserAndProject = exports.addProjectUserByInvite = void 0;
const projectInvites_js_1 = require("../queries/projectInvites.js");
const projectUsers_js_1 = require("../queries/projectUsers.js");
const projects_js_1 = require("../queries/projects.js");
const users_js_1 = require("../queries/users.js");
function addProjectUserByInvite(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const inviteId = req.body.invite_id;
            const inviteData = yield (0, projectInvites_js_1.getProjectInviteQuery)(inviteId);
            const invite = inviteData.rows[0];
            const projectData = yield (0, projects_js_1.getProjectQuery)(invite.project_id);
            const project = projectData.rows[0];
            if (project.user_id == req.session.user)
                throw new Error("You already own this wyrld");
            const projectUserData = yield (0, projectUsers_js_1.getProjectUserByUserAndProjectQuery)(req.session.user, project.id);
            if (projectUserData.rows.length)
                throw new Error("You are already a member of this wyrld");
            req.body.is_editor = false;
            req.body.user_id = req.session.user;
            req.body.project_id = project.id;
            const data = yield (0, projectUsers_js_1.addProjectUserQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addProjectUserByInvite = addProjectUserByInvite;
function getProjectUserByUserAndProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const data = yield (0, projectUsers_js_1.getProjectUserByUserAndProjectQuery)(req.session.user, req.params.project_id);
            res.status(200).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getProjectUserByUserAndProject = getProjectUserByUserAndProject;
function getProjectUsersByProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const projectUsersData = yield (0, projectUsers_js_1.getProjectUsersByProjectQuery)(req.params.project_id);
            const usersList = [];
            for (const projectUser of projectUsersData.rows) {
                const userData = yield (0, users_js_1.getUserByIdQuery)(projectUser.user_id);
                const user = userData.rows[0];
                user.project_user_id =
                    projectUser.id;
                user.is_editor =
                    projectUser.is_editor;
                usersList.push(user);
            }
            res.status(200).json(usersList);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getProjectUsersByProject = getProjectUsersByProject;
function removeProjectUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, projectUsers_js_1.removeProjectUserQuery)(req.params.id);
            res.status(200).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removeProjectUser = removeProjectUser;
function editProjectUserIsEditor(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let is_editor = req.body.is_editor === "on";
            const data = yield (0, projectUsers_js_1.editProjectUserQuery)(req.params.id, { is_editor });
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editProjectUserIsEditor = editProjectUserIsEditor;
