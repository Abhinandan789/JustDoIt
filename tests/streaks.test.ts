import { getPreviousLocalDayBounds, shouldRunDailyRollover } from "@/lib/streaks";

describe("streak logic", () => {
  it("triggers rollover only at local 00:00", () => {
    const run = shouldRunDailyRollover(new Date("2026-03-02T00:00:00.000Z"), "UTC");
    const skip = shouldRunDailyRollover(new Date("2026-03-02T00:01:00.000Z"), "UTC");

    expect(run).toBe(true);
    expect(skip).toBe(false);
  });

  it("computes previous local day bounds", () => {
    const bounds = getPreviousLocalDayBounds(new Date("2026-03-02T12:00:00.000Z"), "UTC");

    expect(bounds.start.toISOString()).toBe("2026-03-01T00:00:00.000Z");
    expect(bounds.end.toISOString()).toBe("2026-03-02T00:00:00.000Z");
  });
});
