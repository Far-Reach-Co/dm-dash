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
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var aws_sdk_1 = require("aws-sdk");
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: "../../../.env" });
var smtp_1 = require("../../api/smtp");
aws_sdk_1.config.update({
    signatureVersion: "v4",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1"
});
var s3 = new aws_sdk_1.S3();
function pgBackup() {
    function doBackup() {
        var command = "pg_dump --data-only --no-acl ".concat(process.env.DATABASE_URL, " > backup.sql");
        (0, child_process_1.exec)(command, function (err, stdout, stderr) {
            if (err) {
                return;
            }
            console.log("stdout: ".concat(stdout));
            console.log("stderr: ".concat(stderr));
        });
    }
    function uploadToAws() {
        return __awaiter(this, void 0, void 0, function () {
            var filename, fileContent, params, res, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filename = "backup.sql";
                        fileContent = (0, fs_1.readFileSync)(filename);
                        params = {
                            Bucket: "wyrld/pg_backups",
                            Key: filename,
                            Body: fileContent
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, new Promise(function (resolve, reject) {
                                s3.upload(params, function (err, data) {
                                    if (err) {
                                        reject(err);
                                    }
                                    resolve(data.Location);
                                });
                            })];
                    case 2:
                        res = _a.sent();
                        return [2, res];
                    case 3:
                        err_1 = _a.sent();
                        console.log(err_1);
                        return [2, err_1];
                    case 4: return [2];
                }
            });
        });
    }
    function runBackup() {
        return __awaiter(this, void 0, void 0, function () {
            function doTheThing() {
                return __awaiter(this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        console.log("Running backup");
                        doBackup();
                        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            var uploadStatus;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, uploadToAws()];
                                    case 1:
                                        uploadStatus = _a.sent();
                                        console.log(uploadStatus);
                                        smtp_1["default"].sendMessage({
                                            user: { email: "farreachco@gmail.com" },
                                            title: "Database Backup",
                                            message: "This information will either be a location of the new backup file, or an error message: ".concat(uploadStatus)
                                        });
                                        return [2];
                                }
                            });
                        }); }, 10000);
                        return [2];
                    });
                });
            }
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, doTheThing()];
                    case 1:
                        _a.sent();
                        setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, doTheThing()];
                                    case 1:
                                        _a.sent();
                                        return [2];
                                }
                            });
                        }); }, 60 * 1000 * 60 * 24);
                        return [2];
                }
            });
        });
    }
    runBackup();
}
pgBackup();
module.exports = pgBackup;
