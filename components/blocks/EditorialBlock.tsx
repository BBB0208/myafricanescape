import { stegaClean } from "next-sanity";
import Art from "@/components/Art";
import { ButtonRow } from "@/components/CmsButton";
import Container from "@/components/Container";
import { Editorial, EditorialArt, EDITORIAL_H2, EDITORIAL_P } from "@/components/Editorial";
import { ViewArt, ViewPills, ViewsProvider } from "@/components/EditorialViews";
import Eyebrow from "@/components/Eyebrow";
import PillRow from "@/components/PillRow";
import { RichText } from "@/components/PortableText";
import Section from "@/components/Section";
import { cn } from "@/lib/cn";
import { EYEBROW_TONE, MUTED_TEXT, PILL_TONE, toTone } from "@/lib/tone";
import type { BlockOf } from "@/sanity/lib/types";

const ART_SIZES = "(max-width: 1080px) 100vw, 45vw";

export default function EditorialBlock({ block }: { block: BlockOf<"editorial"> }) {
  const tone = toTone(block.tone);
  const position = stegaClean(block.artPosition);
  const artRight = position === "right";
  const noArt = position === "none";

  /* Labelled pictures turn the tags into buttons that change the artwork.
     With none set — or with no artwork column to change — the section
     behaves exactly as it always has. */
  const views = (block.views ?? []).filter((view) => view?.label);
  const switchable = views.length > 0 && !noArt;

  const copy = (
    <div className="r-fade [--d:220ms]">
      {block.eyebrow ? (
        <Eyebrow tone={EYEBROW_TONE[tone]} className="mb-4">
          {block.eyebrow}
        </Eyebrow>
      ) : null}
      <h2 className={EDITORIAL_H2}>{block.title}</h2>
      <RichText value={block.body} paragraphClassName={cn(EDITORIAL_P, MUTED_TEXT[tone])} />
      {switchable ? (
        <ViewPills
          tone={PILL_TONE[tone]}
          label={block.title ? `${stegaClean(block.title)} — choose a picture` : undefined}
        />
      ) : block.pills?.length ? (
        <PillRow items={block.pills} tone={PILL_TONE[tone]} />
      ) : null}
      <ButtonRow buttons={block.buttons} className="mt-5" />
    </div>
  );

  /* each label's own set of pictures: the main one, then any extras */
  const groups = views.map((view) => [view.art, ...(view.gallery ?? [])]);

  const art = switchable ? (
    <ViewArt
      groups={groups.map((frames, v) =>
        frames.map((frame, f) => (
          <Art
            key={f}
            art={frame}
            className="absolute inset-0 h-full w-full"
            width={1000}
            height={800}
            sizes={ART_SIZES}
            fit="auto"
            /* each label's first picture is the one shown on switching */
            blur={f === 0}
            /* only the picture on show at load blocks anything */
            loading={v === 0 && f === 0 ? undefined : "lazy"}
          />
        )),
      )}
    />
  ) : (
    <EditorialArt art={block.art} />
  );

  const body = noArt ? (
    /* no picture — the copy runs across the full width */
    <div className="max-w-[68ch]">{copy}</div>
  ) : (
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
  );

  return (
    <Section id={stegaClean(block.anchorId) || undefined} tone={tone}>
      <Container>
        {/* the labels and the picture sit in different columns, so the
            selection has to live around both of them */}
        {switchable ? (
          <ViewsProvider labels={views.map((view) => stegaClean(view.label) as string)}>
            {body}
          </ViewsProvider>
        ) : (
          body
        )}
      </Container>
    </Section>
  );
}
