import mail from "../api/smtp";
import db, { pool } from "../api/dbconfig";
import logger from "../lib/logger";
import { EventType, logEvent } from "../lib/eventLogger";

const DEFAULT_REPORT_EMAIL = "farreachco@gmail.com";

type DailyTotalsRow = {
  total_events: number;
  query_events: number;
  command_events: number;
  unique_users: number;
};

type TopQueryRow = {
  normalized_query: string;
  example_query: string;
  event_count: number;
  unique_users: number;
};

type TopCommandRow = {
  command_name: string;
  event_count: number;
  unique_users: number;
};

function parseFlagValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function parseDateArg(value: string): Date {
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    throw new Error(`Invalid --date value "${value}". Expected YYYY-MM-DD.`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    throw new Error(`Invalid --date value "${value}". Expected YYYY-MM-DD.`);
  }
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

function getYesterdayRangeUtc(now: Date) {
  const todayStartUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
  );
  const dayStartUtc = new Date(todayStartUtc.getTime() - 24 * 60 * 60 * 1000);
  return {
    dayStartUtc,
    dayEndUtc: todayStartUtc,
  };
}

function getDayRangeFromStartUtc(dayStartUtc: Date) {
  return {
    dayStartUtc,
    dayEndUtc: new Date(dayStartUtc.getTime() + 24 * 60 * 60 * 1000),
  };
}

function formatDayKeyUtc(dayStartUtc: Date): string {
  return dayStartUtc.toISOString().slice(0, 10);
}

async function hasSentDailyReport(reportDate: string): Promise<boolean> {
  const query = {
    text: `
      select id
      from public."LogEvent"
      where event_type = $1
        and event_data->>'reportDate' = $2
      limit 1
    `,
    values: [EventType.DAILY_SRD_INTENT_REPORT_EMAIL_SENT, reportDate],
  };
  const data = await db.query<{ id: number }>(query);
  return Boolean(data.rows[0]);
}

async function getDailyTotals(dayStartUtc: Date, dayEndUtc: Date): Promise<DailyTotalsRow> {
  const query = {
    text: `
      select
        count(*)::int as total_events,
        count(*) filter (where source in ('discord_5ebot', 'dm_dash_web'))::int as query_events,
        count(*) filter (
          where source in ('discord_5ebot_command', 'dm_dash_web_command')
        )::int as command_events,
        count(distinct nullif(source_user_id, ''))::int as unique_users
      from public."SrdQuestionEvent"
      where created_at >= $1
        and created_at < $2
    `,
    values: [dayStartUtc.toISOString(), dayEndUtc.toISOString()],
  };
  const data = await db.query<DailyTotalsRow>(query);
  return (
    data.rows[0] || {
      total_events: 0,
      query_events: 0,
      command_events: 0,
      unique_users: 0,
    }
  );
}

async function getTopSearchQueries(
  dayStartUtc: Date,
  dayEndUtc: Date,
  limit = 20,
): Promise<TopQueryRow[]> {
  const query = {
    text: `
      with normalized as (
        select
          lower(trim(regexp_replace(query_text, '\s+', ' ', 'g'))) as normalized_query,
          query_text,
          source_user_id
        from public."SrdQuestionEvent"
        where created_at >= $1
          and created_at < $2
          and source in ('discord_5ebot', 'dm_dash_web')
      )
      select
        normalized_query,
        min(query_text) as example_query,
        count(*)::int as event_count,
        count(distinct nullif(source_user_id, ''))::int as unique_users
      from normalized
      group by normalized_query
      order by event_count desc, normalized_query asc
      limit $3
    `,
    values: [dayStartUtc.toISOString(), dayEndUtc.toISOString(), limit],
  };
  const data = await db.query<TopQueryRow>(query);
  return data.rows;
}

