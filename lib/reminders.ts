import { TaskStatus } from "@prisma/client";
import { formatDistanceStrict, isAfter } from "date-fns";

export type TaskDisplayStatus = "PENDING" | "COMPLETED" | "MISSED";

export type StatusInput = {
  status: TaskStatus;
  eodDeadline: Date;
};

export function getTaskDisplayStatus(task: StatusInput, now = new Date()): TaskDisplayStatus {
  if (task.status === TaskStatus.COMPLETED) {
    return "COMPLETED";
  }

  if (isAfter(now, task.eodDeadline)) {
    return "MISSED";
  }

  return "PENDING";
}

export function getMissedByLabel(eodDeadline: Date, now = new Date()): string {
  if (!isAfter(now, eodDeadline)) {
    return "";
  }

  return `Missed by ${formatDistanceStrict(eodDeadline, now)}`;
}

export function isTaskMissed(task: StatusInput, now = new Date()) {
  return getTaskDisplayStatus(task, now) === "MISSED";
}
