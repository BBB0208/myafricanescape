"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";
import { cn } from "@/lib/cn";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { ICON_STROKE } from "@/lib/icons";
import { useFrameWindow } from "@/components/useFrameWindow";

const ARROW =
  "inline-flex items-center justify-center border-0 bg-transparent px-3 py-[7px] text-pill transition-colors hover:bg-ink/15 focus-visible:bg-ink/15 focus-visible:outline-none";

/* A listing as a film frame. `frames` are the pre-rendered artworks
   (main artwork + gallery); the << >> pill pages through them. */
export default function ListingCard({
  frames,
  label,
  badge,
  sceneTag,
  position,
  children,
}: {
  frames: ReactNode[];
  label: string;
  badge?: ReactNode;
  sceneTag?: ReactNode;
  /* place in its row, for the staggered "develop" reveal */
  position?: number;
  children: ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const count = frames.length;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  /* a card's other photos load when someone shows interest in it — a
     hover, a focus or a touch — not for every card on the page at once */
  const [armed, setArmed] = useState(false);
  const arm = () => setArmed(true);
  const mounted = useFrameWindow(index, count, armed);

  return (
    <Reveal
      variant="develop"
      index={position}
      className="relative overflow-hidden rounded-2xl bg-ink px-3.5 pt-3.5 pb-5 text-cream"
      onPointerEnter={count > 1 ? arm : undefined}
      onFocus={count > 1 ? arm : undefined}
      onTouchStart={count > 1 ? arm : undefined}
    >
      <div className="sprockets mb-2.5" />
      <div className="r-develop relative aspect-[4/3] overflow-hidden rounded-md">
        {frames.map((frame, i) =>
          mounted(i) ? (
            <div
              key={i}
              aria-hidden={i !== index}
              className={cn(
                "absolute inset-0 transition-opacity duration-500",
                i === index ? "opacity-100" : "opacity-0",
              )}
            >
              {frame}
            </div>
          ) : null,
        )}
        {sceneTag ? (
          <span className="absolute top-2.5 left-2.5 z-[3] rounded-full bg-ink/55 px-2.5 py-[5px] font-eyebrow text-[11px] tracking-[.1em] text-cream backdrop-blur-[4px]">
            {sceneTag}
          </span>
        ) : null}
        {badge ? (
          <span className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center font-eyebrow text-[17px] tracking-[.08em] text-pill-cool [text-shadow:0_1px_8px_rgba(36,22,8,.6)]">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="sprockets mt-3.5" />

      <div className="relative px-1.5 pt-[18px] pb-1">
        {children}
        {/* z-[2]: above the card-wide link overlay, so paging frames never navigates */}
        {count > 1 ? (
          <div className="absolute top-3 right-0 z-[2] flex overflow-hidden rounded-full bg-flame shadow-[0_6px_16px_rgba(255,90,31,.35)]">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={`Previous image of ${label}`}
              className={ARROW}
            >
              <ChevronsLeft size={18} strokeWidth={ICON_STROKE} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={`Next image of ${label}`}
              className={ARROW}
            >
              <ChevronsRight size={18} strokeWidth={ICON_STROKE} aria-hidden />
            </button>
          </div>
        ) : null}
        <span className="sr-only" aria-live="polite">
          {count > 1 ? `Image ${index + 1} of ${count}` : ""}
        </span>
      </div>
    </Reveal>
  );
}
