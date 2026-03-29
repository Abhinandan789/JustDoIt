import { formatForTimezone, parseLocalDateTimeToUTC, resolveTimezone } from "@/lib/timezone";
import { toDateTimeLocalValue } from "@/utils/date";

describe("timezone safety", () => {
  it("falls back to UTC when timezone is invalid", () => {
    expect(resolveTimezone("bad/timezone")).toBe("UTC");
    expect(resolveTimezone("")).toBe("UTC");
  });

  it("formats date safely with invalid timezone", () => {
    const value = formatForTimezone(new Date("2026-03-05T10:00:00.000Z"), "bad/timezone", "PP p");
    expect(typeof value).toBe("string");
    expect(value.length).toBeGreaterThan(0);
  });

  it("builds datetime-local value safely with invalid timezone", () => {
    const value = toDateTimeLocalValue(new Date("2026-03-05T10:00:00.000Z"), "bad/timezone");
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it("parses local datetime with timezone fallback", () => {
    const parsed = parseLocalDateTimeToUTC("2026-03-05T18:30", "bad/timezone");
    expect(Number.isNaN(parsed.getTime())).toBe(false);
  });
});

