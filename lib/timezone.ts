import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

export function parseLocalDateTimeToUTC(localDateTime: string, timezone: string): Date {
  return fromZonedTime(localDateTime, timezone);
}

export function formatForTimezone(date: Date, timezone: string, pattern = "PPpp"): string {
  return formatInTimeZone(date, timezone, pattern);
}

export function nowInTimezone(timezone: string): Date {
  return toZonedTime(new Date(), timezone);
}

export function isPastInTimezone(date: Date, timezone: string): boolean {
  const zonedNow = nowInTimezone(timezone);
  const zonedDate = toZonedTime(date, timezone);
  return zonedNow.getTime() > zonedDate.getTime();
}
