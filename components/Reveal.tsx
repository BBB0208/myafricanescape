"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ElementType, HTMLAttributes } from "react";

type Variant = "rise" | "wipe" | "develop" | "group";

type Props = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  /* rise: fades up · wipe: unmasks upward · develop: rises while the
     artwork inside (.r-develop) develops from grey into colour ·
     group: only its .r-fade / .r-wipe / .r-bar / .r-curtain children move */
  variant?: Variant;
  /* position among siblings, for a gentle stagger */
  index?: number;
};

/* One observer for every reveal on the page. */
let observer: IntersectionObserver | null = null;

function observe(node: Element) {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-shown", "");
        observer?.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  );
  observer.observe(node);
  return () => observer?.unobserve(node);
}

/* Plays its reveal the first time it scrolls into view. The motion lives in
   globals.css (keyed off data-reveal / data-shown), so this never re-renders.
   Renders as the element itself, so grid and flex parents keep addressing
   their real children. */
export default function Reveal({ as, variant = "rise", index, style, children, ...rest }: Props) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    return node ? observe(node) : undefined;
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      style={index ? ({ ...style, "--i": index } as CSSProperties) : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
