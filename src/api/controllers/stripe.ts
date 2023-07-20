import Stripe from "stripe";
import { Request, Response, NextFunction } from "express";
import { editUserQuery } from "../queries/users";

const stripe = new Stripe(process.env.FRC_STRIPE_TEST as string, {
  apiVersion: "2022-11-15",
});

async function getOrCreateUserCustomerId(
  user: Request["user"]
): Promise<Stripe.Customer["id"]> {
  if (user.stripe_id) {
    return user.stripe_id;
    // check if customer is deleted?
    // const customer = await stripe.customers.retrieve(user.stripe_id);
    // if (!customer.deleted) {
    //   return customer.id;
    // }
  }
  // create a new one if we don't have one or the customer has been deleted in stripe for some reason
  const customer = await stripe.customers.create({
    email: user.email,
  });

  // update user in db
  await editUserQuery(user.id, { stripe_id: customer.id });

  return customer.id;
}

async function createProSubscription(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const customerId = await getOrCreateUserCustomerId(req.user);
    const priceId = "price_1NVsrfFd3QIkZ3wAWcbhVof3"; // is_sub item price id

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    if (invoice.payment_intent) {
      const intent = invoice.payment_intent as Stripe.PaymentIntent;
      res.send({
        subscriptionId: subscription.id,
        clientSecret: intent.client_secret,
      });
    } else throw new Error("There was a problem creating the subscription");
  } catch (err) {
    next(err);
  }
}

export { createProSubscription };
