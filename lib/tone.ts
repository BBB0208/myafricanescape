import { stegaClean } from "next-sanity";
import { TONES, type Tone } from "@/sanity/schemaTypes/options";

export type { Tone };

export function toTone(value: unknown, fallback: Tone = "cream"): Tone {
  const clean = stegaClean(value);
  return (TONES as readonly unknown[]).includes(clean) ? (clean as Tone) : fallback;
}

/* How copy sits on each section ground. */
export const EYEBROW_TONE = { cream: "sunset", teal: "gold", sunset: "cream" } as const;
export const MUTED_TEXT = {
  cream: "text-ink/70",
  teal: "text-cream/75",
  sunset: "text-cream/85",
} as const;
export const PILL_TONE = { cream: "ink", teal: "cream", sunset: "cream" } as const;
