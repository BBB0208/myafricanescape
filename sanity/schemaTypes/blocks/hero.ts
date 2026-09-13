import { ImageIcon } from "@sanity/icons/Image";
import { defineArrayMember, defineField, defineType } from "sanity";
import { hiddenField, plainText } from "./shared";

export const hero = defineType({
  name: "hero",
  title: "Hero",
  type: "object",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
    }),
    defineField({
      name: "title",
      title: "Headline",
      type: "headline",
      description: "Each line is its own paragraph. Use “Accent” for the italic sunset word.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "lede",
      title: "Lede",
      type: "simpleText",
    }),
    defineField({
      name: "buttons",
      title: "Buttons",
      type: "array",
      of: [defineArrayMember({ type: "button" })],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: "art",
      title: "Background artwork",
      type: "art",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "size",
      title: "Height",
      type: "string",
      initialValue: "full",
      options: {
        list: [
          { title: "Full (home page)", value: "full" },
          { title: "Tall", value: "tall" },
          { title: "Compact", value: "compact" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "showReelStrip",
      title: "Show film-strip divider below",
      type: "boolean",
      initialValue: true,
    }),
    hiddenField,
  ],
  preview: {
    select: { title: "title", eyebrow: "eyebrow", media: "art.image" },
    prepare: ({ title, eyebrow, media }) => ({
      title: plainText(title) || "Hero",
      subtitle: ["Hero", eyebrow].filter(Boolean).join(" · "),
      media: media ?? ImageIcon,
    }),
  },
});
