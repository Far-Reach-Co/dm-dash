"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDatabaseUrl = resolveDatabaseUrl;
exports.resolveDatabaseUrlForLibpq = resolveDatabaseUrlForLibpq;
exports.resolveDatabasePoolConfig = resolveDatabasePoolConfig;
const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const FALSE_VALUES = new Set(["0", "false", "no", "off"]);
const VALID_SSL_MODES = new Set([
    "disable",
    "allow",
    "prefer",
    "require",
    "verify-ca",
    "verify-full",
    "no-verify",
]);
function readRequiredEnv(name) {
    var _a;
    const value = (_a = process.env[name]) === null || _a === void 0 ? void 0 : _a.trim();
    if (!value) {
        throw new Error(`${name} environment variable is required`);
    }
    return value;
}
function readOptionalBoolean(name) {
    const value = process.env[name];
    if (value === undefined)
        return undefined;
    const normalized = value.trim().toLowerCase();
    if (!normalized)
        return undefined;
    if (TRUE_VALUES.has(normalized))
        return true;
    if (FALSE_VALUES.has(normalized))
        return false;
    throw new Error(`${name} must be a boolean value (true/false)`);
}
function readPort() {
    var _a;
    const rawPort = ((_a = process.env.PG_PORT) === null || _a === void 0 ? void 0 : _a.trim()) || "5432";
    const port = Number(rawPort);
    if (!Number.isInteger(port) || port <= 0) {
        throw new Error("PG_PORT must be a positive integer");
    }
    return port;
}
function readConfiguredSslMode() {
    var _a, _b, _c;
    const explicitMode = ((_a = process.env.PGSSLMODE) === null || _a === void 0 ? void 0 : _a.trim()) || ((_b = process.env.PG_SSL_MODE) === null || _b === void 0 ? void 0 : _b.trim());
    if (explicitMode) {
        const normalized = explicitMode.toLowerCase();
        if (!VALID_SSL_MODES.has(normalized)) {
            throw new Error("PGSSLMODE/PG_SSL_MODE must be one of: disable, allow, prefer, require, verify-ca, verify-full, no-verify");
        }
        return normalized;
    }
    const sslEnabled = readOptionalBoolean("PG_SSL");
    if (sslEnabled === false)
        return "disable";
    if (sslEnabled === true) {
        const rejectUnauthorized = (_c = readOptionalBoolean("PG_SSL_REJECT_UNAUTHORIZED")) !== null && _c !== void 0 ? _c : false;
        return rejectUnauthorized ? "verify-full" : "require";
    }
    return undefined;
}
function mapSslModeToPoolSsl(sslMode) {
    if (!sslMode)
        return undefined;
    if (sslMode === "disable")
        return false;
    if (sslMode === "verify-ca" || sslMode === "verify-full") {
        return { rejectUnauthorized: true };
    }
    return { rejectUnauthorized: false };
}
function mapSslModeToLibpqMode(sslMode) {
    if (!sslMode)
        return undefined;
    if (sslMode === "no-verify")
        return "require";
    return sslMode;
}
function buildDatabaseUrlFromPgEnv() {
    const user = readRequiredEnv("PG_USER");
    const host = readRequiredEnv("PG_HOST");
    const database = readRequiredEnv("PG_DB");
    const password = readRequiredEnv("PG_PW");
    const port = readPort();
    const url = new URL("postgres://localhost");
    url.username = user;
    url.password = password;
    url.hostname = host;
    url.port = String(port);
    url.pathname = `/${database}`;
    const sslMode = mapSslModeToLibpqMode(readConfiguredSslMode());
    if (sslMode && sslMode !== "disable") {
        url.searchParams.set("sslmode", sslMode);
    }
    return url.toString();
}
function resolveDatabaseUrl() {
    var _a;
    const directDatabaseUrl = (_a = process.env.DATABASE_URL) === null || _a === void 0 ? void 0 : _a.trim();
    if (directDatabaseUrl)
        return directDatabaseUrl;
    return buildDatabaseUrlFromPgEnv();
}
function resolveDatabaseUrlForLibpq() {
    const url = new URL(resolveDatabaseUrl());
    const sslMode = url.searchParams.get("sslmode");
    if (sslMode && sslMode.toLowerCase() === "no-verify") {
        url.searchParams.set("sslmode", "require");
    }
    return url.toString();
}
function resolveDatabasePoolConfig() {
    var _a;
    const sslMode = readConfiguredSslMode();
    const ssl = mapSslModeToPoolSsl(sslMode);
    const databaseUrl = (_a = process.env.DATABASE_URL) === null || _a === void 0 ? void 0 : _a.trim();
    if (databaseUrl) {
        return Object.assign({ connectionString: databaseUrl }, (ssl !== undefined ? { ssl } : {}));
    }
    return Object.assign({ user: readRequiredEnv("PG_USER"), host: readRequiredEnv("PG_HOST"), database: readRequiredEnv("PG_DB"), password: readRequiredEnv("PG_PW"), port: readPort() }, (ssl !== undefined ? { ssl } : {}));
}
