import mail from "../api/smtp";
import db, { pool } from "../api/dbconfig";
import logger from "../lib/logger";
import { EventType, logEvent } from "../lib/eventLogger";

const DEFAULT_REPORT_EMAIL = "farreachco@gmail.com";

type MonthlyEventSummaryRow = {
  event_type: string;
  feature: string;
  action: string;
  outcome: string;
  reason: string | null;
  event_count: number;
  unique_users: number;
  unique_projects: number;
};

type MonthlyTotalsRow = {
  total_events: number;
  unique_users: number;
  unique_projects: number;
  unique_event_types: number;
};

function parseFlagValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function isFirstDayOfMonthUtc(date: Date): boolean {
  return date.getUTCDate() === 1;
}

function formatMonthKeyUtc(monthStartUtc: Date): string {
  const year = monthStartUtc.getUTCFullYear();
  const month = String(monthStartUtc.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function formatMonthTitleUtc(monthStartUtc: Date): string {
  return monthStartUtc.toLocaleString("en-US", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  });
}

function parseMonthArg(value: string): Date {
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})$/.exec(trimmed);
  if (!match) {
    throw new Error(`Invalid --month value "${value}". Expected YYYY-MM.`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`Invalid --month value "${value}". Expected YYYY-MM.`);
  }
  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
}

function getPreviousMonthRangeUtc(now: Date) {
  const currentMonthStartUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  );
  const previousMonthStartUtc = new Date(
    Date.UTC(
      currentMonthStartUtc.getUTCFullYear(),
      currentMonthStartUtc.getUTCMonth() - 1,
      1,
      0,
      0,
      0,
      0,
    ),
  );
  return {
    monthStartUtc: previousMonthStartUtc,
    monthEndUtc: currentMonthStartUtc,
  };
}

function getMonthRangeFromStartUtc(monthStartUtc: Date) {
  return {
    monthStartUtc,
    monthEndUtc: new Date(
      Date.UTC(
        monthStartUtc.getUTCFullYear(),
        monthStartUtc.getUTCMonth() + 1,
        1,
        0,
        0,
        0,
        0,
      ),
    ),
  };
}

async function hasSentMonthlyReport(reportMonth: string): Promise<boolean> {
  const query = {
    text: `
      SELECT id
      FROM public."LogEvent"
      WHERE event_type = $1
        AND event_data->>'reportMonth' = $2
      LIMIT 1
    `,
    values: [EventType.MONTHLY_LOG_REPORT_EMAIL_SENT, reportMonth],
  };
  const data = await db.query<{ id: number }>(query);
  return Boolean(data.rows[0]);
}

async function getMonthlyTotals(
  monthStartUtc: Date,
  monthEndUtc: Date,
): Promise<MonthlyTotalsRow> {
  const query = {
    text: `
      SELECT
        COUNT(*)::int AS total_events,
        COUNT(DISTINCT user_id)::int AS unique_users,
        COUNT(DISTINCT project_id)::int AS unique_projects,
        COUNT(DISTINCT event_type)::int AS unique_event_types
      FROM public."LogEvent"
      WHERE created_at >= $1
        AND created_at < $2
    `,
    values: [monthStartUtc.toISOString(), monthEndUtc.toISOString()],
  };
  const data = await db.query<MonthlyTotalsRow>(query);
  return (
    data.rows[0] || {
      total_events: 0,
      unique_users: 0,
      unique_projects: 0,
      unique_event_types: 0,
    }
  );
}

async function getMonthlySummaryRows(
  monthStartUtc: Date,
  monthEndUtc: Date,
): Promise<MonthlyEventSummaryRow[]> {
  const query = {
    text: `
      WITH normalized AS (
        SELECT
          event_type,
          COALESCE(
            NULLIF(event_data->>'feature', ''),
            NULLIF(SPLIT_PART(event_type, '.', 1), ''),
            'event'
          ) AS feature,
          COALESCE(
            NULLIF(event_data->>'action', ''),
            CASE
              WHEN POSITION('.' IN event_type) > 0
                THEN SUBSTRING(event_type FROM POSITION('.' IN event_type) + 1)
              ELSE 'event'
            END
          ) AS action,
          COALESCE(NULLIF(event_data->>'outcome', ''), 'success') AS outcome,
          NULLIF(event_data->>'reason', '') AS reason,
          user_id,
          project_id
        FROM public."LogEvent"
        WHERE created_at >= $1
          AND created_at < $2
      )
      SELECT
        event_type,
        feature,
        action,
        outcome,
        reason,
        COUNT(*)::int AS event_count,
        COUNT(DISTINCT user_id)::int AS unique_users,
        COUNT(DISTINCT project_id)::int AS unique_projects
      FROM normalized
      GROUP BY event_type, feature, action, outcome, reason
      ORDER BY event_count DESC, event_type ASC
    `,
    values: [monthStartUtc.toISOString(), monthEndUtc.toISOString()],
  };
  const data = await db.query<MonthlyEventSummaryRow>(query);
  return data.rows;
}

function buildOutcomeBreakdown(summaryRows: MonthlyEventSummaryRow[]) {
  const totals = new Map<string, number>();
  for (const row of summaryRows) {
    totals.set(row.outcome, (totals.get(row.outcome) || 0) + Number(row.event_count || 0));
  }
  return Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
}

