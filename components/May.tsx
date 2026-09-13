"use client";

import { PortableText, type PortableTextBlock } from "@portabletext/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FormEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { fmtPrice } from "@/lib/properties";
import { REGIONS } from "@/sanity/schemaTypes/options";

/* ============================================================
   MAY — the AI property concierge
   A lightweight, rule-based matcher that reads free text or
   quick-select answers (budget / type / region) and returns
   the closest listings from the Amara inventory in Sanity.
   Copy, budget bands and type groups come from Site settings;
   regions come from the listings themselves.
   ============================================================ */

export type ConciergeProperty = {
  _id: string;
  name: string | null;
  price: number | null;
  currency: string | null;
  type: string | null;
  beds: number | null;
  city: string | null;
  country: string | null;
  region: string | null;
  tag: string | null;
};

export type ConciergeConfig =
  | {
      launcherTitle?: string | null;
      launcherSubtitle?: string | null;
      panelTitle?: string | null;
      panelSubtitle?: string | null;
      greeting?: unknown;
      inputPlaceholder?: string | null;
      budgetBands?: { label?: string | null; min?: number | null; max?: number | null }[] | null;
      typeGroups?: { label?: string | null; types?: string[] | null }[] | null;
      anywhereLabel?: string | null;
      callbackMessage?: string | null;
    }
  | null
  | undefined;

type Listing = ConciergeProperty & { name: string; price: number };

type QuickStep = "budget" | "type" | "region" | "after";

type Item =
  | { id: number; kind: "msg"; who: "bot" | "user"; content: ReactNode }
  | { id: number; kind: "quick"; step: QuickStep; options: string[] }
  | { id: number; kind: "result"; property: Listing };

let uid = 0;
const mkBot = (content: ReactNode): Item => ({ id: ++uid, kind: "msg", who: "bot", content });
const mkUser = (text: string): Item => ({ id: ++uid, kind: "msg", who: "user", content: text });
const mkQuick = (step: QuickStep, options: string[]): Item => ({ id: ++uid, kind: "quick", step, options });
const mkResult = (property: Listing): Item => ({ id: ++uid, kind: "result", property });

type Band = { label: string; range: [number, number] };
type Group = { label: string; types: string[] };

/* Used until Site settings says otherwise. */
const DEFAULT_BANDS: Band[] = [
  { label: "Under $400k", range: [0, 400000] },
  { label: "$400k – $800k", range: [400000, 800000] },
  { label: "$800k – $1.5M", range: [800000, 1500000] },
  { label: "$1.5M+", range: [1500000, Infinity] },
];
const DEFAULT_GROUPS: Group[] = [
  { label: "Villa", types: ["Villa"] },
  { label: "Penthouse / Apartment", types: ["Penthouse", "Apartment"] },
  { label: "Beach House", types: ["Beach House"] },
  { label: "Estate", types: ["Estate", "Riad", "Townhouse"] },
];
const DEFAULT_GREETING = (
  <>
    Hello — I&apos;m <b>May</b>, your Amara property concierge. I can search live across our African
    portfolio. What&apos;s your budget in USD?
  </>
);
const DEFAULT_CALLBACK =
  "Lovely — leave a phone number or email below and an advisor will reach out within one business day.";

const AFTER_OPTIONS = ["Search again", "Request a callback", "Done for now"];

type Brief = {
  budget: [number, number] | null;
  types: string[] | null;
  region: string | null;
};

const emptyBrief = (): Brief => ({ budget: null, types: null, region: null });

function parseLooseNumber(match: RegExpMatchArray): number {
  let n = parseFloat(match[1].replace(/,/g, ""));
  if (/k|thousand/i.test(match[2] ?? "")) n *= 1000;
  if (/m|million/i.test(match[2] ?? "")) n *= 1000000;
  return n || 0;
}

/* ---------- context, so any page can hand a search to May ---------- */

const MayContext = createContext<{ openAndGreet: () => void; enabled: boolean } | null>(null);

export function useMay() {
  const ctx = useContext(MayContext);
  if (!ctx) throw new Error("useMay must be used within <MayProvider>");
  return ctx;
}

