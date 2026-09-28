import { stegaClean } from "next-sanity";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* Site settings → Social media, as projected by LAYOUT_QUERY. */
export type SocialData =
  | {
      facebook?: string | null;
      youtube?: string | null;
      instagram?: string | null;
    }
  | null
  | undefined;

type Platform = "facebook" | "youtube" | "instagram";

/* Until an editor pastes a profile's address, each icon still goes
   somewhere real: the trailer's own YouTube channel, and the platform's
   home page for the other two. */
const FALLBACK: Record<Platform, string> = {
  facebook: "https://www.facebook.com/",
  youtube: "https://www.youtube.com/@MyAfricanEscape-SA",
  instagram: "https://www.instagram.com/",
};

const LABEL: Record<Platform, string> = {
  facebook: "Facebook",
  youtube: "YouTube",
  instagram: "Instagram",
};

/* each glyph takes on its platform's colour on hover */
const HOVER: Record<Platform, string> = {
  facebook: "hover:text-[#1877F2] focus-visible:text-[#1877F2]",
  youtube: "hover:text-[#FF0033] focus-visible:text-[#FF0033]",
  instagram: "hover:text-[#E1306C] focus-visible:text-[#E1306C]",
};

/* The three marks as the design has them — a bold "f", a solid
   rounded YouTube block with the play triangle cut through it, and the
   outlined Instagram camera — all the same height (1em), each as wide
   as its own shape, so the row reads as one set. */
const GLYPHS: Record<Platform, { viewBox: string; width: string; body: ReactNode }> = {
  facebook: {
    viewBox: "7.25 2.75 10 18.9",
    width: "w-[.53em]",
    body: (
      <path
        fill="currentColor"
        d="M13.6 21.5v-8.2h2.8l.45-3.4H13.6V7.75c0-.98.28-1.65 1.7-1.65h1.72V3.08A23 23 0 0 0 14.5 2.95c-2.5 0-4.2 1.52-4.2 4.32V9.9H7.5v3.4h2.8v8.2h3.3Z"
      />
    ),
  },
  youtube: {
    viewBox: "1.75 4.75 20.5 14.5",
    width: "w-[1.41em]",
    body: (
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M5.4 4.75h13.2a3.65 3.65 0 0 1 3.65 3.65v7.2a3.65 3.65 0 0 1-3.65 3.65H5.4a3.65 3.65 0 0 1-3.65-3.65V8.4A3.65 3.65 0 0 1 5.4 4.75ZM9.4 7.7v8.6L16.9 12 9.4 7.7Z"
      />
    ),
  },
  instagram: {
    viewBox: "2 2 20 20",
    width: "w-[1em]",
    body: (
      <>
        <rect x="3.1" y="3.1" width="17.8" height="17.8" rx="5" fill="none" stroke="currentColor" strokeWidth={2.2} />
        <circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth={2.2} />
        <circle cx="17.3" cy="6.7" r="1.3" fill="currentColor" />
      </>
    ),
  },
};

function Glyph({ platform }: { platform: Platform }) {
  const { viewBox, width, body } = GLYPHS[platform];
  return (
    <svg viewBox={viewBox} aria-hidden className={cn("block h-[1em]", width)}>
      {body}
    </svg>
  );
}

const PLATFORMS: Platform[] = ["facebook", "youtube", "instagram"];

/* Facebook, YouTube and Instagram, in that order — each opens in a new tab. */
export default function SocialLinks({
  social,
  tone = "ink",
  className,
}: {
  social: SocialData;
  /* the ground they sit on */
  tone?: "ink" | "cream";
  /* set the icons' height with a text size, e.g. text-[22px] */
  className?: string;
}) {
  return (
    <ul
      aria-label="Follow My African Escape"
      className={cn("flex items-center gap-0.5 text-[28px]", className)}
    >
      {PLATFORMS.map((platform) => {
        const href = stegaClean(social?.[platform])?.trim() || FALLBACK[platform];
        return (
          <li key={platform}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${LABEL[platform]} (opens in a new tab)`}
              className={cn(
                // a comfortable target around each mark
                "flex h-[1.6em] min-w-[1.5em] items-center justify-center rounded-lg px-[.2em] transition-[color,transform] duration-300 ease-soft hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-1",
                tone === "ink"
                  ? "text-[#1c1a19] focus-visible:outline-ink/50"
                  : "text-cream/80 focus-visible:outline-cream/60",
                HOVER[platform],
              )}
            >
              <Glyph platform={platform} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
