import { CogIcon } from "@sanity/icons/Cog";
import { defineArrayMember, defineField, defineType } from "sanity";
import { NAV_COLORS, PROPERTY_TYPES } from "../options";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "general", title: "General", default: true },
    { name: "navigation", title: "Navigation" },
    { name: "footer", title: "Footer" },
    { name: "concierge", title: "May concierge" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    /* ---------- general ---------- */
    defineField({
      name: "title",
      title: "Site name",
      type: "string",
      group: "general",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "homePage",
      title: "Home page",
      type: "reference",
      to: [{ type: "page" }],
      group: "general",
      description: "The page served at /.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      group: "general",
      description:
        "Shown in the header and footer. A transparent PNG or SVG works best. Until one is uploaded, the text wordmark below is used.",
      fields: [
        defineField({ name: "alt", title: "Alternative text", type: "string" }),
      ],
    }),
    defineField({
      name: "wordmark",
      title: "Text wordmark — first line",
      type: "string",
      group: "general",
      initialValue: "My African",
    }),
    defineField({
      name: "wordmarkTagline",
      title: "Text wordmark — second line",
      type: "string",
      group: "general",
      initialValue: "Escape",
    }),

    /* ---------- navigation ---------- */
    defineField({
      name: "navigation",
      title: "Main navigation",
      type: "array",
      group: "navigation",
      description: "The coloured pills in the header, also listed in the footer.",
      of: [
        defineArrayMember({
          name: "navItem",
          title: "Navigation item",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "page",
              title: "Page",
              type: "reference",
              to: [{ type: "page" }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "color",
              title: "Pill colour",
              type: "string",
              initialValue: "grape",
              options: { list: NAV_COLORS, layout: "radio", direction: "horizontal" },
            }),
          ],
          preview: {
            select: { title: "label", page: "page.title", color: "color" },
            prepare: ({ title, page, color }) => ({
              title,
              subtitle: [page, color].filter(Boolean).join(" · "),
            }),
          },
        }),
      ],
    }),
    defineField({
      name: "headerCta",
      title: "Header button",
      type: "button",
      group: "navigation",
      description:
        "The button at the top right of every page (a page can override it). Buttons that open May stay hidden while May is switched off.",
    }),

    /* ---------- footer ---------- */
    defineField({
      name: "footer",
      title: "Footer",
      type: "object",
      group: "footer",
      options: { collapsible: false },
      fields: [
        defineField({ name: "blurb", title: "Blurb", type: "text", rows: 3 }),
        defineField({
          name: "exploreHeading",
          title: "Navigation column heading",
          type: "string",
          initialValue: "Explore",
        }),
        defineField({ name: "regionsHeading", title: "Regions heading", type: "string" }),
        defineField({
          name: "regions",
          title: "Regions",
          type: "array",
          of: [defineArrayMember({ type: "string" })],
        }),
        defineField({ name: "contactHeading", title: "Contact heading", type: "string" }),
        defineField({
          name: "contactLines",
          title: "Contact lines",
          type: "array",
          of: [defineArrayMember({ type: "string" })],
        }),
        defineField({ name: "copyright", title: "Copyright line", type: "string" }),
        defineField({
          name: "defaultNote",
          title: "Default footer note",
          type: "string",
          description: "Used on pages that don't set their own footer note.",
        }),
      ],
    }),

    /* ---------- May ---------- */
    defineField({
      name: "concierge",
      title: "May, the AI concierge",
      type: "object",
      group: "concierge",
      options: { collapsible: false },
      fields: [
        defineField({
          name: "enabled",
          title: "Show May on the site",
          type: "boolean",
          initialValue: false,
          description:
            "While off, the chat launcher, the header's Ask May button and every button that opens May are hidden.",
        }),
        defineField({ name: "launcherTitle", title: "Launcher title", type: "string" }),
        defineField({ name: "launcherSubtitle", title: "Launcher subtitle", type: "string" }),
        defineField({ name: "panelTitle", title: "Panel title", type: "string" }),
        defineField({ name: "panelSubtitle", title: "Panel subtitle", type: "string" }),
        defineField({
          name: "greeting",
          title: "Greeting",
          type: "simpleText",
          description: "May's first message. End with the budget question — budget options follow it.",
        }),
        defineField({ name: "inputPlaceholder", title: "Input placeholder", type: "string" }),
        defineField({
          name: "budgetBands",
          title: "Budget options",
          type: "array",
          of: [
            defineArrayMember({
              name: "budgetBand",
              type: "object",
              fields: [
                defineField({
                  name: "label",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({ name: "min", title: "From (USD)", type: "number" }),
                defineField({
                  name: "max",
                  title: "Up to (USD)",
                  type: "number",
                  description: "Leave empty for no upper limit.",
                }),
              ],
              preview: { select: { title: "label" } },
            }),
          ],
        }),
        defineField({
          name: "typeGroups",
          title: "Property type options",
          type: "array",
          of: [
            defineArrayMember({
              name: "typeGroup",
              type: "object",
              fields: [
                defineField({
                  name: "label",
                  type: "string",
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "types",
                  title: "Matches listing types",
                  type: "array",
                  of: [defineArrayMember({ type: "string" })],
                  options: { list: [...PROPERTY_TYPES] },
                }),
              ],
              preview: { select: { title: "label" } },
            }),
          ],
        }),
        defineField({
          name: "anywhereLabel",
          title: "“Anywhere” region option",
          type: "string",
          description: "The other region options come from the regions set on listings.",
        }),
        defineField({
          name: "callbackMessage",
          title: "Callback reply",
          type: "text",
          rows: 2,
        }),
      ],
    }),

    /* ---------- SEO ---------- */
    defineField({
      name: "seo",
      title: "Default SEO",
      type: "object",
      group: "seo",
      options: { collapsible: false },
      fields: [
        defineField({
          name: "defaultTitle",
          title: "Home page / default title",
          type: "string",
        }),
        defineField({
          name: "description",
          title: "Default description",
          type: "text",
          rows: 3,
        }),
        defineField({ name: "ogImage", title: "Default share image", type: "image" }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
