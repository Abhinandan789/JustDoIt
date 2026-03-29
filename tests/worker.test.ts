import { describe, it, expect, vi } from "vitest";
import { processMissedTaskEmailsWithDeps } from "@/lib/reminder-jobs";
import type { LoggerLike } from "@/lib/logger";

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

const mockLogger: LoggerLike = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  startTimer: vi.fn(() => () => 100),
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
        logger: mockLogger,
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
        logger: mockLogger,
      },
      new Date(),
    );

    expect(markTaskEmailed).not.toHaveBeenCalled();
    expect(resetUserStreak).toHaveBeenCalledWith("user_1");
  });

  it("logs errors and keeps processing", async () => {
    const logger = { ...mockLogger };

    await processMissedTaskEmailsWithDeps(
      {
        fetchMissedTasks: vi.fn().mockResolvedValue([task]),
        sendMissedTaskEmail: vi.fn().mockRejectedValue(new Error("network")),
        markTaskEmailed: vi.fn(),
        resetUserStreak: vi.fn(),
        logger,
      },
      new Date(),
    );

    expect(logger.error).toHaveBeenCalled();
  });
});
