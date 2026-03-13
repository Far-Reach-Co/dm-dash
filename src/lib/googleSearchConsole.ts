import fs from "fs";
import path from "path";

import fetch from "node-fetch";
import { sign } from "jsonwebtoken";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEARCH_ANALYTICS_ENDPOINT_BASE = "https://www.googleapis.com/webmasters/v3/sites/";
const SEARCH_CONSOLE_READONLY_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const DEFAULT_SERVICE_ACCOUNT_KEY_FILE = "gsc-service-account.json";

export type GoogleServiceAccountCredentials = {
  clientEmail: string;
  privateKey: string;
  tokenUri: string;
  keyFilePath: string;
};

export type SearchAnalyticsDimension = "page" | "query";
export type SearchAnalyticsOperator = "contains" | "equals" | "includingRegex";

export type SearchAnalyticsFilter = {
  dimension: SearchAnalyticsDimension;
  operator: SearchAnalyticsOperator;
  expression: string;
};

export type SearchAnalyticsRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type SearchAnalyticsResponse = {
  rows?: SearchAnalyticsRow[];
};

export type QueryAnalyticsResult = {
  rows: SearchAnalyticsRow[];
  truncated: boolean;
};

export function getRequiredString(value: string | undefined, name: string): string {
  const trimmed = String(value || "").trim();
  if (!trimmed) throw new Error(`${name} is required.`);
  return trimmed;
}

function resolveServiceAccountKeyFilePath(): string {
  const configured = String(process.env.GSC_SERVICE_ACCOUNT_KEY_FILE || "").trim();
  const keyFile = configured || DEFAULT_SERVICE_ACCOUNT_KEY_FILE;
  return path.resolve(process.cwd(), keyFile);
}

export function dayWindowUtc(
  days: number,
  lagDays: number,
): { startDate: string; endDate: string } {
  const dayMs = 24 * 60 * 60 * 1000;
  const now = new Date();
  const todayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
  );
  const endDate = new Date(todayUtc.getTime() - lagDays * dayMs);
  const startDate = new Date(endDate.getTime() - (days - 1) * dayMs);
  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
  };
}

export function loadServiceAccountCredentials(): GoogleServiceAccountCredentials {
  const keyFilePath = resolveServiceAccountKeyFilePath();
  if (!fs.existsSync(keyFilePath)) {
    throw new Error(
      `Google Search Console service account key file was not found at ${keyFilePath}. Put gsc-service-account.json there or set GSC_SERVICE_ACCOUNT_KEY_FILE.`,
    );
  }

  let rawJson = "";
  try {
    rawJson = fs.readFileSync(keyFilePath, "utf8");
  } catch (err) {
    throw new Error(
      `Failed to read Google Search Console service account key file at ${keyFilePath}: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawJson) as Record<string, unknown>;
  } catch {
    throw new Error(
      `Google Search Console service account key file at ${keyFilePath} is not valid JSON.`,
    );
  }

  return {
    clientEmail: getRequiredString(
      typeof parsed.client_email === "string" ? parsed.client_email : undefined,
      "service account client_email",
    ),
    privateKey: getRequiredString(
      typeof parsed.private_key === "string" ? parsed.private_key : undefined,
      "service account private_key",
    ),
    tokenUri:
      getRequiredString(
        typeof parsed.token_uri === "string" ? parsed.token_uri : TOKEN_URL,
        "service account token_uri",
      ) || TOKEN_URL,
    keyFilePath,
  };
}

export async function getAccessTokenFromServiceAccount(
  credentials: GoogleServiceAccountCredentials,
): Promise<string> {
  const issuedAtSeconds = Math.floor(Date.now() / 1000);
  const expiresAtSeconds = issuedAtSeconds + 60 * 60;
  const assertion = sign(
    {
      iss: credentials.clientEmail,
      scope: SEARCH_CONSOLE_READONLY_SCOPE,
      aud: credentials.tokenUri || TOKEN_URL,
      iat: issuedAtSeconds,
      exp: expiresAtSeconds,
    },
    credentials.privateKey,
    {
      algorithm: "RS256",
    },
  );

  const tokenBody = new URLSearchParams();
  tokenBody.set("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
  tokenBody.set("assertion", assertion);

  const response = await fetch(credentials.tokenUri || TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: tokenBody.toString(),
  });

  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(
      `Service account token exchange failed (${response.status}) using ${credentials.keyFilePath}: ${bodyText}`,
    );
  }

  let tokenData: any;
  try {
    tokenData = JSON.parse(bodyText);
  } catch {
    throw new Error("Failed to parse OAuth token response JSON.");
  }

  const accessToken = String(tokenData.access_token || "").trim();
  if (!accessToken) {
    throw new Error("Service account token exchange response did not include access_token.");
  }

  return accessToken;
}

export async function querySearchAnalytics(params: {
  accessToken: string;
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions: SearchAnalyticsDimension[];
  rowLimit: number;
  startRow?: number;
  dimensionFilterGroups?: Array<{
    groupType?: "and" | "or";
    filters: SearchAnalyticsFilter[];
  }>;
}): Promise<SearchAnalyticsRow[]> {
  const endpoint = `${SEARCH_ANALYTICS_ENDPOINT_BASE}${encodeURIComponent(params.siteUrl)}/searchAnalytics/query`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${params.accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      startDate: params.startDate,
      endDate: params.endDate,
      dimensions: params.dimensions,
      rowLimit: params.rowLimit,
      startRow: params.startRow || 0,
      type: "web",
      dimensionFilterGroups: params.dimensionFilterGroups,
    }),
  });

  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(`Search Analytics query failed (${response.status}): ${bodyText}`);
  }

  let payload: SearchAnalyticsResponse;
  try {
    payload = JSON.parse(bodyText) as SearchAnalyticsResponse;
  } catch {
    throw new Error("Failed to parse Search Analytics response JSON.");
  }

  return Array.isArray(payload.rows) ? payload.rows : [];
}

export async function querySearchAnalyticsAll(params: {
  accessToken: string;
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions: SearchAnalyticsDimension[];
  pageSize: number;
  maxRows: number;
  dimensionFilterGroups?: Array<{
    groupType?: "and" | "or";
    filters: SearchAnalyticsFilter[];
  }>;
}): Promise<QueryAnalyticsResult> {
  const rows: SearchAnalyticsRow[] = [];
  let startRow = 0;
  let truncated = false;

  while (rows.length < params.maxRows) {
    const batchLimit = Math.min(params.pageSize, params.maxRows - rows.length);
    const batch = await querySearchAnalytics({
      accessToken: params.accessToken,
      siteUrl: params.siteUrl,
      startDate: params.startDate,
      endDate: params.endDate,
      dimensions: params.dimensions,
      rowLimit: batchLimit,
      startRow,
      dimensionFilterGroups: params.dimensionFilterGroups,
    });

    rows.push(...batch);

    if (batch.length < batchLimit) {
      break;
    }

    startRow += batch.length;

    if (rows.length >= params.maxRows) {
      truncated = true;
    }
  }

  return { rows, truncated };
}

export function toFiniteNumber(value: unknown): number | undefined {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : undefined;
}

export function normalizePathname(value: string): string | null {
  const trimmed = String(value || "").trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const pathname = parsed.pathname.replace(/\/+$/, "");
      return pathname || "/";
    } catch {
      return null;
    }
  }

  if (!trimmed.startsWith("/")) return null;
  const pathname = trimmed.replace(/\/+$/, "");
  return pathname || "/";
}
