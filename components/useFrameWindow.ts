"use client";

import { useCallback, useEffect, useState } from "react";

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
