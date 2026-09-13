import { CalendarIcon } from "@sanity/icons/Calendar";
import { defineField, defineType } from "sanity";
import { anchorField, hiddenField,asideField, eyebrowField, headingField, toneField } from "./shared";

export const eventList = defineType({
  name: "eventList",
  title: "Event calendar",
  type: "object",
  icon: CalendarIcon,
  description: "Lists Event documents by date.",
  fields: [
    eyebrowField,
    headingField,
    asideField,
    defineField({
      name: "showPast",
      title: "Include past events",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "limit",
      title: "Maximum events",
      type: "number",
      description: "Leave empty to show them all.",
      validation: (rule) => rule.min(1).integer(),
    }),
    defineField({
      name: "rsvpLabel",
      title: "RSVP button label",
      type: "string",
      initialValue: "RSVP",
    }),
    defineField({
      name: "emptyMessage",
      title: "Message when there are no events",
      type: "string",
      initialValue: "New dates are being scheduled — check back soon.",
    }),
    toneField("cream"),
    anchorField,
    hiddenField,
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({
      title: title || "Event calendar",
      subtitle: "Event calendar",
      media: CalendarIcon,
    }),
  },
});
