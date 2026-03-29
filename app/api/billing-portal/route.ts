import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { createBillingPortalSession } from "@/lib/stripe";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { stripeCustomerId?: string };

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing portal available" },
        { status: 400 },
      );
    }

    const url = await createBillingPortalSession(user.stripeCustomerId);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Billing portal error:", error);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 },
    );
  }
}
