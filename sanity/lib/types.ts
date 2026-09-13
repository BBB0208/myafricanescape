/* Convenience types over the TypeGen output in ../types.ts
   (regenerate with `npm run typegen`). */

import type { StegaBranded } from "next-sanity";
import type { HOME_PAGE_QUERY_RESULT } from "../types";

/* As returned by sanityFetch: strings may carry stega markers, so compare
   enum-like values only after stegaClean(). */
export type PageData = NonNullable<StegaBranded<HOME_PAGE_QUERY_RESULT>>;
export type PageBlock = NonNullable<PageData["pageBuilder"]>[number];
export type BlockOf<T extends PageBlock["_type"]> = Extract<PageBlock, { _type: T }>;
