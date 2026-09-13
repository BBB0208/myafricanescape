import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { sanityFetch } from "@/sanity/lib/live";
import { SITEMAP_QUERY } from "@/sanity/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await sanityFetch({
    query: SITEMAP_QUERY,
    perspective: "published",
    stega: false,
  });

  return data.flatMap(({ path, _updatedAt }) =>
    path ? [{ url: new URL(path, siteUrl).toString(), lastModified: new Date(_updatedAt) }] : [],
  );
}
