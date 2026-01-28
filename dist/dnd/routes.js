"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path = require("path");
const fs = require("fs");
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
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-ability-scores.json"), "utf8");
        res.render("dnd/5e/srd/abilityscores", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/alignments", (req, res, next) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-alignments.json"), "utf8");
        res.render("dnd/5e/srd/alignments", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/backgrounds", (req, res, next) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-backgrounds.json"), "utf8");
        res.render("dnd/5e/srd/backgrounds", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
const equipmentData = JSON.parse(fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-equipment.json"), "utf8"));
const magicItemsData = JSON.parse(fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-magic-items.json"), "utf8"));
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
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-damage-types.json"), "utf8");
        res.render("dnd/5e/srd/damagetypes", {
            auth: req.session.user,
            data: JSON.parse(data),
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
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-conditions.json"), "utf8");
        res.render("dnd/5e/srd/conditions", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/feats", (req, res, next) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-feats.json"), "utf8");
        res.render("dnd/5e/srd/feats", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/features", (req, res, next) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-features.json"), "utf8");
        res.render("dnd/5e/srd/features", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/languages", (req, res, next) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-languages.json"), "utf8");
        res.render("dnd/5e/srd/languages", {
            auth: req.session.user,
            data: JSON.parse(data),
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
const spellsData = JSON.parse(fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-spells.json"), "utf8"));
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
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-skills.json"), "utf8");
        res.render("dnd/5e/srd/skills", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5e/srd/weapon-properties", (req, res, next) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-weapon-properties.json"), "utf8");
        res.render("dnd/5e/srd/weaponproperties", {
            auth: req.session.user,
            data: JSON.parse(data),
        });
    }
    catch (err) {
        next(err);
    }
});
const monstersData = JSON.parse(fs.readFileSync(path.join(__dirname, "../../public/lib/data/5e-srd-monsters.json"), "utf8"));
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
exports.default = router;
