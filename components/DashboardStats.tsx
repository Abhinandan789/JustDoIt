type DashboardStatsProps = {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  missedTasks: number;
  currentStreak: number;
  longestStreak: number;
};

export function DashboardStats({
  totalTasks,
  completedTasks,
  pendingTasks,
  missedTasks,
  currentStreak,
  longestStreak,
}: DashboardStatsProps) {
  const cards = [
    { label: "Total Tasks", value: totalTasks, tone: "text-gray-900 dark:text-gray-100" },
    { label: "Completed Tasks", value: completedTasks, tone: "text-emerald-700 dark:text-emerald-400" },
    { label: "Pending Tasks", value: pendingTasks, tone: "text-gray-700 dark:text-gray-100" },
    { label: "Missed Tasks", value: missedTasks, tone: "text-rose-700 dark:text-rose-400" },
    { label: "Current Streak", value: currentStreak, tone: "text-amber-700 dark:text-amber-400" },
    { label: "Longest Streak", value: longestStreak, tone: "text-orange-700 dark:text-orange-400" },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
          <p className={`mt-2 text-2xl font-semibold ${card.tone}`}>{card.value}</p>
        </article>
      ))}
    </section>
  );
}


