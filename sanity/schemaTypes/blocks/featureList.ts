import { OlistIcon } from "@sanity/icons/Olist";
import { defineArrayMember, defineField, defineType } from "sanity";
import { anchorField, hiddenField,asideField, eyebrowField, headingField, toneField } from "./shared";

export const featureList = defineType({
  name: "featureList",
  title: "Numbered list",
  type: "object",
  icon: OlistIcon,
  description: "A numbered list of points — 01, 02, 03 are added automatically.",
  fields: [
    eyebrowField,
    headingField,
    asideField,
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      validation: (rule) => rule.min(1),
      of: [
        defineArrayMember({
          name: "feature",
          title: "Item",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
          ],
        }),
      ],
    }),
    toneField("teal"),
    anchorField,
    hiddenField,
  ],
  preview: {
    select: { title: "title", items: "items" },
    prepare: ({ title, items }) => ({
      title: title || "Numbered list",
      subtitle: `Numbered list · ${items?.length ?? 0} items`,
      media: OlistIcon,
    }),
  },
});
