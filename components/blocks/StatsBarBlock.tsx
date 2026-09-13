import { stegaClean } from "next-sanity";
import Container from "@/components/Container";
import CountUp from "@/components/CountUp";
import Section from "@/components/Section";
import { cn } from "@/lib/cn";
import { compactPrice } from "@/lib/properties";
import { toTone } from "@/lib/tone";
import type { BlockOf } from "@/sanity/lib/types";

type Block = BlockOf<"statsBar">;
type Stat = NonNullable<Block["stats"]>[number];

const BORDER = {
  cream: "border-ink/15",
  teal: "border-cream/[.18]",
  sunset: "border-cream/[.28]",
} as const;
const LABEL = {
  cream: "text-ink/60",
  teal: "text-cream/65",
  sunset: "text-cream/80",
} as const;

/* Custom values are typed in; live ones are counted from the listings. */
function statValue(stat: Stat, live: Block["live"]) {
  switch (stegaClean(stat.kind)) {
    case "listingCount":
      return String(live?.listingCount ?? 0);
    case "countryCount":
      return String(live?.countryCount ?? 0);
    case "topPrice":
      return typeof live?.topPrice === "number" ? compactPrice(live.topPrice) : "—";
    default:
      return stat.value ?? "";
  }
}

export default function StatsBarBlock({ block }: { block: Block }) {
  const tone = toTone(block.tone, "teal");
  const stats = block.stats ?? [];
  if (!stats.length) return null;

  return (
    <Section tone={tone} padding="py-0">
      <Container>
        <div className={cn("flex flex-wrap border-t", BORDER[tone])}>
          {stats.map((stat) => (
            <div
              key={stat._key}
              className={cn("min-w-[180px] flex-1 border-r py-[34px] last:border-r-0", BORDER[tone])}
            >
              <div className="font-display text-[44px] font-extrabold">
                <CountUp value={statValue(stat, block.live)} />
              </div>
              <div className={cn("mt-1.5 font-eyebrow text-[13px] tracking-[.1em]", LABEL[tone])}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
