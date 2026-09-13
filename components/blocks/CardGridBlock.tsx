import { stegaClean } from "next-sanity";
import Container from "@/components/Container";
import FrameCard from "@/components/FrameCard";
import Section from "@/components/Section";
import SectionHead from "@/components/SectionHead";
import { cn } from "@/lib/cn";
import { toTone } from "@/lib/tone";
import type { BlockOf } from "@/sanity/lib/types";

const COLUMNS = {
  2: "grid-cols-2 mobile:grid-cols-1",
  3: "grid-cols-3 tablet:grid-cols-2 mobile:grid-cols-1",
  4: "grid-cols-4 tablet:grid-cols-2 mobile:grid-cols-1",
} as const;

export default function CardGridBlock({ block }: { block: BlockOf<"cardGrid"> }) {
  const tone = toTone(block.tone, "sunset");
  const columns = COLUMNS[stegaClean(block.columns) as keyof typeof COLUMNS] ?? COLUMNS[4];

  return (
    <Section id={stegaClean(block.anchorId) || undefined} tone={tone}>
      <Container>
        <SectionHead center reveal={false} eyebrow={block.eyebrow} title={block.title} tone={tone} />
        <div className={cn("grid gap-7", columns)}>
          {(block.cards ?? []).map((card, i) => (
            <FrameCard key={card._key} art={card.art} index={i % 4}>
              <h3 className="mb-1.5 text-[22px] text-cream">{card.title}</h3>
              {card.body ? <p className="text-[14px] text-cream/70">{card.body}</p> : null}
            </FrameCard>
          ))}
        </div>
      </Container>
    </Section>
  );
}
