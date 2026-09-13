import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import PageBuilder from "@/components/PageBuilder";
import { today } from "@/lib/dates";
import { pageMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/live";
import {
  HOME_SLUG_QUERY,
  PAGE_QUERY,
  PAGE_SEO_QUERY,
  PAGE_SLUGS_QUERY,
} from "@/sanity/lib/queries";

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
  const { data } = await sanityFetch({ query: PAGE_SEO_QUERY, params: { slug }, stega: false });
  return pageMetadata(data, { path: `/${slug}` });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const [{ data: page }, { data: homeSlug }] = await Promise.all([
    sanityFetch({ query: PAGE_QUERY, params: { slug, today: today() } }),
    sanityFetch({ query: HOME_SLUG_QUERY, stega: false }),
  ]);

  // the home page lives at /, not at its own slug
  if (homeSlug && slug === homeSlug) redirect("/");
  if (!page) notFound();

  return <PageBuilder page={page} />;
}
