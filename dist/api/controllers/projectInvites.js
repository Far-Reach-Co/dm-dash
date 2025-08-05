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
exports.removeProjectInvite = exports.addProjectInvite = exports.getProjectInviteByUUID = void 0;
const projectInvites_js_1 = require("../queries/projectInvites.js");
const uuid_1 = require("uuid");
function addProjectInvite(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const uuid = (0, uuid_1.v4)();
        req.body.uuid = uuid;
        try {
            const data = yield (0, projectInvites_js_1.addProjectInviteQuery)(req.body);
            const invite = data.rows[0];
            const inviteLink = `${req.protocol}://${req.get("host")}/invite?invite=${invite.uuid}`;
            const inviteId = invite.id;
            res.render("partials/wyrld_settings/invite", {
                inviteLink,
                inviteId,
                projectId: req.body.project_id,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addProjectInvite = addProjectInvite;
function getProjectInviteByUUID(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, projectInvites_js_1.getProjectInviteByUUIDQuery)(req.params.uuid);
            res.send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getProjectInviteByUUID = getProjectInviteByUUID;
function removeProjectInvite(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, projectInvites_js_1.removeProjectInviteQuery)(req.params.id);
            res.render("partials/wyrld_settings/invitebutton", {
                projectId: data.rows[0].project_id,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removeProjectInvite = removeProjectInvite;
