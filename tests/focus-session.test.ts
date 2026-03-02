const mocked = vi.hoisted(() => ({
  getRequiredUser: vi.fn(),
  prisma: {
    task: {
      findFirst: vi.fn(),
    },
    focusSession: {
      create: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getRequiredUser: mocked.getRequiredUser,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocked.prisma,
}));

import { logFocusSessionAction } from "@/actions/focus-actions";

describe("focus session logging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated users", async () => {
    mocked.getRequiredUser.mockResolvedValue(null);

    const result = await logFocusSessionAction({ duration: 25 });

    expect(result.ok).toBe(false);
  });

  it("creates a focus session with owned task", async () => {
    mocked.getRequiredUser.mockResolvedValue({ id: "user_1" });
    mocked.prisma.task.findFirst.mockResolvedValue({ id: "task_1" });

    const result = await logFocusSessionAction({ taskId: "task_1", duration: 25 });

    expect(result.ok).toBe(true);
    expect(mocked.prisma.focusSession.create).toHaveBeenCalledWith({
      data: {
        userId: "user_1",
        taskId: "task_1",
        duration: 25,
      },
    });
  });
});
