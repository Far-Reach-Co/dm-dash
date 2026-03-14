import fetch from "node-fetch";

import { generateSitemap } from "./generate-sitemap";
import { hasFlag, parseFlagValue } from "./lib/cliFlags";
import { buildIndexNowConfig, writeIndexNowKeyFile } from "./lib/indexNow";

function usage() {
  console.log(`Usage:
  npm run indexnow:all -- [options]

Options:
  --dry-run                 Generate the sitemap and print the IndexNow payload summary without submitting
  --key <value>             Override INDEXNOW_KEY
  --key-path <path>         Override INDEXNOW_KEY_PATH (default: /{key}.txt)
  --site-url <value>        Override INDEXNOW_SITE_URL (default: https://farreachco.com)
  --endpoint <value>        Override INDEXNOW_ENDPOINT
  --help, -h                Show this help

Examples:
  npm run indexnow:all -- --dry-run
  npm run indexnow:all:prod
  npm run indexnow:all:prod -- --site-url https://farreachco.com`);
}

function ensureMatchingOrigin(urls: string[], expectedOrigin: string): void {
  if (!urls.length) throw new Error("Sitemap generation produced no URLs to submit.");

  for (const url of urls) {
    const origin = new URL(url).origin;
    if (origin !== expectedOrigin) {
      throw new Error(
        `Sitemap URL origin mismatch: expected ${expectedOrigin}, received ${origin} for ${url}.`,
      );
    }
  }
}

async function main() {
  if (hasFlag("--help") || hasFlag("-h")) {
    usage();
    return;
  }

  const config = buildIndexNowConfig({
    endpoint: parseFlagValue("--endpoint"),
    key: parseFlagValue("--key"),
    keyPath: parseFlagValue("--key-path"),
    siteOrigin: parseFlagValue("--site-url"),
  });

  writeIndexNowKeyFile(config);
  console.log(`Wrote IndexNow key file to ${config.publicFilePath}`);
  console.log(`Key location: ${config.keyLocation}`);

  const sitemap = await generateSitemap(config.siteOrigin);
  ensureMatchingOrigin(sitemap.urls, config.siteOrigin);

  if (sitemap.urls.length > 10000) {
    throw new Error(
      `IndexNow accepts at most 10000 URLs per batch, but the sitemap contains ${sitemap.urls.length}.`,
    );
  }

  const payload = {
    host: config.host,
    key: config.key,
    keyLocation: config.keyLocation,
    urlList: sitemap.urls,
  };

  console.log(`Prepared IndexNow batch for ${sitemap.totalUrls} URLs.`);

  if (hasFlag("--dry-run")) {
    console.log("Dry run enabled. Skipping IndexNow submission.");
    console.log(`Endpoint: ${config.endpoint}`);
    console.log(`First URL: ${sitemap.urls[0]}`);
    console.log(`Last URL: ${sitemap.urls[sitemap.urls.length - 1]}`);
    return;
  }

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  const bodyText = (await response.text()).trim();
  if (!response.ok) {
    throw new Error(
      `IndexNow submission failed (${response.status})${bodyText ? `: ${bodyText}` : "."}`,
    );
  }

  console.log(`IndexNow accepted ${sitemap.totalUrls} URLs via ${config.endpoint}.`);
  if (bodyText) {
    console.log(bodyText);
  }
}

main().catch((err) => {
  console.error("Failed to submit IndexNow batch:", err);
  process.exit(1);
});
