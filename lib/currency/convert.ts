/* ============================================================
   USD → the currency on screen.

   The stored figure is never touched. Every conversion is one
   multiplication against a dollar-based rate, so nothing is ever
   routed through a third currency.
   ============================================================ */

import { BASE_CURRENCY, type CurrencyCode, DEFAULT_CURRENCY } from "./currencies";

export type RateTable = Record<string, number>;

export type ExchangeRates = {
  /* always "USD" — prices are stored in it and rates are quoted against it */
  base: string;
  rates: RateTable;
  /* when the provider last published these rates, ISO 8601 */
  updatedAt: string | null;
  /* which provider answered, for logging */
  source: string | null;
  /* true when no provider could be reached and we are on the last
     known-good table, or on USD alone */
  stale: boolean;
};

/* What the site runs on when every provider is unreachable and
   nothing has been cached yet: dollars, exactly as before. */
export const USD_ONLY_RATES: ExchangeRates = {
  base: BASE_CURRENCY,
  rates: { [BASE_CURRENCY]: 1 },
  updatedAt: null,
  source: null,
  stale: true,
};

/* Units of `code` per dollar, or null when we have no rate for it. */
export function rateFor(rates: ExchangeRates | null | undefined, code: string): number | null {
  if (code === BASE_CURRENCY) return 1;
  const rate = rates?.rates?.[code];
  return typeof rate === "number" && Number.isFinite(rate) && rate > 0 ? rate : null;
}

export function convertFromUsd(
  amountUsd: number | null | undefined,
  code: string,
  rates: ExchangeRates | null | undefined,
): number | null {
  if (typeof amountUsd !== "number" || !Number.isFinite(amountUsd)) return null;
  const rate = rateFor(rates, code);
  return rate === null ? null : amountUsd * rate;
}

/* The inverse, for the rare listing authored in a local currency. */
export function convertToUsd(
  amount: number | null | undefined,
  code: string,
  rates: ExchangeRates | null | undefined,
): number | null {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return null;
  const rate = rateFor(rates, code);
  return rate === null ? null : amount / rate;
}

export type DisplayAmount = {
  /* the figure to print, in `currency` */
  amount: number | null;
  /* what it is actually printed in — the requested currency, or a
     safe fallback when no rate was available */
  currency: string;
  /* the same money in dollars, for the "≈ USD" note */
  amountUsd: number | null;
  /* false when nothing was converted (already in that currency, or
     no rate to convert with) */
  converted: boolean;
};

/* The single decision point: given a stored price and the currency
   the visitor has chosen, what goes on the page?

   A missing rate never produces NaN and never blanks a price — it
   falls back to dollars, and failing that to the figure as stored. */
export function resolveDisplayAmount(
  amount: number | null | undefined,
  sourceCurrency: string = BASE_CURRENCY,
  targetCurrency: CurrencyCode | string = DEFAULT_CURRENCY,
  rates?: ExchangeRates | null,
): DisplayAmount {
  const source = sourceCurrency || BASE_CURRENCY;

  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return { amount: null, currency: source, amountUsd: null, converted: false };
  }

  const amountUsd = source === BASE_CURRENCY ? amount : convertToUsd(amount, source, rates);

  /* nothing to do — it is already quoted in the chosen currency */
  if (targetCurrency === source) {
    return { amount, currency: source, amountUsd, converted: false };
  }

  /* we could not even reach dollars: show the figure as authored */
  if (amountUsd === null) {
    return { amount, currency: source, amountUsd: null, converted: false };
  }

  if (targetCurrency === BASE_CURRENCY) {
    return { amount: amountUsd, currency: BASE_CURRENCY, amountUsd, converted: true };
  }

  const converted = convertFromUsd(amountUsd, targetCurrency, rates);
  if (converted === null) {
    /* no rate for the chosen currency — dollars, gracefully */
    return { amount: amountUsd, currency: BASE_CURRENCY, amountUsd, converted: source !== BASE_CURRENCY };
  }

  return { amount: converted, currency: targetCurrency, amountUsd, converted: true };
}
