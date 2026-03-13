import {
  dayWindowUtc,
  getAccessTokenFromServiceAccount,
  getRequiredString,
  loadServiceAccountCredentials,
  normalizePathname,
  querySearchAnalyticsAll,
  toFiniteNumber,
} from "../lib/googleSearchConsole";
import { hasFlag, parseFlagValue, parseIntFlag } from "./lib/cliFlags";

type PageGroupKey =
  | "vtt-primary"
  | "vtt-support"
  | "wyrlds-core"
  | "wyrlds-discovery"
  | "character-sheets";

type QueryBucketKey =
  | "brand"
  | "low-friction-vtt"
  | "vtt-generic"
  | "campaign-management"
  | "character-sheets"
  | "other-non-brand";

type PathMatchMode = "exact" | "prefix";

type PageGroupDefinition = {
  key: PageGroupKey;
  label: string;
};

type PageSource = {
  groupKey: PageGroupKey;
  label: string;
  filterExpression: string;
  matchPath: string;
  matchMode: PathMatchMode;
};

type QueryBucketDefinition = {
  key: QueryBucketKey;
  label: string;
  pattern: RegExp | null;
};

type TrackedRow = {
  groupKey: PageGroupKey;
  pageUrl: string;
  path: string;
  query: string;
  bucketKey: QueryBucketKey;
  clicks: number;
  impressions: number;
  position?: number;
};

type MetricAccumulator = {
  clicks: number;
  impressions: number;
  positionWeightedSum: number;
  positionImpressions: number;
  queries: Set<string>;
  pages: Set<string>;
};

type MetricSummary = {
  clicks: number;
  impressions: number;
  ctr: number;
  position?: number;
  queryCount: number;
  pageCount: number;
};

type PageSummary = {
  path: string;
  metrics: MetricSummary;
};

type TopQuerySummary = {
  query: string;
  bucketKey: QueryBucketKey;
  metrics: MetricSummary;
};

const PAGE_GROUPS: PageGroupDefinition[] = [
  { key: "vtt-primary", label: "VTT primary" },
  { key: "vtt-support", label: "VTT support" },
  { key: "wyrlds-core", label: "Wyrlds core" },
  { key: "wyrlds-discovery", label: "Wyrlds discovery" },
  { key: "character-sheets", label: "Character sheets" },
];

const PAGE_SOURCES: PageSource[] = [
  {
    groupKey: "vtt-primary",
    label: "/simple-virtual-tabletop-no-player-accounts",
    filterExpression: "/simple-virtual-tabletop-no-player-accounts",
    matchPath: "/simple-virtual-tabletop-no-player-accounts",
    matchMode: "exact",
  },
  {
    groupKey: "vtt-support",
    label: "/virtual-tabletop-for-dnd-5e",
    filterExpression: "/virtual-tabletop-for-dnd-5e",
    matchPath: "/virtual-tabletop-for-dnd-5e",
    matchMode: "exact",
  },
  {
    groupKey: "vtt-support",
    label: "/roll20-alternative",
    filterExpression: "/roll20-alternative",
    matchPath: "/roll20-alternative",
    matchMode: "exact",
  },
  {
    groupKey: "vtt-support",
    label: "/vtt-guide",
    filterExpression: "/vtt-guide",
    matchPath: "/vtt-guide",
    matchMode: "exact",
  },
  {
    groupKey: "wyrlds-core",
    label: "/wyrlds",
    filterExpression: "/wyrlds",
    matchPath: "/wyrlds",
    matchMode: "exact",
  },
  {
    groupKey: "wyrlds-discovery",
    label: "/public-wyrlds-guide",
    filterExpression: "/public-wyrlds-guide",
    matchPath: "/public-wyrlds-guide",
    matchMode: "exact",
  },
  {
    groupKey: "wyrlds-discovery",
    label: "/play-dungeons-and-dragons-online",
    filterExpression: "/play-dungeons-and-dragons-online",
    matchPath: "/play-dungeons-and-dragons-online",
    matchMode: "exact",
  },
  {
    groupKey: "wyrlds-discovery",
    label: "/wyrlds/public*",
    filterExpression: "/wyrlds/public",
    matchPath: "/wyrlds/public",
    matchMode: "prefix",
  },
  {
    groupKey: "character-sheets",
    label: "/dnd-5e-character-sheets",
    filterExpression: "/dnd-5e-character-sheets",
    matchPath: "/dnd-5e-character-sheets",
    matchMode: "exact",
  },
  {
    groupKey: "character-sheets",
    label: "/character-sheet-guide",
    filterExpression: "/character-sheet-guide",
    matchPath: "/character-sheet-guide",
    matchMode: "exact",
  },
];

