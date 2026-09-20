/* ============================================================
   The listing inventory — the one place the site reads it from.

   Sanity is the source of truth. Nothing here is hardcoded, and no
   component talks to the CMS directly: they call these functions.

   Caching, in two layers:
     · every read is tagged, so the Studio webhook can expire exactly
       the listings that changed (see app/api/revalidate/route.ts)
     · each tag also carries a 10-minute life, so an edit still reaches
       the site on its own if the webhook is never configured
   While Draft Mode is on, the cache is bypassed entirely and the live
   query runs instead, so Presentation keeps showing drafts.
   ============================================================ */

import { draftMode } from "next/headers";
import type { PropertyCard, PropertyDetail } from "@/lib/properties/types";
import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import {
  PROPERTIES_BY_ID_QUERY,
  PROPERTIES_QUERY,
  PROPERTY_QUERY,
  PROPERTY_SLUGS_QUERY,
} from "@/sanity/lib/queries";

/* An edit shows up within ten minutes even with no webhook wired up. */
export const PROPERTIES_REVALIDATE_SECONDS = 600;

/* Everything that depends on the inventory as a whole: the grids, the
   sitemap, the stat counters. */
export const PROPERTIES_TAG = "properties";

/* One listing's own page. */
export const propertyTag = (slug: string) => `property:${slug}`;

type FetchOptions = { tags?: string[] };

/* generateStaticParams and the sitemap run at build time, where there is no
   request and draftMode() throws. No request means no preview, so published
   content is the right answer. */
async function isPreviewing(): Promise<boolean> {
  try {
    const { isEnabled } = await draftMode();
    return isEnabled;
  } catch {
    return false;
  }
}

/* Reads published content through Next's cache. In Draft Mode it steps
   aside for sanityFetch, which carries the viewer token and the drafts
   perspective that Presentation needs. */
async function query<T>(
  groq: string,
  params: Record<string, unknown>,
  fallback: T,
  { tags = [] }: FetchOptions = {},
): Promise<T> {
  const preview = await isPreviewing();

  try {
    if (preview) {
      const { data } = await sanityFetch({ query: groq, params });
      return (data as T) ?? fallback;
    }

    return (
      ((await client.fetch<T>(groq, params, {
        next: { revalidate: PROPERTIES_REVALIDATE_SECONDS, tags: [PROPERTIES_TAG, ...tags] },
      })) as T) ?? fallback
    );
  } catch (error) {
    /* Sanity is unreachable. The page still renders — an empty grid, or a
       404 for a single listing — rather than taking the site down with it. */
    console.error("[properties] Sanity query failed:", error);
    return fallback;
  }
}

/* Every public listing, in the order editors set in the Studio. */
export async function getProperties(): Promise<PropertyCard[]> {
  return query<PropertyCard[]>(PROPERTIES_QUERY, {}, []);
}

/* The hand-picked listings a Listing grid names, returned in the editor's
   order rather than the order Sanity happens to answer in. */
export async function getPropertiesByIds(ids: string[]): Promise<PropertyCard[]> {
  const wanted = ids.filter((id): id is string => typeof id === "string" && id.length > 0);
  if (!wanted.length) return [];

  const found = await query<PropertyCard[]>(PROPERTIES_BY_ID_QUERY, { ids: wanted }, []);
  const byId = new Map(found.map((property) => [property._id, property]));
  return wanted.flatMap((id) => {
    const hit = byId.get(id);
    return hit ? [hit] : [];
  });
}

/* One listing by its web address, or null when there is no public listing
   at that address (unknown, or hidden by an editor). */
export async function getPropertyBySlug(slug: string): Promise<PropertyDetail | null> {
  if (!slug) return null;
  return query<PropertyDetail | null>(PROPERTY_QUERY, { slug }, null, { tags: [propertyTag(slug)] });
}

/* Addresses to pre-render and to list in the sitemap. */
export async function getPropertySlugs(): Promise<{ slug: string; _updatedAt: string }[]> {
  const rows = await query<{ slug: string | null; _updatedAt: string }[]>(
    PROPERTY_SLUGS_QUERY,
    {},
    [],
  );
  return rows.flatMap((row) => (row.slug ? [{ slug: row.slug, _updatedAt: row._updatedAt }] : []));
}

/* The listing's own page, e.g. /property/zanzibar-stone-villa. */
export const propertyHref = (slug: string | null | undefined) =>
  slug ? `/property/${slug}` : null;
