import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import Eyebrow from "@/components/Eyebrow";
import Reveal from "@/components/Reveal";
import { EYEBROW_TONE, MUTED_TEXT, type Tone } from "@/lib/tone";

/* Eyebrow, heading and optional aside. `tone` is the section ground the
   head sits on — it picks the eyebrow and aside colours. On scroll the
   eyebrow rule draws in, the heading wipes up and the aside follows. */
export default function SectionHead({
  eyebrow,
  title,
  titleClassName,
  aside,
  tone = "cream",
  center = false,
  reveal = true,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  titleClassName?: string;
  aside?: ReactNode;
  tone?: Tone;
  center?: boolean;
  reveal?: boolean;
}) {
  const eyebrowNode = eyebrow ? (
    <Eyebrow tone={EYEBROW_TONE[tone]} className="r-fade">
      {eyebrow}
    </Eyebrow>
  ) : null;
  const className = cn(
    "mb-14 flex flex-wrap gap-10",
    center ? "flex-col items-center text-center" : "items-end justify-between",
  );

  const content = center ? (
    <>
      {eyebrowNode}
      <h2 className={cn("r-wipe mt-4 max-w-[20ch] text-[clamp(32px,4vw,52px)] [--d:120ms]", titleClassName)}>
        {title}
      </h2>
    </>
  ) : (
    <>
      <div>
        {eyebrowNode}
        <h2 className={cn("r-wipe mt-4 max-w-[16ch] text-[clamp(32px,4vw,52px)] [--d:120ms]", titleClassName)}>
          {title}
        </h2>
      </div>
      {aside ? (
        <p className={cn("r-fade max-w-[40ch] text-[16px] [--d:260ms]", MUTED_TEXT[tone])}>{aside}</p>
      ) : null}
    </>
  );

  return reveal ? (
    <Reveal variant="group" className={className}>
      {content}
    </Reveal>
  ) : (
    <div className={className}>{content}</div>
  );
}
