import Link from "next/link";

type ReminderTask = {
  id: string;
  title: string;
  eodDeadline: Date;
};

type ReminderPanelProps = {
  items: ReminderTask[];
};

export function ReminderPanel({ items }: ReminderPanelProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Missed Emails Pending</h2>
        <Link href="/tasks" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
          View tasks
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">No pending missed-task notifications.</p>
      ) : (
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-400">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-rose-200 bg-rose-100 px-3 py-2 transition-all duration-200 dark:border-rose-700 dark:bg-rose-950/30"
            >
              <p className="font-medium text-rose-800 dark:text-rose-300">{item.title}</p>
              <p className="text-xs text-rose-700 dark:text-rose-400">Deadline passed: {item.eodDeadline.toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}


