"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

let hasMounted = false;

/* Between pages a strip of film rolls up and away, revealing the next
   page underneath. Skipped on the first load (so it never delays it) and
   for anyone who prefers reduced motion. */
export default function PageShutter({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(() => typeof window !== "undefined" && hasMounted);

  useEffect(() => {
    hasMounted = true;
  }, []);

  return (
    <>
      {show ? (
        <div
          aria-hidden
          onAnimationEnd={() => setShow(false)}
          className="pointer-events-none fixed inset-0 z-[850] flex justify-between bg-ink px-3 motion-safe:animate-shutter motion-reduce:hidden"
        >
          <div className="sprockets-y h-full w-3 opacity-60" />
          <div className="sprockets-y h-full w-3 opacity-60" />
        </div>
      ) : null}
      {children}
    </>
  );
}
