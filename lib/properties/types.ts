/* ============================================================
   The shapes the listing UI works with.

   All of them are derived from the TypeGen output in
   sanity/types.ts, so they follow the Studio schema
   automatically — regenerate with `npm run typegen`.
   ============================================================ */

import type { StegaBranded } from "next-sanity";
import type { PROPERTIES_QUERY_RESULT, PROPERTY_QUERY_RESULT } from "@/sanity/types";

/* A listing as it appears on a card. Strings may carry stega markers,
   so compare enum-like values only after stegaClean(). */
export type PropertyCard = StegaBranded<PROPERTIES_QUERY_RESULT>[number];

/* A listing on its own page: the card fields plus the write-up. */
export type PropertyDetail = NonNullable<StegaBranded<PROPERTY_QUERY_RESULT>>;

/* Editors can leave a listing "available", or mark it reserved or sold —
   both of which stay on the site. "hidden" never reaches the front end;
   the queries filter it out. */
export type PropertyStatus = "available" | "reserved" | "sold";
