import { stegaClean } from "next-sanity";
import CmsButton from "@/components/CmsButton";
import Hero from "@/components/Hero";
import { Headline, RichText } from "@/components/PortableText";
import ReelStrip from "@/components/ReelStrip";
import type { BlockOf } from "@/sanity/lib/types";

const SIZES = {
  full: { section: "min-h-[88vh]", title: "text-[clamp(44px,6.4vw,92px)]" },
  tall: { section: "min-h-[64vh]", title: "text-[clamp(38px,5.6vw,76px)]" },
  compact: { section: "min-h-[56vh]", title: "text-[clamp(36px,5.2vw,70px)]" },
} as const;

export default function HeroBlock({
  block,
  priority,
}: {
  block: BlockOf<"hero">;
  priority?: boolean;
}) {
  const size = SIZES[stegaClean(block.size) as keyof typeof SIZES] ?? SIZES.full;
  const buttons = (block.buttons ?? []).filter((b) => b?.label);

  return (
    <>
      <Hero
        className={size.section}
        titleClassName={size.title}
        art={block.art}
        priority={priority}
        eyebrow={block.eyebrow}
        title={<Headline value={block.title} />}
        lede={block.lede?.length ? <RichText value={block.lede} /> : null}
        actions={
          buttons.length
            ? buttons.map((button) => <CmsButton key={button._key} button={button} />)
            : null
        }
      />
      {block.showReelStrip !== false ? <ReelStrip /> : null}
    </>
  );
}
