"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { buttonClass } from "@/lib/button-styles";
import type { TaskFilter, TaskSort } from "@/types/tasks";
import { cn } from "@/utils/format";

const filters: Array<{ label: string; value: TaskFilter }> = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Missed", value: "missed" },
];

const sortOptions: Array<{ label: string; value: TaskSort }> = [
  { label: "Deadline", value: "deadline" },
  { label: "Priority", value: "priority" },
  { label: "Recently Created", value: "recent" },
];

type TasksToolbarProps = {
  filter: TaskFilter;
  sort: TaskSort;
  query: string;
  total: number;
  shown: number;
  counts: Record<TaskFilter, number>;
};

export function TasksToolbar({ filter, sort, query, total, shown, counts }: TasksToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(query);

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      const next = params.toString();
      if (next === searchParams.toString()) {
        return;
      }

      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const normalized = searchValue.trim();
      setParam("q", normalized.length > 0 ? normalized : null);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchValue, setParam]);

  const resultLabel = useMemo(() => `Showing ${shown} of ${total} task${total === 1 ? "" : "s"}`, [shown, total]);

  return (
    <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => {
          const active = item.value === filter;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setParam("status", item.value === "all" ? null : item.value)}
              className={cn(
                buttonClass(active ? "primary" : "secondary", "px-3 py-1.5 text-sm font-medium"),
                "whitespace-nowrap",
              )}
            >
              {item.label} ({counts[item.value]})
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Search title or description..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors duration-200 focus:border-gray-500 focus:outline-none dark:border-[#303030] dark:bg-[#141414] dark:text-gray-100 dark:focus:border-gray-500"
        />

        <select
          value={sort}
          onChange={(event) => setParam("sort", event.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors duration-200 focus:border-gray-500 focus:outline-none dark:border-[#303030] dark:bg-[#141414] dark:text-gray-100 dark:focus:border-gray-500"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Sort by {option.label}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">{resultLabel}</p>
    </section>
  );
}
