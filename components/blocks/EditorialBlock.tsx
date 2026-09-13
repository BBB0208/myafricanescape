import { stegaClean } from "next-sanity";
import { ButtonRow } from "@/components/CmsButton";
import Container from "@/components/Container";
import { Editorial, EditorialArt, EDITORIAL_H2, EDITORIAL_P } from "@/components/Editorial";
import Eyebrow from "@/components/Eyebrow";
import PillRow from "@/components/PillRow";
import { RichText } from "@/components/PortableText";
import Section from "@/components/Section";
import { cn } from "@/lib/cn";
import { EYEBROW_TONE, MUTED_TEXT, PILL_TONE, toTone } from "@/lib/tone";
import type { BlockOf } from "@/sanity/lib/types";

export default function EditorialBlock({ block }: { block: BlockOf<"editorial"> }) {
  const tone = toTone(block.tone);
  const artRight = stegaClean(block.artPosition) === "right";

  const copy = (
    <div className="r-fade [--d:220ms]">
      {block.eyebrow ? (
        <Eyebrow tone={EYEBROW_TONE[tone]} className="mb-4">
          {block.eyebrow}
        </Eyebrow>
      ) : null}
      <h2 className={EDITORIAL_H2}>{block.title}</h2>
      <RichText value={block.body} paragraphClassName={cn(EDITORIAL_P, MUTED_TEXT[tone])} />
      {block.pills?.length ? <PillRow items={block.pills} tone={PILL_TONE[tone]} /> : null}
      <ButtonRow buttons={block.buttons} className="mt-5" />
    </div>
  );
  const art = <EditorialArt art={block.art} />;

  return (
    <Section id={stegaClean(block.anchorId) || undefined} tone={tone}>
      <Container>
        <Editorial reverse={artRight}>
          {artRight ? (
            <>
              {copy}
              {art}
            </>
          ) : (
            <>
              {art}
              {copy}
            </>
          )}
        </Editorial>
      </Container>
    </Section>
  );
}
