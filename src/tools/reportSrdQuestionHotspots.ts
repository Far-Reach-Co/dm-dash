import db, { pool } from "../api/dbconfig";

type HotspotRow = {
  source: string;
  normalized_query: string;
  count: number;
  unique_users: number;
  last_seen: string;
  example_query: string;
};

function parseNumberFlag(flag: string, fallback: number, min: number, max: number): number {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return fallback;
  const raw = process.argv[idx + 1];
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(parsed)));
}

function parseStringFlag(flag: string): string | null {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  const raw = process.argv[idx + 1];
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed.length ? trimmed : null;
}

async function fetchHotspots(params: {
  days: number;
  source: string | null;
  limit: number;
}): Promise<HotspotRow[]> {
  const query = {
    text: /*sql*/ `
      with normalized as (
        select
          source,
          lower(trim(regexp_replace(query_text, '\s+', ' ', 'g'))) as normalized_query,
          query_text,
          source_user_id,
          created_at
        from public."SrdQuestionEvent"
        where created_at >= now() - make_interval(days => $1::int)
          and ($2::text is null or source = $2)
      )
      select
        source,
        normalized_query,
        count(*)::int as count,
        count(distinct nullif(source_user_id, ''))::int as unique_users,
        max(created_at)::text as last_seen,
        min(query_text) as example_query
      from normalized
      group by source, normalized_query
      order by count desc, max(created_at) desc
      limit $3
    `,
    values: [params.days, params.source, params.limit],
  };

  const data = await db.query<HotspotRow>(query);
  return data.rows;
}

async function main() {
  const days = parseNumberFlag("--days", 30, 1, 3650);
  const limit = parseNumberFlag("--limit", 50, 1, 500);
  const source = parseStringFlag("--source");

  const rows = await fetchHotspots({ days, source, limit });

  console.log(
    `SRD question hotspots for last ${days} day(s)` +
      (source ? ` [source=${source}]` : ""),
  );
  console.log(`Rows: ${rows.length}`);
  console.log("");

  if (!rows.length) {
    console.log("No SRD question events found for that filter.");
    return;
  }

  rows.forEach((row, index) => {
    console.log(
      `${index + 1}. [${row.source}] count=${row.count} unique_users=${row.unique_users} last_seen=${row.last_seen}`,
    );
    console.log(`   ${row.example_query}`);
  });
}

main()
  .catch((err) => {
    console.error("Failed to report SRD question hotspots", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
