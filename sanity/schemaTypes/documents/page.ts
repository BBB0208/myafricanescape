import { DocumentIcon } from "@sanity/icons/Document";
import { defineArrayMember, defineField, defineType } from "sanity";

export const PAGE_BLOCKS = [
  "hero",
  "statsBar",
  "listingGrid",
  "featureList",
  "editorial",
  "cardGrid",
  "mortgageCalculator",
  "eventList",
  "ctaBanner",
] as const;

const RESERVED_SLUGS = ["studio", "api"];

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  icon: DocumentIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "chrome", title: "Header & footer" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      description: "The page's URL. The page chosen as the home page in Site settings is served at /.",
      options: { source: "title", maxLength: 64 },
      validation: (rule) =>
        rule.required().custom((slug) =>
          slug?.current && RESERVED_SLUGS.includes(slug.current)
            ? `“${slug.current}” is reserved`
            : true,
        ),
    }),
    defineField({
      name: "pageBuilder",
      title: "Page sections",
      type: "array",
      group: "content",
      of: PAGE_BLOCKS.map((type) => defineArrayMember({ type })),
      options: {
        insertMenu: {
          views: [{ name: "list" }],
          groups: [
            { name: "intro", title: "Intro", of: ["hero", "statsBar"] },
            {
              name: "content",
              title: "Content",
              of: ["editorial", "featureList", "cardGrid", "ctaBanner"],
            },
            {
              name: "dynamic",
              title: "Live data",
              of: ["listingGrid", "eventList", "mortgageCalculator"],
            },
          ],
        },
      },
    }),
    defineField({
      name: "headerCta",
      title: "Header button",
      type: "button",
      group: "chrome",
      description:
        "Optional. Replaces the site-wide header button (Site settings → Navigation) while this page is open.",
    }),
    defineField({
      name: "footerNote",
      title: "Footer note",
      type: "string",
      group: "chrome",
      description: "Small print at the bottom right of the footer. Falls back to Site settings.",
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { title: "title", slug: "slug.current", count: "pageBuilder.length" },
    prepare: ({ title, slug }) => ({
      title: title || "Untitled page",
      subtitle: slug ? `/${slug}` : "No slug",
    }),
  },
});
