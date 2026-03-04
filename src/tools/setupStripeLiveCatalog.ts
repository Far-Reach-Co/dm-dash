import fetch from "node-fetch";

type StripeInterval = "month" | "year";

interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  metadata?: Record<string, string>;
}

interface StripePrice {
  id: string;
  product: string | { id: string };
  lookup_key: string | null;
  active: boolean;
  currency: string;
  unit_amount: number | null;
  recurring?: {
    interval?: string;
  } | null;
}

interface StripeListResponse<T> {
  data: T[];
  has_more?: boolean;
}

interface PlanPriceConfig {
  lookupKey: string;
  interval: StripeInterval;
  unitAmount: number;
  envKey: string;
}

interface PlanConfig {
  slug: string;
  productName: string;
  productDescription: string;
  prices: PlanPriceConfig[];
}

const PLAN_CONFIGS: PlanConfig[] = [
  {
    slug: "pro_user",
    productName: "Pro User",
    productDescription:
      "DM Dash Pro User plan. Personal-scope limits and features.",
    prices: [
      {
        lookupKey: "pro_user_monthly",
        interval: "month",
        unitAmount: 1000,
        envKey: "STRIPE_PRICE_ID_PRO_USER_MONTHLY",
      },
      {
        lookupKey: "pro_user_yearly",
        interval: "year",
        unitAmount: 10000,
        envKey: "STRIPE_PRICE_ID_PRO_USER_YEARLY",
      },
    ],
  },
  {
    slug: "pro_wyrld",
    productName: "Pro Wyrld",
    productDescription:
      "DM Dash Pro Wyrld plan. Wyrld-scope limits and features.",
    prices: [
      {
        lookupKey: "pro_wyrld_monthly",
        interval: "month",
        unitAmount: 1000,
        envKey: "STRIPE_PRICE_ID_PRO_WYRLD_MONTHLY",
      },
      {
        lookupKey: "pro_wyrld_yearly",
        interval: "year",
        unitAmount: 10000,
        envKey: "STRIPE_PRICE_ID_PRO_WYRLD_YEARLY",
      },
    ],
  },
];

function readLiveStripeKey() {
  const key = process.env.STRIPE_SECRET_KEY?.trim() || "";
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  if (!key.startsWith("sk_live_")) {
    throw new Error(
      "STRIPE_SECRET_KEY is not a live key (expected prefix sk_live_)",
    );
  }
  return key;
}

function buildHeaders(stripeKey: string) {
  return {
    Authorization: `Bearer ${stripeKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

async function stripeRequest<T>(params: {
  stripeKey: string;
  path: string;
  method?: "GET" | "POST";
  query?: URLSearchParams;
  body?: URLSearchParams;
}): Promise<T> {
  const url =
    `https://api.stripe.com/v1${params.path}` +
    (params.query ? `?${params.query.toString()}` : "");
  const response = await fetch(url, {
    method: params.method || "GET",
    headers: buildHeaders(params.stripeKey),
    body: params.body ? params.body.toString() : undefined,
  });
  const text = await response.text();
  const parsed = text ? (JSON.parse(text) as any) : {};
  if (!response.ok) {
    const message =
      parsed?.error?.message ||
      `Stripe request failed (${response.status}) for ${params.path}`;
    throw new Error(message);
  }
  return parsed as T;
}

function productIdValue(value: StripePrice["product"]) {
  return typeof value === "string" ? value : value?.id;
}

async function listProducts(stripeKey: string) {
  const query = new URLSearchParams();
  query.set("limit", "100");
  query.set("active", "true");
  const response = await stripeRequest<StripeListResponse<StripeProduct>>({
    stripeKey,
    path: "/products",
    method: "GET",
    query,
  });
  return response.data || [];
}

async function createProduct(stripeKey: string, plan: PlanConfig) {
  const body = new URLSearchParams();
  body.set("name", plan.productName);
  body.set("description", plan.productDescription);
  body.set("metadata[dm_dash_plan_slug]", plan.slug);
  body.set("metadata[managed_by]", "dm_dash_setup_live_catalog");
  return await stripeRequest<StripeProduct>({
    stripeKey,
    path: "/products",
    method: "POST",
    body,
  });
}

async function ensureProduct(stripeKey: string, plan: PlanConfig) {
  const products = await listProducts(stripeKey);
  const bySlug = products.find(
    (product) => product.metadata?.dm_dash_plan_slug === plan.slug,
  );
  if (bySlug) return bySlug;

  const byName = products.find((product) => product.name === plan.productName);
  if (byName) return byName;

  return await createProduct(stripeKey, plan);
}

async function listPricesByLookupKey(stripeKey: string, lookupKey: string) {
  const query = new URLSearchParams();
  query.set("lookup_keys[0]", lookupKey);
  query.set("limit", "100");
  const response = await stripeRequest<StripeListResponse<StripePrice>>({
    stripeKey,
    path: "/prices",
    method: "GET",
    query,
  });
  return response.data || [];
}

async function createPrice(params: {
  stripeKey: string;
  productId: string;
  lookupKey: string;
  interval: StripeInterval;
  unitAmount: number;
}) {
  const body = new URLSearchParams();
  body.set("product", params.productId);
  body.set("currency", "usd");
  body.set("unit_amount", String(params.unitAmount));
  body.set("recurring[interval]", params.interval);
  body.set("lookup_key", params.lookupKey);
  body.set("transfer_lookup_key", "true");
  body.set("active", "true");

  return await stripeRequest<StripePrice>({
    stripeKey: params.stripeKey,
    path: "/prices",
    method: "POST",
    body,
  });
}

async function ensurePrice(params: {
  stripeKey: string;
  productId: string;
  config: PlanPriceConfig;
}) {
  const prices = await listPricesByLookupKey(params.stripeKey, params.config.lookupKey);
  const exact = prices.find((price) => {
    return (
      price.active &&
      productIdValue(price.product) === params.productId &&
      price.currency.toLowerCase() === "usd" &&
      Number(price.unit_amount) === params.config.unitAmount &&
      String(price.recurring?.interval || "") === params.config.interval
    );
  });
  if (exact) return { price: exact, created: false };

  const created = await createPrice({
    stripeKey: params.stripeKey,
    productId: params.productId,
    lookupKey: params.config.lookupKey,
    interval: params.config.interval,
    unitAmount: params.config.unitAmount,
  });
  return { price: created, created: true };
}

async function main() {
  const stripeKey = readLiveStripeKey();
  const outputLines: string[] = [];

  console.log("Setting up Stripe live catalog for DM Dash...");
  for (const plan of PLAN_CONFIGS) {
    const product = await ensureProduct(stripeKey, plan);
    console.log(`Product: ${plan.productName} -> ${product.id}`);

    for (const priceConfig of plan.prices) {
      const result = await ensurePrice({
        stripeKey,
        productId: product.id,
        config: priceConfig,
      });
      const marker = result.created ? "created" : "existing";
      console.log(
        `  Price (${marker}): ${priceConfig.lookupKey} -> ${result.price.id}`,
      );
      outputLines.push(`${priceConfig.envKey}=${result.price.id}`);
    }
  }

  console.log("\nSet these in your live environment:");
  for (const line of outputLines) {
    console.log(line);
  }
}

main().catch((err) => {
  console.error("Stripe live catalog setup failed.");
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
