import { LinkIcon } from "@sanity/icons/Link";
import { defineField, defineType } from "sanity";

type LinkParent = { linkType?: string } | undefined;
const linkTypeOf = (parent: unknown) => (parent as LinkParent)?.linkType;

export const link = defineType({
  name: "link",
  title: "Link",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "linkType",
      title: "Link to",
      type: "string",
      initialValue: "internal",
      options: {
        list: [
          { title: "A page", value: "internal" },
          { title: "A section on the current page", value: "anchor" },
          { title: "An external URL", value: "external" },
          { title: "Open May, the AI concierge", value: "concierge" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "page",
      title: "Page",
      type: "reference",
      to: [{ type: "page" }],
      hidden: ({ parent }) => linkTypeOf(parent) !== "internal",
      validation: (rule) =>
        rule.custom((value, ctx) =>
          linkTypeOf(ctx.parent) === "internal" && !value ? "Choose a page" : true,
        ),
    }),
    defineField({
      name: "anchor",
      title: "Section anchor",
      type: "string",
      description: "The Anchor ID of a section, without the # (e.g. listings).",
      hidden: ({ parent }) => !["internal", "anchor"].includes(linkTypeOf(parent) ?? ""),
      validation: (rule) =>
        rule.custom((value, ctx) =>
          linkTypeOf(ctx.parent) === "anchor" && !value ? "Enter the section's Anchor ID" : true,
        ),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      hidden: ({ parent }) => linkTypeOf(parent) !== "external",
      validation: (rule) =>
        rule
          .uri({ scheme: ["http", "https", "mailto", "tel"] })
          .custom((value, ctx) =>
            linkTypeOf(ctx.parent) === "external" && !value ? "Enter a URL" : true,
          ),
    }),
    defineField({
      name: "openInNewTab",
      title: "Open in a new tab",
      type: "boolean",
      initialValue: false,
      hidden: ({ parent }) => linkTypeOf(parent) !== "external",
    }),
  ],
});
