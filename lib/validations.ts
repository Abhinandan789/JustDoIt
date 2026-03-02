import { TaskPriority } from "@prisma/client";
import { z } from "zod";

const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long");

export const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers, and underscores only"),
  email: z.string().email(),
  password: passwordRule,
  timezone: z.string().min(1).default("UTC"),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export const taskInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(140, "Title is too long"),
  description: z.string().max(2000, "Description is too long").optional(),
  priority: z.nativeEnum(TaskPriority),
  eodDeadline: z.string().min(1, "Deadline is required"),
});

export const updateTaskInputSchema = taskInputSchema.extend({
  id: z.string().min(1),
});

export const focusSessionSchema = z.object({
  taskId: z.string().min(1).optional(),
  duration: z.number().int().min(1).max(180),
});

export const profileSchema = z.object({
  timezone: z.string().min(1),
  profileImage: z.string().url().optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TaskInput = z.infer<typeof taskInputSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskInputSchema>;
export type FocusSessionInput = z.infer<typeof focusSessionSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