const QUERY_BUCKETS: QueryBucketDefinition[] = [
  {
    key: "brand",
    label: "Brand",
    pattern: /\b(?:far\s*reach|farreach|frc)\b/i,
  },
  {
    key: "low-friction-vtt",
    label: "Low-friction VTT",
    pattern: /no\s*sign\s*up|no player accounts?|without accounts?|invite link/i,
  },
  {
    key: "vtt-generic",
    label: "VTT generic",
    pattern: /\bvtt\b|virtual table\s?top/i,
  },
  {
    key: "campaign-management",
    label: "Campaign management",
    pattern:
      /campaign management|campaign hub|online campaign|campaign organizer|worldbuilding|world building/i,
  },
  {
    key: "character-sheets",
    label: "Character sheets",
    pattern:
      /character sheets?|\b5e\s+sheet\b|d&d beyond alternative|dnd beyond alternative|dndbeyond alternative/i,
  },
  {
    key: "other-non-brand",
    label: "Other non-brand",
    pattern: null,
  },
];

function usage() {
  console.log(`Usage:
  npm run gsc:product-surface -- [options]

Options:
  --days <n>                 Window size in days (default: 90)
  --lag-days <n>             Exclude the most recent n days (default: 3)
  --page-size <n>            Search Console page size per request (default: 25000)
  --max-rows-per-source <n>  Cap rows fetched for each tracked page source (default: 25000)
  --top-queries <n>          Top queries to print for each page group (default: 7)
  --site-url <value>         Override GSC site URL (else GSC_SITE_URL)
  --json                     Print JSON instead of human-readable tables
  --help, -h                 Show this help

Examples:
  npm run gsc:product-surface -- --days 28
  npm run gsc:product-surface -- --days 90 --top-queries 10
  npm run gsc:product-surface -- --days 90 --json
`);
}

function matchesSourcePath(pathname: string, source: PageSource): boolean {
  if (source.matchMode === "exact") {
    return pathname === source.matchPath;
  }
  return pathname === source.matchPath || pathname.startsWith(`${source.matchPath}/`);
}

function classifyQueryBucket(query: string): QueryBucketKey {
  for (const bucket of QUERY_BUCKETS) {
    if (!bucket.pattern) continue;
    if (bucket.pattern.test(query)) {
      return bucket.key;
    }
  }
  return "other-non-brand";
}

function createAccumulator(): MetricAccumulator {
  return {
    clicks: 0,
    impressions: 0,
    positionWeightedSum: 0,
    positionImpressions: 0,
    queries: new Set<string>(),
    pages: new Set<string>(),
  };
}

function addToAccumulator(acc: MetricAccumulator, row: TrackedRow) {
  acc.clicks += row.clicks;
  acc.impressions += row.impressions;
  if (row.position !== undefined && row.impressions > 0) {
    acc.positionWeightedSum += row.position * row.impressions;
    acc.positionImpressions += row.impressions;
  }
  if (row.query) acc.queries.add(row.query);
  if (row.path) acc.pages.add(row.path);
}

function finalizeAccumulator(acc: MetricAccumulator): MetricSummary {
  return {
    clicks: acc.clicks,
    impressions: acc.impressions,
    ctr: acc.impressions > 0 ? acc.clicks / acc.impressions : 0,
    position:
      acc.positionImpressions > 0
        ? acc.positionWeightedSum / acc.positionImpressions
        : undefined,
    queryCount: acc.queries.size,
    pageCount: acc.pages.size,
  };
}

