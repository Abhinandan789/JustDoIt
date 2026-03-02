import { eachDayOfInterval, endOfDay, endOfWeek, format, startOfDay, startOfWeek, subDays } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

import { prisma } from "@/lib/prisma";

function getUtcBoundsForDay(date: Date, timezone: string) {
  const zonedDate = toZonedTime(date, timezone);
  const localStart = startOfDay(zonedDate);
  const localEnd = endOfDay(zonedDate);

  return {
    start: fromZonedTime(localStart, timezone),
    end: fromZonedTime(localEnd, timezone),
  };
}

function getUtcBoundsForWeek(date: Date, timezone: string) {
  const zonedDate = toZonedTime(date, timezone);
  const localStart = startOfWeek(zonedDate, { weekStartsOn: 1 });
  const localEnd = endOfWeek(zonedDate, { weekStartsOn: 1 });

  return {
    start: fromZonedTime(localStart, timezone),
    end: fromZonedTime(localEnd, timezone),
  };
}

export async function getDashboardStats(userId: string) {
  const now = new Date();

  const [totalTasks, completedTasks, pendingTasks, missedTasks, user] = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, status: "COMPLETED" } }),
    prisma.task.count({ where: { userId, status: "PENDING", eodDeadline: { gt: now } } }),
    prisma.task.count({ where: { userId, status: "PENDING", eodDeadline: { lte: now } } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true },
    }),
  ]);

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    missedTasks,
    currentStreak: user?.currentStreak ?? 0,
    longestStreak: user?.longestStreak ?? 0,
  };
}

export async function getRecentTasks(userId: string, limit = 10) {
  return prisma.task.findMany({
    where: { userId },
    orderBy: { eodDeadline: "asc" },
    take: limit,
  });
}

export async function getUpcomingMissedNotifications(userId: string, limit = 5) {
  return prisma.task.findMany({
    where: {
      userId,
      status: "PENDING",
      eodDeadline: { lte: new Date() },
      missedEmailSentAt: null,
    },
    orderBy: { eodDeadline: "asc" },
    take: limit,
  });
}

export async function getAnalytics(userId: string, timezone: string) {
  const now = new Date();
  const dayBounds = getUtcBoundsForDay(now, timezone);
  const weekBounds = getUtcBoundsForWeek(now, timezone);

  const [tasksCompletedToday, tasksCompletedThisWeek, totalTasks, completedTasks, missedTasks, completedWithDuration] =
    await Promise.all([
      prisma.task.count({
        where: {
          userId,
          status: "COMPLETED",
          completedAt: { gte: dayBounds.start, lte: dayBounds.end },
        },
      }),
      prisma.task.count({
        where: {
          userId,
          status: "COMPLETED",
          completedAt: { gte: weekBounds.start, lte: weekBounds.end },
        },
      }),
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: "COMPLETED" } }),
      prisma.task.count({ where: { userId, status: "PENDING", eodDeadline: { lt: now } } }),
      prisma.task.findMany({
        where: {
          userId,
          status: "COMPLETED",
          completedAt: { not: null },
        },
        select: { createdAt: true, completedAt: true },
      }),
    ]);

  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const averageCompletionTime =
    completedWithDuration.length === 0
      ? 0
      : Number(
          (
            completedWithDuration.reduce((sum, task) => {
              const completedAt = task.completedAt ?? task.createdAt;
              return sum + (completedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60);
            }, 0) / completedWithDuration.length
          ).toFixed(2),
        );

  const chartWindowStart = subDays(now, 6);
  const days = eachDayOfInterval({ start: startOfDay(chartWindowStart), end: startOfDay(now) });

  const [completionSeries, focusSeries] = await Promise.all([
    Promise.all(
      days.map(async (day) => {
        const bounds = getUtcBoundsForDay(day, timezone);
        const count = await prisma.task.count({
          where: {
            userId,
            status: "COMPLETED",
            completedAt: { gte: bounds.start, lte: bounds.end },
          },
        });

        return { day: format(day, "EEE"), completions: count };
      }),
    ),
    Promise.all(
      days.map(async (day) => {
        const bounds = getUtcBoundsForDay(day, timezone);
        const sessions = await prisma.focusSession.findMany({
          where: {
            userId,
            completedAt: { gte: bounds.start, lte: bounds.end },
          },
          select: { duration: true },
        });

        return {
          day: format(day, "EEE"),
          minutes: sessions.reduce((sum, item) => sum + item.duration, 0),
        };
      }),
    ),
  ]);

  return {
    tasksCompletedToday,
    tasksCompletedThisWeek,
    averageCompletionTime,
    completionRate,
    missedTasksCount: missedTasks,
    completionSeries,
    focusSeries,
  };
}
