import { TaskPriority, TaskStatus } from "@prisma/client";
import { formatDistanceStrict, isAfter } from "date-fns";

import type { TaskFilter, TaskSort } from "@/types/tasks";

export type TaskListItem = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  eodDeadline: Date;
  completedAt: Date | null;
  createdAt: Date;
};

export function parseTaskFilter(value?: string): TaskFilter {
  if (value === "pending" || value === "completed" || value === "missed" || value === "all") {
    return value;
  }

  return "all";
}

export function parseTaskSort(value?: string): TaskSort {
  if (value === "deadline" || value === "priority" || value === "recent") {
    return value;
  }

  return "deadline";
}

export function normalizeTaskSearch(value?: string): string {
  return (value ?? "").trim();
}

export function taskMatchesSearch(task: Pick<TaskListItem, "title" | "description">, query: string) {
  if (!query) {
    return true;
  }

  const needle = query.toLowerCase();
  const title = task.title.toLowerCase();
  const description = (task.description ?? "").toLowerCase();

  return title.includes(needle) || description.includes(needle);
}

export function taskMatchesFilter(task: Pick<TaskListItem, "status" | "eodDeadline">, filter: TaskFilter, now = new Date()) {
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isMissed = task.status === TaskStatus.PENDING && isAfter(now, task.eodDeadline);
  const isPending = task.status === TaskStatus.PENDING && !isMissed;

  if (filter === "completed") {
    return isCompleted;
  }

  if (filter === "missed") {
    return isMissed;
  }

  if (filter === "pending") {
    return isPending;
  }

  return true;
}

const priorityRank: Record<TaskPriority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export function sortTaskList(tasks: TaskListItem[], sort: TaskSort) {
  const sorted = [...tasks];

  if (sort === "recent") {
    return sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  if (sort === "priority") {
    return sorted.sort((a, b) => {
      const rankDiff = priorityRank[a.priority] - priorityRank[b.priority];
      if (rankDiff !== 0) {
        return rankDiff;
      }

      return a.eodDeadline.getTime() - b.eodDeadline.getTime();
    });
  }

  return sorted.sort((a, b) => a.eodDeadline.getTime() - b.eodDeadline.getTime());
}

export function applyTaskQuery({
  tasks,
  filter,
  sort,
  query,
  now = new Date(),
}: {
  tasks: TaskListItem[];
  filter: TaskFilter;
  sort: TaskSort;
  query: string;
  now?: Date;
}) {
  const filtered = tasks.filter((task) => taskMatchesFilter(task, filter, now) && taskMatchesSearch(task, query));
  return sortTaskList(filtered, sort);
}

export function getTaskFilterCounts(tasks: TaskListItem[], now = new Date()) {
  return {
    all: tasks.length,
    pending: tasks.filter((task) => taskMatchesFilter(task, "pending", now)).length,
    completed: tasks.filter((task) => taskMatchesFilter(task, "completed", now)).length,
    missed: tasks.filter((task) => taskMatchesFilter(task, "missed", now)).length,
  };
}

export function selectUpcomingTasks(tasks: TaskListItem[], now = new Date(), limit = 5) {
  return tasks
    .filter((task) => task.status === TaskStatus.PENDING && task.eodDeadline.getTime() > now.getTime())
    .sort((a, b) => a.eodDeadline.getTime() - b.eodDeadline.getTime())
    .slice(0, limit);
}

export function getDueInLabel(eodDeadline: Date, now = new Date()) {
  if (eodDeadline.getTime() <= now.getTime()) {
    return "Due now";
  }

  return `Due in ${formatDistanceStrict(now, eodDeadline)}`;
}