function formatInteger(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatPosition(value: number | undefined): string {
  return value === undefined ? "-" : value.toFixed(1);
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max - 1))}…`;
}

type TableColumn<T> = {
  header: string;
  align?: "left" | "right";
  render: (row: T) => string;
};

function renderTable<T>(rows: T[], columns: TableColumn<T>[]): string {
  if (!rows.length) return "(no rows)";

  const widths = columns.map((column) => {
    const cellWidths = rows.map((row) => column.render(row).length);
    return Math.max(column.header.length, ...cellWidths);
  });

  const formatRow = (cells: string[]) =>
    cells
      .map((cell, idx) => {
        const width = widths[idx];
        const align = columns[idx].align || "left";
        return align === "right" ? cell.padStart(width) : cell.padEnd(width);
      })
      .join("  ");

  const header = formatRow(columns.map((column) => column.header));
  const divider = widths.map((width) => "-".repeat(width)).join("  ");
  const body = rows.map((row) => formatRow(columns.map((column) => column.render(row))));
  return [header, divider, ...body].join("\n");
}

async function fetchTrackedRows(params: {
  accessToken: string;
  siteUrl: string;
  startDate: string;
  endDate: string;
  pageSize: number;
  maxRowsPerSource: number;
}): Promise<{ rows: TrackedRow[]; fetchedRowCount: number; truncatedSources: string[] }> {
  const trackedRows: TrackedRow[] = [];
  let fetchedRowCount = 0;
  const truncatedSources: string[] = [];

  for (const source of PAGE_SOURCES) {
    const result = await querySearchAnalyticsAll({
      accessToken: params.accessToken,
      siteUrl: params.siteUrl,
      startDate: params.startDate,
      endDate: params.endDate,
      dimensions: ["page", "query"],
      pageSize: params.pageSize,
      maxRows: params.maxRowsPerSource,
      dimensionFilterGroups: [
        {
          groupType: "and",
          filters: [
            {
              dimension: "page",
              operator: "contains",
              expression: source.filterExpression,
            },
          ],
        },
      ],
    });

    fetchedRowCount += result.rows.length;
    if (result.truncated) truncatedSources.push(source.label);

    for (const row of result.rows) {
      const pageUrl = String(row.keys?.[0] || "").trim();
      const path = normalizePathname(pageUrl);
      if (!path || !matchesSourcePath(path, source)) continue;

      const query = String(row.keys?.[1] || "").trim() || "(not provided)";
      const clicks = toFiniteNumber(row.clicks) || 0;
      const impressions = toFiniteNumber(row.impressions) || 0;
      const position = toFiniteNumber(row.position);

      trackedRows.push({
        groupKey: source.groupKey,
        pageUrl,
        path,
        query,
        bucketKey: classifyQueryBucket(query),
        clicks,
        impressions,
        position,
      });
    }
  }

  return { rows: trackedRows, fetchedRowCount, truncatedSources };
}

async function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    usage();
    return;
  }

  const days = parseIntFlag("--days", 90, 1, 365);
  const lagDays = parseIntFlag("--lag-days", 3, 0, 30);
  const pageSize = parseIntFlag("--page-size", 25000, 100, 25000);
  const maxRowsPerSource = parseIntFlag("--max-rows-per-source", 25000, 100, 100000);
  const topQueries = parseIntFlag("--top-queries", 7, 1, 25);
  const json = hasFlag("--json");

  const siteUrl = getRequiredString(
    parseFlagValue("--site-url") || process.env.GSC_SITE_URL,
    "GSC_SITE_URL or --site-url",
  );

  const credentials = loadServiceAccountCredentials();
  const { startDate, endDate } = dayWindowUtc(days, lagDays);

  const accessToken = await getAccessTokenFromServiceAccount(credentials);
  const { rows, fetchedRowCount, truncatedSources } = await fetchTrackedRows({
    accessToken,
    siteUrl,
    startDate,
    endDate,
    pageSize,
    maxRowsPerSource,
  });

  const groupAccumulators = new Map<PageGroupKey, MetricAccumulator>();
  const bucketAccumulators = new Map<QueryBucketKey, MetricAccumulator>();
  const groupBucketAccumulators = new Map<string, MetricAccumulator>();
  const pageAccumulators = new Map<PageGroupKey, Map<string, MetricAccumulator>>();
  const groupQueryAccumulators = new Map<
    PageGroupKey,
    Map<string, { bucketKey: QueryBucketKey; acc: MetricAccumulator }>
  >();

  for (const group of PAGE_GROUPS) {
    groupAccumulators.set(group.key, createAccumulator());
    pageAccumulators.set(group.key, new Map());
    groupQueryAccumulators.set(group.key, new Map());
    for (const bucket of QUERY_BUCKETS) {
      const pairKey = `${group.key}::${bucket.key}`;
      groupBucketAccumulators.set(pairKey, createAccumulator());
    }
  }

  for (const bucket of QUERY_BUCKETS) {
    bucketAccumulators.set(bucket.key, createAccumulator());
  }

  for (const row of rows) {
    addToAccumulator(groupAccumulators.get(row.groupKey)!, row);
    addToAccumulator(bucketAccumulators.get(row.bucketKey)!, row);
    addToAccumulator(groupBucketAccumulators.get(`${row.groupKey}::${row.bucketKey}`)!, row);

    const groupPages = pageAccumulators.get(row.groupKey)!;
    const pageAcc = groupPages.get(row.path) || createAccumulator();
    addToAccumulator(pageAcc, row);
    groupPages.set(row.path, pageAcc);

    const groupQueries = groupQueryAccumulators.get(row.groupKey)!;
    const queryEntry = groupQueries.get(row.query) || {
      bucketKey: row.bucketKey,
      acc: createAccumulator(),
    };
    addToAccumulator(queryEntry.acc, row);
    groupQueries.set(row.query, queryEntry);
  }

  const pageGroupSummaries = PAGE_GROUPS.map((group) => ({
    key: group.key,
    label: group.label,
    metrics: finalizeAccumulator(groupAccumulators.get(group.key)!),
  }));

  const queryBucketSummaries = QUERY_BUCKETS.map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    metrics: finalizeAccumulator(bucketAccumulators.get(bucket.key)!),
  }));

  const pageGroupBucketSummaries = PAGE_GROUPS.flatMap((group) =>
    QUERY_BUCKETS.map((bucket) => ({
      groupKey: group.key,
      groupLabel: group.label,
      bucketKey: bucket.key,
      bucketLabel: bucket.label,
      metrics: finalizeAccumulator(
        groupBucketAccumulators.get(`${group.key}::${bucket.key}`)!,
      ),
    })),
  ).filter((entry) => entry.metrics.impressions > 0);

  const pageDetails = PAGE_GROUPS.map((group) => {
    const pageMap = pageAccumulators.get(group.key)!;
    const pages: PageSummary[] = Array.from(pageMap.entries())
      .map(([path, acc]) => ({
        path,
        metrics: finalizeAccumulator(acc),
      }))
      .sort(
        (a, b) =>
          b.metrics.impressions - a.metrics.impressions || b.metrics.clicks - a.metrics.clicks,
      );

    return {
      groupKey: group.key,
      groupLabel: group.label,
      pages,
    };
  });

  const topQueriesByGroup = PAGE_GROUPS.map((group) => {
    const queryMap = groupQueryAccumulators.get(group.key)!;
    const queries: TopQuerySummary[] = Array.from(queryMap.entries())
      .map(([query, entry]) => ({
        query,
        bucketKey: entry.bucketKey,
        metrics: finalizeAccumulator(entry.acc),
      }))
      .sort(
        (a, b) =>
          b.metrics.clicks - a.metrics.clicks ||
          b.metrics.impressions - a.metrics.impressions ||
          a.query.localeCompare(b.query),
      )
      .slice(0, topQueries);

    return {
      groupKey: group.key,
      groupLabel: group.label,
      queries,
    };
  });

  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    siteUrl,
    window: {
      startDate,
      endDate,
      days,
      lagDays,
    },
    notes: {
      trackedPageGroups: PAGE_GROUPS.length,
      fetchedPageQueryRows: fetchedRowCount,
      matchedTrackedRows: rows.length,
      queryBucketPriority:
        "Brand > Low-friction VTT > VTT generic > Campaign management > Character sheets > Other non-brand",
      truncatedSources,
    },
    pageGroups: pageGroupSummaries,
    queryBuckets: queryBucketSummaries,
    pageGroupBuckets: pageGroupBucketSummaries,
    pageDetails,
    topQueriesByGroup,
  };

  if (json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log("Product Search Surface");
  console.log(`Site: ${siteUrl}`);
  console.log(`Window: ${startDate} to ${endDate} (${days} days, lag ${lagDays})`);
  console.log(`Fetched page/query rows: ${formatInteger(fetchedRowCount)}`);
  console.log(`Matched tracked rows: ${formatInteger(rows.length)}`);
  console.log(
    "Bucket priority: Brand > Low-friction VTT > VTT generic > Campaign management > Character sheets > Other non-brand",
  );
  if (truncatedSources.length) {
    console.log(
      `Warning: source fetch hit --max-rows-per-source for ${truncatedSources.join(", ")}.`,
    );
  }

  console.log("\nPage Groups");
  console.log(
    renderTable(pageGroupSummaries, [
      { header: "Group", render: (row) => row.label },
      { header: "Pages", align: "right", render: (row) => formatInteger(row.metrics.pageCount) },
      {
        header: "Queries",
        align: "right",
        render: (row) => formatInteger(row.metrics.queryCount),
      },
      {
        header: "Clicks",
        align: "right",
        render: (row) => formatInteger(row.metrics.clicks),
      },
      {
        header: "Impr",
        align: "right",
        render: (row) => formatInteger(row.metrics.impressions),
      },
      {
        header: "CTR",
        align: "right",
        render: (row) => formatPercent(row.metrics.ctr),
      },
      {
        header: "Pos",
        align: "right",
        render: (row) => formatPosition(row.metrics.position),
      },
    ]),
  );

  console.log("\nQuery Buckets");
  console.log(
    renderTable(
      queryBucketSummaries.filter((row) => row.metrics.impressions > 0),
      [
        { header: "Bucket", render: (row) => row.label },
        {
          header: "Queries",
          align: "right",
          render: (row) => formatInteger(row.metrics.queryCount),
        },
        {
          header: "Clicks",
          align: "right",
          render: (row) => formatInteger(row.metrics.clicks),
        },
        {
          header: "Impr",
          align: "right",
          render: (row) => formatInteger(row.metrics.impressions),
        },
        {
          header: "CTR",
          align: "right",
          render: (row) => formatPercent(row.metrics.ctr),
        },
        {
          header: "Pos",
          align: "right",
          render: (row) => formatPosition(row.metrics.position),
        },
      ],
    ),
  );

  console.log("\nPage Group x Query Bucket");
  console.log(
    renderTable(pageGroupBucketSummaries, [
      { header: "Group", render: (row) => row.groupLabel },
      { header: "Bucket", render: (row) => row.bucketLabel },
      {
        header: "Queries",
        align: "right",
        render: (row) => formatInteger(row.metrics.queryCount),
      },
      {
        header: "Clicks",
        align: "right",
        render: (row) => formatInteger(row.metrics.clicks),
      },
      {
        header: "Impr",
        align: "right",
        render: (row) => formatInteger(row.metrics.impressions),
      },
      {
        header: "CTR",
        align: "right",
        render: (row) => formatPercent(row.metrics.ctr),
      },
      {
        header: "Pos",
        align: "right",
        render: (row) => formatPosition(row.metrics.position),
      },
    ]),
  );

  for (const detail of pageDetails) {
    if (detail.pages.length <= 1) continue;
    console.log(`\nPages in ${detail.groupLabel}`);
    console.log(
      renderTable(detail.pages, [
        { header: "Path", render: (row) => row.path },
        {
          header: "Queries",
          align: "right",
          render: (row) => formatInteger(row.metrics.queryCount),
        },
        {
          header: "Clicks",
          align: "right",
          render: (row) => formatInteger(row.metrics.clicks),
        },
        {
          header: "Impr",
          align: "right",
          render: (row) => formatInteger(row.metrics.impressions),
        },
        {
          header: "CTR",
          align: "right",
          render: (row) => formatPercent(row.metrics.ctr),
        },
        {
          header: "Pos",
          align: "right",
          render: (row) => formatPosition(row.metrics.position),
        },
      ]),
    );
  }

  for (const group of topQueriesByGroup) {
    console.log(`\nTop queries for ${group.groupLabel}`);
    console.log(
      renderTable(group.queries, [
        {
          header: "Query",
          render: (row) => truncate(row.query, 52),
        },
        {
          header: "Bucket",
          render: (row) =>
            QUERY_BUCKETS.find((bucket) => bucket.key === row.bucketKey)?.label || row.bucketKey,
        },
        {
          header: "Clicks",
          align: "right",
          render: (row) => formatInteger(row.metrics.clicks),
        },
        {
          header: "Impr",
          align: "right",
          render: (row) => formatInteger(row.metrics.impressions),
        },
        {
          header: "CTR",
          align: "right",
          render: (row) => formatPercent(row.metrics.ctr),
        },
        {
          header: "Pos",
          align: "right",
          render: (row) => formatPosition(row.metrics.position),
        },
      ]),
    );
  }
}

main().catch((err) => {
  console.error("Failed to report product search surface from Google Search Console", err);
  process.exitCode = 1;
});
