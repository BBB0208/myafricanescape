import type { CSSProperties } from "react";

const COLORS = ["grape", "saffron", "jungle", "flame", "ink"];

/* Two shades per nav colour:

   --pill       the vivid brand colour, used for the small dot beside a link
                and for the footer's bullets — nothing sits on top of it
   --pill-fill  the same colour deepened, used only behind a label, so the
                white type on it clears WCAG AA at nav sizes
   --pill-text  white, the same on every item

   "ink" and "grape" are already dark enough to take white, so their two
   shades are identical. */
const FILL: Record<string, string> = {
  grape: "var(--color-grape-deep)",
  saffron: "var(--color-saffron-deep)",
  jungle: "var(--color-jungle-deep)",
  flame: "var(--color-flame-deep)",
  ink: "var(--color-ink)",
};

/* CSS variables for a nav item's colour (Site settings → Navigation),
   falling back to the palette order. On dark grounds "ink" becomes gold. */
export function pillStyle(
  color: string | null | undefined,
  index: number,
  ground: "light" | "dark" = "light",
): CSSProperties {
  const name = color && COLORS.includes(color) ? color : COLORS[index % COLORS.length];
  const onDarkInk = name === "ink" && ground === "dark";
  return {
    "--pill": onDarkInk ? "var(--color-gold)" : `var(--color-${name})`,
    "--pill-fill": onDarkInk ? "var(--color-gold)" : FILL[name],
    "--pill-text": onDarkInk ? "var(--color-ink)" : "#ffffff",
  } as CSSProperties;
}
