import dotenv from "dotenv";
import { spawn } from "child_process";
import { createReadStream, createWriteStream } from "fs";
import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import mail from "../../api/smtp";
import logger from "../logger";
import { resolveDatabaseUrlForLibpq } from "../dbConnection";

dotenv.config();

type BucketConfig = {
  bucket: string;
  prefix: string;
};

type BackupResult = {
  mode: BackupMode;
  filename: string;
  localPath: string;
  s3Key: string;
  location: string;
  warnings: string;
  startedAt: Date;
  finishedAt: Date;
};

type BackupMode = "data-only" | "full";

const DEFAULT_COMPANY_EMAIL = "farreachco@gmail.com";
const DEFAULT_BUCKET_PATH = "wyrld/pg_backups";
const DEFAULT_INTERVAL_MS = 24 * 60 * 60 * 1000;
const MIN_BACKUP_FILE_SIZE_BYTES = 50;
const DEFAULT_BACKUP_MODE: BackupMode = "data-only";

const backupIntervalMs = Number(process.env.DB_BACKUP_INTERVAL_MS || DEFAULT_INTERVAL_MS);
const companyAlertEmail = process.env.DB_BACKUP_ALERT_EMAIL || DEFAULT_COMPANY_EMAIL;
const databaseUrl = resolveDatabaseUrlForLibpq();

const bucketConfig = resolveBucketConfig(
  process.env.DB_BACKUP_S3_BUCKET || DEFAULT_BUCKET_PATH,
  process.env.DB_BACKUP_S3_PREFIX || "",
);

const awsRegion = process.env.AWS_REGION || "us-east-1";
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const s3 = new S3Client({
  region: awsRegion,
  ...(awsAccessKeyId && awsSecretAccessKey
    ? {
        credentials: {
          accessKeyId: awsAccessKeyId,
          secretAccessKey: awsSecretAccessKey,
        },
      }
    : {}),
});

function resolveBucketConfig(rawBucket: string, rawPrefix: string): BucketConfig {
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

function formatDateForFilename(date: Date): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

function getS3Key(filename: string): string {
  if (!bucketConfig.prefix) return filename;
  return `${bucketConfig.prefix}/${filename}`;
}

function resolveBackupMode(args = process.argv.slice(2)): BackupMode {
  const inlineModeArg = args.find((arg) => arg.startsWith("--mode="));
  const modeFromInlineArg = inlineModeArg?.split("=")[1];
  const modeFlagIndex = args.findIndex((arg) => arg === "--mode");
  const modeFromPairArg =
    modeFlagIndex >= 0 && args[modeFlagIndex + 1] ? args[modeFlagIndex + 1] : undefined;
  const modeFromFlag = args.includes("--full")
    ? "full"
    : args.includes("--data-only")
      ? "data-only"
      : undefined;

  const candidate = (
    modeFromFlag ||
    modeFromInlineArg ||
    modeFromPairArg ||
    process.env.DB_BACKUP_MODE ||
    DEFAULT_BACKUP_MODE
  )
    .toLowerCase()
    .trim();

  if (candidate === "full" || candidate === "data-only") return candidate;
  throw new Error('Backup mode must be "data-only" or "full"');
}

function assertConfig(): void {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL or PG_* database variables are required for database backups");
  }

  if (!Number.isFinite(backupIntervalMs) || backupIntervalMs <= 0) {
    throw new Error("DB_BACKUP_INTERVAL_MS must be a positive number");
  }
}

function runPgDump(outputPath: string, mode: BackupMode): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = ["--no-acl"];
    if (mode === "data-only") {
      args.push("--data-only");
    }
    args.push(databaseUrl as string);
    const child = spawn("pg_dump", args, { stdio: ["ignore", "pipe", "pipe"] });
    const outputStream = createWriteStream(outputPath, { flags: "w" });
    let stderrOutput = "";
    let settled = false;

    const fail = (err: unknown) => {
      if (settled) return;
      settled = true;
      if (!child.killed) child.kill("SIGTERM");
      outputStream.destroy();
      reject(err);
    };

    child.stdout.pipe(outputStream);
    child.stderr.on("data", (chunk: Buffer | string) => {
      stderrOutput += chunk.toString();
    });

    child.on("error", (err) => {
      fail(err);
    });

    outputStream.on("error", (err) => {
      fail(err);
    });

    const closePromise = new Promise<number | null>((res) => {
      child.on("close", (code) => res(code));
    });

    const finishPromise = new Promise<void>((res, rej) => {
      outputStream.on("finish", () => res());
      outputStream.on("error", (err) => rej(err));
    });

    Promise.all([closePromise, finishPromise])
      .then(([code]) => {
        if (code !== 0) {
          fail(new Error(`pg_dump exited with code ${code}. stderr: ${stderrOutput || "none"}`));
          return;
        }
        if (settled) return;
        settled = true;
        resolve(stderrOutput.trim());
      })
      .catch((err) => {
        fail(err);
      });
  });
}

