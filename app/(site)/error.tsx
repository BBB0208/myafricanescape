"use client";

import { useEffect } from "react";
import { BtnLink } from "@/components/Btn";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import Section from "@/components/Section";

/* Shown when a page can't be built at all — most often because the CMS is
   unreachable. The visitor gets the site's own design and a way forward;
   the details stay in the server log. */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[site] page failed to render:", error.digest ?? error.message);
  }, [error]);

  return (
    <Section tone="teal" className="flex min-h-[70vh] items-center">
      <Container>
        <Eyebrow tone="gold">Technical difficulties</Eyebrow>
        <h1 className="mt-4 max-w-[18ch] text-[clamp(36px,5vw,64px)]">
          We couldn&apos;t load this page just now.
        </h1>
        <p className="mt-5 max-w-[46ch] text-[17px] leading-[1.6] text-cream/70">
          It&apos;s us, not you — the listing library is briefly unavailable. Try again in a
          moment.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center rounded-full border-0 bg-flame px-6 pt-[12px] pb-[10px] font-pill text-[19px] uppercase leading-none tracking-[.04em] text-pill transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-sunset"
          >
            Try again
          </button>
          <BtnLink href="/" variant="ghost">
            Back to the home page
          </BtnLink>
        </div>
      </Container>
    </Section>
  );
}
