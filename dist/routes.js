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
var express_1 = require("express");
var users_1 = require("./api/queries/users");
var _5eCharGeneral_1 = require("./api/queries/5eCharGeneral");
var tableViews_1 = require("./api/queries/tableViews");
var playerUsers_1 = require("./api/queries/playerUsers");
var router = (0, express_1.Router)();
router.get("/", function (req, res, next) {
    try {
        res.render("index", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/index", function (req, res, next) {
    try {
        res.render("index", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/login", function (req, res, next) {
    try {
        res.render("login", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/register", function (req, res, next) {
    try {
        res.render("register", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/forgotpassword", function (req, res, next) {
    try {
        res.render("forgotpassword", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/resetpassword", function (req, res, next) {
    try {
        res.render("resetpassword", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/invite", function (req, res, next) {
    try {
        res.render("invite", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/account", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.session.user)
                    throw new Error("User is not logged in");
                return [4, (0, users_1.getUserByIdQuery)(req.session.user)];
            case 1:
                rows = (_a.sent()).rows;
                res.render("account", { auth: req.session.user, user: rows[0] });
                return [3, 3];
            case 2:
                err_1 = _a.sent();
                next(err_1);
                return [3, 3];
            case 3: return [2];
        }
    });
}); });
router.get("/dashboard", function (req, res, next) {
    try {
        res.render("dashboard", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/5eplayer", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var playerSheetid, playerSheetUserIdData, playerSheetUserId, playerUserData, invite, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                if (!req.session.user)
                    throw new Error("User is not logged in");
                if (!req.query.id)
                    throw new Error("Missing player ID in query");
                playerSheetid = req.query.id;
                return [4, (0, _5eCharGeneral_1.get5eCharGeneralUserIdQuery)(playerSheetid)];
            case 1:
                playerSheetUserIdData = _a.sent();
                playerSheetUserId = playerSheetUserIdData.rows[0].user_id;
                if (!(playerSheetUserId != req.session.user)) return [3, 3];
                return [4, (0, playerUsers_1.getPlayerUserByUserAndPlayerQuery)(req.session.user, playerSheetid)];
            case 2:
                playerUserData = _a.sent();
                if (!playerUserData.rows.length) {
                    invite = req.query.invite;
                    if (!invite) {
                        return [2, res.render("forbidden", { auth: req.session.user })];
                    }
                }
                _a.label = 3;
            case 3:
                res.render("5eplayer", { auth: req.session.user });
                return [3, 5];
            case 4:
                err_2 = _a.sent();
                next(err_2);
                return [3, 5];
            case 5: return [2];
        }
    });
}); });
router.get("/dash", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var tableData, charData, sharedCharData, playerUsersData, _i, _a, playerUser, puCharData, err_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 8, , 9]);
                if (!req.session.user)
                    throw new Error("User is not logged in");
                return [4, (0, tableViews_1.getTableViewsByUserQuery)(req.session.user)];
            case 1:
                tableData = _b.sent();
                return [4, (0, _5eCharGeneral_1.get5eCharsGeneralByUserQuery)(req.session.user)];
            case 2:
                charData = _b.sent();
                sharedCharData = [];
                return [4, (0, playerUsers_1.getPlayerUsersQuery)(req.session.user)];
            case 3:
                playerUsersData = _b.sent();
                if (!playerUsersData.rows.length) return [3, 7];
                _i = 0, _a = playerUsersData.rows;
                _b.label = 4;
            case 4:
                if (!(_i < _a.length)) return [3, 7];
                playerUser = _a[_i];
                return [4, (0, _5eCharGeneral_1.get5eCharGeneralQuery)(playerUser.player_id)];
            case 5:
                puCharData = _b.sent();
                sharedCharData.push(puCharData.rows[0]);
                _b.label = 6;
            case 6:
                _i++;
                return [3, 4];
            case 7:
                res.render("dash", {
                    auth: req.session.user,
                    tables: tableData.rows,
                    sheets: charData.rows,
                    sharedSheets: sharedCharData
                });
                return [3, 9];
            case 8:
                err_3 = _b.sent();
                next(err_3);
                return [3, 9];
            case 9: return [2];
        }
    });
}); });
router.get("/newsheet", function (req, res, next) {
    try {
        res.render("newsheet", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/newtable", function (req, res, next) {
    try {
        res.render("newtable", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.get("/vtt", function (req, res, next) {
    try {
        if (!req.session.user) {
            res.render("forbidden", { auth: req.session.user });
        }
        else {
            res.render("vtt", { auth: req.session.user });
        }
    }
    catch (err) {
        next(err);
    }
});
router.post("/update_username", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var err_4;
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
                err_4 = _a.sent();
                next(err_4);
                return [3, 3];
            case 3: return [2];
        }
    });
}); });
router.post("/update_email", function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.session.user)
                    throw new Error("User is not logged in");
                return [4, (0, users_1.editUserQuery)(req.session.user, {
                        email: req.body.email
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
}); });
router.get("/logout", function (req, res, next) {
    req.session.destroy(function (err) {
        if (err) {
            return console.log(err);
        }
        res.redirect("/");
    });
});
router.get("/forbidden", function (req, res, next) {
    try {
        res.render("forbidden", { auth: req.session.user });
    }
    catch (err) {
        next(err);
    }
});
router.use(function (req, res, next) {
    res.status(404).render("404", { auth: req.session.user });
});
module.exports = router;
