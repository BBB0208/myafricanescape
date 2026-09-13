import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import Art, { type ArtValue } from "@/components/Art";
import Reveal from "@/components/Reveal";
import type { SceneName } from "@/lib/properties";

/* A single frame of film: sprocket holes top and bottom, the artwork in
   the gate, the caption printed below. It "develops" into colour as it
   scrolls in; `index` staggers a row. */
export default function FrameCard({
  art,
  fallback,
  sceneTag,
  index,
  children,
  className,
}: {
  art: ArtValue;
  fallback?: SceneName;
  sceneTag?: ReactNode;
  index?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Reveal
      variant="develop"
      index={index}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-ink px-3.5 pt-3.5 pb-5 text-cream",
        className,
      )}
    >
      <div className="sprockets mb-2.5" />
      <div className="r-develop relative aspect-[4/3] overflow-hidden rounded-md">
        <Art
          art={art}
          fallback={fallback}
          className="absolute inset-0 h-full w-full"
          width={800}
          height={600}
          sizes="(max-width: 780px) 100vw, (max-width: 1080px) 50vw, 33vw"
        />
        {sceneTag ? (
          <span className="absolute top-2.5 left-2.5 z-[3] rounded-full bg-ink/55 px-2.5 py-[5px] font-eyebrow text-[11px] tracking-[.1em] text-cream backdrop-blur-[4px]">
            {sceneTag}
          </span>
        ) : null}
      </div>
      <div className="sprockets mt-3.5" />
      <div className="px-1.5 pt-[18px] pb-1">{children}</div>
    </Reveal>
  );
}
