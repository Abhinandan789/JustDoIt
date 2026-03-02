"use server";

import { revalidatePath } from "next/cache";

import { getRequiredUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { focusSessionSchema } from "@/lib/validations";
import { type ActionState } from "@/types/actions";

export async function logFocusSessionAction(input: {
  taskId?: string;
  duration: number;
}): Promise<ActionState> {
  const user = await getRequiredUser();

  if (!user) {
    return { ok: false, message: "Unauthorized" };
  }

  const parsed = focusSessionSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid focus session" };
  }

  let validTaskId: string | undefined;

  if (parsed.data.taskId) {
    const task = await prisma.task.findFirst({
      where: {
        id: parsed.data.taskId,
        userId: user.id,
      },
      select: { id: true },
    });

    validTaskId = task?.id;
  }

  await prisma.focusSession.create({
    data: {
      userId: user.id,
      taskId: validTaskId,
      duration: parsed.data.duration,
    },
  });

  revalidatePath("/analytics");

  return { ok: true, message: "Focus session logged" };
}
