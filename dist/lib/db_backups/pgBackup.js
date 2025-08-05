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
const dotenv = require("dotenv");
dotenv.config();
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const aws_sdk_1 = require("aws-sdk");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: "../../../.env" });
const smtp_1 = require("../../api/smtp");
aws_sdk_1.config.update({
    signatureVersion: "v4",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
});
const s3 = new aws_sdk_1.S3();
function pgBackup() {
    function doBackup() {
        const command = `pg_dump --data-only --no-acl ${process.env.DATABASE_URL} > backup.sql`;
        (0, child_process_1.exec)(command, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        });
    }
    function uploadToAws() {
        return __awaiter(this, void 0, void 0, function* () {
            const filename = "backup.sql";
            const fileContent = (0, fs_1.readFileSync)(filename);
            const params = {
                Bucket: "wyrld/pg_backups",
                Key: filename,
                Body: fileContent,
            };
            try {
                const res = yield new Promise((resolve, reject) => {
                    s3.upload(params, (err, data) => {
                        if (err) {
                            console.error(err);
                            reject(err);
                        }
                        resolve(data.Location);
                    });
                });
                return res;
            }
            catch (err) {
                console.error(err);
                return err;
            }
        });
    }
    function runBackup() {
        return __awaiter(this, void 0, void 0, function* () {
            function doTheThing() {
                return __awaiter(this, void 0, void 0, function* () {
                    console.log("Running backup");
                    doBackup();
                    setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        const uploadStatus = yield uploadToAws();
                        console.log(uploadStatus);
                        smtp_1.default.sendMessage({
                            user: { email: "farreachco@gmail.com" },
                            title: "Database Backup",
                            message: `This information will either be a location of the new backup file, or an error message: ${uploadStatus}`,
                        });
                    }), 10000);
                });
            }
            yield doTheThing();
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                yield doTheThing();
            }), 60 * 1000 * 60 * 24);
        });
    }
    runBackup();
}
pgBackup();
module.exports = pgBackup;
