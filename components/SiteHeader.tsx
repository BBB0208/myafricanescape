"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { ButtonValue } from "@/components/CmsButton";
import Logo, { type LogoData } from "@/components/Logo";
import { useMay } from "@/components/May";
import { cn } from "@/lib/cn";
import { isConciergeLink, resolveHref } from "@/lib/links";
import { pillStyle } from "@/lib/nav";

export type NavItem = { key: string; label: string; href: string; color?: string | null };

/* What the header and footer show while a given page is open. */
export type PageChrome = {
  path: string;
  note?: string | null;
  cta?: ButtonValue;
};

/* A plain uppercase link with a dot in its own colour. On hover — and for
   the current page — the dot blooms into the full pill. */
const NAV_LINK =
  "relative isolate inline-flex items-center rounded-full py-[11px] pr-4 pl-[30px] font-pill text-[15px] uppercase leading-none tracking-[.06em] text-ink/80 transition-colors duration-300 " +
  "before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-(--pill) before:transition-[clip-path] before:duration-500 before:ease-film before:[clip-path:circle(4px_at_16px_50%)] " +
  "hover:text-(--pill-text) hover:before:[clip-path:circle(160%_at_16px_50%)] " +
  "focus-visible:text-(--pill-text) focus-visible:outline-none focus-visible:before:[clip-path:circle(160%_at_16px_50%)] " +
  "aria-[current=page]:text-(--pill-text) aria-[current=page]:before:[clip-path:circle(160%_at_16px_50%)] " +
  "tablet:pr-3 tablet:text-[13px]";

const CTA =
  "inline-flex items-center rounded-full border-0 bg-flame px-6 pt-[12px] pb-[10px] font-pill text-[19px] uppercase leading-none tracking-[.04em] text-pill transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-sunset";

export default function SiteHeader({
  logo,
  line1,
  line2,
  nav,
  pages,
  cta: siteCta,
}: {
  logo: LogoData;
  line1?: string | null;
  line2?: string | null;
  nav: NavItem[];
  pages: PageChrome[];
  cta?: ButtonValue;
}) {
  const pathname = usePathname();
  const { openAndGreet, enabled: mayEnabled } = useMay();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  /* the header tightens once the top of the page scrolls away —
     an observer, so nothing runs on every scroll event */
  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // a page's own header button wins over the site-wide one
  const current = pages.find((page) => page.path === pathname);
  const cta = current?.cta?.label ? current.cta : siteCta;
  const ctaIsMay = isConciergeLink(cta?.link);
  const ctaHref = cta && !ctaIsMay ? resolveHref(cta.link) : null;

  let ctaNode: ReactNode = null;
  if (cta?.label && ctaIsMay && mayEnabled) {
    ctaNode = (
      <button type="button" onClick={openAndGreet} className={CTA}>
        {cta.label}
      </button>
    );
  } else if (cta?.label && ctaHref) {
    ctaNode = ctaHref.startsWith("#") ? (
      <a href={ctaHref} className={CTA}>
        {cta.label}
      </a>
    ) : (
      <Link href={ctaHref} className={CTA}>
        {cta.label}
      </Link>
    );
  }

  return (
    <>
      <div ref={sentinel} aria-hidden className="pointer-events-none absolute top-0 left-0 h-6 w-px" />

      <header
        className={cn(
          "sticky top-0 z-500 border-b bg-cream/[.9] backdrop-blur-[10px] backdrop-saturate-[1.2] transition-[border-color,box-shadow] duration-300",
          scrolled
            ? "border-ink/[.09] shadow-[0_6px_24px_rgba(36,22,8,.07)]"
            : "border-transparent",
        )}
      >
        <div
          className={cn(
            "mx-auto grid max-w-site grid-cols-[1fr_auto_1fr] items-center gap-6 px-8 transition-[padding] duration-300 mobile:grid-cols-[1fr_auto] mobile:gap-4 mobile:px-5",
            scrolled ? "py-2" : "py-3.5",
          )}
        >
          <Link
            href="/"
            className={cn(
              "flex items-center justify-self-start transition-[height,font-size] duration-300",
              scrolled ? "h-[58px] text-[28px]" : "h-[96px] text-[42px]",
              "mobile:h-[56px] mobile:text-[26px]",
            )}
          >
            <Logo logo={logo} line1={line1} line2={line2} priority />
          </Link>

          <nav aria-label="Main" className="flex items-center gap-1 mobile:hidden">
            {nav.map((link, i) => (
              <Link
                key={link.key}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                style={pillStyle(link.color, i)}
                className={NAV_LINK}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 justify-self-end">
            <div className="mobile:hidden">{ctaNode}</div>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={sheetOpen}
              onClick={() => setSheetOpen(true)}
              className="hidden border-0 bg-transparent p-2 mobile:block"
            >
              <span className="my-[5px] block h-0.5 w-6 bg-ink" />
              <span className="my-[5px] block h-0.5 w-6 bg-ink" />
              <span className="my-[5px] block h-0.5 w-6 bg-ink" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------- mobile menu: the pills slide in one after another ---------- */}
      <div
        inert={!sheetOpen}
        className={cn(
          "fixed inset-0 z-1000 flex flex-col items-start gap-3 bg-ink px-6 pt-24 pb-10 transition-transform duration-500 ease-film",
          sheetOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSheetOpen(false)}
          className="absolute top-6 right-6 border-0 bg-transparent p-2 text-[34px] leading-none text-cream"
        >
          ×
        </button>
        {nav.map((link, i) => (
          <Link
            key={link.key}
            href={link.href}
            onClick={() => setSheetOpen(false)}
            aria-current={pathname === link.href ? "page" : undefined}
            style={{
              ...pillStyle(link.color, i),
              transitionDelay: sheetOpen ? `${180 + i * 70}ms` : "0ms",
            }}
            className={cn(
              "rounded-full bg-(--pill) px-7 pt-[16px] pb-[13px] font-pill text-[28px] uppercase leading-none tracking-[.04em] text-(--pill-text) transition-[transform,opacity] duration-500 ease-soft",
              sheetOpen ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0",
            )}
          >
            {link.label}
          </Link>
        ))}
        {ctaNode ? (
          <div className="mt-4" onClick={() => setSheetOpen(false)}>
            {ctaNode}
          </div>
        ) : null}
      </div>
    </>
  );
}
