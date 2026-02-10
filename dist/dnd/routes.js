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
const express_rate_limit_1 = require("express-rate-limit");
const mistral_js_1 = require("./srd/mistral.js");
const data_js_1 = require("./srd/data.js");
var router = (0, express_1.Router)();
router.get("/5e/srd/contents", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/contents", {
            auth: req.session.user,
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/ability-scores", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/abilityscores", {
            auth: req.session.user,
            data: data_js_1.srdData["ability-scores"] || [],
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/alignments", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/alignments", {
            auth: req.session.user,
            data: data_js_1.srdData["alignments"] || [],
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/backgrounds", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/backgrounds", {
            auth: req.session.user,
            data: data_js_1.srdData["backgrounds"] || [],
        });
    }
    catch (err) {
        next(err);
    }
});
const equipmentData = data_js_1.srdData["equipment"] || [];
const magicItemsData = data_js_1.srdData["magic-items"] || [];
const equipmentMap = new Map(equipmentData.map((e) => [e.index, e]));
const magicItemsMap = new Map(magicItemsData.map((m) => [m.index, m]));
router.get("/5e/srd/equipment/:index", (req, res, next) => {
    try {
        const item = equipmentMap.get(req.params.index);
        if (!item) {
            return res.status(404).render("404", { auth: req.session.user });
        }
        res.render("dnd/5e/srd/equipment-item", {
            auth: req.session.user,
            item,
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/equipment", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/equipment", {
            auth: req.session.user,
            equipmentData,
            magicItemsData,
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/magic-items/:index", (req, res, next) => {
    try {
        const item = magicItemsMap.get(req.params.index);
        if (!item) {
            return res.status(404).render("404", { auth: req.session.user });
        }
        res.render("dnd/5e/srd/magic-item", {
            auth: req.session.user,
            item,
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/damage-types", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/damagetypes", {
            auth: req.session.user,
            data: data_js_1.srdData["damage-types"] || [],
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/classes", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/classes", {
            auth: req.session.user,
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/conditions", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/conditions", {
            auth: req.session.user,
            data: data_js_1.srdData["conditions"] || [],
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/feats", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/feats", {
            auth: req.session.user,
            data: data_js_1.srdData["feats"] || [],
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/features", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/features", {
            auth: req.session.user,
            data: data_js_1.srdData["features"] || [],
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/languages", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/languages", {
            auth: req.session.user,
            data: data_js_1.srdData["languages"] || [],
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/races", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/races", {
            auth: req.session.user,
        });
    }
    catch (err) {
        next(err);
    }
});
const spellsData = data_js_1.srdData["spells"] || [];
const spellsMap = new Map(spellsData.map((s) => [s.index, s]));
router.get("/5e/srd/spells/:index", (req, res, next) => {
    try {
        const spell = spellsMap.get(req.params.index);
        if (!spell) {
            return res.status(404).render("404", { auth: req.session.user });
        }
        res.render("dnd/5e/srd/spell", {
            auth: req.session.user,
            spell,
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/spells", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/spells", {
            auth: req.session.user,
            spellsData,
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/skills", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/skills", {
            auth: req.session.user,
            data: data_js_1.srdData["skills"] || [],
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/weapon-properties", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/weaponproperties", {
            auth: req.session.user,
            data: data_js_1.srdData["weapon-properties"] || [],
        });
    }
    catch (err) {
        next(err);
    }
});
const monstersData = data_js_1.srdData["monsters"] || [];
const monstersMap = new Map(monstersData.map((m) => [m.index, m]));
const DND_API_BASE = "https://www.dnd5eapi.co";
router.get("/5e/srd/monsters/:index", (req, res, next) => {
    try {
        const monster = monstersMap.get(req.params.index);
        if (!monster) {
            return res.status(404).render("404", { auth: req.session.user });
        }
        res.render("dnd/5e/srd/monster", {
            auth: req.session.user,
            monster,
            imageBaseUrl: DND_API_BASE,
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/monsters", (req, res, next) => {
    try {
        res.render("dnd/5e/srd/monsters", {
            auth: req.session.user,
            data: monstersData,
        });
    }
    catch (err) {
        next(err);
    }
});
const srdSearchLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many search requests, please try again later" },
});
router.post("/5e/srd/search", srdSearchLimiter, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req.body;
        if (!query || typeof query !== "string") {
            res.status(400).json({ message: "Query is required" });
            return;
        }
        const trimmed = query.trim();
        if (trimmed.length < 3 || trimmed.length > 500) {
            res.status(400).json({ message: "Query must be between 3 and 500 characters" });
            return;
        }
        const answer = yield (0, mistral_js_1.searchSrd)(trimmed);
        res.json({ answer });
    }
    catch (err) {
        next(err);
    }
}));
exports.default = router;
