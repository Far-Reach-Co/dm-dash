"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicAppUrl = getPublicAppUrl;
exports.createEmailPreferencesToken = createEmailPreferencesToken;
exports.verifyEmailPreferencesToken = verifyEmailPreferencesToken;
exports.getEmailPreferenceLinks = getEmailPreferenceLinks;
const jsonwebtoken_1 = require("jsonwebtoken");
const EMAIL_PREFERENCES_TOKEN_PURPOSE = "email-preferences";
function getPublicAppUrl() {
    var _a;
    const envBaseUrl = (_a = process.env.PUBLIC_BASE_URL) === null || _a === void 0 ? void 0 : _a.trim();
    if (envBaseUrl)
        return envBaseUrl.replace(/\/+$/, "");
    if (process.env.SERVER_ENV === "prod")
        return "https://farreachco.com";
    return "http://localhost:4000";
}
function createEmailPreferencesToken(userId, expiresIn = "365d") {
    return (0, jsonwebtoken_1.sign)({
        purpose: EMAIL_PREFERENCES_TOKEN_PURPOSE,
        userId: String(userId),
    }, process.env.SECRET_KEY, { expiresIn });
}
function verifyEmailPreferencesToken(token) {
    try {
        const payload = (0, jsonwebtoken_1.verify)(token, process.env.SECRET_KEY);
        if (payload.purpose !== EMAIL_PREFERENCES_TOKEN_PURPOSE ||
            !payload.userId) {
            return null;
        }
        return { userId: String(payload.userId) };
    }
    catch (_a) {
        return null;
    }
}
function getEmailPreferenceLinks(userId) {
    const token = createEmailPreferencesToken(userId);
    const baseUrl = getPublicAppUrl();
    return {
        token,
        managePreferencesUrl: `${baseUrl}/email/preferences?token=${encodeURIComponent(token)}`,
        unsubscribeUrl: `${baseUrl}/email/unsubscribe?token=${encodeURIComponent(token)}`,
    };
}
