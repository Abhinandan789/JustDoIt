import cron from "node-cron";

import { sendMissedTaskEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { runDailyStreakRollover } from "@/lib/streaks";

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
  await processMissedTaskEmails(now);
  await runDailyStreakRollover(now);
}

type MissedEmailDeps = {
  fetchMissedTasks: (now: Date) => Promise<MissedTaskRecord[]>;
  sendMissedTaskEmail: typeof sendMissedTaskEmail;
  markTaskEmailed: (taskId: string, processedAt: Date) => Promise<{ count: number }>;
  resetUserStreak: (userId: string) => Promise<unknown>;
  logError: (message: string, error?: unknown) => void;
};

export async function processMissedTaskEmailsWithDeps(deps: MissedEmailDeps, now = new Date()) {
  const missedTasks = await deps.fetchMissedTasks(now);

  for (const task of missedTasks) {
    try {
      await deps.resetUserStreak(task.userId);

      const emailResult = await deps.sendMissedTaskEmail({
        to: task.user.email,
        username: task.user.username,
        taskTitle: task.title,
        eodDeadline: task.eodDeadline,
        timezone: task.user.timezone,
      });

      if (!emailResult.ok) {
        const reason = emailResult.error ?? "unknown error";
        deps.logError(`[worker] Failed to send missed-task email for ${task.id}: ${reason}`);
        continue;
      }

      const marked = await deps.markTaskEmailed(task.id, now);

      if (marked.count === 0) {
        continue;
      }
    } catch (error) {
      deps.logError(`[worker] Error processing task ${task.id}`, error);
    }
  }

  return missedTasks.length;
}

export function startReminderWorker() {
  cron.schedule("* * * * *", async () => {
    try {
      await workerTick(new Date());
    } catch (error) {
      console.error("[worker] Tick failed", error);
    }
  });
}

if (require.main === module) {
  console.log("[worker] Reminder worker started");
  startReminderWorker();
}
