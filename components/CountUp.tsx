"use client";

import { stegaClean } from "@sanity/client/stega";
import { useEffect, useRef, useState } from "react";

/* Counts a whole-number stat up from zero the first time it scrolls into
   view. Anything else ("$2.1M", "24/7") is shown as-is. The real value is
   what's server-rendered, so crawlers and no-JS visitors see it. */
export default function CountUp({ value }: { value: string }) {
  const clean = stegaClean(value);
  const target = /^\d{1,6}$/.test(clean) ? Number(clean) : null;
  const ref = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState<number | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (target === null || !node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / 1400);
          setCurrent(Math.round(target * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) frame = requestAnimationFrame(tick);
          else setCurrent(null); // hand back the original (editable) value
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {current === null ? value : current}
    </span>
  );
}
