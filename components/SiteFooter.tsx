import Link from "next/link";
import { stegaClean } from "next-sanity";
import Container from "@/components/Container";
import FooterNote, { type PageNote } from "@/components/FooterNote";
import Logo, { type LogoData } from "@/components/Logo";
import type { NavItem } from "@/components/SiteHeader";
import { pillStyle } from "@/lib/nav";

export type FooterData =
  | {
      blurb?: string | null;
      exploreHeading?: string | null;
      regionsHeading?: string | null;
      regions?: string[] | null;
      contactHeading?: string | null;
      contactLines?: string[] | null;
      copyright?: string | null;
      defaultNote?: string | null;
    }
  | null
  | undefined;

const COL_HEADING = "mb-5 font-pill text-[13px] font-normal uppercase tracking-[.16em] text-gold";
const COL_ITEM = "mb-2.5 block text-[14.5px] text-cream/[.72]";
const LINK_HOVER =
  "bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat transition-[background-size,color] duration-300 hover:bg-[length:100%_1px] hover:text-cream";

/* A contact line becomes a mailto:/tel: link when it is one. */
function contactHref(line: string): string | null {
  const clean = stegaClean(line).trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return `mailto:${clean}`;
  if (/^\+?[\d\s().-]{7,}$/.test(clean)) return `tel:${clean.replace(/[^\d+]/g, "")}`;
  return null;
}

export default function SiteFooter({
  logo,
  line1,
  line2,
  title,
  cities,
  footer,
  nav,
  notes,
}: {
  logo: LogoData;
  line1?: string | null;
  line2?: string | null;
  title?: string | null;
  /* listing cities, for the scrolling film strip */
  cities: string[];
  footer: FooterData;
  nav: NavItem[];
  notes: PageNote[];
}) {
  // repeat short lists so one copy of the strip always spans the screen
  const reel = cities.length && cities.length < 6 ? [...cities, ...cities, ...cities] : cities;

  return (
    <footer className="relative overflow-hidden bg-ink text-cream">
      {/* ---------- the credits reel: every city on the slate ---------- */}
      {reel.length ? (
        <div className="group border-b border-cream/10 bg-[#1b1006]">
          <div className="sprockets mt-2.5 opacity-60" />
          <div className="flex w-max py-4 motion-safe:animate-marquee group-hover:[animation-play-state:paused]">
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                aria-hidden={copy === 1 || undefined}
                aria-label={copy === 0 ? "Where we are" : undefined}
                className="flex shrink-0 items-center"
              >
                {reel.map((city, i) => (
                  <li
                    key={`${city}-${i}`}
                    className="flex items-center gap-10 pr-10 font-pill text-[clamp(30px,4.2vw,58px)] uppercase leading-none tracking-[.01em] text-cream/85 transition-colors duration-300 hover:text-gold"
                  >
                    {city}
                    <span aria-hidden className="text-[.38em] text-sunset">
                      ✦
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
          <div className="sprockets mb-2.5 opacity-60" />
        </div>
      ) : null}

      <Container className="pt-20 pb-12">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 tablet:grid-cols-2 mobile:grid-cols-1">
          <div>
            <Link href="/" className="inline-flex h-[76px] items-center text-[34px]">
              <Logo logo={logo} line1={line1} line2={line2} />
            </Link>
            {footer?.blurb ? (
              <p className="mt-4 max-w-[34ch] text-[14.5px] text-cream/60">{footer.blurb}</p>
            ) : null}
            <a
              href="#top"
              className="group/top mt-8 inline-flex items-center gap-3 font-pill text-[13px] uppercase tracking-[.14em] text-cream/65 transition-colors duration-300 hover:text-gold"
            >
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/25 text-[15px] transition-[transform,border-color] duration-300 ease-soft group-hover/top:-translate-y-1 group-hover/top:border-gold"
              >
                ↑
              </span>
              Rewind to the top
            </a>
          </div>

          {nav.length ? (
            <nav aria-label="Footer">
              <h2 className={COL_HEADING}>{footer?.exploreHeading || "Explore"}</h2>
              <ul>
                {nav.map((link, i) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      style={pillStyle(link.color, i, "dark")}
                      className="group/link mb-3 inline-flex items-center gap-3 text-[15px] text-cream/75 transition-colors duration-300 hover:text-cream"
                    >
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 rounded-full bg-(--pill) transition-[width] duration-300 ease-soft group-hover/link:w-6"
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {footer?.regions?.length ? (
            <div>
              <h2 className={COL_HEADING}>{footer.regionsHeading}</h2>
              <ul>
                {footer.regions.map((region, i) => (
                  <li key={i} className={COL_ITEM}>
                    {region}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {footer?.contactLines?.length ? (
            <div>
              <h2 className={COL_HEADING}>{footer.contactHeading}</h2>
              <ul>
                {footer.contactLines.map((line, i) => {
                  const href = contactHref(line);
                  return (
                    <li key={i} className={COL_ITEM}>
                      {href ? (
                        <a href={href} className={LINK_HOVER}>
                          {line}
                        </a>
                      ) : (
                        line
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-cream/[.14] pt-[26px] text-[13px] text-cream/50">
          {footer?.copyright ? <span>{footer.copyright}</span> : null}
          <FooterNote pages={notes} fallback={footer?.defaultNote} />
        </div>
      </Container>

      {/* ---------- the closing title, cropped like the last frame ---------- */}
      {title ? (
        <div aria-hidden className="overflow-hidden px-4 select-none">
          <p className="outline-title translate-y-[18%] text-center font-display text-[clamp(52px,9.4vw,164px)] leading-[.9] font-black tracking-[-.02em] whitespace-nowrap">
            {title}
          </p>
        </div>
      ) : null}
    </footer>
  );
}
