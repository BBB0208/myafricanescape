import { defineArrayMember, defineField, defineType } from "sanity";

/* Hero headlines: each block is one line, and the "Accent" decorator gives
   the italic sunset word (the <Em> in the original markup). */
export const headline = defineType({
  name: "headline",
  title: "Headline",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [{ title: "Line", value: "normal" }],
      lists: [],
      marks: {
        decorators: [
          { title: "Accent (italic sunset)", value: "em" },
          { title: "Bold", value: "strong" },
        ],
        annotations: [],
      },
    }),
  ],
});

/* Short body copy: paragraphs with bold, italic and links. */
export const simpleText = defineType({
  name: "simpleText",
  title: "Text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [{ title: "Paragraph", value: "normal" }],
      lists: [],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
        annotations: [
          defineArrayMember({
            name: "link",
            title: "Link",
            type: "object",
            fields: [
              defineField({
                name: "href",
                title: "URL",
                type: "url",
                validation: (rule) =>
                  rule.uri({ scheme: ["http", "https", "mailto", "tel"], allowRelative: true }),
              }),
            ],
          }),
        ],
      },
    }),
  ],
});
