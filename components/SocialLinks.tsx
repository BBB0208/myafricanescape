import { stegaClean } from "next-sanity";
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

/* Drawn on a 24px grid to sit together at one optical size: a solid
   "f", the play button, and the outlined camera. */
function Glyph({ platform }: { platform: Platform }) {
  const common = { viewBox: "0 0 24 24", "aria-hidden": true, className: "size-full" } as const;
  switch (platform) {
    case "facebook":
      return (
        <svg {...common} fill="currentColor">
          <path d="M13.6 21.5v-8.2h2.8l.45-3.4H13.6V7.75c0-.98.28-1.65 1.7-1.65h1.72V3.08A23 23 0 0 0 14.5 2.95c-2.5 0-4.2 1.52-4.2 4.32V9.9H7.5v3.4h2.8v8.2h3.3Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common} fill="currentColor">
          <path
            fillRule="evenodd"
            d="M6.2 4.75h11.6a4.45 4.45 0 0 1 4.45 4.45v5.6a4.45 4.45 0 0 1-4.45 4.45H6.2a4.45 4.45 0 0 1-4.45-4.45V9.2A4.45 4.45 0 0 1 6.2 4.75ZM9.9 8.7v6.6l5.7-3.3-5.7-3.3Z"
          />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={1.9}>
          <rect x="3" y="3" width="18" height="18" rx="5.2" />
          <circle cx="12" cy="12" r="4.1" />
          <circle cx="17.35" cy="6.65" r="1.15" fill="currentColor" stroke="none" />
        </svg>
      );
  }
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
  className?: string;
}) {
  return (
    <ul aria-label="Follow My African Escape" className={cn("flex items-center gap-1", className)}>
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
                "flex size-9 items-center justify-center rounded-full p-[7px] transition-[color,transform] duration-300 ease-soft hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-1",
                tone === "ink"
                  ? "text-ink focus-visible:outline-ink/50"
                  : "text-cream/75 focus-visible:outline-cream/60",
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
