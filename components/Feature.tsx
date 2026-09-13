import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import Reveal from "@/components/Reveal";

export default function Feature({
  num,
  title,
  tone = "ink",
  index,
  children,
}: {
  num: string;
  title: ReactNode;
  tone?: "ink" | "cream";
  /* row position, for the staggered reveal */
  index?: number;
  children: ReactNode;
}) {
  return (
    <Reveal
      index={index}
      className="flex items-start gap-[18px] border-t border-ink/12 py-[26px] last:border-b"
    >
      <div className="min-w-[34px] font-eyebrow text-[14px] text-sunset">{num}</div>
      <div>
        <h3 className="mb-1.5 text-[19px]">{title}</h3>
        <p
          className={cn(
            "max-w-[52ch] text-[15px]",
            tone === "cream" ? "text-cream/75" : "text-ink/70",
          )}
        >
          {children}
        </p>
      </div>
    </Reveal>
  );
}
