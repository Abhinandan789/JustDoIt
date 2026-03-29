import { NextResponse } from "next/server";

import { workerTick } from "@/lib/reminder-jobs";
import { validateHmacSignature } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Validates incoming cron request using HMAC-SHA256 signature
 * Supports two authentication methods:
 * 1. HMAC-SHA256 signature (recommended): X-Signature header with payload signature
 * 2. Bearer token (legacy): Authorization header with Bearer token
 *
 * For production, ensure CRON_SECRET is set and use HMAC validation
 */
async function isAuthorized(request: Request): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;

  // If no secret configured, allow request (development only)
  if (!cronSecret) {
    console.warn(
      "[cron] CRON_SECRET not configured - endpoint is publicly accessible. Set CRON_SECRET in production!"
    );
    return true;
  }

  // Method 1: HMAC-SHA256 validation (recommended)
  const signature = request.headers.get("x-signature");
  if (signature) {
    try {
      const payload = await request.text();
      // Reset body for downstream consumption
      const isValid = validateHmacSignature(payload, signature, cronSecret);
      if (isValid) {
        console.log("[cron] Request authorized via HMAC signature");
        return true;
      }
    } catch (error) {
      console.error("[cron] HMAC validation error:", error);
      return false;
    }
  }

  // Method 2: Bearer token (legacy, for Vercel Cron compatibility)
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${cronSecret}`) {
    console.log("[cron] Request authorized via bearer token (legacy)");
    return true;
  }

  return false;
}

export async function GET(request: Request) {
  if (!(await isAuthorized(request))) {
    console.warn(
      "[cron] Unauthorized access attempt from",
      request.headers.get("cf-connecting-ip") || "unknown IP"
    );
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  try {
    const processedTasks = await workerTick(now);

    return NextResponse.json({
      ok: true,
      processedTasks,
      ranAt: now.toISOString(),
      timestamp: now.getTime(),
    });
  } catch (error) {
    console.error("[cron] reminders tick failed", error);
    return NextResponse.json(
      { ok: false, message: "Cron tick failed", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
