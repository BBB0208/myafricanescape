import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/sanity/lib/client";
import { token } from "@/sanity/lib/token";

/* Called by the Presentation tool to switch the site into Draft Mode. */
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token }),
});
