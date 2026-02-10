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
exports.add5eChar = add5eChar;
exports.get5eCharsByUser = get5eCharsByUser;
exports.get5eCharGeneral = get5eCharGeneral;
exports.remove5eChar = remove5eChar;
exports.edit5eCharGeneral = edit5eCharGeneral;
exports.edit5eCharPro = edit5eCharPro;
exports.edit5eCharBack = edit5eCharBack;
exports.duplicate5eChar = duplicate5eChar;
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
const enums_js_1 = require("../../lib/enums.js");
const projects_1 = require("../queries/projects");
const playerUsers_1 = require("../queries/playerUsers");
const playerInvites_1 = require("../queries/playerInvites");
const _5eCharClasses_1 = require("../queries/5eCharClasses");
const eventLogger_1 = require("../../lib/eventLogger");
function add5eChar(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const generalId = yield createNew5eChar({
                user_id: String(req.session.user),
                name: req.body.name,
            });
            (0, eventLogger_1.logEventAsync)({
                userId: req.session.user,
                eventType: eventLogger_1.EventType.DND_5E_CHARACTER_CREATED,
                eventData: { characterId: generalId, characterName: req.body.name },
                req,
            });
            if (req.body.wyrld_id) {
                const projectPlayersData = yield (0, projectPlayers_1.getProjectPlayersByProjectQuery)(req.body.wyrld_id);
                if (projectPlayersData.rows.length >= 5) {
                    const projectData = yield (0, projects_1.getProjectQuery)(req.body.wyrld_id);
                    if (!projectData.rows[0].is_pro) {
                        throw {
                            status: 402,
                            message: enums_js_1.userSubscriptionStatus.projectIsNotPro,
                        };
                    }
                }
                yield (0, projectPlayers_1.addProjectPlayerQuery)({
                    project_id: req.body.wyrld_id,
                    player_id: String(generalId),
                });
                (0, eventLogger_1.logEventAsync)({
                    userId: req.session.user,
                    projectId: Number(req.body.wyrld_id),
                    eventType: eventLogger_1.EventType.PROJECT_PLAYER_CREATED,
                    eventData: { playerId: generalId, projectId: req.body.wyrld_id },
                    req,
                });
                res
                    .set("HX-Redirect", `/wyrld?id=${req.body.wyrld_id}`)
                    .send("Form submission was successful.");
            }
            else {
                res
                    .set("HX-Redirect", `/5eplayer?id=${generalId}`)
                    .send("Form submission was successful.");
            }
        }
        catch (err) {
            next(err);
        }
    });
}
function createNew5eChar(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const generalData = yield (0, _5eCharGeneral_1.add5eCharGeneralQuery)(data);
        const general = generalData.rows[0];
        yield (0, _5eCharPro_1.add5eCharProQuery)({ general_id: general.id });
        yield (0, _5eCharBack_1.add5eCharBackQuery)({ general_id: general.id });
        yield (0, _5eCharSpellSlots_1.add5eCharSpellSlotInfoQuery)({ general_id: general.id });
        return general.id;
    });
}
function duplicate5eChar(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const generalData = yield (0, _5eCharGeneral_1.get5eCharGeneralQuery)(req.body.general_id);
            const general = generalData.rows[0];
            if (!req.session.user)
                throw new Error("User is not logged in");
            if (req.session.user != general.user_id)
                throw new Error("User does not own this property");
            const newGeneral = yield (0, _5eCharGeneral_1.duplicate5eCharGeneralQuery)({
                generalId: general.id,
            });
            const newGeneralId = newGeneral.rows[0].id;
            yield (0, _5eCharPro_1.duplicate5eCharProQuery)({
                oldGeneralId: general.id,
                newGeneralId: newGeneralId,
            });
            yield (0, _5eCharBack_1.duplicate5eCharBackQuery)({
                oldGeneralId: general.id,
                newGeneralId: newGeneralId,
            });
            yield (0, _5eCharSpellSlots_1.duplicate5eCharSpellSlotsQuery)({
                oldGeneralId: general.id,
                newGeneralId: newGeneralId,
            });
            yield (0, _5eCharSpells_1.duplicate5eCharSpellsQuery)({
                oldGeneralId: general.id,
                newGeneralId: newGeneralId,
            });
            yield (0, _5eCharAttacks_1.duplicate5eCharAttacksQuery)({
                oldGeneralId: general.id,
                newGeneralId: newGeneralId,
            });
            yield (0, _5eCharEquipment_1.duplicate5eCharEquipmentsQuery)({
                oldGeneralId: general.id,
                newGeneralId: newGeneralId,
            });
            yield (0, _5eCharFeats_1.duplicate5eCharFeatsQuery)({
                oldGeneralId: general.id,
                newGeneralId: newGeneralId,
            });
            yield (0, _5eCharOtherProLang_1.duplicate5eCharOtherProLangsQuery)({
                oldGeneralId: general.id,
                newGeneralId: newGeneralId,
            });
            yield (0, _5eCharClasses_1.duplicate5eCharClassesQuery)({
                oldGeneralId: general.id,
                newGeneralId: newGeneralId,
            });
            res.status(201).json({ general_id: newGeneralId });
        }
        catch (err) {
            next(err);
        }
    });
}
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
function remove5eChar(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const generalData = yield (0, _5eCharGeneral_1.get5eCharGeneralQuery)(req.params.id);
            const general = generalData.rows[0];
            if (!req.session.user)
                throw new Error("User is not logged in");
            if (req.session.user != general.user_id)
                throw new Error("User does not own this property");
            yield (0, _5eCharGeneral_1.remove5eCharGeneralQuery)(general.id);
            const projectPlayerData = yield (0, projectPlayers_1.getProjectPlayersByPlayerQuery)(general.id);
            const playerUserData = yield (0, playerUsers_1.getPlayerUsersByPlayerQuery)(general.id);
            const playerInviteData = yield (0, playerInvites_1.getPlayerInviteByPlayerQuery)(general.id);
            yield Promise.all([
                ...projectPlayerData.rows.map((pp) => (0, projectPlayers_1.removeProjectPlayerQuery)(pp.id)),
                ...playerUserData.rows.map((pu) => (0, playerUsers_1.removePlayerUserQuery)(pu.id)),
                ...playerInviteData.rows.map((pi) => (0, playerInvites_1.removePlayerInviteQuery)(pi.id)),
            ]);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
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
