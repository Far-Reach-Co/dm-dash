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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserByToken = verifyUserByToken;
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.getUserBySession = getUserBySession;
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.verifyJwt = verifyJwt;
exports.editEmail = editEmail;
exports.editUsername = editUsername;
exports.editEmailPreferences = editEmailPreferences;
exports.resetPassword = resetPassword;
exports.requestResetEmail = requestResetEmail;
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const index_js_1 = __importDefault(require("../smtp/index.js"));
const users_1 = require("../queries/users");
const projects_1 = require("../queries/projects");
const tableViews_js_1 = require("../queries/tableViews.js");
const express_validator_1 = require("express-validator");
const eventLogger_1 = require("../../lib/eventLogger");
const emailPreferences_1 = require("../../lib/emailPreferences");
function generateAccessToken(id, expires) {
    return (0, jsonwebtoken_1.sign)({ id }, process.env.SECRET_KEY, {
        expiresIn: expires,
    });
}
function buildPreferencesFooter(userId) {
    const { managePreferencesUrl, unsubscribeUrl } = (0, emailPreferences_1.getEmailPreferenceLinks)(userId);
    return `
    <p>
      Manage your email settings:
      <a href="${managePreferencesUrl}">Preferences</a><br />
      Unsubscribe from non-essential emails:
      <a href="${unsubscribeUrl}">Unsubscribe</a>
    </p>
  `;
}
function sendResetEmail(user, token) {
    const resetUrl = `${(0, emailPreferences_1.getPublicAppUrl)()}/resetpassword?token=${encodeURIComponent(token)}`;
    index_js_1.default.sendMessage({
        user: user,
        title: "Reset Password",
        message: `Visit the following link to reset your password: <a href="${resetUrl}">Reset Password</a>`,
        footerHtml: buildPreferencesFooter(user.id),
    });
}
function verifyUserByToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const userVerifiedOrNull = (0, jsonwebtoken_1.verify)(token, process.env.SECRET_KEY);
        if (userVerifiedOrNull) {
            const userData = yield (0, users_1.getUserByIdQuery)(userVerifiedOrNull.id);
            if (userData.rows.length === 0)
                return null;
            return userData;
        }
        else
            return null;
    });
}
function getAllUsers(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const usersData = yield (0, users_1.getAllUsersQuery)();
            res.send(usersData);
        }
        catch (err) {
            return next(err);
        }
    });
}
function getUserById(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userData = yield (0, users_1.getUserByIdQuery)(req.params.id);
            res.send(userData.rows[0]);
        }
        catch (err) {
            return next(err);
        }
    });
}
function registerUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, username, password } = req.body;
            const errors = (0, express_validator_1.validationResult)(req);
            if (errors.mapped().email) {
                throw { status: 400, message: errors.mapped().email.msg };
            }
            const salt = yield (0, bcrypt_1.genSalt)(10);
            const hashedPassword = yield (0, bcrypt_1.hash)(password, salt);
            const userData = yield (0, users_1.registerUserQuery)({
                email: email.toLowerCase(),
                username: username,
                password: hashedPassword,
            });
            const data = userData.rows[0];
            const projectData = yield (0, projects_1.addProjectQuery)({
                title: "First Wyrld",
                user_id: data.id,
            });
            yield (0, tableViews_js_1.addTableViewByProjectQuery)({
                project_id: projectData.rows[0].id,
                title: "First Wyrld Table",
            });
            yield (0, tableViews_js_1.addTableViewByUserQuery)({ user_id: data.id, title: "First Table" });
            req.session.user = data.id;
            req.session.save((err) => {
                if (err) {
                    return next(err);
                }
                (0, eventLogger_1.logEventAsync)({
                    userId: data.id,
                    eventType: eventLogger_1.EventType.USER_REGISTERED,
                    eventData: { email: data.email, username: data.username },
                    req,
                });
                res.status(201).send({ message: "Successful registration" });
            });
            index_js_1.default.sendMessage({
                user: data,
                title: "Welcome",
                message: `Hi friend, our team would like to welcome you aboard our ship as we sail into our next adventure together with courage and strength!\nIf you find yourself in need of any assistance feel free to reach out to us at farreachco@gmail.com<br>Thanks for joining us, have a wonderful day.<br> - Far Reach Co.`,
                footerHtml: buildPreferencesFooter(data.id),
            });
        }
        catch (err) {
            return next(err);
        }
    });
}
function loginUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const email = req.body.email.toLowerCase();
            const password = req.body.password;
            let user;
            const userEmailData = yield (0, users_1.getUserByEmailQuery)(email);
            if (userEmailData.rows.length !== 0) {
                user = userEmailData.rows[0];
            }
            else
                return res
                    .status(400)
                    .json({ message: "This email account has not been registered" });
            if (user) {
                const validPassword = yield (0, bcrypt_1.compare)(password, user.password);
                if (validPassword) {
                    req.session.user = user.id;
                    req.session.save((err) => {
                        if (err) {
                            return next(err);
                        }
                        (0, eventLogger_1.logEventAsync)({
                            userId: user.id,
                            eventType: eventLogger_1.EventType.USER_LOGIN,
                            req,
                        });
                        res.status(200).send({ message: "Successful Login" });
                    });
                }
                else
                    return res.status(400).json({ message: "Invalid Password" });
            }
        }
        catch (err) {
            return next(err);
        }
    });
}
function verifyJwt(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
function editUsername(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            yield (0, users_1.editUserQuery)(req.session.user, {
                username: req.body.username,
            });
            res.send("Saved!");
        }
        catch (err) {
            next(err);
        }
    });
}
function editEmail(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const errors = (0, express_validator_1.validationResult)(req);
            if (errors.mapped().email) {
                throw { status: 400, message: errors.mapped().email.msg };
            }
            yield (0, users_1.editUserQuery)(req.session.user, {
                email: req.body.email,
            });
            res.send("Saved!");
        }
        catch (err) {
            next(err);
        }
    });
}
function parseCheckbox(value) {
    if (Array.isArray(value))
        return parseCheckbox(value[value.length - 1]);
    return value === true || value === "true" || value === "on" || value === "1";
}
function editEmailPreferences(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const emailUnsubscribedAll = parseCheckbox(req.body.email_unsubscribed_all);
            yield (0, users_1.editUserQuery)(req.session.user, {
                notify_wyrld_join: parseCheckbox(req.body.notify_wyrld_join),
                notify_sheet_link: parseCheckbox(req.body.notify_sheet_link),
                notify_product_updates: parseCheckbox(req.body.notify_product_updates),
                email_unsubscribed_all: emailUnsubscribedAll,
                email_unsubscribed_at: emailUnsubscribedAll ? new Date().toISOString() : null,
            });
            res.send("Saved!");
        }
        catch (err) {
            next(err);
        }
    });
}
function resetPassword(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = req.body.token;
            const password = req.body.password;
            const userData = yield verifyUserByToken(token);
            if (userData) {
                const salt = yield (0, bcrypt_1.genSalt)(10);
                const hashedPassword = yield (0, bcrypt_1.hash)(password, salt);
                const user = yield (0, users_1.editUserPasswordQuery)(userData.rows[0].id, hashedPassword);
                res.send({
                    message: `Reset password success for user: ${user.rows[0].username}`,
                });
            }
            else
                res.status(400).json({ message: "Invalid Token" });
        }
        catch (err) {
            return next(err);
        }
    });
}
function requestResetEmail(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userData = yield (0, users_1.getUserByEmailQuery)(req.body.email.toLowerCase());
            if (userData.rows.length !== 0) {
                const user = userData.rows[0];
                const token = generateAccessToken(user.id, "30m");
                sendResetEmail(userData.rows[0], token);
                res.send({ message: "Email has been sent" });
            }
            else
                return res.status(400).json({ message: "No user found by this email" });
        }
        catch (err) {
            return next(err);
        }
    });
}
function getUserBySession(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.session.user)
                throw new Error("User is not logged in");
            const { rows } = yield (0, users_1.getUserByIdQuery)(req.session.user);
            res.send(rows[0]);
        }
        catch (err) {
            return next(err);
        }
    });
}
