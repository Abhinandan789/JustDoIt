import Link from "next/link";

import { TaskCard } from "@/components/TaskCard";
import { getRequiredUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TasksPage() {
  const user = await getRequiredUser();

  if (!user) {
    return null;
  }

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { eodDeadline: "asc" }],
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tasks</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage your day with strict deadlines.</p>
        </div>
        <Link
          href="/tasks/new"
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-rose-700 active:scale-[0.98]"
        >
          Create Task
        </Link>
      </header>

      {tasks.length === 0 ? (
        <p className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm transition-all duration-200 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-gray-400">
          No tasks created yet.
        </p>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} timezone={user.timezone} />
          ))}
        </div>
      )}
    </div>
  );
}


