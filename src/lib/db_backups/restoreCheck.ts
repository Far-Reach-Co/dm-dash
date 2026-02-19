import dotenv from "dotenv";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";
import { tmpdir } from "os";
import logger from "../logger";
import { resolveDatabaseUrlForLibpq } from "../dbConnection";

dotenv.config();

type CommandResult = {
  stdout: string;
  stderr: string;
};

function runCommand(command: string, args: string[]): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `${command} exited with code ${code}. stderr: ${stderr.trim() || "none"}`,
          ),
        );
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

function buildAdminDatabaseUrl(databaseUrl: string): string {
  const url = new URL(databaseUrl);
  url.pathname = "/postgres";
  return url.toString();
}

function buildDatabaseUrlWithDatabaseName(
  databaseUrl: string,
  databaseName: string,
): string {
  const url = new URL(databaseUrl);
  url.pathname = `/${databaseName}`;
  return url.toString();
}

function createTemporaryDatabaseName(): string {
  const timestamp = Date.now().toString(36);
  const suffix = randomBytes(4).toString("hex");
  return `restore_check_${timestamp}_${suffix}`;
}

async function runRestoreCheck(): Promise<void> {
  const sourceDatabaseUrl = resolveDatabaseUrlForLibpq();
  const adminDatabaseUrl = buildAdminDatabaseUrl(sourceDatabaseUrl);
  const tempDatabaseName = createTemporaryDatabaseName();
  const restoreDatabaseUrl = buildDatabaseUrlWithDatabaseName(
    sourceDatabaseUrl,
    tempDatabaseName,
  );
  const dumpFilePath = join(
    tmpdir(),
    `restore-check-full-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`,
  );

  logger.info(
    { dumpFilePath, tempDatabaseName },
    "Starting restore check with a full database dump",
  );

  try {
    await runCommand("pg_dump", [
      "--no-acl",
      "--file",
      dumpFilePath,
      sourceDatabaseUrl,
    ]);

    const stats = await fs.stat(dumpFilePath);
    if (stats.size <= 0) {
      throw new Error("Full dump file is empty");
    }

    await runCommand("psql", [
      adminDatabaseUrl,
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      `CREATE DATABASE "${tempDatabaseName}"`,
    ]);

    await runCommand("psql", [
      restoreDatabaseUrl,
      "-v",
      "ON_ERROR_STOP=1",
      "-f",
      dumpFilePath,
    ]);

    const tableCountResult = await runCommand("psql", [
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

    logger.info(
      { tempDatabaseName, tableCount, dumpFilePath },
      "Restore check completed successfully",
    );
  } finally {
    try {
      await runCommand("psql", [
        adminDatabaseUrl,
        "-v",
        "ON_ERROR_STOP=1",
        "-c",
        `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${tempDatabaseName}' AND pid <> pg_backend_pid();`,
      ]);
      await runCommand("psql", [
        adminDatabaseUrl,
        "-v",
        "ON_ERROR_STOP=1",
        "-c",
        `DROP DATABASE IF EXISTS "${tempDatabaseName}"`,
      ]);
    } catch (cleanupErr) {
      logger.warn(
        { err: cleanupErr, tempDatabaseName },
        "Failed to drop temporary restore-check database",
      );
    }

    try {
      await fs.unlink(dumpFilePath);
    } catch (cleanupErr) {
      logger.warn(
        { err: cleanupErr, dumpFilePath },
        "Failed to delete restore-check dump file",
      );
    }
  }
}

if (require.main === module) {
  runRestoreCheck()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      logger.error({ err }, "Restore check failed");
      process.exit(1);
    });
}
