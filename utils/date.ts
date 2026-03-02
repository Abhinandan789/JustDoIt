import { format, isAfter } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export function toDateTimeLocalValue(date: Date, timezone: string) {
  const zoned = toZonedTime(date, timezone);
  return format(zoned, "yyyy-MM-dd'T'HH:mm");
}

export function isMissed(eodDeadline: Date, now = new Date()) {
  return isAfter(now, eodDeadline);
}
