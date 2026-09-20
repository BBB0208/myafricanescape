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
      title: "Tags",
      type: "array",
      description:
        "Short labels shown under the copy. Ignored once “Switchable images” below has anything in it.",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({
      name: "views",
      title: "Switchable images",
      type: "array",
      description:
        "Give each one a label and its pictures. Visitors click the labels to change what is shown beside this section, and can page through each label's pictures. Leave this empty to show the plain tags above instead.",
      of: [
        defineArrayMember({
          type: "object",
          name: "editorialView",
          title: "Switchable image",
          fields: [
            defineField({
              name: "label",
              title: "Button label",
              type: "string",
              description: "e.g. Private chefs",
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: "art",
              title: "Main picture",
              type: "art",
              description: "Shown the moment this label is selected.",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "gallery",
              title: "More pictures",
              type: "array",
              description:
                "Optional. Add more and visitors can page through them with the << >> buttons, without leaving this label.",
              of: [defineArrayMember({ type: "art" })],
              validation: (rule) => rule.max(12).warning("More than a dozen is a lot to load."),
            }),
          ],
          preview: {
            select: { title: "label", scene: "art.scene", media: "art.image", gallery: "gallery" },
            prepare: ({ title, scene, media, gallery }) => {
              const more = Array.isArray(gallery) ? gallery.length : 0;
              return {
                title: title || "Untitled",
                subtitle: [
                  media ? "Photo" : `Scene: ${scene ?? "—"}`,
                  more ? `+${more} more` : null,
                ]
                  .filter(Boolean)
                  .join(" · "),
                media,
              };
            },
          },
        }),
      ],
      validation: (rule) => rule.max(6).warning("More than six buttons gets crowded."),
    }),
    defineField({
      name: "buttons",
      title: "Buttons",
      type: "array",
      of: [defineArrayMember({ type: "button" })],
      validation: (rule) => rule.max(2),
    }),
    defineField({
      name: "art",
      title: "Artwork",
      type: "art",
      description:
        "Used when there are no switchable images above. Ignored when the position below is set to “No picture”.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "artPosition",
      title: "Artwork position",
      type: "string",
      initialValue: "left",
      options: {
        list: [
          { title: "Left", value: "left" },
          { title: "Right", value: "right" },
          { title: "No picture — copy across the full width", value: "none" },
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
