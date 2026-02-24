import { getSignedUrl as getCloudFrontSignedUrl } from "@aws-sdk/cloudfront-signer";
import path = require("path");
import fs = require("fs");
import { Image } from "../queries/images";
import { redisClient } from "../../lib/socketUsers";
import logger from "../../lib/logger.js";

// Cache CloudFront signing credentials at module level (read once on startup)
const cloudFrontPrivateKeyPath = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "private_frc_cloudfront_key.pem",
);
const cloudFrontPrivateKey = fs.readFileSync(cloudFrontPrivateKeyPath, "utf8");
const cloudFrontKeyId = process.env.CLOUDFRONT_KEY_ID as string;

// Signed URL cache settings - cache for 2.5 days (URLs expire in 3 days)
const SIGNED_URL_CACHE_TTL_SECONDS = 60 * 60 * 24 * 2.5; // 2.5 days
const SIGNED_URL_CACHE_PREFIX = "signed_url:v2:";

export function getSignedUrlCacheKey(imageId: number | string): string {
  return `${SIGNED_URL_CACHE_PREFIX}${imageId}`;
}

export async function invalidateSignedUrlCache(
  imageId: number | string,
): Promise<void> {
  await redisClient.del(getSignedUrlCacheKey(imageId));
}

export function generateSignedUrl(fileName: string): string {
  const cloudFrontUrl = `https://${process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN}/images/${fileName}`;
  const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 3 * 1000); // 3 days
  return getCloudFrontSignedUrl({
    url: cloudFrontUrl,
    keyPairId: cloudFrontKeyId,
    privateKey: cloudFrontPrivateKey,
    dateLessThan: expiresAt.toISOString(),
  });
}

function isCachedSignedUrlUsable(cachedUrl: string): boolean {
  try {
    const parsed = new URL(cachedUrl);
    const expectedHost = String(process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN || "").trim();
    if (!expectedHost) return false;
    if (parsed.hostname !== expectedHost) return false;
    if (!parsed.pathname.startsWith("/images/")) return false;

    const cachedKeyPairId = parsed.searchParams.get("Key-Pair-Id");
    if (!cachedKeyPairId || cachedKeyPairId !== cloudFrontKeyId) {
      return false;
    }

    const expiresRaw = parsed.searchParams.get("Expires");
    if (expiresRaw) {
      const expiresSeconds = Number(expiresRaw);
      if (!Number.isFinite(expiresSeconds)) return false;
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (expiresSeconds <= nowSeconds + 60) return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function cacheSignedUrl(imageId: number | string, url: string): void {
  redisClient
    .setEx(getSignedUrlCacheKey(imageId), SIGNED_URL_CACHE_TTL_SECONDS, url)
    .catch((err) =>
      logger.warn({ err, imageId }, "Failed to cache signed URL"),
    );
}

export async function getSignedUrls(images: Image[]) {
  const urls: { [key: string]: string } = {};
  const uncachedImages: { id: number | string; url: string }[] = [];

  // Batch check cache for all images
  const cacheKeys = images.map((imageData) =>
    getSignedUrlCacheKey(imageData.id),
  );
  const cachedUrls = cacheKeys.length
    ? await redisClient.mGet(cacheKeys)
    : [];

  for (let i = 0; i < images.length; i++) {
    const imageData = images[i];
    const cachedUrl = cachedUrls[i];
    if (cachedUrl && isCachedSignedUrlUsable(cachedUrl)) {
      urls[imageData.id] = cachedUrl;
    } else {
      const signedUrl = generateSignedUrl(imageData.file_name);
      urls[imageData.id] = signedUrl;
      uncachedImages.push({ id: imageData.id, url: signedUrl });
    }
  }

  // Cache new URLs in background (don't await)
  if (uncachedImages.length) {
    Promise.all(
      uncachedImages.map(({ id, url }) =>
        redisClient
          .setEx(getSignedUrlCacheKey(id), SIGNED_URL_CACHE_TTL_SECONDS, url)
          .catch((err) =>
            logger.warn({ err, imageId: id }, "Failed to cache signed URL"),
          ),
      ),
    );
  }

  return urls;
}
