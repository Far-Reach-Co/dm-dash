import { createHash } from "crypto";
import { NextFunction, Request, Response } from "express";
import {
  addBillingEventLogQuery,
  removeBillingEventLogByStripeEventIdQuery,
} from "../queries/billingEventLog";
import {
  getBillingCustomerByStripeCustomerIdQuery,
  upsertBillingCustomerQuery,
} from "../queries/billingCustomers";
import {
  addAffiliateCommissionQuery,
  getAffiliateCommissionByStripeSubscriptionIdQuery,
} from "../queries/affiliateCommissions";
import {
  getAffiliateCodeByCodeQuery,
  getAffiliateCodeByIdQuery,
} from "../queries/affiliateCodes";
import {
  BillingScope,
  BillingSubscription,
  getBillingSubscriptionByStripeSubscriptionIdQuery,
  upsertBillingSubscriptionByStripeIdQuery,
} from "../queries/billingSubscriptions";
import {
  recomputeProjectProEntitlement,
  recomputeUserProEntitlement,
} from "../../lib/billingEntitlements";
import { notifyAffiliateCommissionCreatedAsync } from "../../lib/emailNotifications";
import { AFFILIATE_COMMISSION_PERCENT } from "../../lib/affiliateConfig";
import { normalizeAffiliateCode } from "../../lib/affiliate";
import { verifyStripeWebhookSignature } from "../../lib/stripeWebhookAuth";
import logger from "../../lib/logger";

interface StripeWebhookEvent {
  id: string;
  type: string;
  data?: {
    object?: any;
  };
}

function readOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function readStripeObjectId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return readOptionalString(value);
  if (typeof value === "object" && !Array.isArray(value)) {
    return readOptionalString((value as Record<string, unknown>).id);
  }
  return null;
}

function readPositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function readNonNegativeInt(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function readScope(value: unknown): BillingScope | null {
  const scope = readOptionalString(value)?.toLowerCase();
  if (scope === "user" || scope === "project") return scope;
  return null;
}

function readMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function readIsoTimeFromUnixSeconds(value: unknown): string | null {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(seconds * 1000).toISOString();
}

function normalizeStripeInterval(value: unknown): "monthly" | "yearly" | null {
  const interval = readOptionalString(value)?.toLowerCase();
  if (interval === "month") return "monthly";
  if (interval === "year") return "yearly";
  return null;
}

function readCheckoutSessionCommissionBaseAmountCents(session: any): number | null {
  return (
    readNonNegativeInt(session?.amount_subtotal) ??
    readNonNegativeInt(session?.amount_total)
  );
}

function readInvoiceCommissionBaseAmountCents(invoice: any): number | null {
  return (
    readNonNegativeInt(invoice?.subtotal) ??
    readNonNegativeInt(invoice?.amount_paid) ??
    readNonNegativeInt(invoice?.amount_due) ??
    readNonNegativeInt(invoice?.total)
  );
}

function readSubscriptionCommissionBaseAmountCents(subscription: any): number | null {
  const firstItem = subscription?.items?.data?.[0];
  const unitAmountCents =
    readNonNegativeInt(firstItem?.price?.unit_amount) ??
    readNonNegativeInt(firstItem?.plan?.amount);
  if (unitAmountCents === null) return null;
  const quantity = readPositiveInt(firstItem?.quantity) || 1;
  return unitAmountCents * quantity;
}

function calculateAffiliateCommissionAmountCents(baseAmountCents: number | null) {
  if (!baseAmountCents || baseAmountCents <= 0) return null;
  const amountCents = Math.round(
    (baseAmountCents * AFFILIATE_COMMISSION_PERCENT) / 100,
  );
  return amountCents > 0 ? amountCents : null;
}

function isCheckoutSessionPaymentSuccessful(paymentStatus: unknown) {
  const status = readOptionalString(paymentStatus)?.toLowerCase();
  return status === "paid" || status === "no_payment_required";
}

async function maybeCreateAffiliateCommission(params: {
  stripeSubscriptionId: string | null;
  stripeInvoiceId?: string | null;
  userId: number | null;
  scope: BillingScope | null;
  projectId: number | null;
  commissionBaseAmountCents?: number | null;
  metadata: Record<string, unknown>;
}) {
  if (!params.stripeSubscriptionId || !params.userId || !params.scope) return;
  if (params.scope === "project" && !params.projectId) return;

  const existingCommissionData =
    await getAffiliateCommissionByStripeSubscriptionIdQuery(
      params.stripeSubscriptionId,
    );
  if (existingCommissionData.rows[0]) return;

  const affiliateCodeId = readPositiveInt(params.metadata.affiliate_code_id);
  const affiliateCodeRaw = readOptionalString(params.metadata.affiliate_code);
  const affiliateCode = normalizeAffiliateCode(affiliateCodeRaw);
  const codeData = affiliateCodeId
    ? await getAffiliateCodeByIdQuery(affiliateCodeId)
    : affiliateCode
      ? await getAffiliateCodeByCodeQuery(affiliateCode)
      : { rows: [] };
  const code = codeData.rows[0];
  if (!code) return;

  const commissionAmountCents = calculateAffiliateCommissionAmountCents(
    params.commissionBaseAmountCents || null,
  );
  if (!commissionAmountCents) {
    logger.warn(
      {
        stripeSubscriptionId: params.stripeSubscriptionId,
        stripeInvoiceId: params.stripeInvoiceId,
        scope: params.scope,
        userId: params.userId,
        commissionBaseAmountCents: params.commissionBaseAmountCents || null,
        commissionPercent: AFFILIATE_COMMISSION_PERCENT,
      },
      "Skipped affiliate commission creation due to missing base amount",
    );
    return;
  }

  try {
    const commissionData = await addAffiliateCommissionQuery({
      stripe_subscription_id: params.stripeSubscriptionId,
      stripe_invoice_id: params.stripeInvoiceId || null,
      affiliate_code_id: code.id,
      user_id: params.userId,
      project_id: params.scope === "project" ? params.projectId : null,
      scope: params.scope,
      amount_cents: commissionAmountCents,
    });
    const commission = commissionData.rows[0];
    if (commission) {
      notifyAffiliateCommissionCreatedAsync({
        commissionId: Number(commission.id),
        affiliateCode: code.code,
        collaboratorName: code.collaborator_name,
        amountCents: Number(commission.amount_cents),
        scope: commission.scope,
        userId: Number(commission.user_id),
        projectId:
          commission.project_id === null || commission.project_id === undefined
            ? null
            : Number(commission.project_id),
        stripeSubscriptionId: commission.stripe_subscription_id,
        stripeInvoiceId: commission.stripe_invoice_id,
        createdAt: commission.created_at,
      });
    }
  } catch (err: any) {
    if (err?.code === "23505") return;
    throw err;
  }
}

async function resolveStripeCustomerUserId(
  stripeCustomerId: string | null,
  metadataUserId: number | null,
) {
  if (metadataUserId) return metadataUserId;
  if (!stripeCustomerId) return null;
  const customerData = await getBillingCustomerByStripeCustomerIdQuery(stripeCustomerId);
  const customer = customerData.rows[0];
  return customer ? Number(customer.user_id) : null;
}

async function upsertStripeCustomerMapping(params: {
  stripeCustomerId: string | null;
  userId: number | null;
}) {
  if (!params.stripeCustomerId || !params.userId) return;
  await upsertBillingCustomerQuery({
    user_id: params.userId,
    stripe_customer_id: params.stripeCustomerId,
  });
}

async function handleStripeCheckoutSessionCompleted(session: any) {
  const metadata = readMetadata(session?.metadata);
  const stripeCustomerId = readOptionalString(session?.customer);
  const userId =
    readPositiveInt(metadata.user_id) || readPositiveInt(session?.client_reference_id);

  await upsertStripeCustomerMapping({ stripeCustomerId, userId });

  if (!isCheckoutSessionPaymentSuccessful(session?.payment_status)) return;

  const stripeSubscriptionId = readOptionalString(session?.subscription);
  const scope: BillingScope =
    readScope(metadata.scope) || (readPositiveInt(metadata.project_id) ? "project" : "user");
  const projectId = scope === "project" ? readPositiveInt(metadata.project_id) : null;

  await maybeCreateAffiliateCommission({
    stripeSubscriptionId,
    stripeInvoiceId: readOptionalString(session?.invoice),
    userId,
    scope,
    projectId,
    commissionBaseAmountCents: readCheckoutSessionCommissionBaseAmountCents(session),
    metadata,
  });
}

async function syncStripeSubscription(subscription: any) {
  const stripeSubscriptionId = readOptionalString(subscription?.id);
  if (!stripeSubscriptionId) {
    throw { status: 400, message: "Stripe subscription id is required" };
  }

  const existingData = await getBillingSubscriptionByStripeSubscriptionIdQuery(
    stripeSubscriptionId,
  );
  const existing = existingData.rows[0] || null;

  const stripeCustomerId =
    readOptionalString(subscription?.customer) || existing?.stripe_customer_id || null;
  if (!stripeCustomerId) {
    throw {
      status: 400,
      message: `Stripe customer id missing for subscription ${stripeSubscriptionId}`,
    };
  }

  const metadata = readMetadata(subscription?.metadata);
  const metadataUserId = readPositiveInt(metadata.user_id);
  const userId = await resolveStripeCustomerUserId(stripeCustomerId, metadataUserId);
  if (!userId) {
    throw {
      status: 400,
      message: `Unable to resolve user for subscription ${stripeSubscriptionId}`,
    };
  }

  await upsertStripeCustomerMapping({ stripeCustomerId, userId });

  const metadataProjectId = readPositiveInt(metadata.project_id);
  const scope: BillingScope =
    readScope(metadata.scope) || (metadataProjectId ? "project" : existing?.scope || "user");
  const projectId =
    scope === "project"
      ? metadataProjectId || existing?.project_id || null
      : null;

  if (scope === "project" && !projectId) {
    throw {
      status: 400,
      message: `Project scope subscription ${stripeSubscriptionId} is missing project_id metadata`,
    };
  }

  const stripePriceId =
    readOptionalString(subscription?.items?.data?.[0]?.price?.id) ||
    existing?.stripe_price_id ||
    null;
  const normalizedInterval =
    normalizeStripeInterval(subscription?.items?.data?.[0]?.price?.recurring?.interval) ||
    normalizeStripeInterval(metadata.interval) ||
    normalizeStripeInterval(existing?.metadata_json?.interval) ||
    null;
  const metadataForStorage: Record<string, unknown> = { ...metadata };
  if (normalizedInterval) {
    metadataForStorage.interval = normalizedInterval;
  }

  const subscriptionStatus =
    readOptionalString(subscription?.status) || existing?.status || "unknown";

  await upsertBillingSubscriptionByStripeIdQuery({
    user_id: userId,
    project_id: projectId,
    scope,
    stripe_subscription_id: stripeSubscriptionId,
    stripe_customer_id: stripeCustomerId,
    stripe_price_id: stripePriceId,
    status: subscriptionStatus,
    current_period_end:
      readIsoTimeFromUnixSeconds(subscription?.current_period_end) ||
      existing?.current_period_end ||
      null,
    cancel_at_period_end:
      typeof subscription?.cancel_at_period_end === "boolean"
        ? subscription.cancel_at_period_end
        : Boolean(existing?.cancel_at_period_end),
    metadata_json: metadataForStorage,
  });

  // Fallback: if checkout/invoice webhook ordering misses commission creation,
  // create it on active/trialing subscription events as a safe backstop.
  const normalizedStatus = subscriptionStatus.toLowerCase();
  if (normalizedStatus === "active" || normalizedStatus === "trialing") {
    await maybeCreateAffiliateCommission({
      stripeSubscriptionId,
      userId,
      scope,
      projectId,
      commissionBaseAmountCents: readSubscriptionCommissionBaseAmountCents(
        subscription,
      ),
      metadata: metadataForStorage,
    });
  }

  await recomputeUserProEntitlement(userId);
  if (scope === "project" && projectId) {
    await recomputeProjectProEntitlement(projectId);
  }
}

function readInvoiceSubscriptionId(invoice: any): string | null {
  return (
    readStripeObjectId(invoice?.subscription) ||
    readStripeObjectId(invoice?.parent?.subscription_details?.subscription) ||
    readStripeObjectId(
      invoice?.lines?.data?.[0]?.parent?.subscription_item_details?.subscription,
    ) ||
    null
  );
}

function readInvoiceSubscriptionMetadata(invoice: any): Record<string, unknown> {
  const candidates = [
    readMetadata(invoice?.parent?.subscription_details?.metadata),
    readMetadata(invoice?.lines?.data?.[0]?.parent?.subscription_item_details?.metadata),
    readMetadata(invoice?.metadata),
  ];
  for (const candidate of candidates) {
    if (Object.keys(candidate).length) return candidate;
  }
  return {};
}

async function handleStripeInvoiceEvent(invoice: any) {
  const stripeSubscriptionId = readInvoiceSubscriptionId(invoice);
  if (!stripeSubscriptionId) return;

  const stripeInvoiceId = readStripeObjectId(invoice?.id);
  const stripeCustomerId = readStripeObjectId(invoice?.customer);

  const subData = await getBillingSubscriptionByStripeSubscriptionIdQuery(
    stripeSubscriptionId,
  );
  const sub = subData.rows[0];
  if (sub) {
    await maybeCreateAffiliateCommissionForSubscription(sub, {
      ...invoice,
      id: stripeInvoiceId || invoice?.id,
    });

    await recomputeUserProEntitlement(sub.user_id);
    if (sub.scope === "project" && sub.project_id) {
      await recomputeProjectProEntitlement(sub.project_id);
    }
    return;
  }

  const metadata = readInvoiceSubscriptionMetadata(invoice);
  const scope: BillingScope | null =
    readScope(metadata.scope) || (readPositiveInt(metadata.project_id) ? "project" : "user");
  const projectId = scope === "project" ? readPositiveInt(metadata.project_id) : null;
  const userId =
    readPositiveInt(metadata.user_id) ||
    (await resolveStripeCustomerUserId(stripeCustomerId, null));

  await maybeCreateAffiliateCommission({
    stripeSubscriptionId,
    stripeInvoiceId,
    userId,
    scope,
    projectId,
    commissionBaseAmountCents: readInvoiceCommissionBaseAmountCents(invoice),
    metadata,
  });

  if (userId) {
    await recomputeUserProEntitlement(userId);
  }
  if (scope === "project" && projectId) {
    await recomputeProjectProEntitlement(projectId);
  }
}

async function maybeCreateAffiliateCommissionForSubscription(
  subscription: BillingSubscription,
  invoice: any,
) {
  const metadata =
    subscription.metadata_json &&
    typeof subscription.metadata_json === "object" &&
    !Array.isArray(subscription.metadata_json)
      ? (subscription.metadata_json as Record<string, unknown>)
      : {};
  await maybeCreateAffiliateCommission({
    stripeSubscriptionId: subscription.stripe_subscription_id,
    stripeInvoiceId: readOptionalString(invoice?.id),
    userId: Number(subscription.user_id),
    scope: subscription.scope,
    projectId: subscription.project_id ? Number(subscription.project_id) : null,
    commissionBaseAmountCents: readInvoiceCommissionBaseAmountCents(invoice),
    metadata,
  });
}

async function processStripeWebhookEvent(event: StripeWebhookEvent) {
  switch (event.type) {
    case "checkout.session.completed": {
      await handleStripeCheckoutSessionCompleted(event.data?.object);
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await syncStripeSubscription(event.data?.object);
      return;
    }
    case "invoice.paid":
    case "invoice.payment_succeeded":
    case "invoice.payment_failed": {
      await handleStripeInvoiceEvent(event.data?.object);
      return;
    }
    default:
      return;
  }
}

function readStripeWebhookSecret() {
  const value = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!value) {
    throw {
      status: 503,
      message: "STRIPE_WEBHOOK_SECRET is not configured",
    };
  }
  return value;
}

