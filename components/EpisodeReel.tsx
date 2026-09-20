"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Embed } from "@/lib/video";
import { ChevronsLeft, ChevronsRight, Play } from "lucide-react";
import { ICON_STROKE } from "@/lib/icons";

/* ============================================================
   The episode player.

   Each episode shows its still image until someone presses play.
   An uploaded video then plays in place; a YouTube or Vimeo link
   only loads its embed at that point, so nothing is fetched from
   them — and no cookie is set — just by the section being on the
   page.

   The << >> bar moves between episodes, in the same film
   language as the listing cards.
   ============================================================ */

export type Episode = {
  key: string;
  title: string;
  embed: Embed | null;
  file: { url: string; mimeType: string | null } | null;
  poster: ReactNode;
  posterAlt: string;
};

const SEGMENT =
  "inline-flex items-center justify-center border-0 bg-transparent px-3.5 py-[9px] text-pill " +
  "transition-colors hover:bg-ink/20 focus-visible:bg-ink/20 focus-visible:outline-none " +
  "mobile:px-3 mobile:py-[11px]";

export default function EpisodeReel({
  episodes,
  autoplay = false,
}: {
  episodes: Episode[];
  autoplay?: boolean;
}) {
  const [index, setIndex] = useState(0);
  /* which episode the visitor has actually started */
  const [playing, setPlaying] = useState<string | null>(null);
  const [reduced, setReduced] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* autoplay is a showreel, not a demand — anyone asking for reduced
     motion keeps the still image. Assume reduced until we know. */
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const count = episodes.length;
  const episode = episodes[Math.min(index, count - 1)];
  if (!episode) return null;

  const go = (step: number) => {
    setPlaying(null); // leaving an episode stops it
    setIndex((i) => (i + step + count) % count);
  };

  const started = playing === episode.key;
  /* an uploaded video may run by itself; a linked one never does */
  const reeling = autoplay && !reduced && !!episode.file && !started;
  const showPoster = !started && !reeling;

  return (
    <div className="relative isolate aspect-video w-full overflow-hidden bg-ink mobile:aspect-[4/3]">
      {/* the still, and the button that starts the episode */}
      {showPoster ? (
        <>
          <div className="absolute inset-0">{episode.poster}</div>
          {episode.embed || episode.file ? (
            <button
              type="button"
              onClick={() => setPlaying(episode.key)}
              aria-label={`Play ${episode.title}`}
              className="group absolute inset-0 z-[2] flex cursor-pointer items-center justify-center bg-ink/15 transition-colors hover:bg-ink/30 focus-visible:bg-ink/30 focus-visible:outline-none"
            >
              <span className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-flame pl-1 text-pill shadow-[0_10px_30px_rgba(255,90,31,.45)] transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105 mobile:h-16 mobile:w-16">
                <Play size={32} strokeWidth={1.5} fill="currentColor" aria-hidden className="mobile:size-6" />
              </span>
            </button>
          ) : null}
        </>
      ) : null}

      {/* an uploaded video: played on demand, or looping silently */}
      {episode.file && (started || reeling) ? (
        <video
          ref={videoRef}
          key={`${episode.key}-${started ? "on" : "reel"}`}
          src={episode.file.url}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          playsInline
          /* a silent loop still has to be stoppable, so it keeps its controls */
          controls
          muted={reeling}
          loop={reeling}
        />
      ) : null}

      {/* a linked video: the embed is only created once play is pressed */}
      {!episode.file && episode.embed && started ? (
        <iframe
          key={episode.key}
          src={episode.embed.src}
          title={episode.title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : null}

      {/* << title >> */}
      <div
        role="group"
        aria-label="Episodes"
        className="absolute bottom-8 left-8 z-[3] flex overflow-hidden rounded-full bg-flame shadow-[0_8px_24px_rgba(255,90,31,.4)] mobile:bottom-5 mobile:left-5"
      >
        {count > 1 ? (
          <button type="button" onClick={() => go(-1)} aria-label="Previous episode" className={SEGMENT}>
            <ChevronsLeft size={18} strokeWidth={ICON_STROKE} aria-hidden />
          </button>
        ) : null}
        <span
          className={cn(
            "px-6 pt-[11px] pb-[9px] font-pill text-[17px] leading-none tracking-[.08em] text-pill uppercase",
            "mobile:px-4 mobile:text-[15px] mobile:pt-[13px] mobile:pb-[11px]",
            count > 1 && "border-x border-ink/20",
          )}
        >
          {episode.title}
        </span>
        {count > 1 ? (
          <button type="button" onClick={() => go(1)} aria-label="Next episode" className={SEGMENT}>
            <ChevronsRight size={18} strokeWidth={ICON_STROKE} aria-hidden />
          </button>
        ) : null}
      </div>

      <span className="sr-only" aria-live="polite">
        {count > 1 ? `${episode.title}, episode ${index + 1} of ${count}` : ""}
      </span>
    </div>
  );
}
