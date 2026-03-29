const mocked = vi.hoisted(() => ({
  getRequiredUser: vi.fn(),
  parseLocalDateTimeToUTC: vi.fn(() => new Date("2026-03-02T22:00:00.000Z")),
  prisma: {
    task: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn().mockResolvedValue(10), // Mock for task limit checking
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getRequiredUser: mocked.getRequiredUser,
}));

vi.mock("@/lib/timezone", () => ({
  parseLocalDateTimeToUTC: mocked.parseLocalDateTimeToUTC,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocked.prisma,
}));

import { completeTaskAction, createTaskAction, deleteTaskAction } from "@/actions/task-actions";

describe("task CRUD actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.getRequiredUser.mockResolvedValue({
      id: "user_1",
      timezone: "UTC",
      tier: "FREE",
      tasksLimit: 50,
      subscriptionExpiresAt: null,
    });
  });

  it("creates a task scoped to authenticated user", async () => {
    const formData = new FormData();
    formData.set("title", "Write report");
    formData.set("description", "Finish before EOD");
    formData.set("priority", "HIGH");
    formData.set("eodDeadline", "2026-03-02T22:00");

    const result = await createTaskAction(undefined, formData);

    expect(result.ok).toBe(true);
    expect(mocked.prisma.task.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user_1",
          title: "Write report",
        }),
      }),
    );
  });

  it("completes an owned task", async () => {
    mocked.prisma.task.findFirst.mockResolvedValue({ id: "task_1", status: "PENDING" });

    const formData = new FormData();
    formData.set("id", "task_1");

    const result = await completeTaskAction(formData);

    expect(result.ok).toBe(true);
    expect(mocked.prisma.task.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "task_1" },
        data: expect.objectContaining({ status: "COMPLETED" }),
      }),
    );
  });

  it("deletes only owned tasks", async () => {
    mocked.prisma.task.deleteMany.mockResolvedValue({ count: 1 });

    const formData = new FormData();
    formData.set("id", "task_1");

    const result = await deleteTaskAction(formData);

    expect(result.ok).toBe(true);
    expect(mocked.prisma.task.deleteMany).toHaveBeenCalledWith({
      where: { id: "task_1", userId: "user_1" },
    });
  });
});
