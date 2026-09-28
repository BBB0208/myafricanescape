import { stegaClean } from "next-sanity";
import Container from "@/components/Container";
import EpisodeReel, { type Episode } from "@/components/EpisodeReel";
import ReelStrip from "@/components/ReelStrip";
import Scene from "@/components/Scene";
import Section from "@/components/Section";
import SectionHead from "@/components/SectionHead";
import { toTone } from "@/lib/tone";
import { toEmbed } from "@/lib/video";
import { urlFor } from "@/sanity/lib/image";
import type { BlockOf } from "@/sanity/lib/types";

/* The still behind each episode: the uploaded image, or a scene
   illustration so a half-filled episode never shows a black hole.
   When the reel opens the page, the first still is its main image. */
function poster(
  image: NonNullable<BlockOf<"episodeReel">["episodes"]>[number]["poster"],
  priority: boolean,
) {
  if (!image?.asset?._ref) {
    return <Scene name="lake" className="h-full w-full" />;
  }
  /* sized to the screen, never beyond the original */
  const source = image as Parameters<typeof urlFor>[0];
  const at = (w: number) => urlFor(source).width(w).height(Math.round((w * 9) / 16)).fit("crop").url();
  return (
    // eslint-disable-next-line @next/next/no-img-element -- fills a fixed-ratio stage
    <img
      src={at(1280)}
      srcSet={[640, 960, 1280, 1920].map((w) => `${at(w)} ${w}w`).join(", ")}
      sizes="100vw"
      alt={stegaClean(image.alt) ?? ""}
      className="h-full w-full object-cover"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
    />
  );
}

export default function EpisodeReelBlock({
  block,
  first = false,
}: {
  block: BlockOf<"episodeReel">;
  /* the reel opens the page: its heading is the page's h1 */
  first?: boolean;
}) {
  const tone = toTone(block.tone, "teal");

  const episodes: Episode[] = (block.episodes ?? []).flatMap((episode, i) => {
    const title = stegaClean(episode.title);
    if (!title) return [];
    const file = episode.videoFile?.url
      ? { url: stegaClean(episode.videoFile.url) as string, mimeType: stegaClean(episode.videoFile.mimeType) ?? null }
      : null;
    return [
      {
        key: episode._key ?? String(i),
        title,
        embed: toEmbed(stegaClean(episode.videoUrl)),
        file,
        poster: poster(episode.poster, first && i === 0),
        posterAlt: stegaClean(episode.poster?.alt) ?? "",
      },
    ];
  });

  if (!episodes.length) return null;
  const hasHead = Boolean(block.eyebrow || block.title || block.aside);

  return (
    <>
      {/* opening the page, the film strip runs under the header the way
          it runs under every hero */}
      {first ? <ReelStrip /> : null}
      <Section id={stegaClean(block.anchorId) || undefined} tone={tone} padding="pb-0">
        <Container className={hasHead ? "pt-[104px] mobile:pt-[72px]" : undefined}>
          {hasHead ? (
            <SectionHead
              eyebrow={block.eyebrow}
              title={block.title ?? ""}
              aside={block.aside}
              tone={tone}
              level={first ? "h1" : "h2"}
              /* the heading sits close over the film it introduces */
              className="mb-10! mobile:mb-8!"
            />
          ) : null}
        </Container>
        {/* full width, edge to edge, the way the reel is meant to read */}
        <EpisodeReel
          episodes={episodes}
          pagerLabel={stegaClean(block.pagerLabel) || "Episodes"}
          autoplay={block.autoplay === true}
        />
      </Section>
    </>
  );
}
