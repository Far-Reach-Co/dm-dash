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
exports.edit5eCharBack = exports.edit5eCharPro = exports.edit5eCharGeneral = exports.remove5eChar = exports.get5eCharGeneral = exports.get5eCharsByUser = exports.add5eChar = void 0;
var _5eCharGeneral_1 = require("../queries/5eCharGeneral");
var _5eCharPro_1 = require("../queries/5eCharPro");
var _5eCharBack_1 = require("../queries/5eCharBack");
var _5eCharSpellSlots_1 = require("../queries/5eCharSpellSlots");
var _5eCharAttacks_1 = require("../queries/5eCharAttacks");
var _5eCharEquipment_1 = require("../queries/5eCharEquipment");
var _5eCharFeats_1 = require("../queries/5eCharFeats");
var _5eCharSpells_1 = require("../queries/5eCharSpells");
var _5eCharOtherProLang_1 = require("../queries/5eCharOtherProLang");
var projectPlayers_1 = require("../queries/projectPlayers");
var enums_js_1 = require("../../lib/enums.js");
var users_1 = require("../queries/users");
function add5eChar(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var generalsData, rows, generalData, general, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    if (!req.session.user)
                        throw new Error("User is not logged in");
                    return [4, (0, _5eCharGeneral_1.get5eCharsGeneralByUserQuery)(req.session.user)];
                case 1:
                    generalsData = _a.sent();
                    if (!(generalsData.rows.length >= 5)) return [3, 3];
                    return [4, (0, users_1.getUserByIdQuery)(req.session.user)];
                case 2:
                    rows = (_a.sent()).rows;
                    if (!rows[0].is_pro)
                        throw { status: 402, message: enums_js_1.userSubscriptionStatus.userIsNotPro };
                    _a.label = 3;
                case 3:
                    req.body.user_id = req.session.user;
                    return [4, (0, _5eCharGeneral_1.add5eCharGeneralQuery)(req.body)];
                case 4:
                    generalData = _a.sent();
                    general = generalData.rows[0];
                    return [4, (0, _5eCharPro_1.add5eCharProQuery)({ general_id: general.id })];
                case 5:
                    _a.sent();
                    return [4, (0, _5eCharBack_1.add5eCharBackQuery)({ general_id: general.id })];
                case 6:
                    _a.sent();
                    return [4, (0, _5eCharSpellSlots_1.add5eCharSpellSlotInfoQuery)({ general_id: general.id })];
                case 7:
                    _a.sent();
                    res.set("HX-Redirect", "/5eplayer").send("Form submission was successful.");
                    return [3, 9];
                case 8:
                    err_1 = _a.sent();
                    next(err_1);
                    return [3, 9];
                case 9: return [2];
            }
        });
    });
}
exports.add5eChar = add5eChar;
function get5eCharsByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var generalsData, generals, _i, generals_1, general, proData, pro, backData, back, spellSlotsData, spellSlots, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    if (!req.session.user)
                        throw new Error("User is not logged in");
                    return [4, (0, _5eCharGeneral_1.get5eCharsGeneralByUserQuery)(req.session.user)];
                case 1:
                    generalsData = _a.sent();
                    generals = generalsData.rows;
                    if (!generals.length) return [3, 7];
                    _i = 0, generals_1 = generals;
                    _a.label = 2;
                case 2:
                    if (!(_i < generals_1.length)) return [3, 7];
                    general = generals_1[_i];
                    return [4, (0, _5eCharPro_1.get5eCharProByGeneralQuery)(general.id)];
                case 3:
                    proData = _a.sent();
                    pro = proData.rows[0];
                    return [4, (0, _5eCharBack_1.get5eCharBackByGeneralQuery)(general.id)];
                case 4:
                    backData = _a.sent();
                    back = backData.rows[0];
                    return [4, (0, _5eCharSpellSlots_1.get5eCharSpellSlotInfosByGeneralQuery)(general.id)];
                case 5:
                    spellSlotsData = _a.sent();
                    spellSlots = spellSlotsData.rows[0];
                    general.proficiencies = pro;
                    general.background = back;
                    general.spell_slots = spellSlots;
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3, 2];
                case 7:
                    res.send(generals);
                    return [3, 9];
                case 8:
                    err_2 = _a.sent();
                    next(err_2);
                    return [3, 9];
                case 9: return [2];
            }
        });
    });
}
exports.get5eCharsByUser = get5eCharsByUser;
function get5eCharGeneral(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var generalsData, general, proData, pro, backData, back, spellSlotsData, spellSlots, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4, (0, _5eCharGeneral_1.get5eCharGeneralQuery)(req.params.id)];
                case 1:
                    generalsData = _a.sent();
                    general = generalsData.rows[0];
                    return [4, (0, _5eCharPro_1.get5eCharProByGeneralQuery)(general.id)];
                case 2:
                    proData = _a.sent();
                    pro = proData.rows[0];
                    return [4, (0, _5eCharBack_1.get5eCharBackByGeneralQuery)(general.id)];
                case 3:
                    backData = _a.sent();
                    back = backData.rows[0];
                    return [4, (0, _5eCharSpellSlots_1.get5eCharSpellSlotInfosByGeneralQuery)(general.id)];
                case 4:
                    spellSlotsData = _a.sent();
                    spellSlots = spellSlotsData.rows[0];
                    general.proficiencies = pro;
                    general.background = back;
                    general.spell_slots = spellSlots;
                    res.send(general);
                    return [3, 6];
                case 5:
                    err_3 = _a.sent();
                    next(err_3);
                    return [3, 6];
                case 6: return [2];
            }
        });
    });
}
exports.get5eCharGeneral = get5eCharGeneral;
function remove5eChar(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var generalData, general, proData, pro, backData, back, spellSlotsData, spellSlots, attacksData, equipmentData, featsData, spellsData, otherProLangsData, projectPlayerData, err_4;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 15, , 16]);
                    return [4, (0, _5eCharGeneral_1.get5eCharGeneralQuery)(req.params.id)];
                case 1:
                    generalData = _a.sent();
                    general = generalData.rows[0];
                    return [4, (0, _5eCharPro_1.get5eCharProByGeneralQuery)(general.id)];
                case 2:
                    proData = _a.sent();
                    pro = proData.rows[0];
                    return [4, (0, _5eCharBack_1.get5eCharBackByGeneralQuery)(general.id)];
                case 3:
                    backData = _a.sent();
                    back = backData.rows[0];
                    return [4, (0, _5eCharSpellSlots_1.get5eCharSpellSlotInfosByGeneralQuery)(general.id)];
                case 4:
                    spellSlotsData = _a.sent();
                    spellSlots = spellSlotsData.rows[0];
                    return [4, (0, _5eCharGeneral_1.remove5eCharGeneralQuery)(general.id)];
                case 5:
                    _a.sent();
                    return [4, (0, _5eCharPro_1.remove5eCharProQuery)(pro.id)];
                case 6:
                    _a.sent();
                    return [4, (0, _5eCharBack_1.remove5eCharBackQuery)(back.id)];
                case 7:
                    _a.sent();
                    return [4, (0, _5eCharSpellSlots_1.remove5eCharSpellSlotInfoQuery)(spellSlots.id)];
                case 8:
                    _a.sent();
                    return [4, (0, _5eCharAttacks_1.get5eCharAttacksByGeneralQuery)(general.id)];
                case 9:
                    attacksData = _a.sent();
                    attacksData.rows.forEach(function (attack) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, _5eCharAttacks_1.remove5eCharAttackQuery)(attack.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, (0, _5eCharEquipment_1.get5eCharEquipmentsByGeneralQuery)(general.id)];
                case 10:
                    equipmentData = _a.sent();
                    equipmentData.rows.forEach(function (equipment) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, _5eCharEquipment_1.remove5eCharEquipmentQuery)(equipment.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, (0, _5eCharFeats_1.get5eCharFeatsByGeneralQuery)(general.id)];
                case 11:
                    featsData = _a.sent();
                    featsData.rows.forEach(function (feat) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, _5eCharFeats_1.remove5eCharFeatQuery)(feat.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, (0, _5eCharSpells_1.get5eCharSpellsByGeneralQuery)(general.id)];
                case 12:
                    spellsData = _a.sent();
                    spellsData.rows.forEach(function (spell) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, _5eCharSpells_1.remove5eCharSpellQuery)(spell.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, (0, _5eCharOtherProLang_1.get5eCharOtherProLangsByGeneralQuery)(general.id)];
                case 13:
                    otherProLangsData = _a.sent();
                    otherProLangsData.rows.forEach(function (other) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, _5eCharOtherProLang_1.remove5eCharOtherProLangQuery)(other.id)];
                                case 1:
                                    _a.sent();
                                    return [2];
                            }
                        });
                    }); });
                    return [4, (0, projectPlayers_1.getProjectPlayersByPlayerQuery)(general.id)];
                case 14:
                    projectPlayerData = _a.sent();
                    projectPlayerData.rows.forEach(function (projectPlayer) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4, (0, projectPlayers_1.removeProjectPlayerQuery)(projectPlayer.id)];
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
exports.remove5eChar = remove5eChar;
function edit5eCharGeneral(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, _5eCharGeneral_1.edit5eCharGeneralQuery)(req.params.id, req.body)];
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
exports.edit5eCharGeneral = edit5eCharGeneral;
function edit5eCharPro(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, _5eCharPro_1.edit5eCharProQuery)(req.params.id, req.body)];
                case 1:
                    data = _a.sent();
                    res.status(200).send(data.rows[0]);
                    return [3, 3];
                case 2:
                    err_6 = _a.sent();
                    next(err_6);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.edit5eCharPro = edit5eCharPro;
function edit5eCharBack(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var data, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, _5eCharBack_1.edit5eCharBackQuery)(req.params.id, req.body)];
                case 1:
                    data = _a.sent();
                    res.status(200).send(data.rows[0]);
                    return [3, 3];
                case 2:
                    err_7 = _a.sent();
                    next(err_7);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
exports.edit5eCharBack = edit5eCharBack;