function readStripeSignatureToleranceSeconds() {
  const value = Number(process.env.STRIPE_WEBHOOK_TOLERANCE_SECONDS || 300);
  if (!Number.isFinite(value) || value <= 0) return 300;
  return value;
}

async function handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const webhookSecret = readStripeWebhookSecret();
    const stripeSignature = req.headers["stripe-signature"];
    if (typeof stripeSignature !== "string" || !stripeSignature.trim()) {
      throw { status: 400, message: "Missing Stripe-Signature header" };
    }

    if (!req.rawBody || !req.rawBody.length) {
      throw { status: 400, message: "Missing raw webhook body" };
    }

    const isValid = verifyStripeWebhookSignature({
      payload: req.rawBody,
      stripeSignatureHeader: stripeSignature,
      webhookSecret,
      toleranceSeconds: readStripeSignatureToleranceSeconds(),
    });
    if (!isValid) {
      throw { status: 400, message: "Invalid Stripe webhook signature" };
    }

    let event: StripeWebhookEvent;
    try {
      event = JSON.parse(req.rawBody.toString("utf8")) as StripeWebhookEvent;
    } catch {
      throw { status: 400, message: "Invalid Stripe webhook JSON payload" };
    }

    if (!readOptionalString(event?.id) || !readOptionalString(event?.type)) {
      throw { status: 400, message: "Invalid Stripe event envelope" };
    }

    const payloadHash = createHash("sha256").update(req.rawBody).digest("hex");

    const eventLogData = await addBillingEventLogQuery({
      stripe_event_id: event.id,
      type: event.type,
      payload_hash: payloadHash,
      payload_json: event as unknown as Record<string, unknown>,
    });

    if (!eventLogData.rows[0]) {
      res.status(200).send({ received: true, duplicate: true });
      return;
    }

    try {
      await processStripeWebhookEvent(event);
    } catch (processErr) {
      try {
        await removeBillingEventLogByStripeEventIdQuery(event.id);
      } catch (rollbackErr) {
        logger.error(
          {
            err: rollbackErr,
            stripeEventId: event.id,
            stripeEventType: event.type,
          },
          "Failed to rollback billing event log after Stripe webhook processing failure",
        );
      }
      throw processErr;
    }

    res.status(200).send({ received: true });
  } catch (err) {
    next(err);
  }
}

export { handleStripeWebhook };
