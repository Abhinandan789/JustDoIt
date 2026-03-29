import { format, isAfter } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { resolveTimezone } from "@/lib/timezone";

export function toDateTimeLocalValue(date: Date, timezone: string) {
  try {
    const resolved = resolveTimezone(timezone);
    const zoned = toZonedTime(date, resolved);
    return format(zoned, "yyyy-MM-dd'T'HH:mm");
  } catch {
    // Fallback to UTC formatting
    return format(date, "yyyy-MM-dd'T'HH:mm");
  }
}

export function isMissed(eodDeadline: Date, now = new Date()) {
  return isAfter(now, eodDeadline);
}
