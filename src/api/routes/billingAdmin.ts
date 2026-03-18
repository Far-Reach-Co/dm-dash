import { Router } from "express";
import { handleStripeWebhook } from "../controllers/billingStripe.js";
import {
  createStripeCustomerPortal,
  createStripeProjectCheckout,
  createStripeUserCheckout,
} from "../controllers/billingCheckout.js";
import {
  createAffiliateCode,
  markAffiliateCommissionPaid,
  processAffiliatePendingPayouts,
  retryAffiliateCommissionPayout,
  startAffiliateCodeConnectOnboarding,
  toggleAffiliateCodeStatus,
  updateAffiliateCodeEmail,
} from "../controllers/affiliateAdmin.js";
import { csrfProtection } from "../../routes.js";

const router = Router();

router.post("/stripe/webhook", handleStripeWebhook);
router.post("/billing/stripe/checkout/user", createStripeUserCheckout);
router.post(
  "/billing/stripe/checkout/project/:project_id",
  createStripeProjectCheckout,
);
router.post("/billing/stripe/portal", createStripeCustomerPortal);

router.post("/admin/affiliates/codes", csrfProtection, createAffiliateCode);
router.post(
  "/admin/affiliates/codes/:id/toggle",
  csrfProtection,
  toggleAffiliateCodeStatus,
);
router.post(
  "/admin/affiliates/codes/:id/email",
  csrfProtection,
  updateAffiliateCodeEmail,
);
router.post(
  "/admin/affiliates/codes/:id/connect/start",
  csrfProtection,
  startAffiliateCodeConnectOnboarding,
);
router.post(
  "/admin/affiliates/commissions/:id/pay",
  csrfProtection,
  markAffiliateCommissionPaid,
);
router.post(
  "/admin/affiliates/commissions/:id/payout/retry",
  csrfProtection,
  retryAffiliateCommissionPayout,
);
router.post(
  "/admin/affiliates/payouts/process",
  csrfProtection,
  processAffiliatePendingPayouts,
);

export default router;
