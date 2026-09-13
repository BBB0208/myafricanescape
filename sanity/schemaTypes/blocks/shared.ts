import { defineField } from "sanity";
import { TONE_OPTIONS } from "../options";

/* Fields most page-builder sections share. */

export const toneField = (initialValue = "cream") =>
  defineField({
    name: "tone",
    title: "Background",
    type: "string",
    initialValue,
    options: { list: TONE_OPTIONS, layout: "radio", direction: "horizontal" },
    validation: (rule) => rule.required(),
  });

export const anchorField = defineField({
  name: "anchorId",
  title: "Anchor ID",
  type: "string",
  description:
    "Optional. Lets buttons and the header link straight to this section — e.g. “listings” becomes #listings.",
  validation: (rule) =>
    rule.regex(/^[a-z0-9-]+$/, { name: "lowercase letters, numbers and dashes" }),
});

/* Keeps a section in the page but off the site — e.g. the May call to
   action while May is switched off. */
export const hiddenField = defineField({
  name: "hidden",
  title: "Hide this section",
  type: "boolean",
  initialValue: false,
  description: "The section stays in the page but doesn't show on the site until this is switched off.",
});

export const eyebrowField = defineField({
  name: "eyebrow",
  title: "Eyebrow",
  type: "string",
  description: "The small caps label above the heading.",
});

export const headingField = defineField({
  name: "title",
  title: "Heading",
  type: "string",
  validation: (rule) => rule.required(),
});

export const asideField = defineField({
  name: "aside",
  title: "Aside",
  type: "text",
  rows: 3,
  description: "Short supporting copy set beside the heading.",
});

/* Flatten portable text for Studio previews. */
export function plainText(value: unknown): string {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  return value
    .map((block: { children?: { text?: string }[] }) =>
      (block.children ?? []).map((child) => child.text ?? "").join(""),
    )
    .join(" ");
}
