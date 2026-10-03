/** Calendar dates in the same time zone the admin uses to choose a time. */
export function calendarDate(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (name: string) => parts.find(value => value.type === name)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function shiftCalendarDay(day: string, amount: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function scheduleWeek(now: Date, timeZone: string) {
  const today = calendarDate(now, timeZone);
  const weekday = new Date(`${today}T12:00:00Z`).getUTCDay();
  const start = shiftCalendarDay(today, -(weekday + 6) % 7);
  return { start, end: shiftCalendarDay(start, 6) };
}

export function scheduleTimeError(value: string | null, timeZone = "UTC", now = new Date()): string | null {
  const at = value ? new Date(value) : new Date(NaN);
  if (!Number.isFinite(at.getTime())) return "Choose a valid date and time.";
  if (at.getTime() <= now.getTime()) return "Choose a future publication time.";
  try {
    const { start, end } = scheduleWeek(now, timeZone);
    const day = calendarDate(at, timeZone);
    if (day < start || day > end) return "Choose a time within the current week (Monday–Sunday).";
  } catch {
    return "Choose a valid time zone.";
  }
  return null;
}
