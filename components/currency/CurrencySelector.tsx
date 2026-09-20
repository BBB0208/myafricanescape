"use client";

import { useId } from "react";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import { cn } from "@/lib/cn";
import { SUPPORTED_CURRENCIES, toCurrencyCode } from "@/lib/currency/currencies";
import { ChevronDown } from "lucide-react";
import { ICON_STROKE } from "@/lib/icons";

/* ============================================================
   Display-currency picker.

   A real <select> does the work — keyboard, screen readers and,
   on a phone, the native wheel rather than a custom menu that
   could run off the edge of the screen. It sits transparently
   over the pill so the closed control can stay as narrow as a
   three-letter code while the menu still spells each currency out.
   ============================================================ */

const TONE = {
  light: {
    shell: "border-ink/20 text-ink/80 has-[select:hover]:border-ink/40 has-[select:hover]:text-ink",
    focus: "has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-offset-2 has-[select:focus-visible]:outline-ink/60",
    chevron: "text-ink/50",
  },
  dark: {
    shell:
      "border-cream/30 text-cream/85 has-[select:hover]:border-cream/60 has-[select:hover]:text-cream",
    focus: "has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-offset-2 has-[select:focus-visible]:outline-cream/70",
    chevron: "text-cream/60",
  },
} as const;

export default function CurrencySelector({
  tone = "light",
  className,
}: {
  tone?: keyof typeof TONE;
  className?: string;
}) {
  const id = useId();
  const { currency, setCurrency, ratesUpdated } = useCurrency();
  const skin = TONE[tone];

  return (
    <div
      className={cn(
        "relative inline-flex h-10 items-center gap-1 rounded-full border pr-2.5 pl-3.5",
        "font-pill text-[15px] uppercase leading-none tracking-[.06em]",
        "transition-colors duration-300 tablet:text-[13px]",
        skin.shell,
        skin.focus,
        className,
      )}
    >
      <label htmlFor={id} className="sr-only">
        Display currency
      </label>
      <select
        id={id}
        value={currency}
        onChange={(event) => setCurrency(toCurrencyCode(event.target.value))}
        title={ratesUpdated ? `Indicative rates, updated ${ratesUpdated}` : "Display currency"}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full border-0 bg-transparent p-0 text-transparent opacity-0"
      >
        {SUPPORTED_CURRENCIES.map((option) => (
          <option
            key={option.code}
            value={option.code}
            /* the native menu doesn't inherit the header's colours */
            className="bg-cream text-ink"
          >
            {`${option.code} — ${option.name}`}
          </option>
        ))}
      </select>

      {/* what the closed control shows; the <select> above owns every
          interaction, so this is purely decorative */}
      <span aria-hidden className="pt-px">
        {currency}
      </span>
      <ChevronDown
        size={14}
        strokeWidth={ICON_STROKE}
        aria-hidden
        className={cn("shrink-0", skin.chevron)}
      />
    </div>
  );
}
