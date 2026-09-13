/* ============================================================
   AMARA ESTATES — listing helpers. The listings themselves live
   in Sanity (the "Listing" document type).
   ============================================================ */

import type { SceneName } from "@/sanity/schemaTypes/options";

export type { SceneName };

export const pad2 = (n: number) => String(n).padStart(2, "0");

/* "$1,850,000". Pass stega-clean currency codes — Intl rejects anything else. */
export function fmtPrice(n: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return "$" + n.toLocaleString("en-US");
  }
}

/* "$2.7M" — for stat counters. */
export function compactPrice(n: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  } catch {
    return fmtPrice(n);
  }
}

/* The scene that best suits a listing, used when it has no artwork set. */
export function sceneFor(p: {
  name?: string | null;
  type?: string | null;
  country?: string | null;
}): SceneName {
  const { name = "", type, country } = p;
  if (["Nigeria", "South Africa"].includes(country ?? "") && (type === "Penthouse" || type === "Apartment"))
    return "skyline";
  if (type === "Riad") return "riad";
  if (type === "Beach House") return "coast";
  if (name?.includes("Vineyard") || name?.includes("Constantia")) return "vineyard";
  if (country === "Egypt") return "river";
  if (country === "Uganda") return "lake";
  if (type === "Estate" || type === "Villa") return "savanna";
  return "desert";
}
