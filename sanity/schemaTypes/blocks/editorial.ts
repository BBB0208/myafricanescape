import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { defineArrayMember, defineField, defineType } from "sanity";
import { anchorField, hiddenField,eyebrowField, headingField, toneField } from "./shared";

export const editorial = defineType({
  name: "editorial",
  title: "Editorial (artwork + copy)",
  type: "object",
  icon: DocumentTextIcon,
  fields: [
    eyebrowField,
    headingField,
    defineField({ name: "body", title: "Body", type: "simpleText" }),
    defineField({
      name: "pills",
      title: "Pills",
      type: "array",
      description: "Short tags shown under the copy.",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({
      name: "buttons",
      title: "Buttons",
      type: "array",
      of: [defineArrayMember({ type: "button" })],
      validation: (rule) => rule.max(2),
    }),
    defineField({ name: "art", title: "Artwork", type: "art", validation: (rule) => rule.required() }),
    defineField({
      name: "artPosition",
      title: "Artwork position",
      type: "string",
      initialValue: "left",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    toneField("cream"),
    anchorField,
    hiddenField,
  ],
  preview: {
    select: { title: "title", eyebrow: "eyebrow", media: "art.image" },
    prepare: ({ title, eyebrow, media }) => ({
      title: title || "Editorial",
      subtitle: ["Editorial", eyebrow].filter(Boolean).join(" · "),
      media: media ?? DocumentTextIcon,
    }),
  },
});
