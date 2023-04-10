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
var _a = require("../queries/projects.js"), addProjectQuery = _a.addProjectQuery, getProjectQuery = _a.getProjectQuery, getProjectsQuery = _a.getProjectsQuery, removeProjectQuery = _a.removeProjectQuery, editProjectQuery = _a.editProjectQuery;
var _b = require("../queries/projectInvites.js"), getProjectInviteByProjectQuery = _b.getProjectInviteByProjectQuery, removeProjectInviteQuery = _b.removeProjectInviteQuery;
var _c = require("../queries/projectUsers.js"), getProjectUsersQuery = _c.getProjectUsersQuery, getProjectUserByUserAndProjectQuery = _c.getProjectUserByUserAndProjectQuery, getProjectUsersByProjectQuery = _c.getProjectUsersByProjectQuery, removeProjectUserQuery = _c.removeProjectUserQuery;
var _d = require("../queries/calendars.js"), getCalendarQuery = _d.getCalendarQuery, removeCalendarQuery = _d.removeCalendarQuery;
var _e = require("../queries/months.js"), getMonthsQuery = _e.getMonthsQuery, removeMonthQuery = _e.removeMonthQuery;
var _f = require("../queries/days.js"), getDaysQuery = _f.getDaysQuery, removeDayQuery = _f.removeDayQuery;
var _g = require("../queries/locations.js"), getLocationsQuery = _g.getLocationsQuery, removeLocationQuery = _g.removeLocationQuery;
var _h = require("../queries/characters.js"), getCharactersQuery = _h.getCharactersQuery, removeCharacterQuery = _h.removeCharacterQuery;
var _j = require("../queries/clocks.js"), getClocksQuery = _j.getClocksQuery, removeClockQuery = _j.removeClockQuery;
var _k = require("../queries/counters.js"), removeCounterQuery = _k.removeCounterQuery, getAllCountersByProjectQuery = _k.getAllCountersByProjectQuery;
var _l = require("../queries/events.js"), getEventsQuery = _l.getEventsQuery, removeEventQuery = _l.removeEventQuery;
var _m = require("../queries/items.js"), getItemsQuery = _m.getItemsQuery, removeItemQuery = _m.removeItemQuery;
var _o = require("../queries/lores.js"), getLoresQuery = _o.getLoresQuery, removeLoreQuery = _o.removeLoreQuery;
var _p = require("../queries/loreRelations.js"), removeLoreRelationQuery = _p.removeLoreRelationQuery, getLoreRelationsQuery = _p.getLoreRelationsQuery;
var _q = require("../queries/notes.js"), getAllNotesByProjectQuery = _q.getAllNotesByProjectQuery, removeNoteQuery = _q.removeNoteQuery;
var _r = require("../queries/images.js"), getImageQuery = _r.getImageQuery, removeImageQuery = _r.removeImageQuery;
var removeFile = require("./s3.js").removeFile;
var _s = require("../queries/tableViews.js"), addTableViewQuery = _s.addTableViewQuery, getTableViewsQuery = _s.getTableViewsQuery, removeTableViewQuery = _s.removeTableViewQuery;
var _t = require("../queries/tableImages.js"), getTableImagesQuery = _t.getTableImagesQuery, removeTableImageQuery = _t.removeTableImageQuery;
var USER_IS_NOT_PRO = require("../../lib/enums.js").USER_IS_NOT_PRO;
function addProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var projectsData, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, getProjectsQuery(req.user.id)];
                case 1:
                    projectsData = _a.sent();
                    if (projectsData.rows.length >= 3) {
                        if (!req.user.is_pro)
                            throw { status: 402, message: USER_IS_NOT_PRO };
                    }
                    req.body.user_id = req.user.id;
                    return [4, addProjectQuery(req.body)];
                case 2:
                    data = _a.sent();
                    return [4, addTableViewQuery({ project_id: data.rows[0].id })];
                case 3:
                    _a.sent();
                    res.status(201).json(data.rows[0]);
                    return [3, 5];
                case 4:
                    err_1 = _a.sent();
                    next(err_1);
                    return [3, 5];
                case 5: return [2];
            }
        });
    });
}
function getProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var projectData, project, projectUsersData, projectUser, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4, getProjectQuery(req.params.id)];
                case 1:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    return [4, getProjectUserByUserAndProjectQuery(req.user.id, project.id)];
                case 2:
                    projectUsersData = _a.sent();
                    if (projectUsersData.rows.length) {
                        projectUser = projectUsersData.rows[0];
                        project.was_joined = true;
                        project.project_user_id = projectUser.id;
                        project.date_joined = projectUser.date_joined;
                        project.is_editor = projectUser.is_editor;
                    }
                    res.send(project);
                    return [3, 4];
                case 3:
                    err_2 = _a.sent();
                    next(err_2);
                    return [3, 4];
                case 4: return [2];
            }
        });
    });
}
function getProjects(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var projectsData, projectUserData, _i, _a, projectUser, projectData, project_1, _b, _c, project, projectInvites, err_3;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 11, , 12]);
                    return [4, getProjectsQuery(req.user.id)];
                case 1:
                    projectsData = _d.sent();
                    return [4, getProjectUsersQuery(req.user.id)];
                case 2:
                    projectUserData = _d.sent();
                    if (!(projectUserData &&
                        projectUserData.rows &&
                        projectUserData.rows.length)) return [3, 6];
                    _i = 0, _a = projectUserData.rows;
                    _d.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3, 6];
                    projectUser = _a[_i];
                    return [4, getProjectQuery(projectUser.project_id)];
                case 4:
                    projectData = _d.sent();
                    if (projectData && projectData.rows && projectData.rows.length) {
                        project_1 = projectData.rows[0];
                        project_1.was_joined = true;
                        project_1.project_user_id = projectUser.id;
                        project_1.date_joined = projectUser.date_joined;
                        project_1.is_editor = projectUser.is_editor;
                        projectsData.rows.push(project_1);
                    }
                    _d.label = 5;
                case 5:
                    _i++;
                    return [3, 3];
                case 6:
                    _b = 0, _c = projectsData.rows;
                    _d.label = 7;
                case 7:
                    if (!(_b < _c.length)) return [3, 10];
                    project = _c[_b];
                    return [4, getProjectInviteByProjectQuery(project.id)];
                case 8:
                    projectInvites = _d.sent();
                    if (projectInvites && projectInvites.rows && projectInvites.rows.length)
                        project.project_invite = projectInvites.rows[0];
                    _d.label = 9;
                case 9:
                    _b++;
                    return [3, 7];
                case 10:
                    res.send(projectsData.rows);
                    return [3, 12];
                case 11:
                    err_3 = _d.sent();
                    next(err_3);
                    return [3, 12];
                case 12: return [2];
            }
        });
    });
}
function removeProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var projectData, project, calendarData, locationsData, charactersData, clocksData, countersData, eventsData, itemsData, loreData, notesData, projectInvitesData, projectUsersData, tableImages, tableViews, err_4;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 16, , 17]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, getProjectQuery(req.params.id)];
                case 1:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (project.user_id !== req.user.id)
                        throw { status: 403, message: "Forbidden" };
                    return [4, removeProjectQuery(req.params.id)];
                case 2:
                    _a.sent();
                    return [4, getCalendarQuery(req.params.id)];
                case 3:
                    calendarData = _a.sent();
                    calendarData.rows.forEach(function (calendar) { return __awaiter(_this, void 0, void 0, function () {
                        var monthsData, daysData;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, removeCalendarQuery(calendar.id)];
                                case 1:
                                    _a.sent();
                                    return [4, getMonthsQuery(calendar.id)];
                                case 2:
                                    monthsData = _a.sent();
                                    monthsData.rows.forEach(function (month) { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4, removeMonthQuery(month.id)];
                                                case 1:
                                                    _a.sent();
                                                    return [2];
                                            }
                                        });
                                    }); });
                                    return [4, getDaysQuery(calendar.id)];
                                case 3:
                                    daysData = _a.sent();
                                    daysData.rows.forEach(function (day) { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4, removeDayQuery(day.id)];
                                                case 1:
                                                    _a.sent();
                                                    return [2];
                                            }
                                        });
                                    }); });
                                    return [2];
                            }
                        });
                    }); });
                    return [4, getLocationsQuery({
                            projectId: req.params.id,
                            limit: 10000,
                            offset: 0
                        })];
                case 4:
                    locationsData = _a.sent();
                    locationsData.rows.forEach(function (location) { return __awaiter(_this, void 0, void 0, function () {
                        var imageData, image;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, removeLocationQuery(location.id)];
                                case 1:
                                    _a.sent();
                                    if (!location.image_id) return [3, 5];
                                    return [4, getImageQuery(location.image_id)];
                                case 2:
                                    imageData = _a.sent();
                                    image = imageData.rows[0];
                                    return [4, removeFile("wyrld/images", image)];
                                case 3:
                                    _a.sent();
                                    return [4, removeImageQuery(image.id)];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5: return [2];
                            }
                        });
                    }); });
                    return [4, getCharactersQuery({
                            projectId: req.params.id,
                            limit: 10000,
                            offset: 0
                        })];
                case 5:
                    charactersData = _a.sent();
                    charactersData.rows.forEach(function (character) { return __awaiter(_this, void 0, void 0, function () {
                        var imageData, image;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, removeCharacterQuery(character.id)];
                                case 1:
                                    _a.sent();
                                    if (!character.image_id) return [3, 5];
                                    return [4, getImageQuery(character.image_id)];
                                case 2:
                                    imageData = _a.sent();
                                    image = imageData.rows[0];
                                    return [4, removeFile("wyrld/images", image)];
                                case 3:
                                    _a.sent();
                                    return [4, removeImageQuery(image.id)];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5: return [2];
                            }
                        });
                    }); });
                    return [4, getClocksQuery(req.params.id)];
                case 6:
                    clocksData = _a.sent();
                    clocksData.rows.forEach(function (clock) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, removeClockQuery(clock.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, getAllCountersByProjectQuery(req.params.id)];
                case 7:
                    countersData = _a.sent();
                    countersData.rows.forEach(function (counter) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, removeCounterQuery(counter.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, getEventsQuery({
                            projectId: req.params.id,
                            limit: 1000000,
                            offset: 0
                        })];
                case 8:
                    eventsData = _a.sent();
                    eventsData.rows.forEach(function (event) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, removeEventQuery(event.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, getItemsQuery({
                            projectId: req.params.id,
                            limit: 10000,
                            offset: 0
                        })];
                case 9:
                    itemsData = _a.sent();
                    itemsData.rows.forEach(function (item) { return __awaiter(_this, void 0, void 0, function () {
                        var imageData, image;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, removeItemQuery(item.id)];
                                case 1:
                                    _a.sent();
                                    if (!item.image_id) return [3, 5];
                                    return [4, getImageQuery(item.image_id)];
                                case 2:
                                    imageData = _a.sent();
                                    image = imageData.rows[0];
                                    return [4, removeFile("wyrld/images", image)];
                                case 3:
                                    _a.sent();
                                    return [4, removeImageQuery(image.id)];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5: return [2];
                            }
                        });
                    }); });
                    return [4, getLoresQuery({
                            projectId: req.params.id,
                            limit: 10000,
                            offset: 0
                        })];
                case 10:
                    loreData = _a.sent();
                    loreData.rows.forEach(function (lore) { return __awaiter(_this, void 0, void 0, function () {
                        var imageData, image, relationsData;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, removeLoreQuery(lore.id)];
                                case 1:
                                    _a.sent();
                                    if (!lore.image_id) return [3, 5];
                                    return [4, getImageQuery(lore.image_id)];
                                case 2:
                                    imageData = _a.sent();
                                    image = imageData.rows[0];
                                    return [4, removeFile("wyrld/images", image)];
                                case 3:
                                    _a.sent();
                                    return [4, removeImageQuery(image.id)];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5: return [4, getLoreRelationsQuery(lore.id)];
                                case 6:
                                    relationsData = _a.sent();
                                    relationsData.rows.forEach(function (relation) { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4, removeLoreRelationQuery(relation.id)];
                                                case 1:
                                                    _a.sent();
                                                    return [2];
                                            }
                                        });
                                    }); });
                                    return [2];
                            }
                        });
                    }); });
                    return [4, getAllNotesByProjectQuery(req.params.id)];
                case 11:
                    notesData = _a.sent();
                    notesData.rows.forEach(function (note) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, removeNoteQuery(note.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, getProjectInviteByProjectQuery(req.params.id)];
                case 12:
                    projectInvitesData = _a.sent();
                    projectInvitesData.rows.forEach(function (invite) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, removeProjectInviteQuery(invite.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, getProjectUsersByProjectQuery(req.params.id)];
                case 13:
                    projectUsersData = _a.sent();
                    projectUsersData.rows.forEach(function (user) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, removeProjectUserQuery(user.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, getTableImagesQuery(req.params.id)];
                case 14:
                    tableImages = _a.sent();
                    tableImages.rows.forEach(function (tableImage) { return __awaiter(_this, void 0, void 0, function () {
                        var imageData, image;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, getImageQuery(tableImage.image_id)];
                                case 1:
                                    imageData = _a.sent();
                                    image = imageData.rows[0];
                                    return [4, removeFile("wyrld/images", image)];
                                case 2:
                                    _a.sent();
                                    return [4, removeTableImageQuery(tableImage.id)];
                                case 3:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, getTableViewsQuery(req.params.id)];
                case 15:
                    tableViews = _a.sent();
                    tableViews.rows.forEach(function (tableView) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, removeTableViewQuery(tableView.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    res.status(204).send();
                    return [3, 17];
                case 16:
                    err_4 = _a.sent();
                    next(err_4);
                    return [3, 17];
                case 17: return [2];
            }
        });
    });
}
function editProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var projectData, project, projectUser, data, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!req.user)
                        throw { status: 401, message: "Missing Credentials" };
                    return [4, getProjectQuery(req.params.id)];
                case 1:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    if (!(project.user_id !== req.user.id)) return [3, 3];
                    return [4, getProjectUserByUserAndProjectQuery(req.user.id, project.id)];
                case 2:
                    projectUser = _a.sent();
                    if (projectUser.rows &&
                        projectUser.rows.length &&
                        !projectUser.rows[0].is_editor)
                        throw { status: 403, message: "Forbidden" };
                    _a.label = 3;
                case 3: return [4, editProjectQuery(req.params.id, req.body)];
                case 4:
                    data = _a.sent();
                    res.status(200).send(data.rows[0]);
                    return [3, 6];
                case 5:
                    err_5 = _a.sent();
                    next(err_5);
                    return [3, 6];
                case 6: return [2];
            }
        });
    });
}
module.exports = {
    getProjects: getProjects,
    getProject: getProject,
    addProject: addProject,
    removeProject: removeProject,
    editProject: editProject
};
