import { stegaClean } from "next-sanity";
import AskMayButton from "@/components/AskMayButton";
import { BtnLink } from "@/components/Btn";
import { cn } from "@/lib/cn";
import { externalProps, isConciergeLink, resolveHref, type LinkValue } from "@/lib/links";

type Variant = "default" | "primary" | "ghost";
const VARIANTS: readonly string[] = ["default", "primary", "ghost"];

/* The `button` object as projected by the BUTTON fragment in queries.ts. */
export type ButtonValue =
  | { _key?: string | null; label?: string | null; variant?: string | null; link?: LinkValue }
  | null
  | undefined;

/* A Sanity button: opens May, or links to a page, section or URL. */
export default function CmsButton({
  button,
  fallbackVariant = "primary",
  size = "base",
  className,
}: {
  button: ButtonValue;
  fallbackVariant?: Variant;
  size?: "base" | "small";
  className?: string;
}) {
  if (!button?.label) return null;
  const clean = stegaClean(button.variant);
  const variant = clean && VARIANTS.includes(clean) ? (clean as Variant) : fallbackVariant;

  if (isConciergeLink(button.link)) {
    return (
      <AskMayButton variant={variant} size={size} className={className}>
        {button.label}
      </AskMayButton>
    );
  }

  const href = resolveHref(button.link);
  if (!href) return null;
  return (
    <BtnLink href={href} variant={variant} size={size} className={className} {...externalProps(button.link)}>
      {button.label}
    </BtnLink>
  );
}

export function ButtonRow({
  buttons,
  className,
}: {
  buttons: ButtonValue[] | null | undefined;
  className?: string;
}) {
  const items = (buttons ?? []).filter((button) => button?.label);
  if (!items.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-3.5", className)}>
      {items.map((button, i) => (
        <CmsButton key={button?._key ?? i} button={button} />
      ))}
    </div>
  );
}
