"use server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { initialActionState, type ActionState } from "@/types/actions";

function flattenErrors(issues: { path: readonly PropertyKey[]; message: string }[]) {
  return issues.reduce<Record<string, string>>((acc, issue) => {
    const key = String(issue.path[0] ?? "form");
    acc[key] = issue.message;
    return acc;
  }, {});
}

export async function registerAction(
  prevState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  void prevState;

  const parsed = registerSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    timezone: formData.get("timezone") || "UTC",
  });

  if (!parsed.success) {
    return {
      ok: false,
      errors: flattenErrors(parsed.error.issues),
    };
  }

  const email = parsed.data.email.toLowerCase();

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username: parsed.data.username }],
    },
    select: { id: true, email: true, username: true },
  });

  if (existing?.email === email) {
    return {
      ok: false,
      errors: { email: "Email is already registered" },
    };
  }

  if (existing?.username === parsed.data.username) {
    return {
      ok: false,
      errors: { username: "Username is already taken" },
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      username: parsed.data.username,
      email,
      passwordHash,
      timezone: parsed.data.timezone,
    },
  });

  return {
    ok: true,
    message: "Registration successful. You can log in now.",
  };
}
