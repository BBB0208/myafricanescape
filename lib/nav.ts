import type { CSSProperties } from "react";

const COLORS = ["grape", "saffron", "jungle", "flame", "ink"];

/* Text that reads on each pill colour (ink on the two bright ones). */
const TEXT: Record<string, string> = {
  grape: "var(--color-pill)",
  saffron: "var(--color-ink)",
  jungle: "var(--color-ink)",
  flame: "var(--color-pill)",
  ink: "var(--color-pill-cool)",
};

/* CSS variables for a nav item's colour (Site settings → Navigation),
   falling back to the palette order. On dark grounds "ink" becomes gold. */
export function pillStyle(
  color: string | null | undefined,
  index: number,
  ground: "light" | "dark" = "light",
): CSSProperties {
  const name = color && COLORS.includes(color) ? color : COLORS[index % COLORS.length];
  const fill = name === "ink" && ground === "dark" ? "var(--color-gold)" : `var(--color-${name})`;
  return { "--pill": fill, "--pill-text": TEXT[name] } as CSSProperties;
}
