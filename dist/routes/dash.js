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
const tableViews_1 = require("../api/queries/tableViews");
const playerUsers_1 = require("../api/queries/playerUsers");
const projects_1 = require("../api/queries/projects");
const projectUsers_1 = require("../api/queries/projectUsers");
const record_1 = require("../api/queries/record");
const authz_1 = require("../lib/authz");
const router = (0, express_1.Router)();
router.get("/dash", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(0, authz_1.requireUserOrRedirect)(req, res, "/login"))
            return;
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
        const recordsData = yield (0, record_1.getRecordsByUserQuery)(req.session.user);
        res.render("dash", {
            auth: req.session.user,
            tables: tableData.rows,
            sheets: charData.rows,
            sharedSheets: sharedCharData,
            projects: projectData.rows,
            sharedProjects: sharedProjectList,
            records: recordsData.rows,
        });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
