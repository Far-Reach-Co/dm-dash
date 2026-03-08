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

interface StripeTransfer {
  id: string;
  destination?: string;
  metadata?: Record<string, string>;
}

interface StripeTransferListResponse {
  data?: StripeTransfer[];
  has_more?: boolean;
}

interface StripeConnectAccount {
  id: string;
  details_submitted?: boolean;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
}

function readStripeConnectDefaultCountry() {
  const value = process.env.STRIPE_CONNECT_ACCOUNT_COUNTRY?.trim() || "US";
  return value.toUpperCase();
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

export function readStripeAffiliateDiscountCouponId() {
  const couponId = process.env.STRIPE_AFFILIATE_DISCOUNT_COUPON_ID?.trim() || "";
  if (!couponId) {
    throw {
      status: 503,
      message:
        "Affiliate discount coupon is not configured (STRIPE_AFFILIATE_DISCOUNT_COUPON_ID)",
    };
  }
  return couponId;
}

async function stripeRequest(path: string, options: {
  method?: "GET" | "POST";
  searchParams?: URLSearchParams;
  body?: URLSearchParams;
  headers?: Record<string, string>;
}) {
  const method = options.method || "GET";
  const url = `${STRIPE_API_BASE_URL}${path}${options.searchParams ? `?${options.searchParams.toString()}` : ""}`;

  const response = await fetch(url, {
    method,
    headers: {
      ...buildStripeHeaders(),
      ...(options.headers || {}),
    },
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
  discountCouponId?: string | null;
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
  const discountCouponId =
    typeof params.discountCouponId === "string" ? params.discountCouponId.trim() : "";
  if (discountCouponId) {
    body.set("discounts[0][coupon]", discountCouponId);
  } else {
    body.set("allow_promotion_codes", "true");
  }
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

function readConnectAccountState(account: StripeConnectAccount) {
  return {
    detailsSubmitted: Boolean(account?.details_submitted),
    chargesEnabled: Boolean(account?.charges_enabled),
    payoutsEnabled: Boolean(account?.payouts_enabled),
  };
}

export async function createStripeConnectExpressAccount(params?: {
  email?: string | null;
  metadata?: Record<string, string | number>;
}) {
  const body = new URLSearchParams();
  body.set("type", "express");
  body.set("country", readStripeConnectDefaultCountry());
  body.set("capabilities[transfers][requested]", "true");

  if (params?.email) {
    const email = params.email.trim();
    if (email) {
      body.set("email", email);
    }
  }

  const metadataEntries = Object.entries(params?.metadata || {});
  for (const [key, value] of metadataEntries) {
    body.set(`metadata[${key}]`, String(value));
  }

  const response = (await stripeRequest("/accounts", {
    method: "POST",
    body,
  })) as StripeConnectAccount & Record<string, unknown>;

  const id = typeof response.id === "string" ? response.id : "";
  if (!id) {
    throw { status: 502, message: "Stripe did not return a Connect account id" };
  }

  return {
    id,
    ...readConnectAccountState(response),
  };
}

export async function retrieveStripeConnectAccount(accountId: string) {
  const response = (await stripeRequest(`/accounts/${encodeURIComponent(accountId)}`, {
    method: "GET",
  })) as StripeConnectAccount & Record<string, unknown>;

  const id = typeof response.id === "string" ? response.id : "";
  if (!id) {
    throw { status: 502, message: "Stripe did not return a Connect account id" };
  }

  return {
    id,
    ...readConnectAccountState(response),
  };
}

export async function createStripeConnectOnboardingLink(params: {
  accountId: string;
  refreshPath: string;
  returnPath: string;
}) {
  const baseUrl = getPublicAppUrl();
  const body = new URLSearchParams();
  body.set("account", params.accountId);
  body.set("type", "account_onboarding");
  body.set("refresh_url", `${baseUrl}${params.refreshPath}`);
  body.set("return_url", `${baseUrl}${params.returnPath}`);

  const response = await stripeRequest("/account_links", {
    method: "POST",
    body,
  });

  const url = typeof response.url === "string" ? response.url : "";
  if (!url) {
    throw { status: 502, message: "Stripe did not return a Connect onboarding URL" };
  }

  return { url };
}

export async function createStripeTransferToConnectedAccount(params: {
  amountCents: number;
  destinationAccountId: string;
  currency?: string;
  idempotencyKey: string;
  description?: string;
  metadata?: Record<string, string | number>;
}) {
  const body = new URLSearchParams();
  body.set("amount", String(params.amountCents));
  body.set("currency", (params.currency || "usd").toLowerCase());
  body.set("destination", params.destinationAccountId);

  if (params.description) {
    const description = params.description.trim();
    if (description) {
      body.set("description", description);
    }
  }

  const metadataEntries = Object.entries(params.metadata || {});
  for (const [key, value] of metadataEntries) {
    body.set(`metadata[${key}]`, String(value));
  }

  const response = await stripeRequest("/transfers", {
    method: "POST",
    body,
    headers: {
      "Idempotency-Key": params.idempotencyKey,
    },
  });

  const id = typeof response.id === "string" ? response.id : "";
  if (!id) {
    throw { status: 502, message: "Stripe did not return a transfer id" };
  }

  return { id };
}

export async function findStripeTransferByAffiliateCommissionId(params: {
  affiliateCommissionId: string | number;
  destinationAccountId?: string | null;
}) {
  const targetCommissionId = String(params.affiliateCommissionId);
  const targetDestination = params.destinationAccountId?.trim() || "";
  let startingAfter: string | null = null;

  for (let page = 0; page < 20; page++) {
    const searchParams = new URLSearchParams();
    searchParams.set("limit", "100");
    if (startingAfter) {
      searchParams.set("starting_after", startingAfter);
    }

    const response = (await stripeRequest("/transfers", {
      method: "GET",
      searchParams,
    })) as StripeTransferListResponse;

    const transfers = response.data || [];
    for (const transfer of transfers) {
      if (!transfer?.id) continue;
      if (
        String(transfer.metadata?.affiliate_commission_id || "") !==
        targetCommissionId
      ) {
        continue;
      }
      if (
        targetDestination &&
        String(transfer.destination || "").trim() !== targetDestination
      ) {
        continue;
      }
      return { id: transfer.id };
    }

    if (!response.has_more || !transfers.length) {
      return null;
    }
    startingAfter = transfers[transfers.length - 1]?.id || null;
    if (!startingAfter) {
      return null;
    }
  }

  return null;
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
