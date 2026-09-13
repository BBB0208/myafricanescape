import { ThLargeIcon } from "@sanity/icons/ThLarge";
import { defineArrayMember, defineField, defineType } from "sanity";
import { anchorField, hiddenField,eyebrowField, headingField, toneField } from "./shared";

export const cardGrid = defineType({
  name: "cardGrid",
  title: "Card grid",
  type: "object",
  icon: ThLargeIcon,
  fields: [
    eyebrowField,
    headingField,
    defineField({
      name: "cards",
      title: "Cards",
      type: "array",
      validation: (rule) => rule.min(1),
      of: [
        defineArrayMember({
          name: "card",
          title: "Card",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "body", title: "Body", type: "text", rows: 2 }),
            defineField({ name: "art", title: "Artwork", type: "art" }),
          ],
          preview: {
            select: { title: "title", subtitle: "body", media: "art.image" },
          },
        }),
      ],
    }),
    defineField({
      name: "columns",
      title: "Columns on desktop",
      type: "number",
      initialValue: 4,
      options: { list: [2, 3, 4], layout: "radio", direction: "horizontal" },
    }),
    toneField("sunset"),
    anchorField,
    hiddenField,
  ],
  preview: {
    select: { title: "title", cards: "cards" },
    prepare: ({ title, cards }) => ({
      title: title || "Card grid",
      subtitle: `Card grid · ${cards?.length ?? 0} cards`,
      media: ThLargeIcon,
    }),
  },
});
