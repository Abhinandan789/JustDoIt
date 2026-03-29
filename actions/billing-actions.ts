"use server";

import { getServerSession } from "next-auth/next";
import { createCheckoutSession, createBillingPortalSession } from "@/lib/stripe";
import { authOptions } from "@/lib/auth";
import { createServiceLogger } from "@/lib/logger";

const logger = createServiceLogger("actions:billing");

export async function upgradeSubscription(priceId: string): Promise<string> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const url = await createCheckoutSession(
      session.user.id,
      session.user.email || "",
      priceId,
      (session.user as { tier?: string }).tier || "FREE",
    );

    logger.info("Checkout session created", {
      meta: {
        userId: session.user.id,
        priceId,
      },
    });

    return url;
  } catch (error) {
    logger.error("Failed to create checkout session", error);
    throw new Error("Failed to create checkout session");
  }
}

export async function manageBilling(): Promise<string> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const user = session.user as { stripeCustomerId?: string };

  if (!user.stripeCustomerId) {
    throw new Error("No billing information available");
  }

  try {
    const url = await createBillingPortalSession(user.stripeCustomerId);

    logger.info("Billing portal session created", {
      meta: {
        userId: session.user.id,
      },
    });

    return url;
  } catch (error) {
    logger.error("Failed to create billing portal session", error);
    throw new Error("Failed to access billing portal");
  }
}
