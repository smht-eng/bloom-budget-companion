import {
  format,
  getDaysInMonth,
  startOfMonth,
  endOfMonth,
  differenceInCalendarDays,
  parseISO,
  isSameMonth,
  isSameDay,
} from "date-fns";

/** yyyy-MM-dd in local time */
export function toDateKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** yyyy-MM in local time */
export function toMonthKey(d: Date): string {
  return format(d, "yyyy-MM");
}

export function monthKeyFromDateKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function parseDateKey(dateKey: string): Date {
  return parseISO(dateKey);
}

export function daysInMonthOf(d: Date): number {
  return getDaysInMonth(d);
}

/** Days remaining in the month, inclusive of today. Handles Feb / leap years via date-fns. */
export function remainingDaysInMonth(d: Date): number {
  const total = getDaysInMonth(d);
  return total - d.getDate() + 1;
}

export function dayOfMonth(d: Date): number {
  return d.getDate();
}

export function monthLabel(d: Date): string {
  return format(d, "MMMM yyyy");
}

export function monthShort(d: Date): string {
  return format(d, "MMMM");
}

export { startOfMonth, endOfMonth, differenceInCalendarDays, isSameMonth, isSameDay };
