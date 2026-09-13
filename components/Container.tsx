import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export default function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto max-w-site px-8", className)}>{children}</div>;
}
