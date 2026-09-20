"use client";

import { useCurrency } from "@/components/currency/CurrencyProvider";
import { BASE_CURRENCY } from "@/lib/currency/currencies";

/* ============================================================
   The small print under a converted figure: these are indicative
   rates, and the deal itself is still in dollars.
   ============================================================ */

export default function RateNote({
  className,
  /* the loan wording — only wanted beside the mortgage calculator */
  loan = false,
}: {
  className?: string;
  loan?: boolean;
}) {
  const { currency, ratesUpdated } = useCurrency();
  const converted = currency !== BASE_CURRENCY;

  const parts = [
    converted && loan
      ? `Shown in ${currency} at today's indicative exchange rate. Your actual loan is denominated in ${BASE_CURRENCY}.`
      : converted
        ? `Shown in ${currency} at today's indicative exchange rate. Prices are denominated in ${BASE_CURRENCY}.`
        : null,
    ratesUpdated ? `Rates updated ${ratesUpdated}.` : null,
  ].filter(Boolean);

  if (!parts.length) return null;

  return (
    <p className={className} suppressHydrationWarning>
      {parts.join(" ")}
    </p>
  );
}
