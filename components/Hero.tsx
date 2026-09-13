import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import Art, { type ArtValue } from "@/components/Art";
import Eyebrow from "@/components/Eyebrow";

/* On arrival the artwork eases back from a slight zoom and the copy rises
   in. The headline itself is never hidden — it's the page's largest
   element, so it paints straight away. */
export default function Hero({
  art,
  eyebrow,
  title,
  titleClassName = "text-[clamp(44px,6.4vw,92px)]",
  lede,
  actions,
  className = "min-h-[88vh]",
  priority = false,
}: {
  art: ArtValue;
  eyebrow?: ReactNode;
  title: ReactNode;
  titleClassName?: string;
  lede?: ReactNode;
  actions?: ReactNode;
  className?: string;
  priority?: boolean;
}) {
  return (
    <section className={cn("relative flex items-end overflow-hidden pt-0 pb-[72px] text-cream", className)}>
      <div className="absolute inset-0 z-0 motion-safe:animate-ken-burns">
        <Art
          art={art}
          className="h-full w-full"
          width={2400}
          height={1400}
          sizes="100vw"
          priority={priority}
        />
      </div>
      <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(6,46,43,.15)_0%,rgba(6,46,43,.35)_55%,rgba(6,32,30,.92)_100%)]" />
      <div className="relative z-[2] mx-auto w-full max-w-site px-8">
        {eyebrow ? (
          <Eyebrow tone="gold" className="motion-safe:animate-rise">
            {eyebrow}
          </Eyebrow>
        ) : null}
        <h1 className={cn("mt-[18px] mb-[22px] max-w-[16ch] leading-[.98]", titleClassName)}>
          {title}
        </h1>
        {lede ? (
          <div className="mb-[34px] max-w-[52ch] text-[19px] text-cream/[.88] motion-safe:animate-rise motion-safe:[animation-delay:.18s] [&_p+p]:mt-3">
            {lede}
          </div>
        ) : null}
        {actions ? (
          <div className="flex flex-wrap gap-3.5 motion-safe:animate-rise motion-safe:[animation-delay:.32s]">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/* The italic accent inside a hero headline: a band of gold light sweeps
   across it once. */
export function Em({ children }: { children: ReactNode }) {
  return (
    <em className="-mr-[.08em] bg-[linear-gradient(100deg,var(--color-sunset-2)_0%_40%,var(--color-gold)_50%,var(--color-sunset-2)_60%_100%)] bg-[length:250%_100%] bg-clip-text pr-[.08em] font-medium text-sunset-2 italic [-webkit-text-fill-color:transparent] motion-safe:animate-accent">
      {children}
    </em>
  );
}
