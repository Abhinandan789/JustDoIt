import { sendMissedTaskEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { runDailyStreakRollover } from "@/lib/streaks";
import { retryBatch, countRetryResults } from "@/lib/retry-queue";
import { createServiceLogger, type Logger } from "@/lib/logger";

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
  logger: Logger;
};

/**
 * Process missed task emails with exponential backoff retry
 * Improved from previous version to handle transient failures gracefully
 */
export async function processMissedTaskEmailsWithDeps(deps: MissedEmailDeps, now = new Date()) {
  const timer = deps.logger.startTimer();
  const missedTasks = await deps.fetchMissedTasks(now);

  if (missedTasks.length === 0) {
    deps.logger.debug("No missed tasks to process");
    return 0;
  }

  deps.logger.info(`Processing ${missedTasks.length} missed task emails with retry...`, {
    meta: { taskCount: missedTasks.length },
  });

  // First, reset streaks for all missed tasks (this is not retryable)
  for (const task of missedTasks) {
    try {
      await deps.resetUserStreak(task.userId);
    } catch (error) {
      deps.logger.error(`Failed to reset streak for user ${task.userId}`, error, {
        meta: { userId: task.userId },
      });
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
        deps.logger.debug("Email sent for task", {
          meta: { taskId, attempts: result.attemptsMade, durationMs: result.totalDurationMs },
        });
      } catch (error) {
        deps.logger.error(`Failed to mark task ${taskId} as emailed`, error, {
          meta: { taskId },
        });
        failureCount++;
      }
    } else {
      failureCount++;
      const reason = emailResult?.error || result.error?.message || "unknown error";
      deps.logger.warn(`Failed to send email for task after ${result.attemptsMade} attempts`, {
        meta: { taskId, attempts: result.attemptsMade, reason },
      });
    }
  }

  const totalDuration = timer();
  deps.logger.info("Email processing completed", {
    meta: {
      succeeded: successCount,
      failed: failureCount,
      total: missedTasks.length,
      durationMs: totalDuration,
    },
  });

  return successCount;
}

export async function processMissedTaskEmails(now = new Date()) {
  const logger = createServiceLogger("worker:emails");

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
      logger,
    },
    now,
  );
}

export async function workerTick(now = new Date()) {
  const logger = createServiceLogger("worker:tick");
  const timer = logger.startTimer();

  try {
    const processedTasks = await processMissedTaskEmails(now);
    await runDailyStreakRollover(now);

    const duration = timer();
    logger.info("Worker tick completed", {
      meta: { processedTasks, durationMs: duration },
    });

    return processedTasks;
  } catch (error) {
    logger.error("Worker tick failed", error);
    throw error;
  }
}
