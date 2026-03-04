import { NextFunction, Request, Response } from "express";
import { getUserByIdQuery } from "../queries/users";
import {
  createStripeBillingPortalSession,
  createStripeCheckoutSession,
  parseBillingInterval,
  readStripeAffiliateDiscountCouponId,
  resolveStripePriceIdForScope,
} from "../../lib/stripeApi";
import { getActiveAffiliateCodeByCodeQuery } from "../queries/affiliateCodes";
import { requireApiUser, requireProjectMemberAccess } from "./accessControl";
import { getBillingCustomerByUserIdQuery } from "../queries/billingCustomers";
import { normalizeAffiliateCode } from "../../lib/affiliate";

function normalizeReturnPath(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  return trimmed;
}

function withBillingStatus(path: string, status: string) {
  return `${path}${path.includes("?") ? "&" : "?"}billing=${encodeURIComponent(status)}`;
}

function respondWithRedirect(req: Request, res: Response, url: string) {
  if (req.headers["hx-request"]) {
    res.set("HX-Redirect", url).status(200).send("Redirecting");
    return;
  }

  const acceptHeader = String(req.headers.accept || "").toLowerCase();
  if (acceptHeader.includes("application/json")) {
    res.status(200).send({ url });
    return;
  }

  res.redirect(303, url);
}

async function resolveAffiliateFromRequest(req: Request) {
  const rawAffiliateCode =
    req.body?.affiliate_code || req.query?.affiliate_code || req.query?.ref;
  const normalizedAffiliateCode = normalizeAffiliateCode(rawAffiliateCode);
  if (!normalizedAffiliateCode) return null;

  const codeData = await getActiveAffiliateCodeByCodeQuery(normalizedAffiliateCode);
  const code = codeData.rows[0];
  if (!code) {
    throw { status: 400, message: "Invalid or inactive referral code" };
  }

  return code;
}

async function createStripeUserCheckout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireApiUser(req);
    const userData = await getUserByIdQuery(userId);
    const user = userData.rows[0];
    if (!user) throw { status: 404, message: "User not found" };
    if (user.is_pro) {
      throw {
        status: 409,
        message: "User is already Pro. Use customer portal to manage billing.",
      };
    }

    const interval = parseBillingInterval(req.body?.interval || req.query?.interval);
    const affiliateCode = await resolveAffiliateFromRequest(req);
    const affiliateDiscountCouponId = affiliateCode
      ? readStripeAffiliateDiscountCouponId()
      : null;
    const priceId = await resolveStripePriceIdForScope({ scope: "user", interval });
    const customerData = await getBillingCustomerByUserIdQuery(user.id);
    const customer = customerData.rows[0] || null;
    const returnPath = normalizeReturnPath(req.body?.return_to, "/account");

    const session = await createStripeCheckoutSession({
      priceId,
      customerId: customer?.stripe_customer_id || null,
      customerEmail: customer ? null : user.email,
      clientReferenceId: String(user.id),
      discountCouponId: affiliateDiscountCouponId,
      metadata: {
        user_id: String(user.id),
        scope: "user",
        interval,
        ...(affiliateCode
          ? {
              affiliate_code: affiliateCode.code,
              affiliate_code_id: String(affiliateCode.id),
            }
          : {}),
      },
      subscriptionMetadata: {
        user_id: String(user.id),
        scope: "user",
        interval,
        ...(affiliateCode
          ? {
              affiliate_code: affiliateCode.code,
              affiliate_code_id: String(affiliateCode.id),
            }
          : {}),
      },
      subscriptionDescription: "Pro User Subscription",
      successPath: withBillingStatus(returnPath, "user_success"),
      cancelPath: withBillingStatus(returnPath, "user_cancel"),
    });

    respondWithRedirect(req, res, session.url);
  } catch (err) {
    next(err);
  }
}

async function createStripeProjectCheckout(req: Request, res: Response, next: NextFunction) {
  try {
    const memberRole = await requireProjectMemberAccess(req, req.params.project_id);
    const userId = memberRole.userId;
    const project = memberRole.project;
    if (project.is_pro) {
      throw {
        status: 409,
        message: "Wyrld is already Pro. Use customer portal to manage billing.",
      };
    }

    const userData = await getUserByIdQuery(userId);
    const user = userData.rows[0];
    if (!user) throw { status: 404, message: "User not found" };

    const interval = parseBillingInterval(req.body?.interval || req.query?.interval);
    const affiliateCode = await resolveAffiliateFromRequest(req);
    const affiliateDiscountCouponId = affiliateCode
      ? readStripeAffiliateDiscountCouponId()
      : null;
    const priceId = await resolveStripePriceIdForScope({ scope: "project", interval });
    const customerData = await getBillingCustomerByUserIdQuery(user.id);
    const customer = customerData.rows[0] || null;

    const returnPath = normalizeReturnPath(
      req.body?.return_to,
      `/wyrld/settings?id=${project.id}`,
    );

    const session = await createStripeCheckoutSession({
      priceId,
      customerId: customer?.stripe_customer_id || null,
      customerEmail: customer ? null : user.email,
      clientReferenceId: String(user.id),
      discountCouponId: affiliateDiscountCouponId,
      metadata: {
        user_id: String(user.id),
        scope: "project",
        project_id: String(project.id),
        interval,
        ...(affiliateCode
          ? {
              affiliate_code: affiliateCode.code,
              affiliate_code_id: String(affiliateCode.id),
            }
          : {}),
      },
      subscriptionMetadata: {
        user_id: String(user.id),
        scope: "project",
        project_id: String(project.id),
        interval,
        ...(affiliateCode
          ? {
              affiliate_code: affiliateCode.code,
              affiliate_code_id: String(affiliateCode.id),
            }
          : {}),
      },
      subscriptionDescription: `Pro Wyrld - ${project.title} (#${project.id})`,
      successPath: withBillingStatus(returnPath, "wyrld_success"),
      cancelPath: withBillingStatus(returnPath, "wyrld_cancel"),
    });

    respondWithRedirect(req, res, session.url);
  } catch (err) {
    next(err);
  }
}

async function createStripeCustomerPortal(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireApiUser(req);
    const customerData = await getBillingCustomerByUserIdQuery(userId);
    const customer = customerData.rows[0];

    if (!customer?.stripe_customer_id) {
      throw {
        status: 409,
        message: "No Stripe customer found for this account yet",
      };
    }

    const returnTo = withBillingStatus(
      normalizeReturnPath(req.body?.return_to, "/account"),
      "portal_return",
    );

    const session = await createStripeBillingPortalSession({
      customerId: customer.stripe_customer_id,
      returnPath: returnTo,
    });

    respondWithRedirect(req, res, session.url);
  } catch (err) {
    next(err);
  }
}

export {
  createStripeUserCheckout,
  createStripeProjectCheckout,
  createStripeCustomerPortal,
};
