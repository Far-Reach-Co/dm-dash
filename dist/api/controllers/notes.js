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
exports.getNotesByLore = exports.getNotesByItem = exports.getNotesByCharacter = exports.editNote = exports.removeNote = exports.addNote = exports.getNotesByLocation = exports.getNotes = void 0;
const notes_js_1 = require("../queries/notes.js");
function addNote(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            req.body.user_id = req.session.user;
            const data = yield (0, notes_js_1.addNoteQuery)(req.body);
            res.status(201).json(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.addNote = addNote;
function getNotes(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const data = yield (0, notes_js_1.getNotesQuery)(req.session.user, req.params.project_id, req.params.limit, req.params.offset, req.params.keyword);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getNotes = getNotes;
function getNotesByLocation(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const data = yield (0, notes_js_1.getNotesByLocationQuery)(req.session.user, req.params.location_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getNotesByLocation = getNotesByLocation;
function getNotesByCharacter(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const data = yield (0, notes_js_1.getNotesByCharacterQuery)(req.session.user, req.params.character_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getNotesByCharacter = getNotesByCharacter;
function getNotesByItem(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const data = yield (0, notes_js_1.getNotesByItemQuery)(req.session.user, req.params.item_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getNotesByItem = getNotesByItem;
function getNotesByLore(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const data = yield (0, notes_js_1.getNotesByLoreQuery)(req.session.user, req.params.lore_id);
            res.send(data.rows);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.getNotesByLore = getNotesByLore;
function removeNote(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, notes_js_1.removeNoteQuery)(req.params.id);
            res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    });
}
exports.removeNote = removeNote;
function editNote(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, notes_js_1.editNoteQuery)(req.params.id, req.body);
            res.status(200).send(data.rows[0]);
        }
        catch (err) {
            next(err);
        }
    });
}
exports.editNote = editNote;