async function getTopCommandUsage(
  dayStartUtc: Date,
  dayEndUtc: Date,
  limit = 20,
): Promise<TopCommandRow[]> {
  const query = {
    text: `
      select
        coalesce(
          nullif(metadata_json->>'commandName', ''),
          nullif(split_part(query_text, ' ', 1), ''),
          'unknown'
        ) as command_name,
        count(*)::int as event_count,
        count(distinct nullif(source_user_id, ''))::int as unique_users
      from public."SrdQuestionEvent"
      where created_at >= $1
        and created_at < $2
        and source in ('discord_5ebot_command', 'dm_dash_web_command')
      group by command_name
      order by event_count desc, command_name asc
      limit $3
    `,
    values: [dayStartUtc.toISOString(), dayEndUtc.toISOString(), limit],
  };
  const data = await db.query<TopCommandRow>(query);
  return data.rows;
}

async function getTopCommandQueries(
  dayStartUtc: Date,
  dayEndUtc: Date,
  limit = 20,
): Promise<TopQueryRow[]> {
  const query = {
    text: `
      with normalized as (
        select
          lower(trim(regexp_replace(query_text, '\s+', ' ', 'g'))) as normalized_query,
          query_text,
          source_user_id
        from public."SrdQuestionEvent"
        where created_at >= $1
          and created_at < $2
          and source in ('discord_5ebot_command', 'dm_dash_web_command')
      )
      select
        normalized_query,
        min(query_text) as example_query,
        count(*)::int as event_count,
        count(distinct nullif(source_user_id, ''))::int as unique_users
      from normalized
      group by normalized_query
      order by event_count desc, normalized_query asc
      limit $3
    `,
    values: [dayStartUtc.toISOString(), dayEndUtc.toISOString(), limit],
  };
  const data = await db.query<TopQueryRow>(query);
  return data.rows;
}

async function getUnansweredHotspots(
  dayStartUtc: Date,
  dayEndUtc: Date,
  limit = 20,
): Promise<TopQueryRow[]> {
  const query = {
    text: `
      with unanswered as (
        select
          lower(trim(regexp_replace(query_text, '\s+', ' ', 'g'))) as normalized_query,
          query_text,
          source_user_id
        from public."SrdQuestionEvent"
        where created_at >= $1
          and created_at < $2
          and source in ('discord_5ebot', 'dm_dash_web')
          and (
            answer_text is null
            or lower(answer_text) like '%couldn''t find%'
            or lower(answer_text) like '%insufficient%'
            or lower(answer_text) like '%unavailable%'
            or lower(answer_text) like '%failed to reach%'
            or lower(answer_text) like '%no answer was returned%'
          )
      )
      select
        normalized_query,
        min(query_text) as example_query,
        count(*)::int as event_count,
        count(distinct nullif(source_user_id, ''))::int as unique_users
      from unanswered
      group by normalized_query
      having count(*) >= 2
      order by event_count desc, normalized_query asc
      limit $3
    `,
    values: [dayStartUtc.toISOString(), dayEndUtc.toISOString(), limit],
  };
  const data = await db.query<TopQueryRow>(query);
  return data.rows;
}

function sectionFromRows(
  title: string,
  rows: Array<{ example_query: string; event_count: number; unique_users: number }>,
) {
  const lines: string[] = [];
  lines.push(title);
  if (!rows.length) {
    lines.push("- none");
    return lines;
  }
  for (const row of rows) {
    lines.push(
      `- count=${row.event_count} unique_users=${row.unique_users} :: ${row.example_query}`,
    );
  }
  return lines;
}

function sectionFromCommandRows(title: string, rows: TopCommandRow[]) {
  const lines: string[] = [];
  lines.push(title);
  if (!rows.length) {
    lines.push("- none");
    return lines;
  }
  for (const row of rows) {
    lines.push(
      `- command=${row.command_name} count=${row.event_count} unique_users=${row.unique_users}`,
    );
  }
  return lines;
}

