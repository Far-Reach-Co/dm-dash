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
exports.edit5eCharBack = exports.edit5eCharPro = exports.edit5eCharGeneral = exports.remove5eChar = exports.get5eCharGeneral = exports.get5eCharsByUser = exports.add5eChar = void 0;
const _5eCharGeneral_1 = require("../queries/5eCharGeneral");
const _5eCharPro_1 = require("../queries/5eCharPro");
const _5eCharBack_1 = require("../queries/5eCharBack");
const _5eCharSpellSlots_1 = require("../queries/5eCharSpellSlots");
const _5eCharAttacks_1 = require("../queries/5eCharAttacks");
const _5eCharEquipment_1 = require("../queries/5eCharEquipment");
const _5eCharFeats_1 = require("../queries/5eCharFeats");
const _5eCharSpells_1 = require("../queries/5eCharSpells");
const _5eCharOtherProLang_1 = require("../queries/5eCharOtherProLang");
const projectPlayers_1 = require("../queries/projectPlayers");
const playerUsers_1 = require("../queries/playerUsers");
const playerInvites_1 = require("../queries/playerInvites");
function add5eChar(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            req.body.user_id = req.session.user;
            const generalData = yield (0, _5eCharGeneral_1.add5eCharGeneralQuery)(req.body);
            const general = generalData.rows[0];
            yield (0, _5eCharPro_1.add5eCharProQuery)({ general_id: general.id });
            yield (0, _5eCharBack_1.add5eCharBackQuery)({ general_id: general.id });
            yield (0, _5eCharSpellSlots_1.add5eCharSpellSlotInfoQuery)({ general_id: general.id });
            res
                .set("HX-Redirect", `/5eplayer?id=${general.id}`)
                .send("Form submission was successful.");
        }
        catch (err) {
            next(err);
        }
    });
}
exports.add5eChar = add5eChar;
function get5eCharsByUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const generalsData = yield (0, _5eCharGeneral_1.get5eCharsGeneralByUserQuery)(req.session.user);
            const generals = generalsData.rows;
            if (generals.length) {
                for (var general of generals) {
                    const proData = yield (0, _5eCharPro_1.get5eCharProByGeneralQuery)(general.id);
                    const pro = proData.rows[0];
                    const backData = yield (0, _5eCharBack_1.get5eCharBackByGeneralQuery)(general.id);
                    const back = backData.rows[0];
                    const spellSlotsData = yield (0, _5eCharSpellSlots_1.get5eCharSpellSlotInfosByGeneralQuery)(general.id);
                    const spellSlots = spellSlotsData.rows[0];
                    general.proficiencies = pro;
                    general.background = back;
                    general.spell_slots = spellSlots;
                }
            }
            res.send(generals);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.get5eCharsByUser = get5eCharsByUser;
