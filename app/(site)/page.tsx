import type { Metadata } from "next";
import PageBuilder from "@/components/PageBuilder";
import SetupNotice from "@/components/SetupNotice";
import { today } from "@/lib/dates";
import { pageMetadata } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/live";
import { HOME_PAGE_QUERY, HOME_SEO_QUERY } from "@/sanity/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await sanityFetch({ query: HOME_SEO_QUERY, stega: false });
  return pageMetadata(data, { path: "/" });
}

export default async function HomePage() {
  const { data: page } = await sanityFetch({
    query: HOME_PAGE_QUERY,
    params: { today: today() },
  });

  if (!page) return <SetupNotice />;
  return <PageBuilder page={page} />;
}
