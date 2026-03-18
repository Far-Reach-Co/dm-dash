function getOptionalEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function getRequiredEnv(name: string): string {
  const value = getOptionalEnv(name);
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

function getPositiveIntegerEnv(name: string, fallback: number): number {
  const rawValue = getOptionalEnv(name);
  if (!rawValue) return fallback;
  const value = Number(rawValue);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

function getOptionalEnvUpper(name: string, fallback: string): string {
  return (getOptionalEnv(name) || fallback).toUpperCase();
}

function resolveServerEnv(): "dev" | "prod" | "test" {
  const env = (getOptionalEnv("SERVER_ENV") || "dev").toLowerCase();
  if (env === "dev" || env === "prod" || env === "test") {
    return env;
  }
  throw new Error("SERVER_ENV must be one of: dev, prod, test");
}

export const SECRET_KEY = getRequiredEnv("SECRET_KEY");
export const SERVER_ENV = resolveServerEnv();
export const isProd = SERVER_ENV === "prod";
export const isDev = SERVER_ENV === "dev";
export const PORT = getPositiveIntegerEnv("PORT", 4000);
export const REDIS_URL = getRequiredEnv("REDIS_URL");
export const PUBLIC_BASE_URL = getOptionalEnv("PUBLIC_BASE_URL");

export const AWS_REGION = getOptionalEnv("AWS_REGION") || "us-east-1";
export const AWS_ACCESS_KEY_ID = getOptionalEnv("AWS_ACCESS_KEY_ID");
export const AWS_SECRET_ACCESS_KEY = getOptionalEnv("AWS_SECRET_ACCESS_KEY");
export const CLOUDFRONT_KEY_ID = getOptionalEnv("CLOUDFRONT_KEY_ID");
export const CLOUDFRONT_DISTRIBUTION_DOMAIN = getOptionalEnv(
  "CLOUDFRONT_DISTRIBUTION_DOMAIN",
);

export const BOT_PUBLIC_KEY = getOptionalEnv("BOT_PUBLIC_KEY");
export const BOT_APP_ID = getOptionalEnv("BOT_APP_ID");
export const DISCORD_TOKEN = getOptionalEnv("DISCORD_TOKEN");

export const MAIL_USERNAME = getOptionalEnv("MAIL_USERNAME");
export const MAIL_PASSWORD = getOptionalEnv("MAIL_PASSWORD");

export const STRIPE_SECRET_KEY = getOptionalEnv("STRIPE_SECRET_KEY");
export const STRIPE_CONNECT_ACCOUNT_COUNTRY = getOptionalEnvUpper(
  "STRIPE_CONNECT_ACCOUNT_COUNTRY",
  "US",
);
export const STRIPE_AFFILIATE_DISCOUNT_COUPON_ID = getOptionalEnv(
  "STRIPE_AFFILIATE_DISCOUNT_COUPON_ID",
);
export const STRIPE_WEBHOOK_SECRET = getOptionalEnv("STRIPE_WEBHOOK_SECRET");
export const STRIPE_CONNECT_WEBHOOK_SECRET = getOptionalEnv(
  "STRIPE_CONNECT_WEBHOOK_SECRET",
);
export const STRIPE_WEBHOOK_TOLERANCE_SECONDS = getPositiveIntegerEnv(
  "STRIPE_WEBHOOK_TOLERANCE_SECONDS",
  300,
);
export const STRIPE_PRICE_LOOKUP_PRO_USER_MONTHLY = getOptionalEnv(
  "STRIPE_PRICE_LOOKUP_PRO_USER_MONTHLY",
);
export const STRIPE_PRICE_LOOKUP_PRO_USER_YEARLY = getOptionalEnv(
  "STRIPE_PRICE_LOOKUP_PRO_USER_YEARLY",
);
export const STRIPE_PRICE_LOOKUP_PRO_WYRLD_MONTHLY = getOptionalEnv(
  "STRIPE_PRICE_LOOKUP_PRO_WYRLD_MONTHLY",
);
export const STRIPE_PRICE_LOOKUP_PRO_WYRLD_YEARLY = getOptionalEnv(
  "STRIPE_PRICE_LOOKUP_PRO_WYRLD_YEARLY",
);
export const STRIPE_PRICE_ID_PRO_USER_MONTHLY = getOptionalEnv(
  "STRIPE_PRICE_ID_PRO_USER_MONTHLY",
);
export const STRIPE_PRICE_ID_PRO_USER_YEARLY = getOptionalEnv(
  "STRIPE_PRICE_ID_PRO_USER_YEARLY",
);
export const STRIPE_PRICE_ID_PRO_WYRLD_MONTHLY = getOptionalEnv(
  "STRIPE_PRICE_ID_PRO_WYRLD_MONTHLY",
);
export const STRIPE_PRICE_ID_PRO_WYRLD_YEARLY = getOptionalEnv(
  "STRIPE_PRICE_ID_PRO_WYRLD_YEARLY",
);

export const AFFILIATE_COMMISSION_ALERT_EMAIL = getOptionalEnv(
  "AFFILIATE_COMMISSION_ALERT_EMAIL",
);
export const AFFILIATE_COMMISSION_ALERT_EMAILS = getOptionalEnv(
  "AFFILIATE_COMMISSION_ALERT_EMAILS",
);

export const GUEST_SANDBOX_TTL_SECONDS = getPositiveIntegerEnv(
  "GUEST_SANDBOX_TTL_SECONDS",
  12 * 60 * 60,
);
export const GUEST_SANDBOX_MAX_IMAGES = getPositiveIntegerEnv(
  "GUEST_SANDBOX_MAX_IMAGES",
  30,
);
export const GUEST_SANDBOX_MAX_DATA_BYTES = getPositiveIntegerEnv(
  "GUEST_SANDBOX_MAX_DATA_BYTES",
  2 * 1024 * 1024,
);
