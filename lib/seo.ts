import type { Metadata } from "next";
import { urlFor } from "@/sanity/lib/image";

type ImageRef = { asset?: { _ref: string } | null } | null | undefined;

type SeoData =
  | {
      title?: string | null;
      siteName?: string | null;
      defaultOgImage?: ImageRef;
      seo?: {
        metaTitle?: string | null;
        metaDescription?: string | null;
        noIndex?: boolean | null;
        ogImage?: ImageRef;
      } | null;
    }
  | null
  | undefined;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/* A Sanity image sized for social cards, or the generated brand card. */
export function ogImages(image: ImageRef) {
  if (!image?.asset?._ref) return [{ url: "/og", width: 1200, height: 630 }];
  return [{ url: urlFor(image).width(1200).height(630).fit("crop").url(), width: 1200, height: 630 }];
}

/* Page-level metadata: title, description, canonical URL and social cards.
   The home page keeps the site's default title unless it sets its own. */
export function pageMetadata(data: SeoData, { path }: { path: string }): Metadata {
  if (!data) return {};
  const isHome = path === "/";
  const metaTitle = data.seo?.metaTitle;
  const title = isHome ? (metaTitle ? { absolute: metaTitle } : undefined) : metaTitle || data.title;
  const description = data.seo?.metaDescription || undefined;
  const socialTitle =
    typeof title === "string" && data.siteName ? `${title} — ${data.siteName}` : (metaTitle ?? undefined);
  const images = ogImages(data.seo?.ogImage ?? data.defaultOgImage);

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: { canonical: path },
    ...(data.seo?.noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "website",
      locale: "en_US",
      url: path,
      siteName: data.siteName ?? undefined,
      ...(socialTitle ? { title: socialTitle } : {}),
      ...(description ? { description } : {}),
      images,
    },
    twitter: {
      card: "summary_large_image",
      ...(socialTitle ? { title: socialTitle } : {}),
      ...(description ? { description } : {}),
      images: images.map((image) => image.url),
    },
  };
}
