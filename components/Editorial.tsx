import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import Art, { type ArtValue } from "@/components/Art";
import Reveal from "@/components/Reveal";

/* Two-column editorial block. Children are laid out in source order,
   so an art-first block reads art / copy and a reversed one copy / art.
   On scroll the artwork opens like a curtain and the copy rises after it. */
export function Editorial({
  reverse = false,
  children,
}: {
  reverse?: boolean;
  children: ReactNode;
}) {
  return (
    <Reveal
      variant="group"
      className={cn(
        "grid items-center gap-16 tablet:grid-cols-1",
        reverse ? "grid-cols-[1.1fr_.9fr]" : "grid-cols-[.9fr_1.1fr]",
      )}
    >
      {children}
    </Reveal>
  );
}

export function EditorialArt({ art }: { art: ArtValue }) {
  return (
    <div className="r-curtain relative aspect-[5/4] overflow-hidden rounded-[28px]">
      <Art art={art} className="absolute inset-0 h-full w-full" width={1000} height={800} />
    </div>
  );
}

/* Shared copy styles — blocks add the text colour that suits their ground. */
export const EDITORIAL_H2 = "mb-5 text-[clamp(28px,3.4vw,44px)]";
export const EDITORIAL_P = "mb-4 text-[16px]";
