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
exports.editProject = exports.removeProject = exports.addProject = exports.getProject = exports.getProjects = void 0;
var projects_js_1 = require("../queries/projects.js");
var projectInvites_js_1 = require("../queries/projectInvites.js");
var projectUsers_js_1 = require("../queries/projectUsers.js");
var calendars_js_1 = require("../queries/calendars.js");
var months_js_1 = require("../queries/months.js");
var days_js_1 = require("../queries/days.js");
var locations_js_1 = require("../queries/locations.js");
var characters_js_1 = require("../queries/characters.js");
var clocks_js_1 = require("../queries/clocks.js");
var counters_js_1 = require("../queries/counters.js");
var events_js_1 = require("../queries/events.js");
var items_js_1 = require("../queries/items.js");
var lores_js_1 = require("../queries/lores.js");
var loreRelations_js_1 = require("../queries/loreRelations.js");
var notes_js_1 = require("../queries/notes.js");
var images_js_1 = require("../queries/images.js");
var s3_js_1 = require("./s3.js");
var tableViews_js_1 = require("../queries/tableViews.js");
var tableImages_js_1 = require("../queries/tableImages.js");
var enums_js_1 = require("../../lib/enums.js");
function addProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var projectsData, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4, (0, projects_js_1.getProjectsQuery)(req.user.id)];
                case 1:
                    projectsData = _a.sent();
                    if (projectsData.rows.length >= 3) {
                        if (!req.user.is_pro)
                            throw { status: 402, message: enums_js_1.userSubscriptionStatus.userIsNotPro };
                    }
                    req.body.user_id = req.user.id;
                    return [4, (0, projects_js_1.addProjectQuery)(req.body)];
                case 2:
                    data = _a.sent();
                    return [4, (0, tableViews_js_1.addTableViewQuery)({ project_id: data.rows[0].id })];
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
exports.addProject = addProject;
function getProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var projectData, project, projectUsersData, projectUser, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4, (0, projects_js_1.getProjectQuery)(req.params.id)];
                case 1:
                    projectData = _a.sent();
                    project = projectData.rows[0];
                    return [4, (0, projectUsers_js_1.getProjectUserByUserAndProjectQuery)(req.user.id, project.id)];
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
exports.getProject = getProject;
function getProjects(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var projectsData, projectUserData, _i, _a, projectUser, projectData, project_1, _b, _c, project, projectInvites, err_3;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 11, , 12]);
                    return [4, (0, projects_js_1.getProjectsQuery)(req.user.id)];
                case 1:
                    projectsData = _d.sent();
                    return [4, (0, projectUsers_js_1.getProjectUsersQuery)(req.user.id)];
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
                    return [4, (0, projects_js_1.getProjectQuery)(projectUser.project_id)];
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
                    return [4, (0, projectInvites_js_1.getProjectInviteByProjectQuery)(project.id)];
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
exports.getProjects = getProjects;
function removeProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var calendarData, locationsData, charactersData, clocksData, countersData, eventsData, itemsData, loreData, notesData, projectInvitesData, projectUsersData, tableImages, tableViews, err_4;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 15, , 16]);
                    return [4, (0, projects_js_1.removeProjectQuery)(req.params.id)];
                case 1:
                    _a.sent();
                    return [4, (0, calendars_js_1.getCalendarQuery)(req.params.id)];
                case 2:
                    calendarData = _a.sent();
                    calendarData.rows.forEach(function (calendar) { return __awaiter(_this, void 0, void 0, function () {
                        var monthsData, daysData;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, calendars_js_1.removeCalendarQuery)(calendar.id)];
                                case 1:
                                    _a.sent();
                                    return [4, (0, months_js_1.getMonthsQuery)(calendar.id)];
                                case 2:
                                    monthsData = _a.sent();
                                    monthsData.rows.forEach(function (month) { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4, (0, months_js_1.removeMonthQuery)(month.id)];
                                                case 1:
                                                    _a.sent();
                                                    return [2];
                                            }
                                        });
                                    }); });
                                    return [4, (0, days_js_1.getDaysQuery)(calendar.id)];
                                case 3:
                                    daysData = _a.sent();
                                    daysData.rows.forEach(function (day) { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4, (0, days_js_1.removeDayQuery)(day.id)];
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
                    return [4, (0, locations_js_1.getLocationsQuery)({
                            projectId: req.params.id,
                            limit: 10000,
                            offset: 0
                        })];
                case 3:
                    locationsData = _a.sent();
                    locationsData.rows.forEach(function (location) { return __awaiter(_this, void 0, void 0, function () {
                        var imageData, image;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, locations_js_1.removeLocationQuery)(location.id)];
                                case 1:
                                    _a.sent();
                                    if (!location.image_id) return [3, 5];
                                    return [4, (0, images_js_1.getImageQuery)(location.image_id)];
                                case 2:
                                    imageData = _a.sent();
                                    image = imageData.rows[0];
                                    return [4, (0, s3_js_1.removeFile)("wyrld/images", image)];
                                case 3:
                                    _a.sent();
                                    return [4, (0, images_js_1.removeImageQuery)(image.id)];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5: return [2];
                            }
                        });
                    }); });
                    return [4, (0, characters_js_1.getCharactersQuery)({
                            projectId: req.params.id,
                            limit: 10000,
                            offset: 0
                        })];
                case 4:
                    charactersData = _a.sent();
                    charactersData.rows.forEach(function (character) { return __awaiter(_this, void 0, void 0, function () {
                        var imageData, image;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, characters_js_1.removeCharacterQuery)(character.id)];
                                case 1:
                                    _a.sent();
                                    if (!character.image_id) return [3, 5];
                                    return [4, (0, images_js_1.getImageQuery)(character.image_id)];
                                case 2:
                                    imageData = _a.sent();
                                    image = imageData.rows[0];
                                    return [4, (0, s3_js_1.removeFile)("wyrld/images", image)];
                                case 3:
                                    _a.sent();
                                    return [4, (0, images_js_1.removeImageQuery)(image.id)];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5: return [2];
                            }
                        });
                    }); });
                    return [4, (0, clocks_js_1.getClocksQuery)(req.params.id)];
                case 5:
                    clocksData = _a.sent();
                    clocksData.rows.forEach(function (clock) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, clocks_js_1.removeClockQuery)(clock.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, (0, counters_js_1.getAllCountersByProjectQuery)(req.params.id)];
                case 6:
                    countersData = _a.sent();
                    countersData.rows.forEach(function (counter) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, counters_js_1.removeCounterQuery)(counter.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, (0, events_js_1.getEventsQuery)({
                            projectId: req.params.id,
                            limit: 1000000,
                            offset: 0
                        })];
                case 7:
                    eventsData = _a.sent();
                    eventsData.rows.forEach(function (event) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, events_js_1.removeEventQuery)(event.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, (0, items_js_1.getItemsQuery)({
                            projectId: req.params.id,
                            limit: 10000,
                            offset: 0
                        })];
                case 8:
                    itemsData = _a.sent();
                    itemsData.rows.forEach(function (item) { return __awaiter(_this, void 0, void 0, function () {
                        var imageData, image;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, items_js_1.removeItemQuery)(item.id)];
                                case 1:
                                    _a.sent();
                                    if (!item.image_id) return [3, 5];
                                    return [4, (0, images_js_1.getImageQuery)(item.image_id)];
                                case 2:
                                    imageData = _a.sent();
                                    image = imageData.rows[0];
                                    return [4, (0, s3_js_1.removeFile)("wyrld/images", image)];
                                case 3:
                                    _a.sent();
                                    return [4, (0, images_js_1.removeImageQuery)(image.id)];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5: return [2];
                            }
                        });
                    }); });
                    return [4, (0, lores_js_1.getLoresQuery)({
                            projectId: req.params.id,
                            limit: 10000,
                            offset: 0
                        })];
                case 9:
                    loreData = _a.sent();
                    loreData.rows.forEach(function (lore) { return __awaiter(_this, void 0, void 0, function () {
                        var imageData, image, relationsData;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, lores_js_1.removeLoreQuery)(lore.id)];
                                case 1:
                                    _a.sent();
                                    if (!lore.image_id) return [3, 5];
                                    return [4, (0, images_js_1.getImageQuery)(lore.image_id)];
                                case 2:
                                    imageData = _a.sent();
                                    image = imageData.rows[0];
                                    return [4, (0, s3_js_1.removeFile)("wyrld/images", image)];
                                case 3:
                                    _a.sent();
                                    return [4, (0, images_js_1.removeImageQuery)(image.id)];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5: return [4, (0, loreRelations_js_1.getLoreRelationsQuery)(lore.id)];
                                case 6:
                                    relationsData = _a.sent();
                                    relationsData.rows.forEach(function (relation) { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4, (0, loreRelations_js_1.removeLoreRelationQuery)(relation.id)];
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
                    return [4, (0, notes_js_1.getAllNotesByProjectQuery)(req.params.id)];
                case 10:
                    notesData = _a.sent();
                    notesData.rows.forEach(function (note) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, notes_js_1.removeNoteQuery)(note.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, (0, projectInvites_js_1.getProjectInviteByProjectQuery)(req.params.id)];
                case 11:
                    projectInvitesData = _a.sent();
                    projectInvitesData.rows.forEach(function (invite) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, projectInvites_js_1.removeProjectInviteQuery)(invite.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, (0, projectUsers_js_1.getProjectUsersByProjectQuery)(req.params.id)];
                case 12:
                    projectUsersData = _a.sent();
                    projectUsersData.rows.forEach(function (user) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, projectUsers_js_1.removeProjectUserQuery)(user.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, (0, tableImages_js_1.getTableImagesQuery)(req.params.id)];
                case 13:
                    tableImages = _a.sent();
                    tableImages.rows.forEach(function (tableImage) { return __awaiter(_this, void 0, void 0, function () {
                        var imageData, image;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, images_js_1.getImageQuery)(tableImage.image_id)];
                                case 1:
                                    imageData = _a.sent();
                                    image = imageData.rows[0];
                                    return [4, (0, s3_js_1.removeFile)("wyrld/images", image)];
                                case 2:
                                    _a.sent();
                                    return [4, (0, tableImages_js_1.removeTableImageQuery)(tableImage.id)];
                                case 3:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, (0, tableViews_js_1.getTableViewsQuery)(req.params.id)];
                case 14:
                    tableViews = _a.sent();
                    tableViews.rows.forEach(function (tableView) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, tableViews_js_1.removeTableViewQuery)(tableView.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    res.status(204).send();
                    return [3, 16];
                case 15:
                    err_4 = _a.sent();
                    next(err_4);
                    return [3, 16];
                case 16: return [2];
            }
        });
    });
}
exports.removeProject = removeProject;
function editProject(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, projects_js_1.editProjectQuery)(req.params.id, req.body)];
                case 1:
                    data = _a.sent();
                    res.status(200).send(data.rows[0]);
                    return [3, 3];
                case 2:
                    err_5 = _a.sent();
                    next(err_5);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.editProject = editProject;
