import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* The small rule-and-caps label. On sunset gradients only the text
   lightens — the rule stays sunset, exactly as the original did. */
const TONES = {
  sunset: { text: "text-sunset", bar: "bg-sunset" },
  gold: { text: "text-gold", bar: "bg-gold" },
  cream: { text: "text-cream/85", bar: "bg-sunset" },
} as const;

export default function Eyebrow({
  children,
  tone = "sunset",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  const { text, bar } = TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-eyebrow text-[15px] tracking-[.16em] uppercase",
        text,
        className,
      )}
    >
      {/* r-bar: the rule draws in when a surrounding reveal plays */}
      <span className={cn("r-bar inline-block h-0.5 w-[22px]", bar)} />
      {children}
    </span>
  );
}
