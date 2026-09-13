"use client";

import { useId, useState } from "react";
import Reveal from "@/components/Reveal";
import { fmtPrice } from "@/lib/properties";

/* ============================================================
   Mortgage / financing calculator
   ============================================================ */

const FIELD = "mb-[26px]";
const LABEL =
  "mb-2.5 flex justify-between font-eyebrow text-[13px] tracking-[.08em] text-cream/70";
const RANGE = "h-1 w-full accent-sunset";
const PANEL = "p-[52px] mobile:px-6 mobile:py-8";

const clamp = (n: number | null | undefined, min: number, max: number, fallback: number) =>
  typeof n === "number" && Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;

export type CalculatorDefaults = {
  price?: number | null;
  deposit?: number | null;
  rate?: number | null;
  term?: number | null;
};

export default function MortgageCalculator({
  defaults = {},
  resultLabel,
  note,
}: {
  defaults?: CalculatorDefaults;
  resultLabel?: string | null;
  note?: string | null;
}) {
  const ids = useId();
  const [price, setPrice] = useState(String(clamp(defaults.price, 100000, 3000000, 780000)));
  const [deposit, setDeposit] = useState(String(clamp(defaults.deposit, 5, 60, 25)));
  const [rate, setRate] = useState(String(clamp(defaults.rate, 2, 18, 9.5)));
  const [term, setTerm] = useState(String(clamp(defaults.term, 5, 30, 20)));

  const p = Number(price);
  const depositPct = Number(deposit);
  const r = Number(rate) / 100 / 12;
  const n = Number(term) * 12;

  const depositAmt = p * (depositPct / 100);
  const loan = p - depositAmt;
  const monthly = r === 0 ? loan / n : (loan * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
  const totalPaid = monthly * n;
  const totalInterest = totalPaid - loan;

  const breakdown: [string, number][] = [
    ["Deposit due at purchase", depositAmt],
    ["Loan amount", loan],
    ["Total repaid over term", totalPaid],
    ["Total interest paid", totalInterest],
  ];

  return (
    <Reveal className="grid grid-cols-2 overflow-hidden rounded-[28px] bg-ink text-cream tablet:grid-cols-1">
      <div className={PANEL}>
        <div className={FIELD}>
          <label className={LABEL} htmlFor={`${ids}-price`}>
            Property price <span className="text-gold">{fmtPrice(p)}</span>
          </label>
          <input
            id={`${ids}-price`}
            type="range"
            min="100000"
            max="3000000"
            step="10000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={RANGE}
          />
        </div>

        <div className={FIELD}>
          <label className={LABEL} htmlFor={`${ids}-deposit`}>
            Deposit <span className="text-gold">{depositPct}%</span>
          </label>
          <input
            id={`${ids}-deposit`}
            type="range"
            min="5"
            max="60"
            step="1"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            className={RANGE}
          />
        </div>

        <div className={FIELD}>
          <label className={LABEL} htmlFor={`${ids}-rate`}>
            Interest rate (annual) <span className="text-gold">{rate}%</span>
          </label>
          <input
            id={`${ids}-rate`}
            type="range"
            min="2"
            max="18"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className={RANGE}
          />
        </div>

        <div className={FIELD}>
          <label className={LABEL} htmlFor={`${ids}-term`}>
            Loan term <span className="text-gold">{term} yrs</span>
          </label>
          <input
            id={`${ids}-term`}
            type="range"
            min="5"
            max="30"
            step="1"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className={RANGE}
          />
        </div>

        {note ? <p className="mt-2 text-[13px] text-cream/50">{note}</p> : null}
      </div>

      <div
        className={`flex flex-col justify-center bg-[linear-gradient(160deg,var(--color-sunset)_0%,var(--color-magenta)_100%)] ${PANEL}`}
      >
        <div className="mb-2 font-eyebrow text-[13px] tracking-[.1em] text-cream/85">
          {resultLabel || "Estimated monthly payment"}
        </div>
        <div className="font-display text-[52px] font-extrabold">
          <span className="text-[20px] font-semibold">$</span>
          <span>{Math.round(monthly).toLocaleString("en-US")}</span>
        </div>

        <div className="mt-7 flex flex-col gap-2.5">
          {breakdown.map(([label, amount]) => (
            <div
              key={label}
              className="flex justify-between border-t border-cream/[.28] pt-2.5 text-[14.5px]"
            >
              <span>{label}</span>
              <b className="font-bold">{fmtPrice(Math.round(amount))}</b>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
