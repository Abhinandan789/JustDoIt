import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

export function parseLocalDateTimeToUTC(localDateTime: string, timezone: string): Date {
  try {
    const resolved = resolveTimezone(timezone);
    return fromZonedTime(localDateTime, resolved);
  } catch {
    // Fallback to UTC parsing
    return new Date(localDateTime);
  }
}

export function formatForTimezone(date: Date, timezone: string, pattern = "PPpp"): string {
  try {
    const resolved = resolveTimezone(timezone);
    return formatInTimeZone(date, resolved, pattern);
  } catch {
    // Fallback to UTC formatting
    return formatInTimeZone(date, "UTC", pattern);
  }
}

export function nowInTimezone(timezone: string): Date {
  try {
    const resolved = resolveTimezone(timezone);
    return toZonedTime(new Date(), resolved);
  } catch {
    // Fallback to UTC
    return new Date();
  }
}

export function isPastInTimezone(date: Date, timezone: string): boolean {
  try {
    const resolved = resolveTimezone(timezone);
    const zonedNow = toZonedTime(new Date(), resolved);
    const zonedDate = toZonedTime(date, resolved);
    return zonedNow.getTime() > zonedDate.getTime();
  } catch {
    // Fallback to UTC comparison
    return new Date().getTime() > date.getTime();
  }
}

/**
 * Validate and resolve timezone string
 * Falls back to UTC if invalid
 * Uses Intl API for proper browser-compatible validation
 */
export function resolveTimezone(timezone?: string | null): string {
  // Default to UTC
  if (!timezone || typeof timezone !== "string" || timezone.trim().length === 0) {
    return "UTC";
  }

  try {
    // Validate using Intl API - this will throw if timezone is invalid
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return timezone;
  } catch {
    // Invalid timezone, fall back to UTC
    return "UTC";
  }
}
