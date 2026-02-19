import type { PoolConfig } from "pg";

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

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

function readOptionalBoolean(name: string): boolean | undefined {
  const value = process.env[name];
  if (value === undefined) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  if (TRUE_VALUES.has(normalized)) return true;
  if (FALSE_VALUES.has(normalized)) return false;
  throw new Error(`${name} must be a boolean value (true/false)`);
}

function readPort(): number {
  const rawPort = process.env.PG_PORT?.trim() || "5432";
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error("PG_PORT must be a positive integer");
  }
  return port;
}

function readConfiguredSslMode(): string | undefined {
  const explicitMode =
    process.env.PGSSLMODE?.trim() || process.env.PG_SSL_MODE?.trim();
  if (explicitMode) {
    const normalized = explicitMode.toLowerCase();
    if (!VALID_SSL_MODES.has(normalized)) {
      throw new Error(
        "PGSSLMODE/PG_SSL_MODE must be one of: disable, allow, prefer, require, verify-ca, verify-full, no-verify",
      );
    }
    return normalized;
  }

  const sslEnabled = readOptionalBoolean("PG_SSL");
  if (sslEnabled === false) return "disable";
  if (sslEnabled === true) {
    const rejectUnauthorized =
      readOptionalBoolean("PG_SSL_REJECT_UNAUTHORIZED") ?? false;
    return rejectUnauthorized ? "verify-full" : "require";
  }

  return undefined;
}

function mapSslModeToPoolSsl(
  sslMode: string | undefined,
): PoolConfig["ssl"] | undefined {
  if (!sslMode) return undefined;
  if (sslMode === "disable") return false;
  if (sslMode === "verify-ca" || sslMode === "verify-full") {
    return { rejectUnauthorized: true };
  }
  return { rejectUnauthorized: false };
}

function mapSslModeToLibpqMode(sslMode: string | undefined): string | undefined {
  if (!sslMode) return undefined;
  if (sslMode === "no-verify") return "require";
  return sslMode;
}

function buildDatabaseUrlFromPgEnv(): string {
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

export function resolveDatabaseUrl(): string {
  const directDatabaseUrl = process.env.DATABASE_URL?.trim();
  if (directDatabaseUrl) return directDatabaseUrl;
  return buildDatabaseUrlFromPgEnv();
}

export function resolveDatabaseUrlForLibpq(): string {
  const url = new URL(resolveDatabaseUrl());
  const sslMode = url.searchParams.get("sslmode");
  if (sslMode && sslMode.toLowerCase() === "no-verify") {
    url.searchParams.set("sslmode", "require");
  }
  return url.toString();
}

export function resolveDatabasePoolConfig(): PoolConfig {
  const sslMode = readConfiguredSslMode();
  const ssl = mapSslModeToPoolSsl(sslMode);
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    return {
      connectionString: databaseUrl,
      ...(ssl !== undefined ? { ssl } : {}),
    };
  }

  return {
    user: readRequiredEnv("PG_USER"),
    host: readRequiredEnv("PG_HOST"),
    database: readRequiredEnv("PG_DB"),
    password: readRequiredEnv("PG_PW"),
    port: readPort(),
    ...(ssl !== undefined ? { ssl } : {}),
  };
}
