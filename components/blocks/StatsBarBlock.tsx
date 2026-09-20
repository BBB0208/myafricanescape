import type { ReactNode } from "react";
import { stegaClean } from "next-sanity";
import Container from "@/components/Container";
import Price from "@/components/currency/Price";
import CountUp from "@/components/CountUp";
import Section from "@/components/Section";
import { cn } from "@/lib/cn";
import { toTone } from "@/lib/tone";
import type { BlockOf } from "@/sanity/lib/types";

type Block = BlockOf<"statsBar">;
type Stat = NonNullable<Block["stats"]>[number];

const BORDER = {
  cream: "border-ink/15",
  teal: "border-cream/[.18]",
  sunset: "border-cream/[.28]",
} as const;

/* the vertical hairline between stats, in the same weight as the rules above */
const RULE = {
  cream: "before:bg-ink/15",
  teal: "before:bg-cream/[.18]",
  sunset: "before:bg-cream/[.28]",
} as const;

/* Four across, two on a tablet, stacked on a phone.

   The cells carry no side padding — the gap does the spacing — so the first
   and last always sit flush with the container's gutter. Each cell draws its
   own hairline in the middle of the gap to its left, and hides it whenever
   the cell starts a row, so a rule never dangles at the edge of the grid. */
const CELL =
  "relative py-[38px] " +
  "before:absolute before:inset-y-0 before:-left-6 before:w-px before:content-[''] " +
  "[&:nth-child(4n+1)]:before:hidden " +
  "tablet:[&:nth-child(2n+1)]:before:hidden " +
  // stacked: the rule turns horizontal and sits between the rows instead
  "mobile:py-[30px] mobile:before:hidden mobile:[&:nth-child(n+2)]:border-t";
const LABEL = {
  cream: "text-ink/60",
  teal: "text-cream/65",
  sunset: "text-cream/80",
} as const;

/* Custom values are typed in; live ones are counted from the listings.
   Counts tick up from zero; the price is money, so it goes through the
   display-currency layer instead. */
function statContent(stat: Stat, live: Block["live"]): ReactNode {
  switch (stegaClean(stat.kind)) {
    case "listingCount":
      return <CountUp value={String(live?.listingCount ?? 0)} />;
    case "countryCount":
      return <CountUp value={String(live?.countryCount ?? 0)} />;
    case "topPrice":
      return typeof live?.topPrice === "number" ? (
        <Price amount={live.topPrice} compact className="tabular-nums" />
      ) : (
        "—"
      );
    default:
      return <CountUp value={stat.value ?? ""} />;
  }
}

export default function StatsBarBlock({ block }: { block: Block }) {
  const tone = toTone(block.tone, "teal");
  const stats = block.stats ?? [];
  if (!stats.length) return null;

  return (
    <Section tone={tone} padding="py-0">
      <Container>
        <div
          className={cn(
            "grid grid-cols-4 gap-x-12 border-t tablet:grid-cols-2 mobile:grid-cols-1 mobile:gap-x-0",
            BORDER[tone],
          )}
        >
          {stats.map((stat) => (
            <div key={stat._key} className={cn(CELL, RULE[tone], BORDER[tone])}>
              <div className="font-display text-[44px] font-extrabold mobile:text-[38px]">
                {statContent(stat, block.live)}
              </div>
              <div className={cn("mt-2 font-eyebrow text-[13px] tracking-[.1em]", LABEL[tone])}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
