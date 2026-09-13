import { stegaClean } from "next-sanity";
import Container from "@/components/Container";
import MortgageCalculator from "@/components/MortgageCalculator";
import Section from "@/components/Section";
import SectionHead from "@/components/SectionHead";
import { toTone } from "@/lib/tone";
import type { BlockOf } from "@/sanity/lib/types";

export default function MortgageCalculatorBlock({ block }: { block: BlockOf<"mortgageCalculator"> }) {
  const tone = toTone(block.tone);
  const defaults = {
    price: block.defaultPrice,
    deposit: block.defaultDeposit,
    rate: block.defaultRate,
    term: block.defaultTerm,
  };

  return (
    <Section id={stegaClean(block.anchorId) || undefined} tone={tone}>
      <Container>
        <SectionHead eyebrow={block.eyebrow} title={block.title} aside={block.aside} tone={tone} />
        {/* remount when the starting values are edited, so previews update */}
        <MortgageCalculator
          key={Object.values(defaults).join("-")}
          defaults={defaults}
          resultLabel={block.resultLabel}
          note={block.note}
        />
      </Container>
    </Section>
  );
}
