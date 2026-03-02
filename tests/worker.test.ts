import { processMissedTaskEmailsWithDeps } from "@/worker/reminder-worker";

const task = {
  id: "task_1",
  title: "Finish report",
  eodDeadline: new Date("2026-03-02T16:00:00.000Z"),
  userId: "user_1",
  user: {
    email: "demo@example.com",
    username: "demo",
    timezone: "UTC",
  },
};

describe("reminder worker", () => {
  it("sends missed email once and updates marker", async () => {
    const markTaskEmailed = vi.fn().mockResolvedValue({ count: 1 });
    const resetUserStreak = vi.fn().mockResolvedValue(undefined);

    await processMissedTaskEmailsWithDeps(
      {
        fetchMissedTasks: vi.fn().mockResolvedValue([task]),
        sendMissedTaskEmail: vi.fn().mockResolvedValue({ ok: true }),
        markTaskEmailed,
        resetUserStreak,
        logError: vi.fn(),
      },
      new Date("2026-03-02T17:00:00.000Z"),
    );

    expect(markTaskEmailed).toHaveBeenCalledTimes(1);
    expect(resetUserStreak).toHaveBeenCalledWith("user_1");
  });

  it("does not mark task when email fails", async () => {
    const markTaskEmailed = vi.fn().mockResolvedValue({ count: 1 });
    const resetUserStreak = vi.fn().mockResolvedValue(undefined);

    await processMissedTaskEmailsWithDeps(
      {
        fetchMissedTasks: vi.fn().mockResolvedValue([task]),
        sendMissedTaskEmail: vi.fn().mockResolvedValue({ ok: false, error: "boom" }),
        markTaskEmailed,
        resetUserStreak,
        logError: vi.fn(),
      },
      new Date(),
    );

    expect(markTaskEmailed).not.toHaveBeenCalled();
    expect(resetUserStreak).toHaveBeenCalledWith("user_1");
  });

  it("logs errors and keeps processing", async () => {
    const logError = vi.fn();

    await processMissedTaskEmailsWithDeps(
      {
        fetchMissedTasks: vi.fn().mockResolvedValue([task]),
        sendMissedTaskEmail: vi.fn().mockRejectedValue(new Error("network")),
        markTaskEmailed: vi.fn(),
        resetUserStreak: vi.fn(),
        logError,
      },
      new Date(),
    );

    expect(logError).toHaveBeenCalled();
  });
});
