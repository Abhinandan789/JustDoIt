import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

export const PRICING_PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    price: 0,
    tasksLimit: 50,
    features: ["50 tasks/month", "Basic analytics", "Email reminders"],
  },
  PRO: {
    id: "pro",
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    price: 999, // $9.99/month in cents
    tasksLimit: null, // Unlimited
    features: [
      "Unlimited tasks",
      "Advanced analytics",
      "Email reminders",
      "Basic API access",
      "Priority support",
    ],
  },
  ENTERPRISE: {
    id: "enterprise",
    name: "Enterprise",
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "",
    price: 9999, // $99.99/month in cents
    tasksLimit: null,
    features: [
      "Unlimited tasks",
      "Advanced analytics",
      "Email reminders",
      "Full API access",
      "Dedicated support",
      "Custom branding",
      "SSO/SAML",
    ],
  },
};

/**
 * Create a Stripe checkout session for subscription upgrade
 */
export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  currentTier: string,
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    client_reference_id: userId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?subscription=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/profile?subscription=cancelled`,
    metadata: {
      userId,
      currentTier,
    },
  });

  if (!session.url) {
    throw new Error("Failed to create Stripe checkout session");
  }

  return session.url;
}

/**
 * Create billing portal session for subscription management
 */
export async function createBillingPortalSession(
  customerId: string,
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}/profile`,
  });

  return session.url;
}

/**
 * Retrieve customer subscription details
 */
export async function getCustomerSubscription(
  customerId: string,
): Promise<Stripe.Subscription | null> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
  });

  return subscriptions.data[0] || null;
}

/**
 * Handle Stripe webhook event
 */
export async function handleStripeWebhook(
  event: Stripe.Event,
  onSubscriptionUpdate?: (
    userId: string,
    tier: string,
    expiresAt: Date | null,
    customerId?: string,
  ) => Promise<void>,
): Promise<void> {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      const customerId = subscription.customer as string;

      if (!userId || !onSubscriptionUpdate) break;

      // Determine tier from price ID
      let tier = "FREE";
      for (const item of subscription.items.data) {
        if (item.price.id === PRICING_PLANS.PRO.priceId) {
          tier = "PRO";
        } else if (item.price.id === PRICING_PLANS.ENTERPRISE.priceId) {
          tier = "ENTERPRISE";
        }
      }

      // Calculate expiration date
      const expiresAt =
        subscription.current_period_end && subscription.status === "active"
          ? new Date(subscription.current_period_end * 1000)
          : null;

      await onSubscriptionUpdate(userId, tier, expiresAt, customerId);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      const customerId = subscription.customer as string;

      if (!userId || !onSubscriptionUpdate) break;

      // Downgrade to FREE tier
      await onSubscriptionUpdate(userId, "FREE", null, customerId);
      break;
    }

    case "invoice.payment_succeeded": {
      // Subscription payment succeeded - you can add notifications here
      break;
    }

    case "invoice.payment_failed": {
      // Subscription payment failed - send notification to user
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      console.error(
        `Payment failed for customer ${customerId}: ${invoice.id}`,
      );
      break;
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeWebhookSignature(
  body: string,
  signature: string,
  secret: string,
): Stripe.Event {
  return stripe.webhooks.constructEvent(body, signature, secret);
}

/**
 * Get pricing display format
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}/month`;
}
