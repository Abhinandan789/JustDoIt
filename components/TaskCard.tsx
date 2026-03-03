import { TaskPriority, TaskStatus } from "@prisma/client";

import { completeTaskSubmitAction, deleteTaskSubmitAction } from "@/actions/task-actions";
import { EditTaskModal } from "@/components/EditTaskModal";
import { buttonClass } from "@/lib/button-styles";
import { getMissedByLabel, getTaskDisplayStatus } from "@/lib/reminders";
import { formatForTimezone } from "@/lib/timezone";
import { cn } from "@/utils/format";

export type TaskCardTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  eodDeadline: Date;
  completedAt: Date | null;
};

type TaskCardProps = {
  task: TaskCardTask;
  timezone: string;
};

const priorityTone: Record<TaskPriority, string> = {
  LOW: "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  URGENT: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
};

export function TaskCard({ task, timezone }: TaskCardProps) {
  const displayStatus = getTaskDisplayStatus(task);
  const missedBy = displayStatus === "MISSED" ? getMissedByLabel(task.eodDeadline) : "";

  return (
    <article
      className={cn(
        "rounded-xl border bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-[#1a1a1a] dark:hover:bg-[#202020]",
        displayStatus === "MISSED" && "border-rose-500 bg-rose-100 dark:bg-rose-500/10",
        displayStatus === "COMPLETED" && "border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10",
        displayStatus === "PENDING" && "border-gray-200 dark:border-[#2a2a2a]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{task.title}</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{task.description || "No description"}</p>
        </div>
        <span className={cn("rounded-full px-2 py-1 text-xs font-medium", priorityTone[task.priority])}>{task.priority}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span
          className={cn(
            "rounded-full px-2 py-1 font-medium",
            displayStatus === "MISSED" && "bg-rose-200 text-rose-800 dark:bg-rose-500/15 dark:text-rose-400",
            displayStatus === "COMPLETED" && "bg-emerald-200 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
            displayStatus === "PENDING" && "bg-gray-200 text-gray-700 dark:bg-[#202020] dark:text-gray-400",
          )}
        >
          {displayStatus === "MISSED" ? "Missed" : displayStatus === "COMPLETED" ? "Completed" : "Pending"}
        </span>
        <span className="text-gray-600 dark:text-gray-400">Deadline: {formatForTimezone(task.eodDeadline, timezone, "PP p")}</span>
        {missedBy ? <span className="font-medium text-rose-700 dark:text-rose-300">{missedBy}</span> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <form action={completeTaskSubmitAction}>
          <input type="hidden" name="id" value={task.id} />
          <button
            type="submit"
            className={buttonClass("primary", "px-3 py-2 text-sm font-medium")}
          >
            {task.status === "COMPLETED" ? "Reopen" : "Complete"}
          </button>
        </form>

        <EditTaskModal task={task} timezone={timezone} />

        <form action={deleteTaskSubmitAction}>
          <input type="hidden" name="id" value={task.id} />
          <button
            type="submit"
            className={buttonClass("danger", "px-3 py-2 text-sm font-medium")}
          >
            Delete
          </button>
        </form>
      </div>
    </article>
  );
}

