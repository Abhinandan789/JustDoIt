import { AnalyticsChart } from "@/components/AnalyticsChart";
import { FocusTimer } from "@/components/FocusTimer";
import { getRequiredUser } from "@/lib/auth";
import { getAnalytics } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  const user = await getRequiredUser();

  if (!user) {
    return null;
  }

  const [analytics, taskOptions] = await Promise.all([
    getAnalytics(user.id, user.timezone),
    prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: { id: true, title: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Analytics</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Measure consistency, completion quality, and focus habits.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed Today</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{analytics.tasksCompletedToday}</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed This Week</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{analytics.tasksCompletedThisWeek}</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Completion Time (hrs)</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{analytics.averageCompletionTime}</p>
        </article>
        <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
          <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{analytics.completionRate}%</p>
        </article>
        <article className="rounded-xl border border-rose-200 bg-rose-100 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-rose-700 dark:bg-rose-950/30">
          <p className="text-sm text-rose-700 dark:text-rose-300">Missed Tasks</p>
          <p className="mt-2 text-2xl font-semibold text-rose-700 dark:text-rose-300">{analytics.missedTasksCount}</p>
        </article>
      </section>

      <AnalyticsChart completionSeries={analytics.completionSeries} focusSeries={analytics.focusSeries} />

      <FocusTimer tasks={taskOptions} />
    </div>
  );
}


