import { stegaClean } from "next-sanity";
import Art from "@/components/Art";
import Container from "@/components/Container";
import JsonLd from "@/components/JsonLd";
import ListingCard from "@/components/ListingCard";
import Section from "@/components/Section";
import SectionHead from "@/components/SectionHead";
import { cn } from "@/lib/cn";
import { fmtPrice, pad2, sceneFor } from "@/lib/properties";
import { MUTED_TEXT, toTone } from "@/lib/tone";
import type { BlockOf } from "@/sanity/lib/types";

const FRAME_SIZES = "(max-width: 780px) 100vw, (max-width: 1080px) 50vw, 33vw";

export default function ListingGridBlock({ block }: { block: BlockOf<"listingGrid"> }) {
  const tone = toTone(block.tone);
  const listings = (block.listings ?? []).filter((p) => p != null);
  const showTags = block.showSceneTags !== false;

  // the listings as schema.org data, for search engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: block.title,
    itemListElement: listings.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "RealEstateListing",
        name: p.name,
        description: [p.type, typeof p.beds === "number" ? `${p.beds} bedrooms` : null, p.tag]
          .filter(Boolean)
          .join(" · "),
        offers: { "@type": "Offer", price: p.price, priceCurrency: p.currency || "USD" },
        contentLocation: {
          "@type": "Place",
          name: p.city,
          address: { "@type": "PostalAddress", addressLocality: p.city, addressCountry: p.country },
        },
      },
    })),
  };

  return (
    <Section id={stegaClean(block.anchorId) || undefined} tone={tone}>
      {listings.length ? <JsonLd data={jsonLd} /> : null}
      <Container>
        <SectionHead eyebrow={block.eyebrow} title={block.title} aside={block.aside} tone={tone} />

        {listings.length ? (
          <div className="grid grid-cols-3 gap-7 tablet:grid-cols-2 mobile:grid-cols-1">
            {listings.map((p, i) => {
              const clean = stegaClean({ name: p.name, type: p.type, country: p.country, currency: p.currency });
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
                />
              ));
              // leave room for the << >> pill beside the price
              const roomForArrows = frames.length > 1 && "pr-[104px]";
              const tags = [p.type, typeof p.beds === "number" ? `${p.beds} bed` : null, p.tag].filter(Boolean);

              return (
                <ListingCard
                  key={p._id}
                  frames={frames}
                  label={clean.name ?? "this listing"}
                  badge={p.badge}
                  sceneTag={showTags ? `SCENE ${pad2(i + 1)}` : undefined}
                  position={i % 3}
                >
                  {typeof p.price === "number" ? (
                    <div className={cn("mb-1.5 font-eyebrow text-[15px] tracking-[.06em] text-gold", roomForArrows)}>
                      {fmtPrice(p.price, clean.currency || "USD")}
                    </div>
                  ) : null}
                  <h3 className="mb-1.5 text-[22px] text-cream">{p.name}</h3>
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
