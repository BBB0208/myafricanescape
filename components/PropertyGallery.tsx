"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";
import { cn } from "@/lib/cn";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { ICON_STROKE } from "@/lib/icons";
import { useAfterLoad, useFrameWindow } from "@/components/useFrameWindow";

const ARROW =
  "inline-flex items-center justify-center border-0 bg-transparent px-3.5 py-[9px] text-pill transition-colors hover:bg-ink/15 focus-visible:bg-ink/15 focus-visible:outline-none";

/* The listing's frames, in the same film language as the cards — sprocket
   holes, one frame at a time, the << >> pill to page through them. */
export default function PropertyGallery({
  frames,
  label,
  badge,
}: {
  frames: ReactNode[];
  label: string;
  badge?: string | null;
}) {
  const [index, setIndex] = useState(0);
  const count = frames.length;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  // neighbours only once the page (and its main photo) has loaded
  const mounted = useFrameWindow(index, count, useAfterLoad());

  if (!count) return null;

  return (
    <Reveal
      variant="develop"
      className="relative overflow-hidden rounded-[28px] bg-ink px-4 pt-4 pb-5 text-cream"
    >
      <div className="sprockets mb-3" />
      <div className="r-develop relative aspect-[16/9] overflow-hidden rounded-lg mobile:aspect-[4/3]">
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
        {badge ? (
          <span className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center font-eyebrow text-[28px] tracking-[.08em] text-pill-cool [text-shadow:0_1px_8px_rgba(36,22,8,.6)]">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="sprockets mt-3" />

      {count > 1 ? (
        <div className="mt-3.5 flex items-center justify-between px-1">
          <span className="font-eyebrow text-[12px] tracking-[.1em] text-cream/55">
            {`FRAME ${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`}
          </span>
          <div className="flex overflow-hidden rounded-full bg-flame shadow-[0_6px_16px_rgba(255,90,31,.35)]">
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
        </div>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {count > 1 ? `Image ${index + 1} of ${count}` : ""}
      </span>
    </Reveal>
  );
}
