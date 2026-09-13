import { LaunchIcon } from "@sanity/icons/Launch";
import { defineField, defineType } from "sanity";
import { BUTTON_VARIANTS } from "../options";

const LINK_LABELS: Record<string, string> = {
  internal: "Page",
  anchor: "Section",
  external: "External URL",
  concierge: "Opens May",
};

export const button = defineType({
  name: "button",
  title: "Button",
  type: "object",
  icon: LaunchIcon,
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "variant",
      title: "Style",
      type: "string",
      initialValue: "primary",
      options: { list: BUTTON_VARIANTS, layout: "radio" },
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "link",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "label", linkType: "link.linkType", variant: "variant" },
    prepare: ({ title, linkType, variant }) => ({
      title: title || "Button",
      subtitle: [LINK_LABELS[linkType] ?? "No link", variant].filter(Boolean).join(" · "),
    }),
  },
});
