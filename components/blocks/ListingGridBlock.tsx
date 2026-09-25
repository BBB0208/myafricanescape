import Link from "next/link";
import { stegaClean } from "next-sanity";
import Art from "@/components/Art";
import Container from "@/components/Container";
import Price from "@/components/currency/Price";
import JsonLd from "@/components/JsonLd";
import ListingCard from "@/components/ListingCard";
import Section from "@/components/Section";
import SectionHead from "@/components/SectionHead";
import { cn } from "@/lib/cn";
import { updatedLabel } from "@/lib/dates";
import { getProperties, getPropertiesByIds, propertyHref } from "@/lib/properties/api";
import { pad2, sceneFor } from "@/lib/properties";
import { MUTED_TEXT, toTone } from "@/lib/tone";
import { siteUrl } from "@/lib/seo";
import { STATUS_LABEL } from "@/sanity/schemaTypes/options";
import type { BlockOf } from "@/sanity/lib/types";

const FRAME_SIZES = "(max-width: 780px) 100vw, (max-width: 1080px) 50vw, 33vw";

export default async function ListingGridBlock({ block }: { block: BlockOf<"listingGrid"> }) {
  const tone = toTone(block.tone);
  const showTags = block.showSceneTags !== false;

  /* The inventory comes from the CMS, never from the page document: the
     grid only says *which* listings it wants. */
  const listings =
    stegaClean(block.source) === "selected"
      ? await getPropertiesByIds(block.selectedIds ?? [])
      : await getProperties();

  // the listings as schema.org data, for search engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: block.title,
    itemListElement: listings.map((p, i) => {
      const href = propertyHref(stegaClean(p.slug));
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "RealEstateListing",
          name: p.name,
          ...(href ? { url: new URL(href, siteUrl).toString() } : {}),
          description: [p.type, typeof p.beds === "number" ? `${p.beds} bedrooms` : null, p.tag]
            .filter(Boolean)
            .join(" · "),
          offers: {
            "@type": "Offer",
            price: p.price,
            priceCurrency: p.currency || "USD",
            availability:
              stegaClean(p.status) === "sold"
                ? "https://schema.org/SoldOut"
                : stegaClean(p.status) === "reserved"
                  ? "https://schema.org/LimitedAvailability"
                  : "https://schema.org/InStock",
          },
          contentLocation: {
            "@type": "Place",
            name: p.city,
            address: { "@type": "PostalAddress", addressLocality: p.city, addressCountry: p.country },
          },
        },
      };
    }),
  };

  return (
    <Section id={stegaClean(block.anchorId) || undefined} tone={tone}>
      {listings.length ? <JsonLd data={jsonLd} /> : null}
      <Container>
        <SectionHead eyebrow={block.eyebrow} title={block.title} aside={block.aside} tone={tone} />

        {listings.length ? (
          <div className="grid grid-cols-3 gap-7 tablet:grid-cols-2 mobile:grid-cols-1">
            {listings.map((p, i) => {
              const clean = stegaClean({
                name: p.name,
                type: p.type,
                country: p.country,
                currency: p.currency,
                slug: p.slug,
                status: p.status,
              });
              const fallback = sceneFor(clean);
              const frames = [p.art, ...(p.gallery ?? [])].map((art, j) => (
                <Art
                  key={j}
                  art={art}
                  fallback={fallback}
                  className="absolute inset-0 h-full w-full"
                  width={800}
                  height={600}
                  sizes={FRAME_SIZES}
                  /* the cover always fills the card, so the grid stays even;
                     a portrait photo further in is shown whole */
                  fit={j === 0 ? "cover" : "auto"}
                  blur={j === 0}
                />
              ));
              // leave room for the << >> pill beside the price
              const roomForArrows = frames.length > 1 && "pr-[104px]";
              const tags = [p.type, typeof p.beds === "number" ? `${p.beds} bed` : null, p.tag].filter(Boolean);
              const href = propertyHref(clean.slug);
              const updated = updatedLabel(p._updatedAt);
              // a sold or reserved listing says so over the artwork, ahead of
              // whatever label an editor set
              const statusLabel = STATUS_LABEL[clean.status ?? ""];

              return (
                <ListingCard
                  key={p._id}
                  frames={frames}
                  label={clean.name ?? "this listing"}
                  badge={statusLabel ?? p.badge}
                  sceneTag={showTags ? `SCENE ${pad2(i + 1)}` : undefined}
                  position={i % 3}
                >
                  {typeof p.price === "number" ? (
                    <div className={cn("mb-1.5 font-eyebrow text-[15px] tracking-[.06em] text-gold", roomForArrows)}>
                      {/* stored in USD; shown in whatever the visitor picked,
                          with the dollar figure kept in view underneath */}
                      <Price
                        amount={p.price}
                        currency={clean.currency || "USD"}
                        usdNote
                        usdNoteClassName="mt-0.5 block text-[11.5px] tracking-[.04em] text-cream/45"
                      />
                    </div>
                  ) : null}
                  <h3 className="mb-1.5 text-[22px] text-cream">
                    {href ? (
                      /* the whole card is the link; the << >> arrows sit above it */
                      <Link
                        href={href}
                        className="after:absolute after:inset-0 after:z-[1] after:content-[''] hover:text-gold focus-visible:text-gold focus-visible:outline-none"
                      >
                        {p.name}
                      </Link>
                    ) : (
                      p.name
                    )}
                  </h3>
                  <div className="mb-3.5 flex items-center gap-1.5 text-[13.5px] text-cream/65">
                    <span>
                      {p.city}
                      {p.city && p.country ? ", " : null}
                      {p.country}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, j) => (
                      <span
                        key={j}
                        className="rounded-full border border-cream/[.28] px-2.5 py-[5px] text-[11.5px] tracking-[.03em] text-cream/85"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {updated ? (
                    <div className="mt-3 font-eyebrow text-[11px] tracking-[.1em] text-cream/40">
                      {updated}
                    </div>
                  ) : null}
                </ListingCard>
              );
            })}
          </div>
        ) : (
          <p className={MUTED_TEXT[tone]}>No listings to show yet.</p>
        )}
      </Container>
    </Section>
  );
}
