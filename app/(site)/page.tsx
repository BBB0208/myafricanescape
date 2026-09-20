import type { Metadata } from "next";
import PageBuilder from "@/components/PageBuilder";
import SetupNotice from "@/components/SetupNotice";
import { today } from "@/lib/dates";
import { pageMetadata } from "@/lib/seo";
import { safeSanityFetch } from "@/sanity/lib/safeFetch";
import { HOME_PAGE_QUERY, HOME_SEO_QUERY } from "@/sanity/lib/queries";
import type { PageData } from "@/sanity/lib/types";
import type { HOME_SEO_QUERY_RESULT } from "@/sanity/types";

export async function generateMetadata(): Promise<Metadata> {
  /* a metadata throw can't be caught by error.tsx, so it never throws */
  const { data } = await safeSanityFetch<HOME_SEO_QUERY_RESULT>(
    { query: HOME_SEO_QUERY, stega: false },
    "home metadata",
  );
  return pageMetadata(data, { path: "/" });
}

export default async function HomePage() {
  const { data: page, failed } = await safeSanityFetch<PageData>(
    { query: HOME_PAGE_QUERY, params: { today: today() } },
    "home page",
  );

  // the CMS is unreachable — hand over to app/(site)/error.tsx, which says so
  // in the site's own design rather than showing a blank 500
  if (failed) throw new Error("The CMS is unavailable");

  if (!page) return <SetupNotice />;
  return <PageBuilder page={page} />;
}