async function ensureBackupFileLooksValid(filePath: string): Promise<void> {
  const stats = await fs.stat(filePath);
  if (stats.size < MIN_BACKUP_FILE_SIZE_BYTES) {
    throw new Error(
      `Backup file is unexpectedly small (${stats.size} bytes). Expected at least ${MIN_BACKUP_FILE_SIZE_BYTES} bytes.`,
    );
  }
}

async function uploadBackupToS3(localPath: string, s3Key: string): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketConfig.bucket,
      Key: s3Key,
      Body: createReadStream(localPath),
      ContentType: "application/sql",
    }),
  );

  return `https://${bucketConfig.bucket}.s3.${awsRegion}.amazonaws.com/${s3Key}`;
}

async function sendSevereIssueEmail(params: {
  startedAt: Date;
  failedAt: Date;
  err: unknown;
  context?: string;
}): Promise<void> {
  const { startedAt, failedAt, err, context } = params;
  const errMessage = err instanceof Error ? `${err.message}\n${err.stack || ""}` : String(err);
  const host = process.env.HOSTNAME || "unknown-host";

  await mail.sendMessage({
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
}

async function runSingleBackup(mode: BackupMode): Promise<BackupResult> {
  assertConfig();

  const startedAt = new Date();
  const modeTag = mode === "full" ? "full" : "data";
  const filename = `backup-${modeTag}-${formatDateForFilename(startedAt)}.sql`;
  const localPath = join(tmpdir(), filename);
  const s3Key = getS3Key(filename);

  try {
    const warnings = await runPgDump(localPath, mode);
    await ensureBackupFileLooksValid(localPath);
    const location = await uploadBackupToS3(localPath, s3Key);

    const finishedAt = new Date();
    return {
      mode,
      filename,
      localPath,
      s3Key,
      location,
      warnings,
      startedAt,
      finishedAt,
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    (error as Error & { localPath?: string; startedAt?: Date }).localPath = localPath;
    (error as Error & { localPath?: string; startedAt?: Date }).startedAt = startedAt;
    throw error;
  }
}

async function executeBackupRun(mode: BackupMode): Promise<boolean> {
  let localPathForCleanup: string | undefined;
  let startedAt = new Date();

  try {
    logger.info(
      {
        intervalMs: backupIntervalMs,
        mode,
        bucket: bucketConfig.bucket,
        prefix: bucketConfig.prefix || "(none)",
      },
      "Starting database backup run",
    );

    const result = await runSingleBackup(mode);
    localPathForCleanup = result.localPath;
    startedAt = result.startedAt;

    logger.info(
      {
        filename: result.filename,
        mode: result.mode,
        s3Key: result.s3Key,
        location: result.location,
        durationMs: result.finishedAt.getTime() - result.startedAt.getTime(),
        warnings: result.warnings || undefined,
      },
      "Database backup completed",
    );
    return true;
  } catch (err) {
    logger.error({ err }, "Database backup failed");
    const detailedError = err as Error & { localPath?: string; startedAt?: Date };
    if (detailedError.startedAt) startedAt = detailedError.startedAt;
    localPathForCleanup = detailedError.localPath || localPathForCleanup;
    const failedAt = new Date();

    try {
      await sendSevereIssueEmail({
        startedAt,
        failedAt,
        err,
        context: `Mode: ${mode}; S3 bucket: ${bucketConfig.bucket}, prefix: ${bucketConfig.prefix || "(none)"}`,
      });
    } catch (emailErr) {
      logger.error({ err: emailErr }, "Failed to send severe backup failure email");
    }
    return false;
  } finally {
    if (localPathForCleanup) {
      try {
        await fs.unlink(localPathForCleanup);
      } catch (cleanupErr) {
        logger.warn(
          { err: cleanupErr, localPath: localPathForCleanup },
          "Failed to clean up local backup file",
        );
      }
    }
  }
}

function startDbBackupScheduler(): void {
  const mode = resolveBackupMode();
  let inFlight = false;

  const runAndHandle = async () => {
    if (inFlight) {
      logger.warn("Skipping backup run because a previous run is still in progress");
      return;
    }

    inFlight = true;
    try {
      await executeBackupRun(mode);
    } finally {
      inFlight = false;
    }
  };

  runAndHandle().catch((err) => {
    logger.error({ err }, "Unexpected backup runner error");
  });

  setInterval(() => {
    runAndHandle().catch((err) => {
      logger.error({ err }, "Unexpected backup runner error");
    });
  }, backupIntervalMs);
}

if (require.main === module) {
  const runOnce = process.argv.includes("--once");
  const mode = resolveBackupMode();
  if (runOnce) {
    executeBackupRun(mode)
      .then((ok) => {
        process.exit(ok ? 0 : 1);
      })
      .catch((err) => {
        logger.error({ err }, "Unexpected backup runner error");
        process.exit(1);
      });
  } else {
    startDbBackupScheduler();
  }
}

export default startDbBackupScheduler;
