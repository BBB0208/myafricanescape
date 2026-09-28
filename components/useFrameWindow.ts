"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent } from "react";

/* Which frames of a pager to put in the DOM: the one on show, any frame
   visited before (so paging back never flashes) and — once `armed` —
   its two neighbours, so the next cross-dissolve is already loaded.
   A listing with two dozen photos then loads one, not two dozen, and
   nothing it holds in reserve competes with the page's first paint. */
export function useFrameWindow(index: number, count: number, armed = true) {
  const [seen, setSeen] = useState<ReadonlySet<number>>(() => new Set([index]));

  /* adjusted during render, so a newly selected frame mounts in the same pass */
  if (!seen.has(index)) setSeen(new Set(seen).add(index));

  return useCallback(
    (i: number) =>
      seen.has(i) ||
      i === index ||
      (armed && count > 1 && (i === (index + 1) % count || i === (index - 1 + count) % count)),
    [seen, index, count, armed],
  );
}

/* A horizontal swipe on a touch screen pages through frames, like the
   << >> arrows: right-to-left is next, left-to-right is previous. A
   mostly vertical drag is left alone, so the page still scrolls, and
   a swipe never becomes a tap on whatever it started over. */
export function useSwipe(go: (step: number) => void, enabled = true) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    start.current = event.touches.length === 1 && touch ? { x: touch.clientX, y: touch.clientY } : null;
  }, []);

  const onTouchEnd = useCallback(
    (event: TouchEvent) => {
      const from = start.current;
      const touch = event.changedTouches[0];
      start.current = null;
      if (!from || !touch) return;
      const dx = touch.clientX - from.x;
      const dy = touch.clientY - from.y;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      go(dx < 0 ? 1 : -1);
    },
    [go],
  );

  return enabled ? { onTouchStart, onTouchEnd } : {};
}

/* true once the page has finished loading (and the browser has a
   moment to spare) — the point to start fetching what isn't on show */
export function useAfterLoad() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idle: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const go = () => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) idle = w.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      else timer = setTimeout(() => setReady(true), 200);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.removeEventListener("load", go);
      if (idle !== undefined) (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(idle);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return ready;
}