export function MayProvider({
  enabled,
  config,
  properties,
  children,
}: {
  /* Site settings → May concierge → "Show May on the site" */
  enabled: boolean;
  config: ConciergeConfig;
  properties: ConciergeProperty[];
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [draft, setDraft] = useState("");
  const brief = useRef<Brief>(emptyBrief());
  const greeted = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  /* ---------- everything May knows, from Sanity ---------- */

  const listings = useMemo(
    () => properties.filter((p): p is Listing => !!p.name && typeof p.price === "number"),
    [properties],
  );

  const bands = useMemo<Band[]>(() => {
    const fromCms = (config?.budgetBands ?? []).flatMap((b) =>
      b.label ? [{ label: b.label, range: [b.min ?? 0, b.max ?? Infinity] as [number, number] }] : [],
    );
    return fromCms.length ? fromCms : DEFAULT_BANDS;
  }, [config?.budgetBands]);

  const groups = useMemo<Group[]>(() => {
    const fromCms = (config?.typeGroups ?? []).flatMap((g) =>
      g.label ? [{ label: g.label, types: g.types ?? [] }] : [],
    );
    return fromCms.length ? fromCms : DEFAULT_GROUPS;
  }, [config?.typeGroups]);

  const anywhere = config?.anywhereLabel || "Anywhere in Africa";

  const regions = useMemo(() => {
    const present = new Set(listings.map((p) => p.region).filter((r): r is string => !!r));
    const known = REGIONS.filter((r) => present.has(r));
    const extra = [...present].filter((r) => !(REGIONS as readonly string[]).includes(r));
    return [...known, ...extra];
  }, [listings]);

  const greeting = useMemo<ReactNode>(() => {
    const blocks = config?.greeting as PortableTextBlock[] | null | undefined;
    if (!blocks?.length) return DEFAULT_GREETING;
    return (
      <PortableText
        value={blocks}
        components={{ block: { normal: ({ children }) => <span className="block">{children}</span> } }}
      />
    );
  }, [config?.greeting]);

  const budgetLabels = bands.map((b) => b.label);
  const typeLabels = groups.map((g) => g.label);
  const regionLabels = [anywhere, ...regions];

  const append = useCallback((...next: Item[]) => {
    setItems((prev) => [...prev, ...next]);
  }, []);

  const openAndGreet = useCallback(() => {
    setOpen(true);
    if (greeted.current) return;
    greeted.current = true;
    setItems((prev) => [
      ...prev,
      mkBot(greeting),
      mkQuick("budget", bands.map((b) => b.label)),
    ]);
  }, [greeting, bands]);

  /* keep the transcript pinned to the newest message */
  useEffect(() => {
    const node = bodyRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [items]);

  function runSearch() {
    const [lo, hi] = brief.current.budget ?? [0, Infinity];
    const { types, region } = brief.current;

    let matches = listings.filter((p) => {
      const inBudget = p.price >= lo && p.price <= hi;
      const inType = !types || types.includes(p.type ?? "");
      const inRegion = !region || p.region === region;
      return inBudget && inType && inRegion;
    });

    const out: Item[] = [];

    // widen the search if nothing was found, prioritising budget match
    if (matches.length === 0) {
      matches = listings
        .filter((p) => !region || p.region === region)
        .sort((a, b) => Math.abs(a.price - lo) - Math.abs(b.price - lo))
        .slice(0, 3);
      out.push(
        mkBot("I couldn't find an exact match, so here's the closest inventory I have on those terms:"),
      );
    } else {
      matches = matches.slice(0, 3);
      out.push(
        mkBot(
          <>
            Here&apos;s what&apos;s showing well right now —{" "}
            <b>
              {matches.length} match{matches.length > 1 ? "es" : ""}
            </b>{" "}
            for that brief:
          </>,
        ),
      );
    }

    matches.forEach((p) => out.push(mkResult(p)));
    out.push(mkBot("Want to refine this, or shall I have an Amara advisor call you about one of these?"));
    out.push(mkQuick("after", AFTER_OPTIONS));
    append(...out);
  }

  function onBudget(choice: string) {
    brief.current.budget = bands.find((b) => b.label === choice)?.range ?? null;
    append(mkBot("Got it. What kind of property are you picturing?"), mkQuick("type", typeLabels));
  }

  function onType(choice: string) {
    brief.current.types = groups.find((g) => g.label === choice)?.types ?? null;
    append(
      mkBot("Any part of Africa you're drawn to, or should I search the whole continent?"),
      mkQuick("region", regionLabels),
    );
  }

  function onRegion(choice: string) {
    brief.current.region = choice === anywhere ? null : choice;
    runSearch();
  }

  function onAfter(choice: string) {
    if (choice === "Search again") {
      brief.current = emptyBrief();
      append(mkBot("Sure — starting over. What's your budget in USD?"), mkQuick("budget", budgetLabels));
    } else if (choice === "Request a callback") {
      append(mkBot(config?.callbackMessage || DEFAULT_CALLBACK));
    } else {
      append(mkBot("Wonderful — I'll be right here whenever you're ready to pick this up again."));
    }
  }

  function handleQuick(itemId: number, step: QuickStep, choice: string) {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    append(mkUser(choice));
    if (step === "budget") onBudget(choice);
    else if (step === "type") onType(choice);
    else if (step === "region") onRegion(choice);
    else onAfter(choice);
  }

  function freeTextSearch(text: string) {
    const out: Item[] = [mkUser(text)];
    const lower = text.toLowerCase();

    // try to extract a rough budget
    let lo = 0;
    let hi = Infinity;
    const num = lower.match(/([\d,.]+)\s*(k|m|million|thousand)?/);
    if (/under|below|less than/.test(lower) && num) {
      hi = parseLooseNumber(num);
    } else if (num && /\d/.test(num[1])) {
      lo = parseLooseNumber(num) * 0.7;
      hi = parseLooseNumber(num) * 1.3;
    }

    const has = (s: string | null | undefined) => !!s && lower.includes(s.toLowerCase());
    const typeHit = listings.map((p) => p.type).find(has);
    const countryHit = listings.map((p) => p.country).find(has);
    const cityHit = listings.map((p) => p.city?.split(",")[0]).find(has);

    let matches = listings.filter((p) => {
      const inBudget = p.price >= lo && p.price <= hi;
      const inType = !typeHit || p.type === typeHit;
      const inCountry = !countryHit || p.country === countryHit;
      const inCity = !cityHit || (p.city ?? "").toLowerCase().includes(cityHit.toLowerCase());
      return inBudget && inType && inCountry && inCity;
    });

    if (matches.length === 0) {
      const mid = Number.isFinite(hi) ? (lo + hi) / 2 : lo;
      matches = [...listings]
        .sort((a, b) => Math.abs(a.price - mid) - Math.abs(b.price - mid))
        .slice(0, 3);
      out.push(
        mkBot("Nothing matched that exactly, so here's the nearest inventory across the continent:"),
      );
    } else {
      matches = matches.slice(0, 3);
      out.push(mkBot(`Found ${matches.length} that fit — here's a first look:`));
    }

    matches.forEach((p) => out.push(mkResult(p)));
    out.push(
      mkBot(
        'Tell me more about what you\'re after, or use the quick options any time by typing "restart".',
      ),
    );
    append(...out);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    if (/restart|start over/i.test(text)) {
      brief.current = emptyBrief();
      append(
        mkUser(text),
        mkBot("Starting fresh — what's your budget in USD?"),
        mkQuick("budget", budgetLabels),
      );
    } else {
      freeTextSearch(text);
    }
  }

  const value = useMemo(() => ({ openAndGreet, enabled }), [openAndGreet, enabled]);

  // switched off: no launcher or panel, and every Ask May button hides itself
  if (!enabled) {
    return <MayContext.Provider value={value}>{children}</MayContext.Provider>;
  }

  return (
    <MayContext.Provider value={value}>
      {children}

      {/* ---------- launcher ---------- */}
      <button
        type="button"
        onClick={openAndGreet}
        className={cn(
          "fixed right-[26px] bottom-[26px] z-1200 items-center gap-3 rounded-full border-0 bg-ink py-3.5 pr-5 pl-3.5 text-cream shadow-[0_14px_34px_rgba(36,22,8,.35)] transition-transform duration-200 hover:-translate-y-[3px]",
          open ? "hidden" : "flex",
        )}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-sunset),var(--color-magenta))] font-display text-[16px] font-extrabold">
          M
        </span>
        <span className="text-left leading-[1.15]">
          <b className="block font-eyebrow text-[13.5px] tracking-[.06em]">
            {config?.launcherTitle || "Ask May"}
          </b>
          <span className="text-[11.5px] text-cream/60">
            {config?.launcherSubtitle || "Find a property in Africa"}
          </span>
        </span>
      </button>

      {/* ---------- panel ---------- */}
      <div
        className={cn(
          "fixed right-[26px] bottom-[26px] z-1300 flex h-[min(600px,calc(100vh-52px))] w-[392px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[22px] bg-cream shadow-[0_30px_70px_rgba(6,20,18,.45)]",
          "[transition:transform_.28s_cubic-bezier(.2,.8,.2,1),opacity_.22s_ease]",
          "mobile:right-4 mobile:bottom-4 mobile:w-[calc(100vw-32px)]",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-6 scale-[.97] opacity-0",
        )}
      >
        <div className="flex items-center justify-between bg-[repeating-linear-gradient(-45deg,var(--color-ink)_0_18px,#3a2812_18px_36px)] px-[18px] py-4 text-cream">
          <div className="flex items-center gap-2.5">
            <span className="h-[9px] w-[9px] rounded-full bg-gold shadow-[0_0_0_3px_rgba(242,183,5,.25)]" />
            <div>
              <b className="font-eyebrow text-[15px] tracking-[.08em]">{config?.panelTitle || "MAY"}</b>
              <small className="block text-[11px] text-cream/65">
                {config?.panelSubtitle || "Amara AI Concierge"}
              </small>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="border-0 bg-transparent p-1 text-[20px] leading-none text-cream"
          >
            ×
          </button>
        </div>

        <div
          ref={bodyRef}
          className="flex flex-1 flex-col gap-3 overflow-y-auto bg-[radial-gradient(circle_at_100%_0%,rgba(232,93,44,.06),transparent_40%),radial-gradient(circle_at_0%_100%,rgba(198,35,111,.06),transparent_40%)] p-[18px]"
        >
          {items.map((item) => {
            if (item.kind === "msg") {
              return (
                <div
                  key={item.id}
                  className={cn(
                    "max-w-[85%] rounded-[14px] px-3.5 py-3 text-[14.5px] leading-[1.45]",
                    item.who === "bot"
                      ? "self-start rounded-bl-[4px] bg-cream-2 text-ink [&_b]:text-magenta-2 [&_strong]:text-magenta-2"
                      : "self-end rounded-br-[4px] bg-ink text-cream",
                  )}
                >
                  {item.content}
                </div>
              );
            }

            if (item.kind === "quick") {
              return (
                <div key={item.id} className="mt-0.5 flex flex-wrap gap-2">
                  {item.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleQuick(item.id, item.step, option)}
                      className="rounded-full border border-ink/20 bg-transparent px-3 py-2 text-[12.5px] text-ink hover:bg-ink hover:text-cream"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              );
            }

            const p = item.property;
            return (
              <div key={item.id} className="mt-1 rounded-xl bg-ink p-3 text-cream">
                <div className="font-eyebrow text-[13px] tracking-[.05em] text-gold">
                  {fmtPrice(p.price, p.currency ?? "USD")}
                </div>
                <h4 className="mt-1 mb-0.5 text-[16px]">{p.name}</h4>
                <p className="mb-0 text-[12.5px] text-cream/65">
                  {[p.city, p.country].filter(Boolean).join(", ")} —{" "}
                  {[p.type, p.beds != null ? `${p.beds} bed` : null, p.tag].filter(Boolean).join(" · ")}
                </p>
              </div>
            );
          })}
        </div>

        <form onSubmit={onSubmit} className="flex gap-2 border-t border-ink/10 bg-cream p-3.5">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={config?.inputPlaceholder || "e.g. villa in Kenya under $600k"}
            autoComplete="off"
            className="flex-1 rounded-full border-[1.5px] border-ink/[.18] bg-white px-4 py-3 text-[14px] text-ink focus:outline-2 focus:outline-sunset"
          />
          <button
            type="submit"
            aria-label="Send"
            className="flex h-11 w-11 items-center justify-center rounded-full border-0 bg-sunset text-[16px] text-cream"
          >
            ➤
          </button>
        </form>
      </div>
    </MayContext.Provider>
  );
}
