import Link from "next/link";

import { CreateTaskModal } from "@/components/CreateTaskModal";
import { DashboardStats } from "@/components/DashboardStats";
import { ReminderPanel } from "@/components/ReminderPanel";
import { TaskCard } from "@/components/TaskCard";
import { getRequiredUser } from "@/lib/auth";
import { buttonClass } from "@/lib/button-styles";
import { getDashboardStats, getRecentTasks, getUpcomingMissedNotifications } from "@/lib/analytics";

export default async function DashboardPage() {
  const user = await getRequiredUser();

  if (!user) {
    return null;
  }

  const [stats, recentTasks, pendingEmails] = await Promise.all([
    getDashboardStats(user.id),
    getRecentTasks(user.id, 6),
    getUpcomingMissedNotifications(user.id, 5),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Track deadlines, missed tasks, and momentum.</p>
        </div>
        <Link
          href="/tasks/new"
          className={buttonClass("primary", "px-4 py-2 text-sm font-semibold")}
        >
          New Task
        </Link>
      </header>

      <DashboardStats {...stats} />

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Tasks</h2>
          {recentTasks.length === 0 ? (
            <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm transition-all duration-200 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-gray-400">
              No tasks yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <TaskCard key={task.id} task={task} timezone={user.timezone} />
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <CreateTaskModal />
          <ReminderPanel items={pendingEmails} />
        </div>
      </div>
    </div>
  );
}


