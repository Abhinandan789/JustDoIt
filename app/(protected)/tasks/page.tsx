import Link from "next/link";

import { buttonClass } from "@/lib/button-styles";
import {
  applyTaskQuery,
  getTaskFilterCounts,
  normalizeTaskSearch,
  parseTaskFilter,
  parseTaskSort,
  selectUpcomingTasks,
} from "@/lib/task-list";
import { validatePaginationLimit, encodeCursor, decodeCursor } from "@/lib/pagination";
import { TasksToolbar } from "@/components/TasksToolbar";
import { TaskCard } from "@/components/TaskCard";
import { UpcomingDeadlinesPanel } from "@/components/UpcomingDeadlinesPanel";
import { getRequiredUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SearchParamValue = string | string[] | undefined;

type TasksPageProps = {
  searchParams?: Promise<Record<string, SearchParamValue>>;
};

function firstParam(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Default items per page for task listings
 * Can be customized via ?limit=50 query param
 */
const DEFAULT_TASKS_PER_PAGE = 25;

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const user = await getRequiredUser();

  if (!user) {
    return null;
  }

  const resolvedParams: Record<string, SearchParamValue> = await Promise.resolve(searchParams ?? {});
  const filter = parseTaskFilter(firstParam(resolvedParams.status));
  const sort = parseTaskSort(firstParam(resolvedParams.sort));
  const query = normalizeTaskSearch(firstParam(resolvedParams.q));
  const limit = validatePaginationLimit(firstParam(resolvedParams.limit));
  const cursor = firstParam(resolvedParams.cursor);
  const now = new Date();

  // Decode cursor to get starting ID for pagination
  let startAfterCursor: string | undefined;
  if (cursor) {
    startAfterCursor = decodeCursor(cursor);
  }

  // Load tasks in batches (limit + 1 to check if hasMore)
  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }, // Consistent ordering for cursor pagination
    ...(startAfterCursor && {
      skip: 1, // Skip the cursor item itself
      cursor: { id: startAfterCursor },
    }),
    take: limit + 1, // +1 to determine if there are more items
  });

  const hasMore = tasks.length > limit;
  const paginatedTasks = hasMore ? tasks.slice(0, limit) : tasks;
  const nextCursor = hasMore ? encodeCursor(paginatedTasks[paginatedTasks.length - 1]!.id) : undefined;

  // Get full task count for UI display
  const totalTasks = await prisma.task.count({
    where: { userId: user.id },
  });

  const counts = getTaskFilterCounts(paginatedTasks, now);
  const visibleTasks = applyTaskQuery({
    tasks: paginatedTasks,
    filter,
    sort,
    query,
    now,
  });
  const upcomingTasks = selectUpcomingTasks(paginatedTasks, now, 5);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tasks</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Manage your day with strict deadlines.</p>
        </div>
        <Link
          href="/tasks/new"
          className={buttonClass("primary", "px-4 py-2 text-sm font-semibold")}
        >
          Create Task
        </Link>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <TasksToolbar 
            filter={filter} 
            sort={sort} 
            query={query} 
            total={totalTasks} 
            shown={visibleTasks.length} 
            counts={counts} 
          />

          {paginatedTasks.length === 0 ? (
            <p className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm transition-all duration-200 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-gray-400">
              No tasks created yet.
            </p>
          ) : visibleTasks.length === 0 ? (
            <p className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm transition-all duration-200 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-gray-400">
              No tasks match the current filters.
            </p>
          ) : (
            <>
              <div className="space-y-3">
                {visibleTasks.map((task) => (
                  <TaskCard key={task.id} task={task} timezone={user.timezone} />
                ))}
              </div>

              {/* Pagination controls */}
              {(cursor || hasMore) && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-[#2a2a2a]">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Page size: {limit} items
                  </span>
                  <div className="flex gap-2">
                    {cursor && (
                      <Link
                        href={`/tasks?${new URLSearchParams({
                          status: filter,
                          sort,
                          ...(query && { q: query }),
                          limit: limit.toString(),
                        }).toString()}`}
                        className={buttonClass("secondary", "px-3 py-1 text-sm")}
                      >
                        ← Previous
                      </Link>
                    )}
                    {hasMore && (
                      <Link
                        href={`/tasks?${new URLSearchParams({
                          status: filter,
                          sort,
                          ...(query && { q: query }),
                          limit: limit.toString(),
                          cursor: nextCursor || "",
                        }).toString()}`}
                        className={buttonClass("secondary", "px-3 py-1 text-sm")}
                      >
                        Next →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <UpcomingDeadlinesPanel tasks={upcomingTasks} timezone={user.timezone} />
        </div>
      </div>
    </div>
  );
}

