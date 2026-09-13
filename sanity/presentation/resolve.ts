import {
  defineDocuments,
  defineLocations,
  type PresentationPluginOptions,
} from "sanity/presentation";

/* Tells Presentation which document a URL is "about" (mainDocuments), and
   where each document shows up on the site (locations). */
export const resolve: PresentationPluginOptions["resolve"] = {
  mainDocuments: defineDocuments([
    {
      route: "/",
      filter: `_type == "page" && _id == *[_id == "siteSettings"][0].homePage._ref`,
    },
    {
      route: "/:slug",
      filter: `_type == "page" && slug.current == $slug`,
    },
  ]),
  locations: {
    siteSettings: defineLocations({
      message: "Used on every page — header, footer and May.",
      tone: "positive",
      locations: [{ title: "Home", href: "/" }],
    }),
    page: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) =>
        doc?.slug
          ? { locations: [{ title: doc.title || "Untitled", href: `/${doc.slug}` }] }
          : { message: "Add a slug to preview this page.", tone: "caution" },
    }),
    property: defineLocations({
      select: { title: "name" },
      resolve: (doc) => ({
        message: "Shown in every Listing grid set to “All listings”, and in May's results.",
        locations: [{ title: `${doc?.title ?? "Listing"} on the home page`, href: "/" }],
      }),
    }),
    event: defineLocations({
      select: { title: "title" },
      resolve: (doc) => ({
        message: "Shown in every Event calendar section.",
        locations: [{ title: `${doc?.title ?? "Event"} on the Episodes page`, href: "/episodes" }],
      }),
    }),
  },
};
