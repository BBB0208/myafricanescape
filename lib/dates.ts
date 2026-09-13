import { stegaClean } from "next-sanity";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/* Today as YYYY-MM-DD, for the "upcoming events" filter. */
export const today = () => new Date().toISOString().slice(0, 10);

/* "2026-09-14" → { day: "14", month: "SEP" }, without timezone drift. */
export function dayAndMonth(date: string | null | undefined) {
  const [, month, day] = (stegaClean(date) ?? "").split("-");
  return { day: day ?? "", month: MONTHS[Number(month) - 1] ?? "" };
}
