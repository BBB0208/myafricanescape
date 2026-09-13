import Image from "next/image";
import { cn } from "@/lib/cn";

/* The logo uploaded in Site settings, resolved in the site layout. */
export type LogoData = {
  url: string;
  width: number;
  height: number;
  alt?: string | null;
} | null;

/* The uploaded logo, or — until there is one — the two-line script
   wordmark. Fills the height of its container; the wordmark scales with
   the container's font-size. */
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
        alt={logo.alt || [line1, line2].filter(Boolean).join(" ") || "Home"}
        width={logo.width}
        height={logo.height}
        priority={priority}
        unoptimized={logo.url.endsWith(".svg")}
        sizes="320px"
        className={cn("h-full w-auto object-contain", className)}
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
