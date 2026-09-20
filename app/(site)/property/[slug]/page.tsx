import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { stegaClean } from "next-sanity";
import Art from "@/components/Art";
import Container from "@/components/Container";
import Price from "@/components/currency/Price";
import Eyebrow from "@/components/Eyebrow";
import JsonLd from "@/components/JsonLd";
import { RichText } from "@/components/PortableText";
import PropertyGallery from "@/components/PropertyGallery";
import Reveal from "@/components/Reveal";
import Section from "@/components/Section";
import { updatedLabel } from "@/lib/dates";
import { getPropertyBySlug, getPropertySlugs, propertyHref } from "@/lib/properties/api";
import { sceneFor } from "@/lib/properties";
import { pageMetadata, siteUrl } from "@/lib/seo";
import { STATUS_LABEL } from "@/sanity/schemaTypes/options";
import { ChevronsLeft } from "lucide-react";
import { ICON_STROKE } from "@/lib/icons";

type Props = { params: Promise<{ slug: string }> };

/* Pre-render the listings that exist at build time; anything published
   afterwards is rendered on first request and then cached. */
export async function generateStaticParams() {
  const slugs = await getPropertySlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return {};

  const clean = stegaClean({
    name: property.name,
    summary: property.summary,
    city: property.city,
    country: property.country,
  });
  const where = [clean.city, clean.country].filter(Boolean).join(", ");

  /* The listing's own SEO fields win; otherwise its name and summary do. */
  const base = pageMetadata(
    {
      title: clean.name,
      siteName: property.siteName,
      defaultOgImage: property.defaultOgImage,
      seo: {
        metaTitle: property.seo?.metaTitle ?? clean.name,
        metaDescription:
          property.seo?.metaDescription ??
          clean.summary ??
          [clean.name, where].filter(Boolean).join(" — "),
        noIndex: property.seo?.noIndex,
        ogImage: property.seo?.ogImage ?? property.art?.image,
      },
    },
    { path: `/property/${slug}` },
  );

  return { ...base, openGraph: { ...base.openGraph, type: "article" } };
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  // unknown address, or an editor set the listing to Hidden
  if (!property) notFound();

  const clean = stegaClean({
    name: property.name,
    type: property.type,
    country: property.country,
    city: property.city,
    currency: property.currency,
    status: property.status,
    summary: property.summary,
    badge: property.badge,
  });

  const where = [clean.city, clean.country].filter(Boolean).join(", ");
  const statusLabel = STATUS_LABEL[clean.status ?? ""];
  const updated = updatedLabel(property._updatedAt);
  const amenities = (property.amenities ?? []).filter(Boolean);

  const frames = [property.art, ...(property.gallery ?? [])].map((art, i) => (
    <Art
      key={i}
      art={art}
      fallback={sceneFor(clean)}
      className="absolute inset-0 h-full w-full"
      width={1600}
      height={900}
      sizes="(max-width: 1080px) 100vw, 1100px"
      priority={i === 0}
    />
  ));

  /* facts that exist — a listing with no bathroom count simply omits it */
  const facts: [string, React.ReactNode][] = [
    ["Type", clean.type],
    ["Bedrooms", typeof property.beds === "number" ? property.beds : null],
    ["Bathrooms", typeof property.baths === "number" ? property.baths : null],
    ["Internal area", typeof property.area === "number" ? `${property.area} m²` : null],
    ["Region", property.region],
  ].flatMap(([label, value]) => (value ? [[label, value] as [string, React.ReactNode]] : []));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: clean.name,
    url: new URL(propertyHref(slug) ?? "/", siteUrl).toString(),
    ...(clean.summary ? { description: clean.summary } : {}),
    ...(typeof property.price === "number"
      ? {
          offers: {
            "@type": "Offer",
            price: property.price,
            priceCurrency: clean.currency || "USD",
            availability:
              clean.status === "sold"
                ? "https://schema.org/SoldOut"
                : clean.status === "reserved"
                  ? "https://schema.org/LimitedAvailability"
                  : "https://schema.org/InStock",
          },
        }
      : {}),
    ...(typeof property.beds === "number" ? { numberOfBedrooms: property.beds } : {}),
    contentLocation: {
      "@type": "Place",
      name: clean.city,
      address: {
        "@type": "PostalAddress",
        addressLocality: clean.city,
        addressCountry: clean.country,
      },
    },
    dateModified: property._updatedAt,
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <Section padding="pt-[72px] pb-[88px] mobile:pt-12 mobile:pb-14">
        <Container>
          <Reveal>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-eyebrow text-[13px] tracking-[.12em] text-ink/55 uppercase transition-colors hover:text-ink"
            >
              <ChevronsLeft size={16} strokeWidth={ICON_STROKE} aria-hidden />
              All listings
            </Link>
          </Reveal>

          <div className="mt-6 grid grid-cols-[1fr_auto] items-end gap-8 mobile:grid-cols-1 mobile:items-start mobile:gap-5">
            <div>
              {where ? <Eyebrow>{where}</Eyebrow> : null}
              <h1 className="mt-3.5 text-[clamp(34px,5vw,62px)] leading-[1.04]">{property.name}</h1>
              {clean.summary ? (
                <p className="mt-4 max-w-[52ch] text-[17px] leading-[1.6] text-ink/70">
                  {clean.summary}
                </p>
              ) : null}
            </div>

            <div className="text-right mobile:text-left">
              {typeof property.price === "number" ? (
                <div className="font-display text-[clamp(28px,3.4vw,42px)] font-extrabold text-ink">
                  {/* stored in USD; converted only for display */}
                  <Price
                    amount={property.price}
                    currency={clean.currency || "USD"}
                    usdNote
                    usdNoteClassName="mt-1 block font-body text-[12.5px] font-normal tracking-[.04em] text-ink/45"
                  />
                </div>
              ) : null}
              {statusLabel ? (
                <span className="mt-3 inline-block rounded-full bg-ink px-4 pt-[9px] pb-[7px] font-eyebrow text-[12px] tracking-[.12em] text-cream uppercase">
                  {statusLabel}
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-10">
            <PropertyGallery
              frames={frames}
              label={clean.name ?? "this listing"}
              badge={statusLabel ?? clean.badge}
            />
          </div>

          {facts.length ? (
            <div className="mt-10 flex flex-wrap border-t border-ink/15">
              {facts.map(([label, value]) => (
                <div key={label} className="min-w-[160px] flex-1 border-r border-ink/15 py-7 last:border-r-0">
                  <div className="font-display text-[30px] font-extrabold">{value}</div>
                  <div className="mt-1.5 font-eyebrow text-[12px] tracking-[.1em] text-ink/60">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {property.description ? (
            <Reveal className="mt-12 max-w-[64ch]">
              <RichText
                value={property.description}
                paragraphClassName="mb-4 text-[17px] leading-[1.68] text-ink/75 last:mb-0"
              />
            </Reveal>
          ) : null}

          {amenities.length ? (
            <Reveal className="mt-12">
              <Eyebrow>Features</Eyebrow>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {amenities.map((amenity, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-ink/20 px-4 py-2 text-[14px] text-ink/80"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </Reveal>
          ) : null}

          {updated ? (
            <p className="mt-12 mb-0 font-eyebrow text-[12px] tracking-[.1em] text-ink/45">
              {updated}
            </p>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
