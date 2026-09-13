"use client";

import { useIsPresentationTool } from "next-sanity/hooks";

/* Shown while previewing drafts outside the Presentation tool, so editors
   can always find their way back to the published site. */
export default function DraftModeToast() {
  const isPresentationTool = useIsPresentationTool();
  if (isPresentationTool !== false) return null;

  return (
    <div className="fixed bottom-[26px] left-[26px] z-1400 flex items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-4 text-[13px] text-cream shadow-[0_14px_34px_rgba(36,22,8,.35)] mobile:bottom-24 mobile:left-4">
      <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_0_3px_rgba(242,183,5,.25)]" />
      Previewing drafts
      {/* a plain anchor: route handlers shouldn't be prefetched */}
      <a
        href="/api/draft-mode/disable"
        className="rounded-full bg-sunset px-3.5 py-2 font-eyebrow text-[13px] tracking-[.08em]"
      >
        Exit preview
      </a>
    </div>
  );
}
