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
const users_1 = require("../api/queries/users");
const emailPreferences_1 = require("../lib/emailPreferences");
const router = (0, express_1.Router)();
function parseCheckbox(value) {
    if (Array.isArray(value))
        return parseCheckbox(value[value.length - 1]);
    return value === true || value === "true" || value === "on" || value === "1";
}
function readToken(req) {
    if (typeof req.query.token === "string")
        return req.query.token;
    if (req.body && typeof req.body.token === "string")
        return req.body.token;
    return null;
}
function renderPreferencesPage(res, params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { token, userId, saved, unsubscribed, error } = params;
        const userData = yield (0, users_1.getUserByIdQuery)(userId);
        const user = userData.rows[0];
        if (!user) {
            return res.status(404).render("email-preferences", {
                token,
                user: null,
                saved: false,
                unsubscribed: false,
                error: "User not found for this email token.",
            });
        }
        return res.render("email-preferences", {
            token,
            user,
            saved: Boolean(saved),
            unsubscribed: Boolean(unsubscribed),
            error: error || "",
        });
    });
}
function unsubscribeAllByToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = (0, emailPreferences_1.verifyEmailPreferencesToken)(token);
        if (!payload)
            return null;
        yield (0, users_1.editUserQuery)(payload.userId, {
            email_unsubscribed_all: true,
            email_unsubscribed_at: new Date().toISOString(),
        });
        return payload;
    });
}
router.get("/email/preferences", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = readToken(req);
        if (!token) {
            return res.status(400).render("email-preferences", {
                token: "",
                user: null,
                saved: false,
                unsubscribed: false,
                error: "Missing email preferences token.",
            });
        }
        const payload = (0, emailPreferences_1.verifyEmailPreferencesToken)(token);
        if (!payload) {
            return res.status(400).render("email-preferences", {
                token,
                user: null,
                saved: false,
                unsubscribed: false,
                error: "Invalid or expired email preferences token.",
            });
        }
        return yield renderPreferencesPage(res, {
            token,
            userId: payload.userId,
            saved: req.query.saved === "1",
            unsubscribed: req.query.unsubscribed === "1",
        });
    }
    catch (err) {
        return next(err);
    }
}));
router.post("/email/preferences", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = readToken(req);
        if (!token) {
            return res.status(400).render("email-preferences", {
                token: "",
                user: null,
                saved: false,
                unsubscribed: false,
                error: "Missing email preferences token.",
            });
        }
        const payload = (0, emailPreferences_1.verifyEmailPreferencesToken)(token);
        if (!payload) {
            return res.status(400).render("email-preferences", {
                token,
                user: null,
                saved: false,
                unsubscribed: false,
                error: "Invalid or expired email preferences token.",
            });
        }
        const emailUnsubscribedAll = parseCheckbox(req.body.email_unsubscribed_all);
        yield (0, users_1.editUserQuery)(payload.userId, {
            notify_wyrld_join: parseCheckbox(req.body.notify_wyrld_join),
            notify_sheet_link: parseCheckbox(req.body.notify_sheet_link),
            notify_product_updates: parseCheckbox(req.body.notify_product_updates),
            email_unsubscribed_all: emailUnsubscribedAll,
            email_unsubscribed_at: emailUnsubscribedAll ? new Date().toISOString() : null,
        });
        return yield renderPreferencesPage(res, {
            token,
            userId: payload.userId,
            saved: true,
        });
    }
    catch (err) {
        return next(err);
    }
}));
router.get("/email/unsubscribe", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = readToken(req);
        if (!token) {
            return res.status(400).send("Missing unsubscribe token.");
        }
        const payload = yield unsubscribeAllByToken(token);
        if (!payload) {
            return res.status(400).send("Invalid or expired unsubscribe token.");
        }
        return res.redirect(`/email/preferences?token=${encodeURIComponent(token)}&unsubscribed=1`);
    }
    catch (err) {
        return next(err);
    }
}));
router.post("/email/unsubscribe", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = readToken(req);
        if (!token) {
            return res.status(400).send("Missing unsubscribe token.");
        }
        const payload = yield unsubscribeAllByToken(token);
        if (!payload) {
            return res.status(400).send("Invalid or expired unsubscribe token.");
        }
        return res.status(200).send("You have been unsubscribed.");
    }
    catch (err) {
        return next(err);
    }
}));
exports.default = router;