function buildDailyMessage(params: {
  reportDate: string;
  totals: DailyTotalsRow;
  topCommands: TopCommandRow[];
  topCommandQueries: TopQueryRow[];
  topSearchQueries: TopQueryRow[];
  unansweredHotspots: TopQueryRow[];
}) {
  const { reportDate, totals, topCommands, topCommandQueries, topSearchQueries, unansweredHotspots } =
    params;
  const lines: string[] = [];
  lines.push(`DM Dash daily SRD intent report for ${reportDate} (UTC).`);
  lines.push("");
  lines.push(`Total SRD events: ${totals.total_events}`);
  lines.push(`Query events: ${totals.query_events}`);
  lines.push(`Command events: ${totals.command_events}`);
  lines.push(`Unique users: ${totals.unique_users}`);
  lines.push("");
  lines.push(...sectionFromCommandRows("Top command usage:", topCommands));
  lines.push("");
  lines.push(
    ...sectionFromRows(
      "Top command query patterns:",
      topCommandQueries.map((row) => ({
        example_query: row.example_query,
        event_count: row.event_count,
        unique_users: row.unique_users,
      })),
    ),
  );
  lines.push("");
  lines.push(
    ...sectionFromRows(
      "Top SRD search queries:",
      topSearchQueries.map((row) => ({
        example_query: row.example_query,
        event_count: row.event_count,
        unique_users: row.unique_users,
      })),
    ),
  );
  lines.push("");
  lines.push(
    ...sectionFromRows(
      "High-volume unanswered SRD queries:",
      unansweredHotspots.map((row) => ({
        example_query: row.example_query,
        event_count: row.event_count,
        unique_users: row.unique_users,
      })),
    ),
  );
  return lines.join("\n");
}

async function runDailySrdReport(): Promise<void> {
  const now = new Date();
  const dryRun = hasFlag("--dry-run");
  const force = hasFlag("--force");
  const allowResend = hasFlag("--allow-resend");
  const dateArg = parseFlagValue("--date");
  const recipientEmail = (process.env.SRD_DAILY_REPORT_EMAIL || DEFAULT_REPORT_EMAIL).trim();

  const range = dateArg
    ? getDayRangeFromStartUtc(parseDateArg(dateArg))
    : getYesterdayRangeUtc(now);
  const reportDate = formatDayKeyUtc(range.dayStartUtc);

  if (!allowResend) {
    const alreadySent = await hasSentDailyReport(reportDate);
    if (alreadySent && !force) {
      logger.info({ reportDate }, "Skipping daily SRD intent report because it was already sent");
      return;
    }
  }

  const [totals, topCommands, topCommandQueries, topSearchQueries, unansweredHotspots] =
    await Promise.all([
      getDailyTotals(range.dayStartUtc, range.dayEndUtc),
      getTopCommandUsage(range.dayStartUtc, range.dayEndUtc, 15),
      getTopCommandQueries(range.dayStartUtc, range.dayEndUtc, 20),
      getTopSearchQueries(range.dayStartUtc, range.dayEndUtc, 20),
      getUnansweredHotspots(range.dayStartUtc, range.dayEndUtc, 20),
    ]);

  const title = `[DM Dash] Daily SRD Intent Report - ${reportDate} UTC`;
  const message = buildDailyMessage({
    reportDate,
    totals,
    topCommands,
    topCommandQueries,
    topSearchQueries,
    unansweredHotspots,
  });

  if (dryRun) {
    console.log(`Dry run enabled. Would send daily SRD intent report to ${recipientEmail}.`);
    console.log("");
    console.log(`Subject: ${title}`);
    console.log("");
    console.log(message);
    return;
  }

  await mail.sendMessage({
    user: { email: recipientEmail },
    title,
    message,
  });

  await logEvent({
    eventType: EventType.DAILY_SRD_INTENT_REPORT_EMAIL_SENT,
    eventData: {
      reportDate,
      recipientEmail,
      totalEvents: totals.total_events,
      queryEvents: totals.query_events,
      commandEvents: totals.command_events,
      uniqueUsers: totals.unique_users,
      unansweredCount: unansweredHotspots.length,
      outcome: "success",
      reason: null,
    },
  });

  logger.info(
    {
      reportDate,
      recipientEmail,
      totalEvents: totals.total_events,
      queryEvents: totals.query_events,
      commandEvents: totals.command_events,
      uniqueUsers: totals.unique_users,
      unansweredCount: unansweredHotspots.length,
    },
    "Daily SRD intent report email sent",
  );
}

runDailySrdReport()
  .catch((err) => {
    logger.error({ err }, "Daily SRD intent report run failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
