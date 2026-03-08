import logger from "./logger";
import {
  AffiliateCommissionPayoutCandidate,
  getAffiliateCommissionPayoutCandidateByIdQuery,
  getPendingAffiliateCommissionPayoutCandidatesQuery,
  markAffiliateCommissionPaidByTransferQuery,
  markAffiliateCommissionPayoutFailedQuery,
} from "../api/queries/affiliateCommissions";
import {
  createStripeTransferToConnectedAccount,
  findStripeTransferByAffiliateCommissionId,
} from "./stripeApi";

function normalizeErrorMessage(err: unknown, fallback: string) {
  const raw =
    typeof err === "object" && err !== null && "message" in err
      ? (err as { message?: unknown }).message
      : null;
  const message = typeof raw === "string" ? raw.trim() : "";
  return (message || fallback).slice(0, 2000);
}

function isPayoutReady(candidate: AffiliateCommissionPayoutCandidate) {
  return Boolean(
    candidate.stripe_connect_account_id && candidate.stripe_connect_payouts_enabled,
  );
}

function buildCommissionTransferIdempotencyKey(
  candidate: AffiliateCommissionPayoutCandidate,
) {
  const commissionId = Number(candidate.id);
  const attemptedAtMs = candidate.payout_attempted_at
    ? Date.parse(String(candidate.payout_attempted_at))
    : NaN;
  if (Number.isFinite(attemptedAtMs) && attemptedAtMs > 0) {
    return `affiliate_commission_${commissionId}_retry_${Math.trunc(attemptedAtMs)}`;
  }
  return `affiliate_commission_${commissionId}`;
}

export interface AffiliateCommissionPayoutResult {
  commissionId: number;
  status: "paid" | "failed" | "skipped";
  reason?: string;
  transferId?: string;
}

export interface AffiliateCommissionPayoutBatchResult {
  total: number;
  paid: number;
  failed: number;
  skipped: number;
}

async function attemptAffiliateCommissionPayout(
  candidate: AffiliateCommissionPayoutCandidate,
): Promise<AffiliateCommissionPayoutResult> {
  const commissionId = Number(candidate.id);
  if (!Number.isInteger(commissionId) || commissionId <= 0) {
    return {
      commissionId: 0,
      status: "skipped",
      reason: "invalid_commission_id",
    };
  }

  if (candidate.status !== "pending") {
    return {
      commissionId,
      status: "skipped",
      reason: "not_pending",
    };
  }

  if (!isPayoutReady(candidate)) {
    return {
      commissionId,
      status: "skipped",
      reason: "connect_not_ready",
    };
  }

  const destinationAccountId = String(candidate.stripe_connect_account_id || "");

  try {
    const existingTransfer = await findStripeTransferByAffiliateCommissionId({
      affiliateCommissionId: commissionId,
      destinationAccountId,
    });
    if (existingTransfer?.id) {
      await markAffiliateCommissionPaidByTransferQuery({
        id: commissionId,
        stripe_transfer_id: existingTransfer.id,
        payout_note: `Recovered existing Stripe Connect transfer ${existingTransfer.id}`,
      });
      return {
        commissionId,
        status: "paid",
        transferId: existingTransfer.id,
      };
    }

    const transfer = await createStripeTransferToConnectedAccount({
      amountCents: Number(candidate.amount_cents),
      destinationAccountId,
      currency: "usd",
      idempotencyKey: buildCommissionTransferIdempotencyKey(candidate),
      description: `Affiliate commission #${commissionId}`,
      metadata: {
        affiliate_commission_id: String(commissionId),
        affiliate_code_id: String(candidate.affiliate_code_id),
        affiliate_code: candidate.affiliate_code,
        stripe_subscription_id: candidate.stripe_subscription_id,
      },
    });

    await markAffiliateCommissionPaidByTransferQuery({
      id: commissionId,
      stripe_transfer_id: transfer.id,
      payout_note: `Auto payout via Stripe Connect transfer ${transfer.id}`,
    });

    return {
      commissionId,
      status: "paid",
      transferId: transfer.id,
    };
  } catch (err) {
    const payoutError = normalizeErrorMessage(err, "Stripe transfer failed");
    await markAffiliateCommissionPayoutFailedQuery({
      id: commissionId,
      payout_error: payoutError,
    });
    logger.error(
      {
        err,
        commissionId,
        destinationAccountId,
      },
      "Affiliate Stripe Connect payout failed",
    );

    return {
      commissionId,
      status: "failed",
      reason: payoutError,
    };
  }
}

export async function attemptAffiliateCommissionPayoutById(
  commissionId: string | number,
): Promise<AffiliateCommissionPayoutResult> {
  const candidateData = await getAffiliateCommissionPayoutCandidateByIdQuery(commissionId);
  const candidate = candidateData.rows[0];
  if (!candidate) {
    return {
      commissionId: Number(commissionId) || 0,
      status: "skipped",
      reason: "not_found",
    };
  }
  return await attemptAffiliateCommissionPayout(candidate);
}

export async function processPendingAffiliateCommissionPayouts(params?: {
  limit?: number;
  affiliateCodeId?: string | number | null;
}): Promise<AffiliateCommissionPayoutBatchResult> {
  const candidatesData = await getPendingAffiliateCommissionPayoutCandidatesQuery({
    limit: params?.limit,
    affiliate_code_id: params?.affiliateCodeId || null,
  });

  let paid = 0;
  let failed = 0;
  let skipped = 0;

  for (const candidate of candidatesData.rows) {
    const result = await attemptAffiliateCommissionPayout(candidate);
    if (result.status === "paid") {
      paid++;
      continue;
    }
    if (result.status === "failed") {
      failed++;
      continue;
    }
    skipped++;
  }

  return {
    total: candidatesData.rows.length,
    paid,
    failed,
    skipped,
  };
}
