import type { MetadataRoute } from "next";
import { getPropertySlugs } from "@/lib/properties/api";
import { siteUrl } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/live";
import { SITEMAP_QUERY } from "@/sanity/lib/queries";

/* Pages and listings, both straight from the CMS — publishing a listing
   puts it in here without anyone touching the code. Hidden listings and
   drafts are filtered out by the query itself. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, properties] = await Promise.all([
    sanityFetch({ query: SITEMAP_QUERY, perspective: "published", stega: false })
      .then(({ data }) => data)
      .catch((error) => {
        console.error("[sitemap] could not read pages:", error);
        return [];
      }),
    getPropertySlugs(),
  ]);

  const entries: MetadataRoute.Sitemap = pages.flatMap(({ path, _updatedAt }) =>
    path ? [{ url: new URL(path, siteUrl).toString(), lastModified: new Date(_updatedAt) }] : [],
  );

  for (const { slug, _updatedAt } of properties) {
    entries.push({
      url: new URL(`/property/${slug}`, siteUrl).toString(),
      lastModified: new Date(_updatedAt),
    });
  }

  return entries;
}
