import { stegaClean } from "next-sanity";
import Container from "@/components/Container";
import Feature from "@/components/Feature";
import Section from "@/components/Section";
import SectionHead from "@/components/SectionHead";
import { pad2 } from "@/lib/properties";
import { toTone } from "@/lib/tone";
import type { BlockOf } from "@/sanity/lib/types";

export default function FeatureListBlock({ block }: { block: BlockOf<"featureList"> }) {
  const tone = toTone(block.tone, "teal");

  return (
    <Section id={stegaClean(block.anchorId) || undefined} tone={tone}>
      <Container>
        <SectionHead eyebrow={block.eyebrow} title={block.title} aside={block.aside} tone={tone} />
        {(block.items ?? []).map((item, i) => (
          <Feature
            key={item._key}
            num={pad2(i + 1)}
            index={i}
            title={item.title}
            tone={tone === "cream" ? "ink" : "cream"}
          >
            {item.body}
          </Feature>
        ))}
      </Container>
    </Section>
  );
}
