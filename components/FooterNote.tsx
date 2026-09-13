"use client";

import { usePathname } from "next/navigation";

export type PageNote = { path: string; note?: string | null };

/* The small print that changes from page to page. */
export default function FooterNote({
  pages,
  fallback,
}: {
  pages: PageNote[];
  fallback?: string | null;
}) {
  const pathname = usePathname();
  const note = pages.find((page) => page.path === pathname)?.note || fallback;
  return note ? <span>{note}</span> : null;
}
