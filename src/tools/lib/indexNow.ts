import fs from "fs";
import path from "path";

const DEFAULT_INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
const DEFAULT_SITE_ORIGIN = "https://farreachco.com";
const DEFAULT_KEY_PATH_TEMPLATE = "/{key}.txt";
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

export type IndexNowConfig = {
  endpoint: string;
  host: string;
  key: string;
  keyLocation: string;
  keyPath: string;
  publicFilePath: string;
  siteOrigin: string;
};

function getRequiredString(value: string | undefined, name: string): string {
  const trimmed = String(value || "").trim();
  if (!trimmed) throw new Error(`${name} is required.`);
  return trimmed;
}

function normalizeHttpUrl(value: string, name: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid absolute URL.`);
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`${name} must use http or https.`);
  }

  return parsed;
}

export function getIndexNowKey(rawValue?: string): string {
  const key = getRequiredString(rawValue || process.env.INDEXNOW_KEY, "INDEXNOW_KEY or --key");
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(key)) {
    throw new Error(
      "INDEXNOW_KEY must be 8-128 characters and contain only letters, numbers, underscores, or hyphens.",
    );
  }
  return key;
}

export function resolveIndexNowSiteOrigin(rawValue?: string): string {
  const explicitValue =
    String(rawValue || process.env.INDEXNOW_SITE_URL || "")
      .trim();
  if (explicitValue) {
    return normalizeHttpUrl(explicitValue, "INDEXNOW_SITE_URL or --site-url").origin;
  }

  const publicBaseUrl = String(process.env.PUBLIC_BASE_URL || "").trim();
  if (publicBaseUrl) {
    const publicBaseOrigin = normalizeHttpUrl(publicBaseUrl, "PUBLIC_BASE_URL").origin;
    if (!LOCAL_HOSTNAMES.has(new URL(publicBaseOrigin).hostname)) {
      return publicBaseOrigin;
    }
  }

  return DEFAULT_SITE_ORIGIN;
}

export function resolveIndexNowKeyPath(key: string, rawValue?: string): string {
  const template = String(rawValue || process.env.INDEXNOW_KEY_PATH || DEFAULT_KEY_PATH_TEMPLATE)
    .trim();
  const resolved = template.replace(/\{key\}/g, key).replace(/\/{2,}/g, "/");

  if (!resolved.startsWith("/")) {
    throw new Error("INDEXNOW_KEY_PATH must start with '/'.");
  }
  if (!resolved.endsWith(".txt")) {
    throw new Error("INDEXNOW_KEY_PATH must resolve to a .txt file path.");
  }
  if (resolved.includes("..") || resolved.includes("\\") || resolved.includes("?") || resolved.includes("#")) {
    throw new Error("INDEXNOW_KEY_PATH must be a clean site path without '..', query strings, or fragments.");
  }

  return resolved;
}

export function resolveIndexNowEndpoint(rawValue?: string): string {
  return normalizeHttpUrl(
    String(rawValue || process.env.INDEXNOW_ENDPOINT || DEFAULT_INDEXNOW_ENDPOINT).trim(),
    "INDEXNOW_ENDPOINT or --endpoint",
  ).toString();
}

export function buildIndexNowConfig(options: {
  endpoint?: string;
  key?: string;
  keyPath?: string;
  siteOrigin?: string;
} = {}): IndexNowConfig {
  const key = getIndexNowKey(options.key);
  const siteOrigin = resolveIndexNowSiteOrigin(options.siteOrigin);
  const keyPath = resolveIndexNowKeyPath(key, options.keyPath);
  const endpoint = resolveIndexNowEndpoint(options.endpoint);
  const publicFilePath = path.resolve(process.cwd(), "public", keyPath.replace(/^\/+/, ""));

  return {
    endpoint,
    host: new URL(siteOrigin).host,
    key,
    keyLocation: `${siteOrigin}${keyPath}`,
    keyPath,
    publicFilePath,
    siteOrigin,
  };
}

export function writeIndexNowKeyFile(config: Pick<IndexNowConfig, "key" | "publicFilePath">): void {
  fs.mkdirSync(path.dirname(config.publicFilePath), { recursive: true });
  fs.writeFileSync(config.publicFilePath, config.key, "utf8");
}
