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
const tableImages_1 = require("../api/queries/tableImages");
const recentlyViewed_1 = require("../api/queries/recentlyViewed");
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
function buildRecents(items, viewedIds, getId, getDate, limit) {
    const itemMap = new Map(items.map((item) => [getId(item), item]));
    const recent = [];
    for (const id of viewedIds) {
        const item = itemMap.get(id);
        if (item)
            recent.push(item);
    }
    if (recent.length < limit) {
        const recentIds = new Set(recent.map(getId));
        const fallback = sortByDateDesc(items, getDate);
        for (const item of fallback) {
            if (recent.length >= limit)
                break;
            if (!recentIds.has(getId(item)))
                recent.push(item);
        }
    }
    return recent;
}
function loadDashData(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const tableData = yield (0, tableViews_1.getTableViewsByUserQuery)(userId);
        const charData = yield (0, _5eCharGeneral_1.get5eCharsGeneralByUserQuery)(userId);
        const sharedCharData = [];
        const playerUsersData = yield (0, playerUsers_1.getPlayerUsersQuery)(userId);
        if (playerUsersData.rows.length) {
            for (const playerUser of playerUsersData.rows) {
                const puCharData = yield (0, _5eCharGeneral_1.get5eCharGeneralQuery)(playerUser.player_id);
                sharedCharData.push(puCharData.rows[0]);
            }
        }
        const projectData = yield (0, projects_1.getProjectsQuery)(userId);
        const sharedProjectList = [];
        const projectUserData = yield (0, projectUsers_1.getProjectUsersQuery)(userId);
        for (const projectUser of projectUserData.rows) {
            const sharedProjectData = yield (0, projects_1.getProjectQuery)(projectUser.project_id);
            sharedProjectList.push(sharedProjectData.rows[0]);
        }
        const recordsData = yield (0, record_1.getRecordsByUserQuery)(userId);
        const imageCountData = yield (0, tableImages_1.getTableImageCountByUserQuery)(userId);
        const imageCount = parseInt(imageCountData.rows[0].count);
        const tables = tableData.rows;
        const records = recordsData.rows;
        const createdSheets = charData.rows;
        const sharedSheets = sharedCharData.filter(Boolean);
        const createdWyrlds = projectData.rows;
        const sharedWyrlds = sharedProjectList.filter(Boolean);
        const [rvTables, rvRecords, rvSheets, rvWyrlds] = yield Promise.all([
            (0, recentlyViewed_1.getRecentlyViewedByUser)(userId, "table", RECENT_LIMIT),
            (0, recentlyViewed_1.getRecentlyViewedByUser)(userId, "record", RECENT_LIMIT),
            (0, recentlyViewed_1.getRecentlyViewedByUser)(userId, "sheet", RECENT_LIMIT),
            (0, recentlyViewed_1.getRecentlyViewedByUser)(userId, "wyrld", RECENT_LIMIT),
        ]);
        const allSheets = [...createdSheets, ...sharedSheets];
        const allWyrlds = [...createdWyrlds, ...sharedWyrlds];
        const recentTables = buildRecents(tables, rvTables.rows.map(r => r.entity_id), (t) => t.id, (t) => t.date_created, RECENT_LIMIT);
        const recentRecords = buildRecents(records, rvRecords.rows.map(r => r.entity_id), (r) => r.id, (r) => r.created_at, RECENT_LIMIT);
        const recentSheets = buildRecents(allSheets, rvSheets.rows.map(r => r.entity_id), (s) => s.id, (s) => s.created_at, RECENT_LIMIT);
        const recentWyrlds = buildRecents(allWyrlds, rvWyrlds.rows.map(r => r.entity_id), (w) => w.id, (w) => w.date_created, RECENT_LIMIT);
        return {
            tables,
            records,
            sheets: createdSheets,
            sharedSheets,
            projects: createdWyrlds,
            sharedProjects: sharedWyrlds,
            imageCount,
            recentTables,
            recentRecords,
            recentSheets,
            recentWyrlds,
            tablesSorted: sortByTitle(tables, (table) => table.title),
            recordsSorted: sortByTitle(records, (record) => record.title),
            sheetsSorted: sortByTitle(createdSheets, (sheet) => sheet.name),
            sharedSheetsSorted: sortByTitle(sharedSheets, (sheet) => sheet.name),
            projectsSorted: sortByTitle(createdWyrlds, (project) => project.title),
            sharedProjectsSorted: sortByTitle(sharedWyrlds, (project) => project.title),
        };
    });
}
router.get("/dash", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = (0, authz_1.requireUserOrRedirect)(req, res, "/login");
        if (!userId)
            return;
        const data = yield loadDashData(userId);
        res.render("dash", Object.assign({ auth: userId, section: "overview" }, data));
    }
    catch (err) {
        next(err);
    }
}));
router.get(["/dash/tables", "/dash/records", "/dash/sheets", "/dash/wyrlds"], (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = (0, authz_1.requireUserOrRedirect)(req, res, "/login");
        if (!userId)
            return;
        const section = req.path.split("/")[2];
        const data = yield loadDashData(userId);
        res.render("dash", Object.assign({ auth: userId, section }, data));
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
