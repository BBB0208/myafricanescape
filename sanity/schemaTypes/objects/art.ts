import { ImageIcon } from "@sanity/icons/Image";
import { defineField, defineType } from "sanity";
import { SCENE_OPTIONS } from "../options";

/* Every visual on the site is one of the bespoke "Panavision" scene
   illustrations — or, when a photo is uploaded, that photo instead. */
export const art = defineType({
  name: "art",
  title: "Artwork",
  type: "object",
  icon: ImageIcon,
  fields: [
    defineField({
      name: "scene",
      title: "Scene illustration",
      type: "string",
      description: "The colour-graded illustration shown when no photo is uploaded.",
      initialValue: "savanna",
      options: { list: SCENE_OPTIONS },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Photo (optional)",
      type: "image",
      description: "Replaces the illustration. Use the hotspot to control cropping.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description: "Describe the photo for screen readers.",
        }),
      ],
    }),
  ],
  preview: {
    select: { scene: "scene", media: "image" },
    prepare: ({ scene, media }) => ({
      title: media ? "Photo" : `Scene: ${scene ?? "—"}`,
      media: media ?? ImageIcon,
    }),
  },
});
