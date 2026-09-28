import Image from "next/image";
import { cn } from "@/lib/cn";

/* The logo uploaded in Site settings, resolved in the site layout. */
export type LogoData = {
  url: string;
  width: number;
  height: number;
  alt?: string | null;
} | null;

/* The My African Escape logo that ships with the site (public/logo.png,
   trimmed to its artwork), used until Site settings has one of its own. */
export const BRAND_LOGO: NonNullable<LogoData> = {
  url: "/logo.png",
  width: 960,
  height: 166,
};

/* The logo, filling the width of its container at its own proportions —
   or, should there somehow be none, the two-line script wordmark, which
   scales with the container's font-size. */
export default function Logo({
  logo,
  line1,
  line2,
  priority = false,
  className,
}: {
  logo: LogoData;
  line1?: string | null;
  line2?: string | null;
  priority?: boolean;
  className?: string;
}) {
  if (logo?.url) {
    return (
      <Image
        src={logo.url}
        alt={logo.alt || [line1, line2].filter(Boolean).join(" ") || "My African Escape"}
        width={logo.width}
        height={logo.height}
        /* in the header on every page: fetched straight away */
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
        /* the built-in PNG is already sized; SVGs need no resizing */
        unoptimized={logo.url.startsWith("/") || logo.url.endsWith(".svg")}
        sizes="340px"
        className={cn("block h-auto w-full object-contain", className)}
      />
    );
  }

  return (
    <span className={cn("wordmark inline-block", className)}>
      <span className="block">{line1 || "My African"}</span>
      <span className="block pl-[.6em]">{line2 || "Escape"}</span>
    </span>
  );
}
