import { sanityFetch } from "./live";

/* ============================================================
   sanityFetch, but a CMS outage doesn't take the render with it.

   Used for the chrome and the page documents: the site stays up
   with whatever it could read, the error is logged server-side,
   and nothing about the CMS reaches the visitor.
   ============================================================ */

type FetchArgs = Parameters<typeof sanityFetch>[0];

export async function safeSanityFetch<T = unknown>(
  args: FetchArgs,
  label: string,
): Promise<{ data: T | null; failed: boolean }> {
  try {
    const { data } = await sanityFetch(args);
    return { data: (data ?? null) as T | null, failed: false };
  } catch (error) {
    console.error(`[sanity] ${label} failed:`, error);
    return { data: null, failed: true };
  }
}
