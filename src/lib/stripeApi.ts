import fetch from "node-fetch";
import { getPublicAppUrl } from "./emailPreferences";

export type BillingInterval = "monthly" | "yearly";
export type BillingScope = "user" | "project";

const STRIPE_API_BASE_URL = "https://api.stripe.com/v1";

interface StripeErrorResponse {
  error?: {
    message?: string;
  };
}

interface StripePrice {
  id: string;
  lookup_key: string | null;
  active: boolean;
  recurring?: {
    interval?: string;
  };
}

interface StripePriceListResponse {
  data?: StripePrice[];
}

function readStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY?.trim() || "";
  if (!key) {
    throw {
      status: 503,
      message: "Stripe secret key is not configured (STRIPE_SECRET_KEY)",
    };
  }
  return key;
}

function intervalToStripeRecurringInterval(interval: BillingInterval) {
  return interval === "yearly" ? "year" : "month";
}

function getDefaultLookupKey(scope: BillingScope, interval: BillingInterval) {
  if (scope === "user") {
    return interval === "yearly" ? "pro_user_yearly" : "pro_user_monthly";
  }
  return interval === "yearly" ? "pro_wyrld_yearly" : "pro_wyrld_monthly";
}

function getPriceLookupKey(scope: BillingScope, interval: BillingInterval) {
  if (scope === "user") {
    return (
      process.env[
        interval === "yearly"
          ? "STRIPE_PRICE_LOOKUP_PRO_USER_YEARLY"
          : "STRIPE_PRICE_LOOKUP_PRO_USER_MONTHLY"
      ]?.trim() || getDefaultLookupKey(scope, interval)
    );
  }

  return (
    process.env[
      interval === "yearly"
        ? "STRIPE_PRICE_LOOKUP_PRO_WYRLD_YEARLY"
        : "STRIPE_PRICE_LOOKUP_PRO_WYRLD_MONTHLY"
    ]?.trim() || getDefaultLookupKey(scope, interval)
  );
}

function getPriceIdOverride(scope: BillingScope, interval: BillingInterval) {
  if (scope === "user") {
    return process.env[
      interval === "yearly"
        ? "STRIPE_PRICE_ID_PRO_USER_YEARLY"
        : "STRIPE_PRICE_ID_PRO_USER_MONTHLY"
    ]?.trim();
  }

  return process.env[
    interval === "yearly"
      ? "STRIPE_PRICE_ID_PRO_WYRLD_YEARLY"
      : "STRIPE_PRICE_ID_PRO_WYRLD_MONTHLY"
  ]?.trim();
}

function buildStripeHeaders() {
  return {
    Authorization: `Bearer ${readStripeSecretKey()}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

async function stripeRequest(path: string, options: {
  method?: "GET" | "POST";
  searchParams?: URLSearchParams;
  body?: URLSearchParams;
}) {
  const method = options.method || "GET";
  const url = `${STRIPE_API_BASE_URL}${path}${options.searchParams ? `?${options.searchParams.toString()}` : ""}`;

  const response = await fetch(url, {
    method,
    headers: buildStripeHeaders(),
    body: options.body ? options.body.toString() : undefined,
  });

  const text = await response.text();
  const parsed = text ? (JSON.parse(text) as StripeErrorResponse & Record<string, unknown>) : {};

  if (!response.ok) {
    throw {
      status: 502,
      message:
        parsed?.error?.message || `Stripe API request failed with status ${response.status}`,
    };
  }

  return parsed;
}

export async function resolveStripePriceIdForScope(params: {
  scope: BillingScope;
  interval: BillingInterval;
}) {
  const override = getPriceIdOverride(params.scope, params.interval);
  if (override) return override;

  const lookupKey = getPriceLookupKey(params.scope, params.interval);
  const searchParams = new URLSearchParams();
  searchParams.append("lookup_keys[0]", lookupKey);
  searchParams.append("active", "true");
  searchParams.append("limit", "10");

  const response = (await stripeRequest("/prices", {
    method: "GET",
    searchParams,
  })) as StripePriceListResponse;

  const expectedInterval = intervalToStripeRecurringInterval(params.interval);
  const price = (response.data || []).find((candidate) =>
    candidate.active && candidate.recurring?.interval === expectedInterval,
  ) || (response.data || [])[0];

  if (!price?.id) {
    throw {
      status: 503,
      message: `No active Stripe price found for lookup key '${lookupKey}'`,
    };
  }

  return price.id;
}

export async function createStripeCheckoutSession(params: {
  priceId: string;
  customerId?: string | null;
  customerEmail?: string | null;
  clientReferenceId?: string | null;
  metadata?: Record<string, string | number>;
  subscriptionMetadata?: Record<string, string | number>;
  subscriptionDescription?: string | null;
  successPath: string;
  cancelPath: string;
}) {
  const baseUrl = getPublicAppUrl();
  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("line_items[0][price]", params.priceId);
  body.set("line_items[0][quantity]", "1");
  body.set("allow_promotion_codes", "true");
  body.set(
    "success_url",
    `${baseUrl}${params.successPath}${params.successPath.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`,
  );
  body.set("cancel_url", `${baseUrl}${params.cancelPath}`);

  if (params.customerId) {
    body.set("customer", params.customerId);
  } else if (params.customerEmail) {
    body.set("customer_email", params.customerEmail);
  }

  if (params.clientReferenceId) {
    body.set("client_reference_id", params.clientReferenceId);
  }

  const metadataEntries = Object.entries(params.metadata || {});
  for (const [key, value] of metadataEntries) {
    body.set(`metadata[${key}]`, String(value));
  }

  const subscriptionMetadataEntries = Object.entries(params.subscriptionMetadata || {});
  for (const [key, value] of subscriptionMetadataEntries) {
    body.set(`subscription_data[metadata][${key}]`, String(value));
  }

  if (typeof params.subscriptionDescription === "string") {
    const description = params.subscriptionDescription.trim();
    if (description) {
      body.set("subscription_data[description]", description);
    }
  }

  const response = await stripeRequest("/checkout/sessions", {
    method: "POST",
    body,
  });

  const url = typeof response.url === "string" ? response.url : "";
  if (!url) {
    throw { status: 502, message: "Stripe did not return a checkout session URL" };
  }

  return { url };
}

export async function createStripeBillingPortalSession(params: {
  customerId: string;
  returnPath: string;
}) {
  const baseUrl = getPublicAppUrl();
  const body = new URLSearchParams();
  body.set("customer", params.customerId);
  body.set("return_url", `${baseUrl}${params.returnPath}`);

  const response = await stripeRequest("/billing_portal/sessions", {
    method: "POST",
    body,
  });

  const url = typeof response.url === "string" ? response.url : "";
  if (!url) {
    throw { status: 502, message: "Stripe did not return a customer portal URL" };
  }

  return { url };
}

export function parseBillingInterval(value: unknown): BillingInterval {
  if (typeof value !== "string") return "monthly";
  const normalized = value.trim().toLowerCase();
  if (normalized === "yearly" || normalized === "annual" || normalized === "year") {
    return "yearly";
  }
  return "monthly";
}
