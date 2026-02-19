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
const path_1 = require("path");
const crypto_1 = require("crypto");
const os_1 = require("os");
const logger_1 = __importDefault(require("../logger"));
const dbConnection_1 = require("../dbConnection");
dotenv_1.default.config();
function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.spawn)(command, args, { stdio: ["ignore", "pipe", "pipe"] });
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
        });
        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });
        child.on("error", (err) => {
            reject(err);
        });
        child.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(`${command} exited with code ${code}. stderr: ${stderr.trim() || "none"}`));
                return;
            }
            resolve({ stdout, stderr });
        });
    });
}
function buildAdminDatabaseUrl(databaseUrl) {
    const url = new URL(databaseUrl);
    url.pathname = "/postgres";
    return url.toString();
}
function buildDatabaseUrlWithDatabaseName(databaseUrl, databaseName) {
    const url = new URL(databaseUrl);
    url.pathname = `/${databaseName}`;
    return url.toString();
}
function createTemporaryDatabaseName() {
    const timestamp = Date.now().toString(36);
    const suffix = (0, crypto_1.randomBytes)(4).toString("hex");
    return `restore_check_${timestamp}_${suffix}`;
}
function runRestoreCheck() {
    return __awaiter(this, void 0, void 0, function* () {
        const sourceDatabaseUrl = (0, dbConnection_1.resolveDatabaseUrlForLibpq)();
        const adminDatabaseUrl = buildAdminDatabaseUrl(sourceDatabaseUrl);
        const tempDatabaseName = createTemporaryDatabaseName();
        const restoreDatabaseUrl = buildDatabaseUrlWithDatabaseName(sourceDatabaseUrl, tempDatabaseName);
        const dumpFilePath = (0, path_1.join)((0, os_1.tmpdir)(), `restore-check-full-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`);
        logger_1.default.info({ dumpFilePath, tempDatabaseName }, "Starting restore check with a full database dump");
        try {
            yield runCommand("pg_dump", [
                "--no-acl",
                "--file",
                dumpFilePath,
                sourceDatabaseUrl,
            ]);
            const stats = yield fs_1.promises.stat(dumpFilePath);
            if (stats.size <= 0) {
                throw new Error("Full dump file is empty");
            }
            yield runCommand("psql", [
                adminDatabaseUrl,
                "-v",
                "ON_ERROR_STOP=1",
                "-c",
                `CREATE DATABASE "${tempDatabaseName}"`,
            ]);
            yield runCommand("psql", [
                restoreDatabaseUrl,
                "-v",
                "ON_ERROR_STOP=1",
                "-f",
                dumpFilePath,
            ]);
            const tableCountResult = yield runCommand("psql", [
                restoreDatabaseUrl,
                "-v",
                "ON_ERROR_STOP=1",
                "-tAc",
                "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';",
            ]);
            const tableCount = Number(tableCountResult.stdout.trim() || "0");
            if (!Number.isFinite(tableCount) || tableCount <= 0) {
                throw new Error("Restore check failed: restored database has no public tables");
            }
            logger_1.default.info({ tempDatabaseName, tableCount, dumpFilePath }, "Restore check completed successfully");
        }
        finally {
            try {
                yield runCommand("psql", [
                    adminDatabaseUrl,
                    "-v",
                    "ON_ERROR_STOP=1",
                    "-c",
                    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${tempDatabaseName}' AND pid <> pg_backend_pid();`,
                ]);
                yield runCommand("psql", [
                    adminDatabaseUrl,
                    "-v",
                    "ON_ERROR_STOP=1",
                    "-c",
                    `DROP DATABASE IF EXISTS "${tempDatabaseName}"`,
                ]);
            }
            catch (cleanupErr) {
                logger_1.default.warn({ err: cleanupErr, tempDatabaseName }, "Failed to drop temporary restore-check database");
            }
            try {
                yield fs_1.promises.unlink(dumpFilePath);
            }
            catch (cleanupErr) {
                logger_1.default.warn({ err: cleanupErr, dumpFilePath }, "Failed to delete restore-check dump file");
            }
        }
    });
}
if (require.main === module) {
    runRestoreCheck()
        .then(() => {
        process.exit(0);
    })
        .catch((err) => {
        logger_1.default.error({ err }, "Restore check failed");
        process.exit(1);
    });
}
