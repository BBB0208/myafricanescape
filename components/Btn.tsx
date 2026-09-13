import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "default" | "primary" | "ghost";

const BASE =
  "inline-flex items-center gap-2.5 rounded-full border-[1.5px] font-eyebrow tracking-[.08em] transition-all duration-[.22s] hover:-translate-y-0.5";

const SIZES = {
  base: "px-7 py-[15px] text-[15px]",
  small: "px-[18px] py-2.5 text-[13px]",
} as const;

const VARIANTS: Record<Variant, string> = {
  default: "border-ink bg-transparent text-ink hover:bg-ink hover:text-cream",
  primary:
    "border-sunset bg-sunset text-cream shadow-[0_8px_22px_rgba(232,93,44,.35)] hover:border-magenta hover:bg-magenta hover:text-cream hover:shadow-[0_10px_26px_rgba(198,35,111,.4)]",
  ghost:
    "border-cream/50 bg-transparent text-cream hover:bg-cream hover:text-ink",
};

function classes(variant: Variant, size: keyof typeof SIZES, className?: string) {
  return cn(BASE, SIZES[size], VARIANTS[variant], className);
}

type Shared = {
  variant?: Variant;
  size?: keyof typeof SIZES;
  className?: string;
  children: ReactNode;
};

export function BtnLink({
  href,
  variant = "default",
  size = "base",
  className,
  children,
  ...rest
}: Shared & { href: string } & Omit<ComponentProps<"a">, "href" | "className" | "children">) {
  const cls = classes(variant, size, className);
  // Hash targets stay plain anchors so the CSS smooth-scroll handles them.
  if (href.startsWith("#")) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

export function Btn({
  variant = "default",
  size = "base",
  className,
  children,
  ...rest
}: Shared & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
