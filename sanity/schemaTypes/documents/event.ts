import { CalendarIcon } from "@sanity/icons/Calendar";
import { defineField, defineType } from "sanity";

export const event = defineType({
  name: "event",
  title: "Event",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      options: { dateFormat: "D MMMM YYYY" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "city",
      title: "Location",
      type: "string",
      description: "e.g. Cape Town, South Africa",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "rsvp",
      title: "RSVP link",
      type: "link",
      description: "Where the RSVP button goes. Leave empty to have May take the RSVP.",
    }),
  ],
  orderings: [
    { title: "Date", name: "dateAsc", by: [{ field: "date", direction: "asc" }] },
  ],
  preview: {
    select: { title: "title", date: "date", city: "city" },
    prepare: ({ title, date, city }) => ({
      title,
      subtitle: [date, city].filter(Boolean).join(" · "),
      media: CalendarIcon,
    }),
  },
});
