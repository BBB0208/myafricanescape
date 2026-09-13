import type { ReactNode } from "react";
import PageShutter from "@/components/PageShutter";

/* Re-mounts on every navigation, so each page gets the shutter transition. */
export default function Template({ children }: { children: ReactNode }) {
  return <PageShutter>{children}</PageShutter>;
}
