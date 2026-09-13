import { BarChartIcon } from "@sanity/icons/BarChart";
import { defineArrayMember, defineField, defineType } from "sanity";
import { hiddenField, toneField } from "./shared";

const KIND_LABELS: Record<string, string> = {
  custom: "Custom",
  listingCount: "Live · number of listings",
  countryCount: "Live · number of countries",
  topPrice: "Live · highest listing price",
};

export const statsBar = defineType({
  name: "statsBar",
  title: "Stats bar",
  type: "object",
  icon: BarChartIcon,
  fields: [
    toneField("teal"),
    hiddenField,
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      validation: (rule) => rule.min(1).max(6),
      of: [
        defineArrayMember({
          name: "stat",
          title: "Stat",
          type: "object",
          fields: [
            defineField({
              name: "kind",
              title: "Value",
              type: "string",
              initialValue: "custom",
              description: "Live values are calculated from the listings in Sanity.",
              options: {
                list: Object.entries(KIND_LABELS).map(([value, title]) => ({ title, value })),
              },
            }),
            defineField({
              name: "value",
              title: "Custom value",
              type: "string",
              hidden: ({ parent }) => (parent as { kind?: string })?.kind !== "custom",
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { kind: "kind", value: "value", label: "label" },
            prepare: ({ kind, value, label }) => ({
              title: kind === "custom" ? `${value ?? "—"} ${label ?? ""}` : label,
              subtitle: KIND_LABELS[kind] ?? "",
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { stats: "stats" },
    prepare: ({ stats }) => ({
      title: `${stats?.length ?? 0} stats`,
      subtitle: "Stats bar",
    }),
  },
});