function get5eCharGeneral(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const generalsData = yield (0, _5eCharGeneral_1.get5eCharGeneralQuery)(req.params.id);
            const general = generalsData.rows[0];
            const proData = yield (0, _5eCharPro_1.get5eCharProByGeneralQuery)(general.id);
            const pro = proData.rows[0];
            const backData = yield (0, _5eCharBack_1.get5eCharBackByGeneralQuery)(general.id);
            const back = backData.rows[0];
            const spellSlotsData = yield (0, _5eCharSpellSlots_1.get5eCharSpellSlotInfosByGeneralQuery)(general.id);
            const spellSlots = spellSlotsData.rows[0];
            general.proficiencies = pro;
            general.background = back;
            general.spell_slots = spellSlots;
            res.send(general);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.get5eCharGeneral = get5eCharGeneral;
function remove5eChar(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const generalData = yield (0, _5eCharGeneral_1.get5eCharGeneralQuery)(req.params.id);
            const general = generalData.rows[0];
            if (!req.session.user)
                throw new Error("User is not logged in");
            if (req.session.user != general.user_id)
                throw new Error("User does not own this property");
            const proData = yield (0, _5eCharPro_1.get5eCharProByGeneralQuery)(general.id);
            const pro = proData.rows[0];
            const backData = yield (0, _5eCharBack_1.get5eCharBackByGeneralQuery)(general.id);
            const back = backData.rows[0];
            const spellSlotsData = yield (0, _5eCharSpellSlots_1.get5eCharSpellSlotInfosByGeneralQuery)(general.id);
            const spellSlots = spellSlotsData.rows[0];
            yield (0, _5eCharGeneral_1.remove5eCharGeneralQuery)(general.id);
            yield (0, _5eCharPro_1.remove5eCharProQuery)(pro.id);
            yield (0, _5eCharBack_1.remove5eCharBackQuery)(back.id);
            yield (0, _5eCharSpellSlots_1.remove5eCharSpellSlotInfoQuery)(spellSlots.id);
            const attacksData = yield (0, _5eCharAttacks_1.get5eCharAttacksByGeneralQuery)(general.id);
            attacksData.rows.forEach((attack) => __awaiter(this, void 0, void 0, function* () {
                yield (0, _5eCharAttacks_1.remove5eCharAttackQuery)(attack.id);
            }));
            const equipmentData = yield (0, _5eCharEquipment_1.get5eCharEquipmentsByGeneralQuery)(general.id);
            equipmentData.rows.forEach((equipment) => __awaiter(this, void 0, void 0, function* () {
                yield (0, _5eCharEquipment_1.remove5eCharEquipmentQuery)(equipment.id);
            }));
            const featsData = yield (0, _5eCharFeats_1.get5eCharFeatsByGeneralQuery)(general.id);
            featsData.rows.forEach((feat) => __awaiter(this, void 0, void 0, function* () {
                yield (0, _5eCharFeats_1.remove5eCharFeatQuery)(feat.id);
            }));
            const spellsData = yield (0, _5eCharSpells_1.get5eCharSpellsByGeneralQuery)(general.id);
            spellsData.rows.forEach((spell) => __awaiter(this, void 0, void 0, function* () {
                yield (0, _5eCharSpells_1.remove5eCharSpellQuery)(spell.id);
            }));
            const otherProLangsData = yield (0, _5eCharOtherProLang_1.get5eCharOtherProLangsByGeneralQuery)(general.id);
            otherProLangsData.rows.forEach((other) => __awaiter(this, void 0, void 0, function* () {
                yield (0, _5eCharOtherProLang_1.remove5eCharOtherProLangQuery)(other.id);
            }));
            const projectPlayerData = yield (0, projectPlayers_1.getProjectPlayersByPlayerQuery)(general.id);
            projectPlayerData.rows.forEach((projectPlayer) => __awaiter(this, void 0, void 0, function* () {
                yield (0, projectPlayers_1.removeProjectPlayerQuery)(projectPlayer.id);
            }));
            const playerUserData = yield (0, playerUsers_1.getPlayerUsersByPlayerQuery)(general.id);
            playerUserData.rows.forEach((playerUser) => __awaiter(this, void 0, void 0, function* () {
                yield (0, playerUsers_1.removePlayerUserQuery)(playerUser.id);
            }));
            const playerInviteData = yield (0, playerInvites_1.getPlayerInviteByPlayerQuery)(general.id);
            playerInviteData.rows.forEach((playerInvite) => __awaiter(this, void 0, void 0, function* () {
                yield (0, playerInvites_1.removePlayerInviteQuery)(playerInvite.id);
            }));
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.remove5eChar = remove5eChar;
function edit5eCharGeneral(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.body.hasOwnProperty("id")) {
                throw new Error('Request body cannot contain the "id" field');
            }
            if (req.body.hasOwnProperty("user_id")) {
                throw new Error('Request body cannot contain the "user_id" field');
            }
            const editData = yield (0, _5eCharGeneral_1.edit5eCharGeneralQuery)(req.params.id, req.body);
            res.status(200).send(editData.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.edit5eCharGeneral = edit5eCharGeneral;
function edit5eCharPro(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.body.hasOwnProperty("id")) {
                throw new Error('Request body cannot contain the "id" field');
            }
            if (req.body.hasOwnProperty("general_id")) {
                throw new Error('Request body cannot contain the "general_id" field');
            }
            const data = yield (0, _5eCharPro_1.edit5eCharProQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.edit5eCharPro = edit5eCharPro;
function edit5eCharBack(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.body.hasOwnProperty("id")) {
                throw new Error('Request body cannot contain the "id" field');
            }
            if (req.body.hasOwnProperty("general_id")) {
                throw new Error('Request body cannot contain the "general_id" field');
            }
            const data = yield (0, _5eCharBack_1.edit5eCharBackQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.edit5eCharBack = edit5eCharBack;
