"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { ICON_STROKE } from "@/lib/icons";
import { useAfterLoad, useFrameWindow } from "@/components/useFrameWindow";

/* ============================================================
   The hero's background, cross-dissolving between images.

   Every frame is rendered by the server, so the first one is the
   LCP image exactly as it was before — the rotation is only an
   opacity change. Only the slide on show and its neighbours are
   mounted, so the later slides never compete with the first.

   The frames sit inside the ken-burns layer, which is its own
   stacking context; the << >> pill has to live outside it to
   clear the hero's gradient and copy. So the two are separate
   components sharing a context.

   It rotates on its own, and taking hold of the arrows stops the
   timer for good — which is also what WCAG 2.2.2 asks for. It
   holds still for anyone who prefers reduced motion, and pauses
   while the tab is in the background.
   ============================================================ */

const FADE_MS = 1400;

const ARROW =
  "inline-flex items-center justify-center border-0 bg-transparent px-3 py-[7px] text-pill transition-colors hover:bg-ink/20 focus-visible:bg-ink/20 focus-visible:outline-none " +
  // a roomier target for thumbs
  "mobile:px-3.5 mobile:py-[11px]";

type SlidesContextValue = { index: number; count: number; go: (step: number) => void };

const SlidesContext = createContext<SlidesContextValue>({ index: 0, count: 0, go: () => {} });

export function HeroSlides({
  count,
  seconds = 6,
  children,
}: {
  count: number;
  seconds?: number;
  children: ReactNode;
}) {
  const [index, setIndex] = useState(0);
  /* set once a visitor takes over — the timer then stays off */
  const [driven, setDriven] = useState(false);
  const countRef = useRef(count);
  countRef.current = count;

  const go = useCallback((step: number) => {
    setDriven(true);
    setIndex((i) => (i + step + countRef.current) % countRef.current);
  }, []);

  useEffect(() => {
    if (count < 2 || driven) return;
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      stop();
      // held still for reduced motion, and while nobody is looking
      if (reduced.matches || document.hidden) return;
      timer = setInterval(
        () => setIndex((i) => (i + 1) % countRef.current),
        Math.max(3, seconds) * 1000,
      );
    };

    start();
    document.addEventListener("visibilitychange", start);
    reduced.addEventListener("change", start);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", start);
      reduced.removeEventListener("change", start);
    };
  }, [count, seconds, driven]);

  const value = useMemo(() => ({ index, count, go }), [index, count, go]);
  return <SlidesContext.Provider value={value}>{children}</SlidesContext.Provider>;
}

/* The pictures themselves, inside the ken-burns layer. */
export function HeroFrames({ frames }: { frames: ReactNode[] }) {
  const { index, count } = useContext(SlidesContext);
  /* the first slide alone until the page has loaded, then its neighbours —
     so the later slides never compete with the first paint */
  const mounted = useFrameWindow(index, count, useAfterLoad());

  return (
    <>
      {frames.map((frame, i) =>
        mounted(i) ? (
          <div
            key={i}
            /* the frames are one picture as far as a reader is concerned */
            aria-hidden={count > 1 ? i !== index : undefined}
            style={{ transitionDuration: `${FADE_MS}ms` }}
            className={cn(
              "absolute inset-0 transition-opacity ease-soft",
              i === index ? "opacity-100" : "opacity-0",
            )}
          >
            {frame}
          </div>
        ) : null,
      )}
    </>
  );
}

/* The counter and the << >> pill, above the gradient and the copy. */
export function HeroSlideControls() {
  const { index, count, go } = useContext(SlidesContext);
  if (count < 2) return null;

  return (
    <>
      <div className="absolute right-8 bottom-8 z-[3] flex items-center gap-3.5 mobile:right-5 mobile:bottom-6">
        <span className="font-eyebrow text-[12px] tracking-[.1em] text-cream/85 [text-shadow:0_1px_6px_rgba(6,32,30,.85)]">
          {`${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`}
        </span>
        <div className="flex overflow-hidden rounded-full bg-flame shadow-[0_6px_16px_rgba(255,90,31,.35)]">
          <button type="button" onClick={() => go(-1)} aria-label="Previous background image" className={ARROW}>
            <ChevronsLeft size={16} strokeWidth={ICON_STROKE} aria-hidden />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next background image" className={ARROW}>
            <ChevronsRight size={16} strokeWidth={ICON_STROKE} aria-hidden />
          </button>
        </div>
      </div>
      <span className="sr-only" aria-live="polite">
        {`Background image ${index + 1} of ${count}`}
      </span>
    </>
  );
}
