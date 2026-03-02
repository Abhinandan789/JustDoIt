import { TaskStatus } from "@prisma/client";

import { getMissedByLabel, getTaskDisplayStatus } from "@/lib/reminders";

describe("MISSED task detection", () => {
  it("returns MISSED when deadline has passed and task is pending", () => {
    const status = getTaskDisplayStatus(
      {
        status: TaskStatus.PENDING,
        eodDeadline: new Date("2026-03-01T10:00:00.000Z"),
      },
      new Date("2026-03-01T11:00:00.000Z"),
    );

    expect(status).toBe("MISSED");
  });

  it("returns COMPLETED for completed tasks", () => {
    const status = getTaskDisplayStatus(
      {
        status: TaskStatus.COMPLETED,
        eodDeadline: new Date("2026-03-01T10:00:00.000Z"),
      },
      new Date("2026-03-01T11:00:00.000Z"),
    );

    expect(status).toBe("COMPLETED");
  });

  it("builds a missed by label", () => {
    const label = getMissedByLabel(new Date("2026-03-01T10:00:00.000Z"), new Date("2026-03-01T12:15:00.000Z"));
    expect(label).toContain("Missed by");
  });
});
