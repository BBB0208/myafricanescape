import { HomeIcon } from "@sanity/icons/Home";
import { defineArrayMember, defineField, defineType } from "sanity";
import { anchorField, hiddenField,asideField, eyebrowField, headingField, toneField } from "./shared";

export const listingGrid = defineType({
  name: "listingGrid",
  title: "Listing grid",
  type: "object",
  icon: HomeIcon,
  fields: [
    eyebrowField,
    headingField,
    asideField,
    defineField({
      name: "source",
      title: "Listings to show",
      type: "string",
      initialValue: "all",
      options: {
        list: [
          { title: "All listings (in display order)", value: "all" },
          { title: "Hand-picked listings", value: "selected" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "properties",
      title: "Hand-picked listings",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "property" }] })],
      hidden: ({ parent }) => (parent as { source?: string })?.source !== "selected",
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "showSceneTags",
      title: "Show “SCENE 01” frame numbers",
      type: "boolean",
      initialValue: true,
    }),
    toneField("cream"),
    anchorField,
    hiddenField,
  ],
  preview: {
    select: { title: "title", source: "source" },
    prepare: ({ title, source }) => ({
      title: title || "Listing grid",
      subtitle: `Listing grid · ${source === "selected" ? "hand-picked" : "all listings"}`,
      media: HomeIcon,
    }),
  },
});
