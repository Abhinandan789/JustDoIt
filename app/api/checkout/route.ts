import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { createCheckoutSession, PRICING_PLANS } from "@/lib/stripe";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing priceId parameter" },
        { status: 400 },
      );
    }

    // Validate price ID against known plans
    const validPriceIds = Object.values(PRICING_PLANS)
      .filter((plan) => plan.priceId)
      .map((plan) => plan.priceId);

    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: "Invalid pricing plan" },
        { status: 400 },
      );
    }

    const url = await createCheckoutSession(
      session.user.id,
      session.user.email || "",
      priceId,
      (session.user as { tier?: string }).tier || "FREE",
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
