import { sendMissedTaskEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { runDailyStreakRollover } from "@/lib/streaks";
import { retryBatch, countRetryResults } from "@/lib/retry-queue";

type MissedTaskRecord = {
  id: string;
  title: string;
  eodDeadline: Date;
  userId: string;
  user: {
    email: string;
    username: string;
    timezone: string;
  };
};

export async function fetchMissedTasks(now = new Date()): Promise<MissedTaskRecord[]> {
  return prisma.task.findMany({
    where: {
      status: "PENDING",
      missedEmailSentAt: null,
      eodDeadline: { lte: now },
    },
    include: {
      user: {
        select: {
          email: true,
          username: true,
          timezone: true,
        },
      },
    },
    orderBy: { eodDeadline: "asc" },
  });
}

type MissedEmailDeps = {
  fetchMissedTasks: (now: Date) => Promise<MissedTaskRecord[]>;
  sendMissedTaskEmail: typeof sendMissedTaskEmail;
  markTaskEmailed: (taskId: string, processedAt: Date) => Promise<{ count: number }>;
  resetUserStreak: (userId: string) => Promise<unknown>;
  logError: (message: string, error?: unknown) => void;
};

/**
 * Process missed task emails with exponential backoff retry
 * Improved from previous version to handle transient failures gracefully
 */
export async function processMissedTaskEmailsWithDeps(deps: MissedEmailDeps, now = new Date()) {
  const missedTasks = await deps.fetchMissedTasks(now);

  if (missedTasks.length === 0) {
    console.log("[worker] No missed tasks to process");
    return 0;
  }

  // First, reset streaks for all missed tasks (this is not retryable)
  for (const task of missedTasks) {
    try {
      await deps.resetUserStreak(task.userId);
    } catch (error) {
      deps.logError(`[worker] Failed to reset streak for user ${task.userId}`, error);
    }
  }

  // Batch email operations with retry
  const emailOperations = missedTasks.map((task) => ({
    id: task.id,
    operation: async () =>
      deps.sendMissedTaskEmail({
        to: task.user.email,
        username: task.user.username,
        taskTitle: task.title,
        eodDeadline: task.eodDeadline,
        timezone: task.user.timezone,
      }),
  }));

  console.log(`[worker] Processing ${missedTasks.length} missed task emails with retry...`);

  const results = await retryBatch(emailOperations, {
    maxAttempts: 3,
    initialDelayMs: 100,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
  });

  // Process results and update database
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < results.length; i++) {
    const { id: taskId, result } = results[i]!;
    const emailResult = result.data;

    if (result.success && emailResult?.ok) {
      try {
        await deps.markTaskEmailed(taskId, now);
        successCount++;
        console.log(`[worker] ✓ Email sent for task ${taskId} (${result.attemptsMade} attempt(s))`);
      } catch (error) {
        deps.logError(`[worker] Failed to mark task ${taskId} as emailed`, error);
        failureCount++;
      }
    } else {
      failureCount++;
      const reason = emailResult?.error || result.error?.message || "unknown error";
      deps.logError(
        `[worker] ✗ Failed to send email for task ${taskId} after ${result.attemptsMade} attempts: ${reason}`
      );
    }
  }

  const summary = { successCount, failureCount, totalDurationMs: results[results.length - 1]?.result.totalDurationMs || 0 };
  console.log(
    `[worker] Email processing complete: ${successCount} succeeded, ${failureCount} failed, ${summary.totalDurationMs}ms total`
  );

  return successCount;
}

export async function processMissedTaskEmails(now = new Date()) {
  return processMissedTaskEmailsWithDeps(
    {
      fetchMissedTasks,
      sendMissedTaskEmail,
      markTaskEmailed: async (taskId: string, processedAt: Date) =>
        prisma.task.updateMany({
          where: { id: taskId, missedEmailSentAt: null },
          data: { missedEmailSentAt: processedAt },
        }),
      resetUserStreak: async (userId: string) =>
        prisma.user.update({
          where: { id: userId },
          data: { currentStreak: 0 },
        }),
      logError: (message: string, error?: unknown) => console.error(message, error),
    },
    now,
  );
}

export async function workerTick(now = new Date()) {
  const processedTasks = await processMissedTaskEmails(now);
  await runDailyStreakRollover(now);
  return processedTasks;
}
