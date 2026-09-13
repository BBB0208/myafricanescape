import { SearchIcon } from "@sanity/icons/Search";
import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  icon: SearchIcon,
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta title",
      type: "string",
      description: "Shown in the browser tab and search results. Falls back to the page title.",
      validation: (rule) => rule.max(70).warning("Keep titles under 70 characters."),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(160).warning("Keep descriptions under 160 characters."),
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      type: "image",
      description: "1200 × 630 works best.",
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
