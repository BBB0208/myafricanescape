"use client";

import { createContext, useCallback, useContext, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { ICON_STROKE } from "@/lib/icons";

/* ============================================================
   An editorial section whose labels change the picture beside it,
   and where each label can hold a set of pictures to page through.

   The labels and the pictures sit in different columns of the
   grid, so the selection lives in a context wrapped around both.
   Every picture is rendered by the server and cross-dissolved on
   selection — nothing is fetched when a label or an arrow is used.

   The labels follow the WAI-ARIA tabs pattern: arrow keys move
   between them, Home and End jump to the ends, and only the
   selected label is in the tab order.
   ============================================================ */

type ViewsContextValue = {
  index: number;
  select: (i: number) => void;
  labels: string[];
  tabId: (i: number) => string;
  panelId: string;
  register: (i: number, node: HTMLButtonElement | null) => void;
  focus: (i: number) => void;
  count: number;
};

const ViewsContext = createContext<ViewsContextValue | null>(null);

const useViews = () => {
  const ctx = useContext(ViewsContext);
  if (!ctx) throw new Error("EditorialViews components must be used inside <ViewsProvider>");
  return ctx;
};

export function ViewsProvider({ labels, children }: { labels: string[]; children: ReactNode }) {
  const id = useId();
  const [index, setIndex] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = labels.length;

  const register = useCallback((i: number, node: HTMLButtonElement | null) => {
    tabs.current[i] = node;
  }, []);
  const focus = useCallback((i: number) => tabs.current[i]?.focus(), []);

  const value = useMemo<ViewsContextValue>(
    () => ({
      index: Math.min(index, Math.max(0, count - 1)),
      select: setIndex,
      labels,
      tabId: (i) => `${id}-tab-${i}`,
      panelId: `${id}-panel`,
      register,
      focus,
      count,
    }),
    [index, labels, count, id, register, focus],
  );

  return <ViewsContext.Provider value={value}>{children}</ViewsContext.Provider>;
}

const ARROW =
  "inline-flex items-center justify-center border-0 bg-transparent px-3 py-[7px] text-pill transition-colors hover:bg-ink/20 focus-visible:bg-ink/20 focus-visible:outline-none " +
  // a roomier target for thumbs
  "mobile:px-3.5 mobile:py-[11px]";

/* The picture. Every frame of every label is already in the markup;
   selecting one only changes which is opaque. */
export function ViewArt({ groups }: { groups: ReactNode[][] }) {
  const { index: view, panelId, tabId, labels } = useViews();
  const [frame, setFrame] = useState(0);

  /* a new label starts at its first picture — adjusted during render, so
     there is never a flash of the old frame */
  const lastView = useRef(view);
  if (lastView.current !== view) {
    lastView.current = view;
    setFrame(0);
  }

  const count = groups[view]?.length ?? 0;
  const at = Math.min(frame, Math.max(0, count - 1));
  const go = (step: number) => setFrame((f) => (f + step + count) % count);
  const label = labels[view] ?? "this selection";

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId(view)}
      className="r-curtain relative aspect-[5/4] overflow-hidden rounded-[28px]"
    >
      {groups.map((frames, v) =>
        frames.map((node, f) => (
          <div
            key={`${v}-${f}`}
            aria-hidden={!(v === view && f === at)}
            className={cn(
              "absolute inset-0 transition-opacity duration-500 ease-soft",
              v === view && f === at ? "opacity-100" : "opacity-0",
            )}
          >
            {node}
          </div>
        )),
      )}

      {count > 1 ? (
        <>
          <span className="pointer-events-none absolute bottom-5 left-5 z-[2] font-eyebrow text-[12px] tracking-[.1em] text-cream [text-shadow:0_1px_6px_rgba(36,22,8,.75)]">
            {`${String(at + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`}
          </span>
          <div className="absolute right-5 bottom-4 z-[2] flex overflow-hidden rounded-full bg-flame shadow-[0_6px_16px_rgba(255,90,31,.35)]">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={`Previous picture of ${label}`}
              aria-controls={panelId}
              className={ARROW}
            >
              <ChevronsLeft size={16} strokeWidth={ICON_STROKE} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={`Next picture of ${label}`}
              aria-controls={panelId}
              className={ARROW}
            >
              <ChevronsRight size={16} strokeWidth={ICON_STROKE} aria-hidden />
            </button>
          </div>
        </>
      ) : null}

      <span className="sr-only" aria-live="polite">
        {count > 1 ? `${label}, picture ${at + 1} of ${count}` : ""}
      </span>
    </div>
  );
}

const TONES = {
  ink: {
    idle: "border-ink/20 text-ink/70 hover:border-ink/45 hover:text-ink",
    on: "border-ink bg-ink text-cream",
    ring: "focus-visible:outline-ink/60",
  },
  cream: {
    idle: "border-cream/25 text-cream/75 hover:border-cream/55 hover:text-cream",
    on: "border-cream bg-cream text-ink",
    ring: "focus-visible:outline-cream/70",
  },
} as const;

export function ViewPills({
  tone = "ink",
  label = "Choose a picture",
}: {
  tone?: keyof typeof TONES;
  label?: string;
}) {
  const { index, select, labels, tabId, panelId, register, focus, count } = useViews();
  const skin = TONES[tone];

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: count - 1,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const wrapped = (next + count) % count;
    select(wrapped);
    focus(wrapped);
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      aria-orientation="horizontal"
      onKeyDown={onKeyDown}
      className="mt-[22px] flex flex-wrap gap-2.5"
    >
      {labels.map((text, i) => {
        const selected = i === index;
        return (
          <button
            key={i}
            type="button"
            role="tab"
            id={tabId(i)}
            ref={(node) => register(i, node)}
            aria-selected={selected}
            aria-controls={panelId}
            /* roving tab order: one stop for the whole group */
            tabIndex={selected ? 0 : -1}
            onClick={() => select(i)}
            className={cn(
              "cursor-pointer rounded-full border px-3.5 py-2 font-eyebrow text-[12.5px] tracking-[.06em]",
              "transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2",
              selected ? skin.on : skin.idle,
              skin.ring,
            )}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}
