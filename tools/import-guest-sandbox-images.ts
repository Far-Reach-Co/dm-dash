import { createHash } from "crypto";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";
import { inflateRawSync } from "zlib";
import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import db, { pool } from "../src/api/dbconfig";
import { addImageQuery } from "../src/api/queries/images";

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

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

type Args = {
  source: string;
  bucket: string;
  folder: string;
  envFile?: string;
  dryRun: boolean;
};

type SourceImageEntry = {
  filePath: string;
  key: string;
  ext: string;
  originalName: string;
  contentType: string;
};

type GuestTokenImageRow = {
  id: number;
  file_name: string;
  original_name: string;
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
      "  npm run guest-sandbox:import-images -- [options]",
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

type ZipEntry = {
  fileName: string;
  compressedSize: number;
  uncompressedSize: number;
  compressionMethod: number;
  localHeaderOffset: number;
  isDirectory: boolean;
};

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_DIR_SIGNATURE = 0x02014b50;
const LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const MAX_EOCD_SEARCH = 0xffff + 22; // 64k comment + EOCD fixed fields

function decodeZipFileName(bytes: Buffer, useUtf8: boolean) {
  return bytes.toString(useUtf8 ? "utf8" : "latin1");
}

function findEocdOffset(zipBuffer: Buffer) {
  const minOffset = Math.max(0, zipBuffer.length - MAX_EOCD_SEARCH);
  for (let i = zipBuffer.length - 22; i >= minOffset; i -= 1) {
    if (zipBuffer.readUInt32LE(i) === EOCD_SIGNATURE) {
      return i;
    }
  }
  return -1;
}

function parseCentralDirectory(zipBuffer: Buffer): ZipEntry[] {
  const eocdOffset = findEocdOffset(zipBuffer);
  if (eocdOffset < 0) {
    throw new Error("Invalid ZIP: end-of-central-directory not found");
  }

  const totalEntries = zipBuffer.readUInt16LE(eocdOffset + 10);
  const centralDirSize = zipBuffer.readUInt32LE(eocdOffset + 12);
  const centralDirOffset = zipBuffer.readUInt32LE(eocdOffset + 16);
  if (centralDirOffset + centralDirSize > zipBuffer.length) {
    throw new Error("Invalid ZIP: central directory out of bounds");
  }

  const entries: ZipEntry[] = [];
  let offset = centralDirOffset;
  for (let i = 0; i < totalEntries; i += 1) {
    if (offset + 46 > zipBuffer.length) {
      throw new Error("Invalid ZIP: truncated central directory header");
    }
    if (zipBuffer.readUInt32LE(offset) !== CENTRAL_DIR_SIGNATURE) {
      throw new Error("Invalid ZIP: central directory signature mismatch");
    }

    const generalPurposeBitFlag = zipBuffer.readUInt16LE(offset + 8);
    const compressionMethod = zipBuffer.readUInt16LE(offset + 10);
    const compressedSize = zipBuffer.readUInt32LE(offset + 20);
    const uncompressedSize = zipBuffer.readUInt32LE(offset + 24);
    const fileNameLength = zipBuffer.readUInt16LE(offset + 28);
    const extraFieldLength = zipBuffer.readUInt16LE(offset + 30);
    const fileCommentLength = zipBuffer.readUInt16LE(offset + 32);
    const localHeaderOffset = zipBuffer.readUInt32LE(offset + 42);

    const fileNameStart = offset + 46;
    const fileNameEnd = fileNameStart + fileNameLength;
    if (fileNameEnd > zipBuffer.length) {
      throw new Error("Invalid ZIP: central directory filename out of bounds");
    }

    const useUtf8 = (generalPurposeBitFlag & (1 << 11)) !== 0;
    const fileName = decodeZipFileName(
      zipBuffer.subarray(fileNameStart, fileNameEnd),
      useUtf8,
    );

    entries.push({
      fileName,
      compressedSize,
      uncompressedSize,
      compressionMethod,
      localHeaderOffset,
      isDirectory: fileName.endsWith("/"),
    });

    offset = fileNameEnd + extraFieldLength + fileCommentLength;
  }

  return entries;
}

function resolveSafeOutputPath(baseDir: string, zipFileName: string) {
  const normalized = zipFileName.replace(/\\/g, "/");
  const targetPath = path.resolve(baseDir, normalized);
  const resolvedBase = path.resolve(baseDir);
  const relative = path.relative(resolvedBase, targetPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Unsafe ZIP path detected: ${zipFileName}`);
  }
  return targetPath;
}

function extractZipEntryBuffer(zipBuffer: Buffer, entry: ZipEntry) {
  const headerOffset = entry.localHeaderOffset;
  if (headerOffset + 30 > zipBuffer.length) {
    throw new Error(`Invalid ZIP: local header out of bounds (${entry.fileName})`);
  }
  if (zipBuffer.readUInt32LE(headerOffset) !== LOCAL_FILE_HEADER_SIGNATURE) {
    throw new Error(
      `Invalid ZIP: local header signature mismatch (${entry.fileName})`,
    );
  }

  const fileNameLength = zipBuffer.readUInt16LE(headerOffset + 26);
  const extraFieldLength = zipBuffer.readUInt16LE(headerOffset + 28);
  const compressedStart = headerOffset + 30 + fileNameLength + extraFieldLength;
  const compressedEnd = compressedStart + entry.compressedSize;
  if (compressedEnd > zipBuffer.length) {
    throw new Error(`Invalid ZIP: compressed data out of bounds (${entry.fileName})`);
  }

  const compressedData = zipBuffer.subarray(compressedStart, compressedEnd);
  let data: Buffer;
  if (entry.compressionMethod === 0) {
    data = Buffer.from(compressedData);
  } else if (entry.compressionMethod === 8) {
    data = inflateRawSync(compressedData);
  } else {
    throw new Error(
      `Unsupported ZIP compression method ${entry.compressionMethod} (${entry.fileName})`,
    );
  }

  if (data.length !== entry.uncompressedSize) {
    throw new Error(`ZIP size mismatch while extracting ${entry.fileName}`);
  }

  return data;
}

async function unzip(zipPath: string, outDir: string) {
  const zipBuffer = await fs.readFile(zipPath);
  const entries = parseCentralDirectory(zipBuffer);
  for (const entry of entries) {
    const outputPath = resolveSafeOutputPath(outDir, entry.fileName);
    if (entry.isDirectory) {
      await fs.mkdir(outputPath, { recursive: true });
      continue;
    }

    const fileBuffer = extractZipEntryBuffer(zipBuffer, entry);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, fileBuffer);
  }
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
    const baseName = entry.name.toLowerCase();
    const isIgnoredFile = baseName.startsWith("._") || baseName === ".ds_store";
    if (IMAGE_EXTENSIONS.has(ext) && !isIgnoredFile) acc.push(fullPath);
  }
  return acc;
}

function deterministicKeyFromBuffer(buffer: Buffer, ext: string) {
  const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 24);
  return `guest-token-${hash}${ext.toLowerCase()}`;
}

function normalizeBucketAndKey(
  rawBucket: string,
  rawFolder: string,
  key: string,
) {
  const bucketValue = rawBucket.trim().replace(/^\/+|\/+$/g, "");
  const folder = rawFolder.trim().replace(/^\/+|\/+$/g, "");
  if (!bucketValue) throw new Error("Missing --bucket");

  const slashIndex = bucketValue.indexOf("/");
  const bucket =
    slashIndex === -1 ? bucketValue : bucketValue.slice(0, slashIndex).trim();
  const bucketPrefix =
    slashIndex === -1
      ? ""
      : bucketValue
          .slice(slashIndex + 1)
          .trim()
          .replace(/^\/+|\/+$/g, "");
  if (!bucket) throw new Error("Invalid --bucket value");
  const prefix = [bucketPrefix, folder].filter(Boolean).join("/");
  const normalizedKey = key.trim().replace(/^\/+|\/+$/g, "");

  return {
    bucket,
    key: prefix && normalizedKey ? `${prefix}/${normalizedKey}` : prefix || normalizedKey,
  };
}

async function findImageByFileName(fileName: string) {
  const query = {
    text: 'select id, file_name from public."Image" where file_name = $1 and is_blocked = false order by id asc limit 1',
    values: [fileName],
  };
  const { rows } = await db.query<{ id: number; file_name: string }>(query);
  return rows[0] || null;
}

async function listGuestTokenImages() {
  const query = {
    text: 'select id, file_name, original_name from public."Image" where file_name like $1 and is_blocked = false order by id asc',
    values: ["guest-token-%"],
  };
  const { rows } = await db.query<GuestTokenImageRow>(query);
  return rows;
}

async function updateImageOriginalName(imageId: number, originalName: string) {
  await db.query({
    text: 'update public."Image" set original_name = $1 where id = $2',
    values: [originalName, imageId],
  });
}

function normalizeOriginalName(value: string) {
  return path.basename(String(value || "")).trim().toLowerCase();
}

function isAppleDoubleOriginalName(value: string) {
  return normalizeOriginalName(value).startsWith("._");
}

function originalNameCandidates(value: string) {
  const normalized = normalizeOriginalName(value);
  if (!normalized) return [];

  const candidates = new Set<string>([normalized]);
  if (normalized.startsWith("._")) {
    candidates.add(normalized.slice(2));
    candidates.add(normalized.slice(1));
  } else if (normalized.startsWith(".")) {
    candidates.add(normalized.slice(1));
  }

  return Array.from(candidates).filter(Boolean);
}

function pickSourceForGuestTokenRow(
  row: GuestTokenImageRow,
  sourceByKey: Map<string, SourceImageEntry>,
  sourceByOriginalName: Map<string, SourceImageEntry[]>,
) {
  const byKey = sourceByKey.get(row.file_name);
  if (byKey) return byKey;

  const names = originalNameCandidates(row.original_name);
  if (!names.length) return null;

  for (const name of names) {
    const candidates = sourceByOriginalName.get(name) || [];
    if (!candidates.length) continue;
    if (candidates.length === 1) return candidates[0];

    const fileExt = path.extname(row.file_name).toLowerCase();
    const extMatch =
      candidates.find((candidate) => candidate.ext === fileExt) || candidates[0];
    if (extMatch) return extMatch;
  }

  return null;
}

function getContentTypeForExt(ext: string) {
  return CONTENT_TYPE_BY_EXT[ext.toLowerCase()] || "application/octet-stream";
}

async function objectExistsInS3(
  s3: S3Client,
  bucket: string,
  key: string,
) {
  try {
    const response = await s3.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    return response;
  } catch (err) {
    const s3Err = err as {
      name?: string;
      code?: string;
      Code?: string;
      $metadata?: { httpStatusCode?: number };
    };
    if (
      s3Err?.$metadata?.httpStatusCode === 404 ||
      s3Err?.name === "NotFound" ||
      s3Err?.code === "NotFound" ||
      s3Err?.Code === "NotFound"
    ) {
      return null;
    }
    throw err;
  }
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
  const previewTarget = normalizeBucketAndKey(args.bucket, args.folder, "");
  const bucketPath = previewTarget.key
    ? `${previewTarget.bucket}/${previewTarget.key}`
    : previewTarget.bucket;

  const tempRoot = await fs.mkdtemp(path.join(tmpdir(), "guest-sandbox-"));
  const zipPath = path.join(tempRoot, "source.zip");
  const extractedDir = path.join(tempRoot, "unzipped");
  await fs.mkdir(extractedDir, { recursive: true });

  const createdIds: number[] = [];
  let createdCount = 0;
  let reusedCount = 0;
  let repairedCount = 0;
  let unresolvedRepairCount = 0;

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

    const sourceEntries: SourceImageEntry[] = [];
    const sourceByKey = new Map<string, SourceImageEntry>();
    const sourceByOriginalName = new Map<string, SourceImageEntry[]>();

    for (const filePath of files) {
      const ext = path.extname(filePath).toLowerCase();
      const originalName = path.basename(filePath);
      const buffer = await fs.readFile(filePath);
      const key = deterministicKeyFromBuffer(buffer, ext);
      const contentType = getContentTypeForExt(ext);
      const sourceEntry: SourceImageEntry = {
        filePath,
        key,
        ext,
        originalName,
        contentType,
      };
      sourceEntries.push(sourceEntry);
      sourceByKey.set(key, sourceEntry);
      const normalizedOriginal = normalizeOriginalName(originalName);
      const sourceByNameList = sourceByOriginalName.get(normalizedOriginal) || [];
      sourceByNameList.push(sourceEntry);
      sourceByOriginalName.set(normalizedOriginal, sourceByNameList);
    }

    for (const sourceEntry of sourceEntries) {
      const { filePath, key, contentType, originalName } = sourceEntry;
      const buffer = await fs.readFile(filePath);
      const s3Target = normalizeBucketAndKey(args.bucket, args.folder, key);

      const existing = await findImageByFileName(key);
      if (existing) {
        createdIds.push(existing.id);
        reusedCount += 1;

        const headObject = await objectExistsInS3(
          s3,
          s3Target.bucket,
          s3Target.key,
        );
        const hasImageContentType = String(headObject?.ContentType || "")
          .toLowerCase()
          .startsWith("image/");
        const needsRepair = !headObject || !hasImageContentType;
        if (needsRepair) {
          if (args.dryRun) {
            console.log(
              `[dry-run] would repair existing DB row object: ${existing.id} -> ${key}`,
            );
          } else {
            await s3.send(
              new PutObjectCommand({
                Bucket: s3Target.bucket,
                Key: s3Target.key,
                Body: buffer,
                ContentType: contentType,
              }),
            );
            repairedCount += 1;
          }
        }
        continue;
      }

      if (args.dryRun) {
        console.log(`[dry-run] would upload/create: ${originalName} -> ${key}`);
        continue;
      }

      await s3.send(
        new PutObjectCommand({
          Bucket: s3Target.bucket,
          Key: s3Target.key,
          Body: buffer,
          ContentType: contentType,
        }),
      );

      const inserted = await addImageQuery({
        original_name: originalName,
        size: buffer.byteLength,
        file_name: key,
      });
      const image = inserted.rows[0];
      createdIds.push(image.id);
      createdCount += 1;
    }

    const guestTokenRows = await listGuestTokenImages();
    for (const row of guestTokenRows) {
      const s3Target = normalizeBucketAndKey(args.bucket, args.folder, row.file_name);
      const headObject = await objectExistsInS3(s3, s3Target.bucket, s3Target.key);
      const hasImageContentType = String(headObject?.ContentType || "")
        .toLowerCase()
        .startsWith("image/");
      const needsRepair =
        !headObject || !hasImageContentType || isAppleDoubleOriginalName(row.original_name);
      if (!needsRepair) continue;

      const sourceEntry = pickSourceForGuestTokenRow(
        row,
        sourceByKey,
        sourceByOriginalName,
      );
      if (!sourceEntry) {
        unresolvedRepairCount += 1;
        console.warn(
          `[warn] missing object without source match: image_id=${row.id} file_name=${row.file_name} original_name=${row.original_name}`,
        );
        continue;
      }

      if (args.dryRun) {
        console.log(
          `[dry-run] would repair DB row object: ${row.id} -> ${row.file_name} (source: ${sourceEntry.originalName})`,
        );
        continue;
      }

      const buffer = await fs.readFile(sourceEntry.filePath);
      const fileExt = path.extname(row.file_name).toLowerCase();
      await s3.send(
        new PutObjectCommand({
          Bucket: s3Target.bucket,
          Key: s3Target.key,
          Body: buffer,
          ContentType: getContentTypeForExt(fileExt) || sourceEntry.contentType,
        }),
      );
      if (
        isAppleDoubleOriginalName(row.original_name) &&
        sourceEntry.originalName !== row.original_name
      ) {
        await updateImageOriginalName(row.id, sourceEntry.originalName);
      }
      repairedCount += 1;
    }

    const uniqueIds = Array.from(new Set(createdIds));
    const idsLine = `GUEST_SANDBOX_IMAGE_IDS=${uniqueIds.join(",")}`;

    console.log("");
    console.log(`Processed images: ${files.length}`);
    console.log(`Reused existing: ${reusedCount}`);
    console.log(`Repaired missing objects: ${repairedCount}`);
    console.log(`Unresolved missing objects: ${unresolvedRepairCount}`);
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