function buildReasonBreakdown(summaryRows: MonthlyEventSummaryRow[], max = 10) {
  const totals = new Map<string, number>();
  for (const row of summaryRows) {
    if (!row.reason) continue;
    totals.set(row.reason, (totals.get(row.reason) || 0) + Number(row.event_count || 0));
  }
  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, max);
}

function buildEmailMessage(params: {
  monthStartUtc: Date;
  monthEndUtc: Date;
  totals: MonthlyTotalsRow;
  summaryRows: MonthlyEventSummaryRow[];
}) {
  const { monthStartUtc, monthEndUtc, totals, summaryRows } = params;
  const monthTitle = formatMonthTitleUtc(monthStartUtc);
  const monthStartDate = monthStartUtc.toISOString().slice(0, 10);
  const monthEndDateExclusive = monthEndUtc.toISOString().slice(0, 10);
  const topRows = summaryRows.slice(0, 15);
  const outcomes = buildOutcomeBreakdown(summaryRows);
  const reasons = buildReasonBreakdown(summaryRows, 10);

  const lines: string[] = [];
  lines.push(`DM Dash monthly log report for ${monthTitle} (UTC).`);
  lines.push(`Period: ${monthStartDate} to ${monthEndDateExclusive} (exclusive end).`);
  lines.push("");
  lines.push(`Total events: ${totals.total_events}`);
  lines.push(`Unique users: ${totals.unique_users}`);
  lines.push(`Unique projects: ${totals.unique_projects}`);
  lines.push(`Unique event types: ${totals.unique_event_types}`);
  lines.push("");
  lines.push("Outcome breakdown:");
  if (!outcomes.length) {
    lines.push("- none");
  } else {
    for (const [outcome, count] of outcomes) {
      lines.push(`- ${outcome}: ${count}`);
    }
  }
  lines.push("");
  lines.push("Top event groups:");
  if (!topRows.length) {
    lines.push("- none");
  } else {
    for (const row of topRows) {
      lines.push(
        `- ${row.event_type} | outcome=${row.outcome} | reason=${row.reason || "none"} | count=${row.event_count} | unique_users=${row.unique_users} | unique_projects=${row.unique_projects}`,
      );
    }
  }
  lines.push("");
  lines.push("Top denial/error reasons:");
  if (!reasons.length) {
    lines.push("- none");
  } else {
    for (const [reason, count] of reasons) {
      lines.push(`- ${reason}: ${count}`);
    }
  }

  return lines.join("\n");
}

async function runMonthlyReportEmail(): Promise<void> {
  const now = new Date();
  const dryRun = hasFlag("--dry-run");
  const force = hasFlag("--force");
  const allowResend = hasFlag("--allow-resend");
  const monthArg = parseFlagValue("--month");
  const recipientEmail = (process.env.MONTHLY_REPORT_EMAIL || DEFAULT_REPORT_EMAIL).trim();

  const range = monthArg
    ? getMonthRangeFromStartUtc(parseMonthArg(monthArg))
    : getPreviousMonthRangeUtc(now);
  const reportMonth = formatMonthKeyUtc(range.monthStartUtc);

  if (!monthArg && !force && !isFirstDayOfMonthUtc(now)) {
    logger.info(
      { todayUtc: now.toISOString().slice(0, 10), reportMonth },
      "Skipping monthly log report email because today is not the first day of the month",
    );
    return;
  }

  if (!allowResend) {
    const alreadySent = await hasSentMonthlyReport(reportMonth);
    if (alreadySent) {
      logger.info({ reportMonth }, "Skipping monthly log report email because it was already sent");
      return;
    }
  }

  const [totals, summaryRows] = await Promise.all([
    getMonthlyTotals(range.monthStartUtc, range.monthEndUtc),
    getMonthlySummaryRows(range.monthStartUtc, range.monthEndUtc),
  ]);

  const title = `[DM Dash] Monthly Log Report - ${formatMonthTitleUtc(range.monthStartUtc)}`;
  const message = buildEmailMessage({
    monthStartUtc: range.monthStartUtc,
    monthEndUtc: range.monthEndUtc,
    totals,
    summaryRows,
  });

  if (dryRun) {
    console.log(`Dry run enabled. Would send monthly report to ${recipientEmail}.`);
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
    eventType: EventType.MONTHLY_LOG_REPORT_EMAIL_SENT,
    eventData: {
      reportMonth,
      recipientEmail,
      totalEvents: totals.total_events,
      uniqueUsers: totals.unique_users,
      uniqueProjects: totals.unique_projects,
      uniqueEventTypes: totals.unique_event_types,
      outcome: "success",
      reason: null,
    },
  });

  logger.info(
    {
      reportMonth,
      recipientEmail,
      totalEvents: totals.total_events,
      uniqueUsers: totals.unique_users,
      uniqueProjects: totals.unique_projects,
      uniqueEventTypes: totals.unique_event_types,
    },
    "Monthly log report email sent",
  );
}

runMonthlyReportEmail()
  .catch((err) => {
    logger.error({ err }, "Monthly log report email run failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
