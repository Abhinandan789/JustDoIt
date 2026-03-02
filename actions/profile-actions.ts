"use server";

import { revalidatePath } from "next/cache";

import { getRequiredUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";
import { initialActionState, type ActionState } from "@/types/actions";

export async function updateProfileAction(
  prevState: ActionState = initialActionState,
  formData: FormData,
): Promise<ActionState> {
  void prevState;

  const user = await getRequiredUser();

  if (!user) {
    return { ok: false, message: "Unauthorized" };
  }

  const parsed = profileSchema.safeParse({
    timezone: formData.get("timezone"),
    profileImage: formData.get("profileImage"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid profile input",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      timezone: parsed.data.timezone,
      profileImage: parsed.data.profileImage || null,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/tasks");

  return { ok: true, message: "Profile updated" };
}
