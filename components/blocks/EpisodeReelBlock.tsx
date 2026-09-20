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
   illustration so a half-filled episode never shows a black hole. */
function poster(image: NonNullable<BlockOf<"episodeReel">["episodes"]>[number]["poster"]) {
  if (!image?.asset?._ref) {
    return <Scene name="lake" className="h-full w-full" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- fills a fixed-ratio stage
    <img
      src={urlFor(image as Parameters<typeof urlFor>[0]).width(1920).height(1080).fit("crop").url()}
      alt={stegaClean(image.alt) ?? ""}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
    />
  );
}

export default function EpisodeReelBlock({ block }: { block: BlockOf<"episodeReel"> }) {
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
        poster: poster(episode.poster),
        posterAlt: stegaClean(episode.poster?.alt) ?? "",
      },
    ];
  });

  if (!episodes.length) return null;
  const hasHead = Boolean(block.eyebrow || block.title || block.aside);

  return (
    <Section id={stegaClean(block.anchorId) || undefined} tone={tone} padding={hasHead ? undefined : "py-0"}>
      {hasHead ? (
        <Container>
          <SectionHead eyebrow={block.eyebrow} title={block.title ?? ""} aside={block.aside} tone={tone} />
        </Container>
      ) : null}
      {/* full width, edge to edge, the way the reel is meant to read */}
      <EpisodeReel episodes={episodes} autoplay={block.autoplay === true} />
      <ReelStrip />
    </Section>
  );
}
