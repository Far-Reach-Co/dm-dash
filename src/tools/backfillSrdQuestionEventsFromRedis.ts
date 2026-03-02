import { createClient } from "redis";
import { pool } from "../api/dbconfig";
import { createSrdQuestionEvent } from "../api/queries/srdQuestionEvents";
import { getRedisUrl } from "../lib/redisConfig";
import logger from "../lib/logger";

const SRD_CACHE_PREFIX = "srd-search:";
const SRD_CACHE_SHORT_PREFIX = "srd-search:short:";

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function parseNumberFlag(flag: string, fallback: number, min: number, max: number): number {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  const raw = process.argv[idx + 1];
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(parsed)));
}

function parseStringFlag(flag: string, fallback: string): string {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  const raw = process.argv[idx + 1];
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  return trimmed.length ? trimmed : fallback;
}

function extractQueryFromKey(key: string): { queryText: string; isShort: boolean } | null {
  if (key.startsWith(SRD_CACHE_SHORT_PREFIX)) {
    const queryText = key.slice(SRD_CACHE_SHORT_PREFIX.length).trim();
    if (!queryText.length) return null;
    return { queryText, isShort: true };
  }
  if (key.startsWith(SRD_CACHE_PREFIX)) {
    const queryText = key.slice(SRD_CACHE_PREFIX.length).trim();
    if (!queryText.length) return null;
    return { queryText, isShort: false };
  }
  return null;
}

async function eventExists(source: string, queryText: string, redisKey: string): Promise<boolean> {
  const query = {
    text: `
      select id
      from public."SrdQuestionEvent"
      where source = $1
        and query_text = $2
        and metadata_json->>'redisKey' = $3
      limit 1
    `,
    values: [source, queryText, redisKey],
  };
  const data = await pool.query<{ id: number }>(query);
  return Boolean(data.rows[0]);
}

async function main() {
  const apply = hasFlag("--apply");
  const skipExisting = !hasFlag("--allow-duplicates");
  const maxEvents = parseNumberFlag("--max-events", 5000, 1, 200000);
  const scanCount = parseNumberFlag("--scan-count", 200, 10, 5000);
  const source = parseStringFlag("--source", "redis_srd_cache_backfill");
  const match = parseStringFlag("--match", `${SRD_CACHE_PREFIX}*`);

  const redisClient = createClient({ url: getRedisUrl() });
  await redisClient.connect();

  let scanned = 0;
  let parsed = 0;
  let inserted = 0;
  let skippedExisting = 0;
  let skippedMissingValue = 0;

  try {
    for await (const key of redisClient.scanIterator({ MATCH: match, COUNT: scanCount })) {
      scanned += 1;
      if (inserted >= maxEvents) break;

      const parsedKey = extractQueryFromKey(String(key));
      if (!parsedKey) continue;
      parsed += 1;

      const [answerText, ttlMs] = await Promise.all([
        redisClient.get(String(key)),
        redisClient.pTTL(String(key)),
      ]);

      if (typeof answerText !== "string" || !answerText.trim().length) {
        skippedMissingValue += 1;
        continue;
      }

      if (skipExisting) {
        const exists = await eventExists(source, parsedKey.queryText, String(key));
        if (exists) {
          skippedExisting += 1;
          continue;
        }
      }

      if (apply) {
        await createSrdQuestionEvent({
          source,
          queryText: parsedKey.queryText,
          answerText,
          isShort: parsedKey.isShort,
          metadataJson: {
            backfill: true,
            redisKey: String(key),
            redisTtlMs: ttlMs,
          },
        });
      }

      inserted += 1;
    }

    const summary = {
      apply,
      source,
      match,
      scanned,
      parsed,
      inserted,
      skippedExisting,
      skippedMissingValue,
      maxEvents,
      scanCount,
    };

    logger.info(summary, "Redis SRD cache backfill summary");
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await redisClient.quit();
    await pool.end();
  }
}

main().catch((err) => {
  logger.error({ err }, "Redis SRD cache backfill failed");
  process.exitCode = 1;
});
