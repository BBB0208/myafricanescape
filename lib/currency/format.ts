/* ============================================================
   Money on the page. Intl does all of it — symbols, grouping,
   decimals, the quirks of zero-decimal currencies — so nothing
   here ever concatenates a symbol onto a number.
   ============================================================ */

import { currencyConfig, DEFAULT_CURRENCY } from "./currencies";

/* Shown when an amount isn't a number, so a missing price can
   never surface as NaN or undefined. */
export const EM_DASH = "—";

/* Amara quotes whole figures ("$1,850,000", not "$1,850,000.00").
   That house style is kept for every currency; Intl still decides
   the symbol, its position and the separators. */
const WHOLE = { maximumFractionDigits: 0, minimumFractionDigits: 0 } as const;

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(code: string, compact: boolean): Intl.NumberFormat | null {
  const key = `${code}:${compact}`;
  const hit = formatters.get(key);
  if (hit) return hit;

  const config = currencyConfig(code);
  try {
    const made = new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      currencyDisplay: config.display,
      ...(compact ? { notation: "compact", maximumFractionDigits: 1 } : WHOLE),
    });
    formatters.set(key, made);
    return made;
  } catch {
    /* an engine without the data for this currency */
    return null;
  }
}

/* Node and the browser occasionally disagree on which flavour of
   space sits between symbol and digits; levelling them keeps the
   server and client markup identical. */
const normalize = (value: string) => value.replace(/[   ]/g, " ");

export type FormatOptions = { compact?: boolean };

/* formatMoney(212500, "EUR") → "€212,500" */
export function formatMoney(
  amount: number | null | undefined,
  code: string = DEFAULT_CURRENCY,
  { compact = false }: FormatOptions = {},
): string {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return EM_DASH;

  const fmt = formatter(code, compact) ?? formatter(DEFAULT_CURRENCY, compact);
  if (!fmt) return EM_DASH;

  try {
    return normalize(fmt.format(amount));
  } catch {
    return EM_DASH;
  }
}

/* "$2.7M" — for the live stat counters. */
export const formatMoneyCompact = (amount: number | null | undefined, code?: string) =>
  formatMoney(amount, code, { compact: true });

/* "Sep 20, 2026". Pinned to UTC so the server and the browser
   always print the same day. */
export function formatRateDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return iso.slice(0, 10);
  }
}

/* The symbol and the digits, separately, so a layout can set them at
   different sizes ("$" small, "1,850,000" large) without ever guessing
   which symbol belongs to which currency. */
export function splitMoney(
  amount: number | null | undefined,
  code: string = DEFAULT_CURRENCY,
): { symbol: string; value: string } {
  const whole = formatMoney(amount, code);
  if (whole === EM_DASH) return { symbol: "", value: EM_DASH };

  const config = currencyConfig(code);
  try {
    const parts = new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      currencyDisplay: config.display,
      ...WHOLE,
    }).formatToParts(amount as number);

    const firstDigit = parts.findIndex((part) => part.type === "integer");
    /* symbol trails the number in this locale — keep it in one piece */
    if (firstDigit <= 0) return { symbol: "", value: whole };

    const join = (from: number, to?: number) =>
      normalize(
        parts
          .slice(from, to)
          .map((part) => part.value)
          .join(""),
      );
    return { symbol: join(0, firstDigit), value: join(firstDigit) };
  } catch {
    return { symbol: "", value: whole };
  }
}
