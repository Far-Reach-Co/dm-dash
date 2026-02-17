import { createHash } from "crypto";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";
import { promisify } from "util";
import { execFile } from "child_process";
import { S3, config } from "aws-sdk";
import db, { pool } from "../src/api/dbconfig";
import { addImageQuery } from "../src/api/queries/images";

const execFileAsync = promisify(execFile);

const DEFAULT_SOURCE_URL =
  "https://wyrld.s3.us-east-1.amazonaws.com/free-images/FreeTokens_v4.zip";

const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".avif",
]);

type Args = {
  source: string;
  bucket: string;
  folder: string;
  envFile?: string;
  dryRun: boolean;
};

function argValue(flag: string) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

function usage() {
  console.log(
    [
      "Usage:",
      "  dotenv -e .env -- npx tsx tools/import-guest-sandbox-images.ts [options]",
      "",
      "Options:",
      "  --source <url-or-zip-path>   Source ZIP (default: FreeTokens_v4.zip URL)",
      "  --bucket <name>              Bucket base name (default: wyrld)",
      "  --folder <name>              Folder segment for bucket path (default: images)",
      "  --env-file <path>            Update/append GUEST_SANDBOX_IMAGE_IDS in env file",
      "  --dry-run                    Do not upload/create rows; only print planned IDs",
      "  --help                       Show this help text",
    ].join("\n"),
  );
}

function parseArgs(): Args {
  if (hasFlag("--help")) {
    usage();
    process.exit(0);
  }
  return {
    source: argValue("--source") || DEFAULT_SOURCE_URL,
    bucket: argValue("--bucket") || process.env.GUEST_SANDBOX_BUCKET || "wyrld",
    folder: argValue("--folder") || process.env.GUEST_SANDBOX_FOLDER || "images",
    envFile: argValue("--env-file"),
    dryRun: hasFlag("--dry-run"),
  };
}

function isUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

async function downloadToFile(url: string, targetPath: string) {
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download ZIP: ${url} (status ${res.status})`);
  }
  const arrayBuffer = await res.arrayBuffer();
  await fs.writeFile(targetPath, Buffer.from(arrayBuffer));
}

async function copySourceToFile(source: string, targetPath: string) {
  if (isUrl(source)) {
    await downloadToFile(source, targetPath);
    return;
  }
  await fs.copyFile(source, targetPath);
}

async function unzip(zipPath: string, outDir: string) {
  await execFileAsync("unzip", ["-q", "-o", zipPath, "-d", outDir]);
}

async function walkFiles(dir: string, acc: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(fullPath, acc);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (IMAGE_EXTENSIONS.has(ext)) acc.push(fullPath);
  }
  return acc;
}

function deterministicKeyFromBuffer(buffer: Buffer, ext: string) {
  const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 24);
  return `guest-token-${hash}${ext.toLowerCase()}`;
}

async function findImageByFileName(fileName: string) {
  const query = {
    text: 'select id, file_name from public."Image" where file_name = $1 and is_blocked = false order by id asc limit 1',
    values: [fileName],
  };
  const { rows } = await db.query<{ id: number; file_name: string }>(query);
  return rows[0] || null;
}

async function updateEnvFile(envFile: string, idsLine: string) {
  let content = "";
  try {
    content = await fs.readFile(envFile, "utf8");
  } catch {
    content = "";
  }
  if (/^GUEST_SANDBOX_IMAGE_IDS=/m.test(content)) {
    content = content.replace(/^GUEST_SANDBOX_IMAGE_IDS=.*$/m, idsLine);
  } else {
    content = content.trimEnd();
    content += `${content.length ? "\n" : ""}${idsLine}\n`;
  }
  await fs.writeFile(envFile, content, "utf8");
}

async function run() {
  const args = parseArgs();

  config.update({
    signatureVersion: "v4",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1",
  });
  const s3 = new S3();
  const bucketPath = `${args.bucket}/${args.folder}`;

  const tempRoot = await fs.mkdtemp(path.join(tmpdir(), "guest-sandbox-"));
  const zipPath = path.join(tempRoot, "source.zip");
  const extractedDir = path.join(tempRoot, "unzipped");
  await fs.mkdir(extractedDir, { recursive: true });

  const createdIds: number[] = [];
  let createdCount = 0;
  let reusedCount = 0;

  try {
    console.log(`Source: ${args.source}`);
    console.log(`Bucket path: ${bucketPath}`);
    await copySourceToFile(args.source, zipPath);
    await unzip(zipPath, extractedDir);

    const files = (await walkFiles(extractedDir)).sort((a, b) =>
      a.localeCompare(b),
    );
    if (!files.length) {
      throw new Error("No image files found in ZIP");
    }

    for (const filePath of files) {
      const ext = path.extname(filePath).toLowerCase();
      const originalName = path.basename(filePath);
      const buffer = await fs.readFile(filePath);
      const key = deterministicKeyFromBuffer(buffer, ext);

      const existing = await findImageByFileName(key);
      if (existing) {
        createdIds.push(existing.id);
        reusedCount += 1;
        continue;
      }

      if (args.dryRun) {
        console.log(`[dry-run] would upload/create: ${originalName} -> ${key}`);
        continue;
      }

      await s3
        .upload({
          Bucket: bucketPath,
          Key: key,
          Body: buffer,
        })
        .promise();

      const inserted = await addImageQuery({
        original_name: originalName,
        size: buffer.byteLength,
        file_name: key,
      });
      const image = inserted.rows[0];
      createdIds.push(image.id);
      createdCount += 1;
    }

    const uniqueIds = Array.from(new Set(createdIds));
    const idsLine = `GUEST_SANDBOX_IMAGE_IDS=${uniqueIds.join(",")}`;

    console.log("");
    console.log(`Processed images: ${files.length}`);
    console.log(`Reused existing: ${reusedCount}`);
    console.log(`Created new: ${createdCount}`);
    console.log(idsLine);

    if (args.envFile && !args.dryRun) {
      await updateEnvFile(args.envFile, idsLine);
      console.log(`Updated ${args.envFile}`);
    }
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
    await pool.end();
  }
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
