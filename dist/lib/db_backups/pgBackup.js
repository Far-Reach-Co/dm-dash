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
const dotenv_1 = __importDefault(require("dotenv"));
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const fs_2 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
const aws_sdk_1 = require("aws-sdk");
const smtp_1 = __importDefault(require("../../api/smtp"));
const logger_1 = __importDefault(require("../logger"));
dotenv_1.default.config();
const DEFAULT_COMPANY_EMAIL = "farreachco@gmail.com";
const DEFAULT_BUCKET_PATH = "wyrld/pg_backups";
const DEFAULT_INTERVAL_MS = 24 * 60 * 60 * 1000;
const MIN_BACKUP_FILE_SIZE_BYTES = 50;
const backupIntervalMs = Number(process.env.DB_BACKUP_INTERVAL_MS || DEFAULT_INTERVAL_MS);
const companyAlertEmail = process.env.DB_BACKUP_ALERT_EMAIL || DEFAULT_COMPANY_EMAIL;
const databaseUrl = process.env.DATABASE_URL;
const bucketConfig = resolveBucketConfig(process.env.DB_BACKUP_S3_BUCKET || DEFAULT_BUCKET_PATH, process.env.DB_BACKUP_S3_PREFIX || "");
aws_sdk_1.config.update({
    signatureVersion: "v4",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || "us-east-1",
});
const s3 = new aws_sdk_1.S3();
function resolveBucketConfig(rawBucket, rawPrefix) {
    const normalizedBucket = rawBucket.trim().replace(/^\/+|\/+$/g, "");
    const normalizedPrefix = rawPrefix.trim().replace(/^\/+|\/+$/g, "");
    if (!normalizedBucket) {
        throw new Error("DB_BACKUP_S3_BUCKET is required");
    }
    if (!normalizedBucket.includes("/")) {
        return {
            bucket: normalizedBucket,
            prefix: normalizedPrefix,
        };
    }
    const [bucket, ...rest] = normalizedBucket.split("/");
    const derivedPrefix = rest.join("/");
    const prefix = [derivedPrefix, normalizedPrefix].filter(Boolean).join("/");
    return { bucket, prefix };
}
function formatDateForFilename(date) {
    return date.toISOString().replace(/[:.]/g, "-");
}
function getS3Key(filename) {
    if (!bucketConfig.prefix)
        return filename;
    return `${bucketConfig.prefix}/${filename}`;
}
function assertConfig() {
    if (!databaseUrl) {
        throw new Error("DATABASE_URL is required for database backups");
    }
    if (!Number.isFinite(backupIntervalMs) || backupIntervalMs <= 0) {
        throw new Error("DB_BACKUP_INTERVAL_MS must be a positive number");
    }
}
function runPgDump(outputPath) {
    return new Promise((resolve, reject) => {
        const args = ["--data-only", "--no-acl", databaseUrl];
        const child = (0, child_process_1.spawn)("pg_dump", args, { stdio: ["ignore", "pipe", "pipe"] });
        const outputStream = (0, fs_1.createWriteStream)(outputPath, { flags: "w" });
        let stderrOutput = "";
        let settled = false;
        const fail = (err) => {
            if (settled)
                return;
            settled = true;
            if (!child.killed)
                child.kill("SIGTERM");
            outputStream.destroy();
            reject(err);
        };
        child.stdout.pipe(outputStream);
        child.stderr.on("data", (chunk) => {
            stderrOutput += chunk.toString();
        });
        child.on("error", (err) => {
            fail(err);
        });
        outputStream.on("error", (err) => {
            fail(err);
        });
        const closePromise = new Promise((res) => {
            child.on("close", (code) => res(code));
        });
        const finishPromise = new Promise((res, rej) => {
            outputStream.on("finish", () => res());
            outputStream.on("error", (err) => rej(err));
        });
        Promise.all([closePromise, finishPromise])
            .then(([code]) => {
            if (code !== 0) {
                fail(new Error(`pg_dump exited with code ${code}. stderr: ${stderrOutput || "none"}`));
                return;
            }
            if (settled)
                return;
            settled = true;
            resolve(stderrOutput.trim());
        })
            .catch((err) => {
            fail(err);
        });
    });
}
function ensureBackupFileLooksValid(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = yield fs_2.promises.stat(filePath);
        if (stats.size < MIN_BACKUP_FILE_SIZE_BYTES) {
            throw new Error(`Backup file is unexpectedly small (${stats.size} bytes). Expected at least ${MIN_BACKUP_FILE_SIZE_BYTES} bytes.`);
        }
    });
}
function uploadBackupToS3(localPath, s3Key) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield s3
            .upload({
            Bucket: bucketConfig.bucket,
            Key: s3Key,
            Body: (0, fs_1.createReadStream)(localPath),
            ContentType: "application/sql",
        })
            .promise();
        if (!result.Location) {
            throw new Error("S3 upload completed without a file location");
        }
        return result.Location;
    });
}
function sendSevereIssueEmail(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { startedAt, failedAt, err, context } = params;
        const errMessage = err instanceof Error ? `${err.message}\n${err.stack || ""}` : String(err);
        const host = process.env.HOSTNAME || "unknown-host";
        yield smtp_1.default.sendMessage({
            user: { email: companyAlertEmail },
            title: "[SEVERE] Database backup failed",
            message: [
                "A severe issue occurred while running the database backup.",
                `Host: ${host}`,
                `Started at: ${startedAt.toISOString()}`,
                `Failed at: ${failedAt.toISOString()}`,
                context ? `Context: ${context}` : null,
                "",
                "Error:",
                errMessage,
            ]
                .filter(Boolean)
                .join("\n"),
        });
    });
}
function runSingleBackup() {
    return __awaiter(this, void 0, void 0, function* () {
        assertConfig();
        const startedAt = new Date();
        const filename = `backup-${formatDateForFilename(startedAt)}.sql`;
        const localPath = (0, path_1.join)((0, os_1.tmpdir)(), filename);
        const s3Key = getS3Key(filename);
        try {
            const warnings = yield runPgDump(localPath);
            yield ensureBackupFileLooksValid(localPath);
            const location = yield uploadBackupToS3(localPath, s3Key);
            const finishedAt = new Date();
            return {
                filename,
                localPath,
                s3Key,
                location,
                warnings,
                startedAt,
                finishedAt,
            };
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            error.localPath = localPath;
            error.startedAt = startedAt;
            throw error;
        }
    });
}
function startDbBackupScheduler() {
    let inFlight = false;
    const runAndHandle = () => __awaiter(this, void 0, void 0, function* () {
        if (inFlight) {
            logger_1.default.warn("Skipping backup run because a previous run is still in progress");
            return;
        }
        inFlight = true;
        let localPathForCleanup;
        let startedAt = new Date();
        try {
            logger_1.default.info({
                intervalMs: backupIntervalMs,
                bucket: bucketConfig.bucket,
                prefix: bucketConfig.prefix || "(none)",
            }, "Starting database backup run");
            const result = yield runSingleBackup();
            localPathForCleanup = result.localPath;
            startedAt = result.startedAt;
            logger_1.default.info({
                filename: result.filename,
                s3Key: result.s3Key,
                location: result.location,
                durationMs: result.finishedAt.getTime() - result.startedAt.getTime(),
                warnings: result.warnings || undefined,
            }, "Database backup completed");
        }
        catch (err) {
            logger_1.default.error({ err }, "Database backup failed");
            const detailedError = err;
            if (detailedError.startedAt)
                startedAt = detailedError.startedAt;
            localPathForCleanup = detailedError.localPath || localPathForCleanup;
            const failedAt = new Date();
            try {
                yield sendSevereIssueEmail({
                    startedAt,
                    failedAt,
                    err,
                    context: `S3 bucket: ${bucketConfig.bucket}, prefix: ${bucketConfig.prefix || "(none)"}`,
                });
            }
            catch (emailErr) {
                logger_1.default.error({ err: emailErr }, "Failed to send severe backup failure email");
            }
        }
        finally {
            if (localPathForCleanup) {
                try {
                    yield fs_2.promises.unlink(localPathForCleanup);
                }
                catch (cleanupErr) {
                    logger_1.default.warn({ err: cleanupErr, localPath: localPathForCleanup }, "Failed to clean up local backup file");
                }
            }
            inFlight = false;
        }
    });
    runAndHandle().catch((err) => {
        logger_1.default.error({ err }, "Unexpected backup runner error");
    });
    setInterval(() => {
        runAndHandle().catch((err) => {
            logger_1.default.error({ err }, "Unexpected backup runner error");
        });
    }, backupIntervalMs);
}
startDbBackupScheduler();
exports.default = startDbBackupScheduler;
