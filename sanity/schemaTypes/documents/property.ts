import { HomeIcon } from "@sanity/icons/Home";
import { defineArrayMember, defineField, defineType } from "sanity";
import { CURRENCIES, PROPERTY_TYPES, REGIONS } from "../options";

export const property = defineType({
  name: "property",
  title: "Listing",
  type: "document",
  icon: HomeIcon,
  fieldsets: [
    { name: "location", title: "Location", options: { columns: 2 } },
    { name: "details", title: "Details", options: { columns: 2 } },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      fieldset: "details",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      fieldset: "details",
      initialValue: "USD",
      options: { list: CURRENCIES },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "type",
      title: "Property type",
      type: "string",
      fieldset: "details",
      options: { list: [...PROPERTY_TYPES] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "beds",
      title: "Bedrooms",
      type: "number",
      fieldset: "details",
      validation: (rule) => rule.required().min(0).integer(),
    }),
    defineField({
      name: "city",
      title: "Neighbourhood, city",
      type: "string",
      fieldset: "location",
      description: "e.g. Camps Bay, Cape Town",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "country",
      title: "Country",
      type: "string",
      fieldset: "location",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "region",
      title: "Region",
      type: "string",
      description: "Used by May when a visitor searches by region.",
      options: { list: [...REGIONS] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tag",
      title: "Highlight",
      type: "string",
      description: "One short selling point, e.g. “Ocean-facing”.",
    }),
    defineField({
      name: "art",
      title: "Main artwork",
      type: "art",
      description: "The first frame on the listing card.",
    }),
    defineField({
      name: "gallery",
      title: "More frames",
      type: "array",
      description: "Extra photos or scenes. Visitors page through them with the << >> buttons on the card.",
      of: [defineArrayMember({ type: "art" })],
    }),
    defineField({
      name: "badge",
      title: "Label on artwork",
      type: "string",
      description: "Optional short label printed over the card's artwork, e.g. EPISODES.",
      validation: (rule) => rule.max(24),
    }),
    defineField({
      name: "sortOrder",
      title: "Display order",
      type: "number",
      description: "Lower numbers appear first in listing grids.",
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "sortOrderAsc",
      by: [{ field: "sortOrder", direction: "asc" }],
    },
    {
      title: "Price, high to low",
      name: "priceDesc",
      by: [{ field: "price", direction: "desc" }],
    },
    { title: "Name", name: "nameAsc", by: [{ field: "name", direction: "asc" }] },
  ],
  preview: {
    select: {
      title: "name",
      city: "city",
      country: "country",
      price: "price",
      currency: "currency",
      media: "art.image",
    },
    prepare: ({ title, city, country, price, currency, media }) => ({
      title,
      subtitle: [
        typeof price === "number" ? `${currency ?? "USD"} ${price.toLocaleString("en-US")}` : null,
        [city, country].filter(Boolean).join(", "),
      ]
        .filter(Boolean)
        .join(" · "),
      media: media ?? HomeIcon,
    }),
  },
});
