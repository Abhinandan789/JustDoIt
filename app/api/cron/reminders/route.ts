import { NextResponse } from "next/server";

import { workerTick } from "@/lib/reminder-jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  try {
    const processedTasks = await workerTick(now);

    return NextResponse.json({
      ok: true,
      processedTasks,
      ranAt: now.toISOString(),
    });
  } catch (error) {
    console.error("[cron] reminders tick failed", error);
    return NextResponse.json({ ok: false, message: "Cron tick failed" }, { status: 500 });
  }
}
