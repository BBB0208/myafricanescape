"use client";

import { useCurrency } from "@/components/currency/CurrencyProvider";
import { BASE_CURRENCY, toCurrencyCode } from "@/lib/currency/currencies";
import { formatMoney } from "@/lib/currency/format";

/* ============================================================
   A price on the page.

   `amount` is the figure as stored — dollars, unless a listing
   says otherwise — and is never mutated. Only the rendering
   follows the visitor's chosen currency.
   ============================================================ */

export default function Price({
  amount,
  currency = BASE_CURRENCY,
  compact = false,
  className,
  /* adds "≈ $1,850,000 USD" underneath, so it stays clear which
     currency the listing is actually denominated in */
  usdNote = false,
  usdNoteClassName,
}: {
  amount: number | null | undefined;
  currency?: string | null;
  compact?: boolean;
  className?: string;
  usdNote?: boolean;
  usdNoteClassName?: string;
}) {
  const { display } = useCurrency();
  const source = toCurrencyCode(currency, BASE_CURRENCY);
  const resolved = display(amount, source);

  const showNote =
    usdNote &&
    resolved.converted &&
    resolved.currency !== BASE_CURRENCY &&
    typeof resolved.amountUsd === "number";

  return (
    <>
      {/* Intl data can differ by a hair between Node and the browser;
          the markup is identical either way, so don't warn on it */}
      <span className={className} suppressHydrationWarning>
        {formatMoney(resolved.amount, resolved.currency, { compact })}
      </span>
      {showNote ? (
        <span className={usdNoteClassName} suppressHydrationWarning>
          {`≈ ${formatMoney(resolved.amountUsd, BASE_CURRENCY, { compact })} ${BASE_CURRENCY}`}
        </span>
      ) : null}
    </>
  );
}
