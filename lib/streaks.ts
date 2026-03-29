import { addDays, startOfDay, subDays } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

import { prisma } from "@/lib/prisma";

export function getPreviousLocalDayBounds(now: Date, timezone: string) {
  const zonedNow = toZonedTime(now, timezone);
  const startTodayLocal = startOfDay(zonedNow);
  const startYesterdayLocal = subDays(startTodayLocal, 1);
  const endYesterdayLocal = addDays(startYesterdayLocal, 1);

  return {
    start: fromZonedTime(startYesterdayLocal, timezone),
    end: fromZonedTime(endYesterdayLocal, timezone),
  };
}

export function shouldRunDailyRollover(now: Date, timezone: string) {
  const zonedNow = toZonedTime(now, timezone);
  return zonedNow.getHours() === 0 && zonedNow.getMinutes() === 0;
}

export async function resetUserStreak(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { currentStreak: 0 },
  });
}

export async function runDailyStreakRollover(now = new Date()) {
  /**
   * Process users in batches to prevent memory exhaustion
   * With 1M users, loading all at once = ~1GB RAM spike
   * Batching at 1000 = constant ~1-5MB memory usage
   */
  const BATCH_SIZE = 1000;
  let skip = 0;
  let processedCount = 0;
  let updatedCount = 0;

  while (true) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        timezone: true,
        currentStreak: true,
        longestStreak: true,
      },
      skip,
      take: BATCH_SIZE,
    });

    if (users.length === 0) {
      break; // No more users to process
    }

    for (const user of users) {
      processedCount++;

      if (!shouldRunDailyRollover(now, user.timezone)) {
        continue;
      }

      const bounds = getPreviousLocalDayBounds(now, user.timezone);

      const previousDayTasks = await prisma.task.findMany({
        where: {
          userId: user.id,
          eodDeadline: {
            gte: bounds.start,
            lt: bounds.end,
          },
        },
        select: {
          status: true,
          completedAt: true,
          eodDeadline: true,
        },
      });

      const hasMissedTask = previousDayTasks.some(
        (task) => task.status === "PENDING" || (task.completedAt && task.completedAt > task.eodDeadline),
      );

      if (hasMissedTask) {
        await prisma.user.update({
          where: { id: user.id },
          data: { currentStreak: 0 },
        });
        updatedCount++;
        continue;
      }

      const nextStreak = user.currentStreak + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          currentStreak: nextStreak,
          longestStreak: Math.max(user.longestStreak, nextStreak),
        },
      });
      updatedCount++;
    }

    // Move to next batch
    skip += BATCH_SIZE;
  }

  // Log processing summary for monitoring
  console.log(
    `[streaks] Daily rollover completed: processed ${processedCount} users, updated ${updatedCount} streaks`
  );

  return { processedCount, updatedCount };
}
