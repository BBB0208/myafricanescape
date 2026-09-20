import { stegaClean } from "next-sanity";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/* Today as YYYY-MM-DD, for the "upcoming events" filter. */
export const today = () => new Date().toISOString().slice(0, 10);

/* "2026-09-14" → { day: "14", month: "SEP" }, without timezone drift. */
export function dayAndMonth(date: string | null | undefined) {
  const [, month, day] = (stegaClean(date) ?? "").split("-");
  return { day: day ?? "", month: MONTHS[Number(month) - 1] ?? "" };
}

/* "Updated 2 days ago" / "Updated Sep 20, 2026".

   Anything inside a fortnight reads as an interval, which is what tells a
   buyer the inventory is live; past that an exact date is more use than
   "3 weeks ago". Formatting is pinned to UTC and to en-US so the server
   and the browser always print the same string. */
export function updatedLabel(
  iso: string | null | undefined,
  now: Date = new Date(),
): string | null {
  const value = stegaClean(iso);
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (days < 0) return null; // a clock skew, not a real date
  if (days === 0) return "Updated today";
  if (days === 1) return "Updated yesterday";
  if (days < 14) return `Updated ${days} days ago`;

  try {
    const formatted = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
    return `Updated ${formatted}`;
  } catch {
    return `Updated ${value.slice(0, 10)}`;
  }
}
