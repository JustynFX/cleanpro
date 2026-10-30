// Pure helpers (safe for browser and server).
export const TIME_SLOTS = ["8:00 AM - 11:00 AM", "11:00 AM - 2:00 PM", "2:00 PM - 5:00 PM"] as const;

/** Today's date in Benin City (Africa/Lagos) as YYYY-MM-DD. */
export function lagosToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" });
}

export function addDays(ymd: string, n: number): string {
  const d = new Date(ymd + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Returns an error message, or null when the date is bookable (tomorrow up to 60 days ahead). */
export function validateDate(ymd: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return "Choose a valid date.";
  const parsed = new Date(ymd + "T00:00:00Z");
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== ymd) return "Choose a valid date.";
  const today = lagosToday();
  if (ymd < addDays(today, 1)) return "Please choose a date from tomorrow onward.";
  if (ymd > addDays(today, 60)) return "Bookings can be made up to 60 days ahead.";
  return null;
}

export function formatLongDate(ymd: string): string {
  return new Date(ymd + "T00:00:00Z").toLocaleDateString("en-NG", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}
