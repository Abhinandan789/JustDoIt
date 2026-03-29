import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  handleStripeWebhook,
  verifyStripeWebhookSignature,
} from "@/lib/stripe";
import { createServiceLogger } from "@/lib/logger";

const logger = createServiceLogger("webhook:stripe");

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      logger.error("STRIPE_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook not configured" },
        { status: 500 },
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = verifyStripeWebhookSignature(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      logger.warn("Invalid signature", {
        meta: { error: String(error) },
      });
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 },
      );
    }

    logger.debug("Processing Stripe event", {
      meta: { type: event.type, id: event.id },
    });

    // Handle webhook event
    await handleStripeWebhook(event, async (userId, tier, expiresAt, customerId) => {
      await prisma.user.update({
        where: { id: userId },
        data: {
          tier: tier as "FREE" | "PRO" | "ENTERPRISE",
          subscriptionExpiresAt: expiresAt,
          ...(customerId ? { stripeCustomerId: customerId } : {}),
        },
      });

      logger.info("User subscription updated", {
        meta: {
          userId,
          tier,
          expiresAt: expiresAt?.toISOString(),
          stripeCustomerId: customerId ?? undefined,
        },
      });
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook processing failed", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
