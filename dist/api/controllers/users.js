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
exports.requestResetEmail = exports.resetPassword = exports.editUsername = exports.editEmail = exports.verifyJwt = exports.loginUser = exports.registerUser = exports.getUserBySession = exports.getUserById = exports.getAllUsers = exports.verifyUserByToken = void 0;
var bcrypt_1 = require("bcrypt");
var jsonwebtoken_1 = require("jsonwebtoken");
var index_js_1 = require("../smtp/index.js");
var users_1 = require("../queries/users");
var projects_1 = require("../queries/projects");
var tableViews_js_1 = require("../queries/tableViews.js");
var express_validator_1 = require("express-validator");
function generateAccessToken(id, expires) {
    return (0, jsonwebtoken_1.sign)({ id: id }, process.env.SECRET_KEY, { expiresIn: expires });
}
function sendResetEmail(user, token) {
    index_js_1["default"].sendMessage({
        user: user,
        title: "Reset Password",
        message: "Visit the following link to reset your password: <a href=\"https://farreachco.com/resetpassword?token=".concat(token, "\">Reset Password</a>")
    });
}
function verifyUserByToken(token) {
    return __awaiter(this, void 0, void 0, function () {
        var userVerifiedOrNull, userData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userVerifiedOrNull = (0, jsonwebtoken_1.verify)(token, process.env.SECRET_KEY);
                    if (!userVerifiedOrNull) return [3, 2];
                    return [4, (0, users_1.getUserByIdQuery)(userVerifiedOrNull.id)];
                case 1:
                    userData = _a.sent();
                    if (userData.rows.length === 0)
                        return [2, null];
                    return [2, userData];
                case 2: return [2, null];
            }
        });
    });
}
exports.verifyUserByToken = verifyUserByToken;
function getAllUsers(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var usersData, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, users_1.getAllUsersQuery)()];
                case 1:
                    usersData = _a.sent();
                    res.send(usersData);
                    return [3, 3];
                case 2:
                    err_1 = _a.sent();
                    return [2, next(err_1)];
                case 3: return [2];
            }
        });
    });
}
exports.getAllUsers = getAllUsers;
function getUserById(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var userData, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, users_1.getUserByIdQuery)(req.params.id)];
                case 1:
                    userData = _a.sent();
                    res.send(userData.rows[0]);
                    return [3, 3];
                case 2:
                    err_2 = _a.sent();
                    return [2, next(err_2)];
                case 3: return [2];
            }
        });
    });
}
exports.getUserById = getUserById;
function registerUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, email, username, password, errors, salt, hashedPassword, userData, data, projectData, err_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    _a = req.body, email = _a.email, username = _a.username, password = _a.password;
                    errors = (0, express_validator_1.validationResult)(req);
                    if (errors.mapped().email) {
                        throw { status: 400, message: errors.mapped().email.msg };
                    }
                    return [4, (0, bcrypt_1.genSalt)(10)];
                case 1:
                    salt = _b.sent();
                    return [4, (0, bcrypt_1.hash)(password, salt)];
                case 2:
                    hashedPassword = _b.sent();
                    return [4, (0, users_1.registerUserQuery)({
                            email: email.toLowerCase(),
                            username: username,
                            password: hashedPassword
                        })];
                case 3:
                    userData = _b.sent();
                    data = userData.rows[0];
                    return [4, (0, projects_1.addProjectQuery)({
                            title: "First Wyrld",
                            user_id: data.id
                        })];
                case 4:
                    projectData = _b.sent();
                    return [4, (0, tableViews_js_1.addTableViewByProjectQuery)({
                            project_id: projectData.rows[0].id,
                            title: "First Wyrld Table"
                        })];
                case 5:
                    _b.sent();
                    return [4, (0, tableViews_js_1.addTableViewByUserQuery)({ user_id: data.id, title: "First Table" })];
                case 6:
                    _b.sent();
                    req.session.user = data.id;
                    res.status(201).send({ message: "Successful registration" });
                    index_js_1["default"].sendMessage({
                        user: data,
                        title: "Welcome",
                        message: "Hi friend, our team would like to welcome you aboard our ship as we sail into our next adventure together with courage and strength!\nIf you find yourself in need of any assistance feel free to reach out to us at farreachco@gmail.com<br>Thanks for joining us, have a wonderful day.<br> - Far Reach Co."
                    });
                    return [3, 8];
                case 7:
                    err_3 = _b.sent();
                    return [2, next(err_3)];
                case 8: return [2];
            }
        });
    });
}
exports.registerUser = registerUser;
function loginUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var email, password, user, userEmailData, validPassword, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    email = req.body.email.toLowerCase();
                    password = req.body.password;
                    user = void 0;
                    return [4, (0, users_1.getUserByEmailQuery)(email)];
                case 1:
                    userEmailData = _a.sent();
                    if (userEmailData.rows.length !== 0) {
                        user = userEmailData.rows[0];
                    }
                    else
                        return [2, res
                                .status(400)
                                .json({ message: "This email account has not been registered" })];
                    if (!user) return [3, 3];
                    return [4, (0, bcrypt_1.compare)(password, user.password)];
                case 2:
                    validPassword = _a.sent();
                    if (validPassword) {
                        req.session.user = user.id;
                        res.status(200).send({ message: "Successful Login" });
                    }
                    else
                        return [2, res.status(400).json({ message: "Invalid Password" })];
                    _a.label = 3;
                case 3: return [3, 5];
                case 4:
                    err_4 = _a.sent();
                    return [2, next(err_4)];
                case 5: return [2];
            }
        });
    });
}
exports.loginUser = loginUser;
function verifyJwt(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2];
        });
    });
}
exports.verifyJwt = verifyJwt;
function editUsername(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!req.session.user)
                        throw new Error("User is not logged in");
                    return [4, (0, users_1.editUserQuery)(req.session.user, {
                            username: req.body.username
                        })];
                case 1:
                    _a.sent();
                    res.send("Saved!");
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
exports.editUsername = editUsername;
function editEmail(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var errors, err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!req.session.user)
                        throw new Error("User is not logged in");
                    errors = (0, express_validator_1.validationResult)(req);
                    if (errors.mapped().email) {
                        throw { status: 400, message: errors.mapped().email.msg };
                    }
                    return [4, (0, users_1.editUserQuery)(req.session.user, {
                            email: req.body.email
                        })];
                case 1:
                    _a.sent();
                    res.send("Saved!");
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
exports.editEmail = editEmail;
function resetPassword(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var token, password, userData, salt, hashedPassword, user, err_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    token = req.body.token;
                    password = req.body.password;
                    return [4, verifyUserByToken(token)];
                case 1:
                    userData = _a.sent();
                    if (!userData) return [3, 5];
                    return [4, (0, bcrypt_1.genSalt)(10)];
                case 2:
                    salt = _a.sent();
                    return [4, (0, bcrypt_1.hash)(password, salt)];
                case 3:
                    hashedPassword = _a.sent();
                    return [4, (0, users_1.editUserPasswordQuery)(userData.rows[0].id, hashedPassword)];
                case 4:
                    user = _a.sent();
                    res.send({
                        message: "Reset password success for user: ".concat(user.rows[0].id)
                    });
                    return [3, 6];
                case 5:
                    res.status(400).json({ message: "Invalid Token" });
                    _a.label = 6;
                case 6: return [3, 8];
                case 7:
                    err_7 = _a.sent();
                    return [2, next(err_7)];
                case 8: return [2];
            }
        });
    });
}
exports.resetPassword = resetPassword;
function requestResetEmail(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var userData, user, token, err_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, (0, users_1.getUserByEmailQuery)(req.body.email.toLowerCase())];
                case 1:
                    userData = _a.sent();
                    if (userData.rows.length !== 0) {
                        user = userData.rows[0];
                        token = generateAccessToken(user.id, "30m");
                        sendResetEmail(userData.rows[0], token);
                        res.send({ message: "Email has been sent" });
                    }
                    else
                        return [2, res.status(400).json({ message: "No user found by this email" })];
                    return [3, 3];
                case 2:
                    err_8 = _a.sent();
                    return [2, next(err_8)];
                case 3: return [2];
            }
        });
    });
}
exports.requestResetEmail = requestResetEmail;
function getUserBySession(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var rows, err_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!req.session.user)
                        throw new Error("User is not logged in");
                    return [4, (0, users_1.getUserByIdQuery)(req.session.user)];
                case 1:
                    rows = (_a.sent()).rows;
                    res.send(rows[0]);
                    return [3, 3];
                case 2:
                    err_9 = _a.sent();
                    return [2, next(err_9)];
                case 3: return [2];
            }
        });
    });
}
exports.getUserBySession = getUserBySession;
