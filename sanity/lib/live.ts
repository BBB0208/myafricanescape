import { defineLive } from "next-sanity/live";
import { client } from "./client";
import { token } from "./token";

/* sanityFetch caches by content tags and <SanityLive /> revalidates them the
   moment content changes — published content for visitors, drafts while
   Draft Mode / Presentation is active. */
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token || false,
  browserToken: token || false,
});
