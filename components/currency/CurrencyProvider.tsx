"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  type ExchangeRates,
  type DisplayAmount,
  resolveDisplayAmount,
  USD_ONLY_RATES,
} from "@/lib/currency/convert";
import {
  BASE_CURRENCY,
  CURRENCY_COOKIE,
  CURRENCY_COOKIE_MAX_AGE,
  type CurrencyCode,
  DEFAULT_CURRENCY,
  isCurrencyCode,
} from "@/lib/currency/currencies";
import { formatMoney, formatRateDate } from "@/lib/currency/format";

/* ============================================================
   The display currency, for the whole site.

   The chosen currency arrives from the cookie the server already
   read, and the rate table arrives as a prop — so the first paint
   is correct, nothing is read from localStorage during rendering,
   and there is no hydration mismatch to warn about.
   ============================================================ */

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  rates: ExchangeRates;
  /* true while the site is showing dollars because no rates could
     be fetched */
  ratesUnavailable: boolean;
  /* "Sep 20, 2026", or null when no provider answered */
  ratesUpdated: string | null;
  /* USD figure → what to print, and in which currency */
  display: (amount: number | null | undefined, sourceCurrency?: string) => DisplayAmount;
  /* USD figure → the finished string */
  format: (
    amount: number | null | undefined,
    options?: { sourceCurrency?: string; compact?: boolean },
  ) => string;
};

const FALLBACK: CurrencyContextValue = {
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  rates: USD_ONLY_RATES,
  ratesUnavailable: true,
  ratesUpdated: null,
  display: (amount, sourceCurrency = BASE_CURRENCY) =>
    resolveDisplayAmount(amount, sourceCurrency, DEFAULT_CURRENCY, USD_ONLY_RATES),
  format: (amount, options) =>
    formatMoney(amount, options?.sourceCurrency ?? BASE_CURRENCY, { compact: options?.compact }),
};

const CurrencyContext = createContext<CurrencyContextValue>(FALLBACK);

/* Usable outside the provider too — it simply keeps showing USD,
   which is what the site did before this layer existed. */
export const useCurrency = () => useContext(CurrencyContext);

function persist(code: CurrencyCode) {
  if (typeof document === "undefined") return;
  try {
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie =
      `${CURRENCY_COOKIE}=${code}; path=/; max-age=${CURRENCY_COOKIE_MAX_AGE}; samesite=lax` + secure;
  } catch {
    /* cookies blocked — the choice simply lasts for this visit */
  }
}

export default function CurrencyProvider({
  initialCurrency = DEFAULT_CURRENCY,
  rates = USD_ONLY_RATES,
  children,
}: {
  initialCurrency?: CurrencyCode;
  rates?: ExchangeRates;
  children: ReactNode;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(
    isCurrencyCode(initialCurrency) ? initialCurrency : DEFAULT_CURRENCY,
  );

  const setCurrency = useCallback((code: CurrencyCode) => {
    if (!isCurrencyCode(code)) return;
    setCurrencyState(code);
    persist(code);
  }, []);

  const value = useMemo<CurrencyContextValue>(() => {
    const display: CurrencyContextValue["display"] = (amount, sourceCurrency = BASE_CURRENCY) =>
      resolveDisplayAmount(amount, sourceCurrency, currency, rates);

    return {
      currency,
      setCurrency,
      rates,
      ratesUnavailable: rates.stale && rates.updatedAt === null,
      ratesUpdated: formatRateDate(rates.updatedAt),
      display,
      format: (amount, options) => {
        const resolved = display(amount, options?.sourceCurrency);
        return formatMoney(resolved.amount, resolved.currency, { compact: options?.compact });
      },
    };
  }, [currency, rates, setCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}
