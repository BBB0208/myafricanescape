import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const TONES = {
  cream: "",
  teal: "bg-teal-deep text-cream",
  sunset:
    "bg-[linear-gradient(120deg,var(--color-sunset)_0%,var(--color-magenta)_100%)] text-cream",
} as const;

export default function Section({
  id,
  tone = "cream",
  padding = "py-[104px] mobile:py-[72px]",
  className,
  children,
}: {
  id?: string;
  tone?: keyof typeof TONES;
  padding?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn(padding, TONES[tone], className)}>
      {children}
    </section>
  );
}
