import { getDueInLabel } from "@/lib/task-list";
import { formatForTimezone } from "@/lib/timezone";

type UpcomingTask = {
  id: string;
  title: string;
  eodDeadline: Date;
};

type UpcomingDeadlinesPanelProps = {
  tasks: UpcomingTask[];
  timezone: string;
};

export function UpcomingDeadlinesPanel({ tasks, timezone }: UpcomingDeadlinesPanelProps) {
  const now = new Date();

  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Upcoming Deadlines</h2>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Nearest pending tasks across your board.</p>

      {tasks.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No upcoming deadlines right now.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {tasks.map((task) => (
            <li key={task.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-[#303030] dark:bg-[#141414]">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formatForTimezone(task.eodDeadline, timezone, "PP p")}
              </p>
              <p className="mt-1 text-xs font-semibold text-blue-700 dark:text-blue-300">{getDueInLabel(task.eodDeadline, now)}</p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
