"use client";

import type { ReactNode } from "react";
import { Btn } from "@/components/Btn";
import { useMay } from "@/components/May";

/* Hands the visitor straight to the concierge, opening the panel and
   starting the greeting in one go. */
export default function AskMayButton({
  variant = "primary",
  size,
  className,
  children,
}: {
  variant?: "default" | "primary" | "ghost";
  size?: "base" | "small";
  className?: string;
  children: ReactNode;
}) {
  const { openAndGreet, enabled } = useMay();
  if (!enabled) return null;
  return (
    <Btn variant={variant} size={size} className={className} onClick={openAndGreet}>
      {children}
    </Btn>
  );
}
