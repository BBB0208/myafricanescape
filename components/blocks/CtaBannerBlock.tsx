import { stegaClean } from "next-sanity";
import { ButtonRow } from "@/components/CmsButton";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import { EYEBROW_TONE, toTone } from "@/lib/tone";
import type { BlockOf } from "@/sanity/lib/types";

export default function CtaBannerBlock({ block }: { block: BlockOf<"ctaBanner"> }) {
  const tone = toTone(block.tone, "sunset");

  return (
    <Section id={stegaClean(block.anchorId) || undefined} tone={tone}>
      <Container className="text-center">
        {block.eyebrow ? <Eyebrow tone={EYEBROW_TONE[tone]}>{block.eyebrow}</Eyebrow> : null}
        <Reveal as="h2" variant="wipe" className="mx-auto mt-[18px] max-w-[20ch] text-[clamp(30px,4.4vw,54px)]">
          {block.title}
        </Reveal>
        <ButtonRow buttons={block.buttons} className="mt-8 justify-center" />
      </Container>
    </Section>
  );
}
