"use server";

import { TaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getRequiredUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseLocalDateTimeToUTC } from "@/lib/timezone";
import { taskInputSchema, updateTaskInputSchema } from "@/lib/validations";
import { initialActionState, type ActionState } from "@/types/actions";
import { getUserCapabilities, checkTaskLimit, getUpgradePrompt } from "@/lib/feature-gates";

function parseTaskFields(formData: FormData) {
  return {
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    priority: formData.get("priority"),
    eodDeadline: formData.get("eodDeadline"),
  };
}

function parseIssues(issues: { path: readonly PropertyKey[]; message: string }[]) {
  return issues.reduce<Record<string, string>>((acc, issue) => {
    const key = String(issue.path[0] ?? "form");
    acc[key] = issue.message;
    return acc;
  }, {});
}

function revalidateTaskViews() {
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  revalidatePath("/analytics");
}

export async function createTaskAction(
  prevState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  void prevState;

  const user = await getRequiredUser();

  if (!user) {
    return { ok: false, message: "Unauthorized" };
  }

  // Check if user has reached their task limit
  const capabilities = getUserCapabilities(user);
  const taskCount = await prisma.task.count({ where: { userId: user.id } });
  const limitCheck = checkTaskLimit(capabilities, taskCount);

  if (!limitCheck.canCreateTask) {
    return {
      ok: false,
      message: limitCheck.message,
      errors: {
        form: `${limitCheck.message} - ${getUpgradePrompt("unlimited_tasks")}`,
      },
    };
  }

  const parsed = taskInputSchema.safeParse(parseTaskFields(formData));

  if (!parsed.success) {
    return { ok: false, errors: parseIssues(parsed.error.issues) };
  }

  const eodDeadline = parseLocalDateTimeToUTC(parsed.data.eodDeadline, user.timezone);

  await prisma.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      eodDeadline,
      userId: user.id,
    },
  });

  revalidateTaskViews();

  return { ok: true, message: "Task created" };
}

export async function updateTaskAction(
  prevState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  void prevState;

  const user = await getRequiredUser();

  if (!user) {
    return { ok: false, message: "Unauthorized" };
  }

  const parsed = updateTaskInputSchema.safeParse({
    ...parseTaskFields(formData),
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return { ok: false, errors: parseIssues(parsed.error.issues) };
  }

  const task = await prisma.task.findFirst({
    where: { id: parsed.data.id, userId: user.id },
    select: { id: true },
  });

  if (!task) {
    return { ok: false, message: "Task not found" };
  }

  const eodDeadline = parseLocalDateTimeToUTC(parsed.data.eodDeadline, user.timezone);

  await prisma.task.update({
    where: { id: task.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      eodDeadline,
    },
  });

  revalidateTaskViews();

  return { ok: true, message: "Task updated" };
}

export async function deleteTaskAction(formData: FormData): Promise<ActionState> {
  const user = await getRequiredUser();

  if (!user) {
    return { ok: false, message: "Unauthorized" };
  }

  const id = formData.get("id")?.toString() ?? "";

  if (!id) {
    return { ok: false, message: "Task id is required" };
  }

  const deleted = await prisma.task.deleteMany({
    where: { id, userId: user.id },
  });

  if (deleted.count === 0) {
    return { ok: false, message: "Task not found" };
  }

  revalidateTaskViews();

  return { ok: true, message: "Task deleted" };
}

export async function completeTaskAction(formData: FormData): Promise<ActionState> {
  const user = await getRequiredUser();

  if (!user) {
    return { ok: false, message: "Unauthorized" };
  }

  const id = formData.get("id")?.toString() ?? "";

  if (!id) {
    return { ok: false, message: "Task id is required" };
  }

  const task = await prisma.task.findFirst({
    where: { id, userId: user.id },
    select: { id: true, status: true },
  });

  if (!task) {
    return { ok: false, message: "Task not found" };
  }

  const nextStatus = task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;

  await prisma.task.update({
    where: { id: task.id },
    data: {
      status: nextStatus,
      completedAt: nextStatus === TaskStatus.COMPLETED ? new Date() : null,
    },
  });

  revalidateTaskViews();

  return {
    ok: true,
    message: nextStatus === TaskStatus.COMPLETED ? "Task completed" : "Task reopened",
  };
}

export async function deleteTaskSubmitAction(formData: FormData): Promise<void> {
  await deleteTaskAction(formData);
}

export async function completeTaskSubmitAction(formData: FormData): Promise<void> {
  await completeTaskAction(formData);
}
