import { BulbOutlineIcon } from "@sanity/icons/BulbOutline";
import { defineArrayMember, defineField, defineType } from "sanity";
import { anchorField, hiddenField,eyebrowField, headingField, toneField } from "./shared";

export const ctaBanner = defineType({
  name: "ctaBanner",
  title: "Call to action",
  type: "object",
  icon: BulbOutlineIcon,
  fields: [
    eyebrowField,
    headingField,
    defineField({
      name: "buttons",
      title: "Buttons",
      type: "array",
      of: [defineArrayMember({ type: "button" })],
      validation: (rule) => rule.max(3),
    }),
    toneField("sunset"),
    anchorField,
    hiddenField,
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({
      title: title || "Call to action",
      subtitle: "Call to action",
      media: BulbOutlineIcon,
    }),
  },
});
