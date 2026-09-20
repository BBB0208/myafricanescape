import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PageBuilder from "@/components/PageBuilder";
import { today } from "@/lib/dates";
import { pageMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/live";
import { safeSanityFetch } from "@/sanity/lib/safeFetch";
import {
  HOME_SLUG_QUERY,
  PAGE_QUERY,
  PAGE_SEO_QUERY,
  PAGE_SLUGS_QUERY,
} from "@/sanity/lib/queries";
import type { PageData } from "@/sanity/lib/types";
import type { HOME_SLUG_QUERY_RESULT, PAGE_SEO_QUERY_RESULT } from "@/sanity/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { data } = await sanityFetch({
    query: PAGE_SLUGS_QUERY,
    perspective: "published",
    stega: false,
  });
  return data.flatMap(({ slug }) => (slug ? [{ slug }] : []));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  /* a metadata throw can't be caught by error.tsx, so it never throws */
  const { data } = await safeSanityFetch<PAGE_SEO_QUERY_RESULT>(
    { query: PAGE_SEO_QUERY, params: { slug }, stega: false },
    "page metadata",
  );
  return pageMetadata(data, { path: `/${slug}` });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const [{ data: page, failed }, { data: homeSlug }] = await Promise.all([
    safeSanityFetch<PageData>(
      { query: PAGE_QUERY, params: { slug, today: today() } },
      "page",
    ),
    safeSanityFetch<HOME_SLUG_QUERY_RESULT>({ query: HOME_SLUG_QUERY, stega: false }, "home slug"),
  ]);

  // the CMS is unreachable — app/(site)/error.tsx says so in the site's design
  if (failed) throw new Error("The CMS is unavailable");

  // the home page lives at /, not at its own slug
  if (homeSlug && slug === homeSlug) redirect("/");
  if (!page) notFound();

  return <PageBuilder page={page} />;
}
