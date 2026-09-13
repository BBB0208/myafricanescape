import type { Metadata } from "next";
import type { ReactNode } from "react";
import { draftMode } from "next/headers";
import { stegaClean } from "next-sanity";
import { VisualEditing } from "next-sanity/visual-editing";
import DraftModeToast from "@/components/DraftModeToast";
import JsonLd from "@/components/JsonLd";
import type { LogoData } from "@/components/Logo";
import { MayProvider } from "@/components/May";
import { SceneDefs } from "@/components/Scene";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader, { type NavItem, type PageChrome } from "@/components/SiteHeader";
import { ogImages, siteUrl } from "@/lib/seo";
import { SanityLive, sanityFetch } from "@/sanity/lib/live";
import { CONCIERGE_QUERY, LAYOUT_QUERY } from "@/sanity/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await sanityFetch({ query: LAYOUT_QUERY, stega: false });
  const settings = data?.settings;
  const siteName = settings?.title || "My African Escape";
  const images = ogImages(settings?.seo?.ogImage);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings?.seo?.defaultTitle || siteName,
      template: `%s — ${siteName}`,
    },
    description: settings?.seo?.description || undefined,
    applicationName: siteName,
    alternates: { canonical: "/" },
    openGraph: { type: "website", locale: "en_US", siteName, images },
    twitter: { card: "summary_large_image", images: images.map((image) => image.url) },
  };
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [{ data: layout }, { data: concierge }, { isEnabled: isDraftMode }] = await Promise.all([
    sanityFetch({ query: LAYOUT_QUERY }),
    // May matches on these strings, so they must be free of stega markers
    sanityFetch({ query: CONCIERGE_QUERY, stega: false }),
    draftMode(),
  ]);

  const settings = layout?.settings;
  const mayEnabled = settings?.conciergeEnabled === true;

  const nav: NavItem[] = (settings?.navigation ?? []).flatMap((item) => {
    const href = stegaClean(item.href);
    return item.label && href
      ? [{ key: item._key, label: item.label, href, color: stegaClean(item.color) }]
      : [];
  });

  const pages: PageChrome[] = (layout?.pages ?? []).map((page) => ({
    path: stegaClean(page.path) ?? "",
    note: page.footerNote,
    cta: page.headerCta,
  }));

  const logo: LogoData = settings?.logo?.url
    ? {
        url: stegaClean(settings.logo.url),
        width: settings.logo.width ?? 480,
        height: settings.logo.height ?? 200,
        alt: settings.logo.alt,
      }
    : null;

  // "Camps Bay, Cape Town" → "Cape Town", once each, for the footer reel
  const cities = [
    ...new Set(
      (layout?.cities ?? []).flatMap((city) => {
        const name = stegaClean(city)?.split(",").pop()?.trim();
        return name ? [name] : [];
      }),
    ),
  ];

  // who we are, for search engines
  const contact = (settings?.footer?.contactLines ?? []).map((line) => stegaClean(line));
  const organization = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateAgent",
        "@id": `${siteUrl}/#organization`,
        name: settings?.title,
        url: siteUrl,
        logo: logo?.url ?? `${siteUrl}/icon.svg`,
        image: logo?.url ?? `${siteUrl}/icon.svg`,
        description: settings?.seo?.description ?? undefined,
        email: contact.find((line) => line.includes("@")),
        telephone: contact.find((line) => /^\+?[\d\s().-]{7,}$/.test(line)),
        areaServed: settings?.footer?.regions ?? undefined,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: settings?.title,
        inLanguage: "en",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <>
      <div id="top" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[1500] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-cream"
      >
        Skip to content
      </a>
      <JsonLd data={organization} />

      {/* film grain + vignette, each on its own GPU layer so scrolling
          never repaints them */}
      <div className="bg-grain pointer-events-none fixed inset-0 z-9000 transform-gpu opacity-5 mix-blend-overlay" />
      <div className="pointer-events-none fixed inset-0 z-8999 transform-gpu shadow-[inset_0_0_18vw_rgba(6,20,18,.42)]" />
      <SceneDefs />

      {/* while May is switched off, none of its copy or inventory is sent to the browser */}
      <MayProvider
        enabled={mayEnabled}
        config={mayEnabled ? concierge?.config : null}
        properties={mayEnabled ? (concierge?.properties ?? []) : []}
      >
        <SiteHeader
          logo={logo}
          line1={settings?.wordmark}
          line2={settings?.wordmarkTagline}
          nav={nav}
          pages={pages}
          cta={settings?.headerCta}
        />
        <main id="main">{children}</main>
        <SiteFooter
          logo={logo}
          line1={settings?.wordmark}
          line2={settings?.wordmarkTagline}
          title={settings?.title}
          cities={cities}
          footer={settings?.footer}
          nav={nav}
          notes={pages}
        />
      </MayProvider>

      <SanityLive />
      {isDraftMode ? (
        <>
          <VisualEditing />
          <DraftModeToast />
        </>
      ) : null}
    </>
  );
}
