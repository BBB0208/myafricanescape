import { CreditCardIcon } from "@sanity/icons/CreditCard";
import { defineField, defineType } from "sanity";
import { anchorField, hiddenField,asideField, eyebrowField, headingField, toneField } from "./shared";

export const mortgageCalculator = defineType({
  name: "mortgageCalculator",
  title: "Mortgage calculator",
  type: "object",
  icon: CreditCardIcon,
  fieldsets: [
    { name: "defaults", title: "Starting values", options: { columns: 2 } },
  ],
  fields: [
    eyebrowField,
    headingField,
    asideField,
    defineField({
      name: "defaultPrice",
      title: "Property price (USD)",
      type: "number",
      fieldset: "defaults",
      initialValue: 780000,
      validation: (rule) => rule.min(100000).max(3000000),
    }),
    defineField({
      name: "defaultDeposit",
      title: "Deposit (%)",
      type: "number",
      fieldset: "defaults",
      initialValue: 25,
      validation: (rule) => rule.min(5).max(60),
    }),
    defineField({
      name: "defaultRate",
      title: "Interest rate (%)",
      type: "number",
      fieldset: "defaults",
      initialValue: 9.5,
      validation: (rule) => rule.min(2).max(18),
    }),
    defineField({
      name: "defaultTerm",
      title: "Loan term (years)",
      type: "number",
      fieldset: "defaults",
      initialValue: 20,
      validation: (rule) => rule.min(5).max(30).integer(),
    }),
    defineField({
      name: "resultLabel",
      title: "Result label",
      type: "string",
      initialValue: "Estimated monthly payment",
    }),
    defineField({
      name: "note",
      title: "Small print",
      type: "text",
      rows: 3,
    }),
    toneField("cream"),
    anchorField,
    hiddenField,
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({
      title: title || "Mortgage calculator",
      subtitle: "Mortgage calculator",
      media: CreditCardIcon,
    }),
  },
});
