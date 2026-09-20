/* ============================================================
   AMARA ESTATES — listing helpers. The listings themselves live
   in Sanity (the "Listing" document type).
   ============================================================ */

import type { SceneName } from "@/sanity/schemaTypes/options";

export type { SceneName };

export const pad2 = (n: number) => String(n).padStart(2, "0");

/* Money is never formatted here. Every figure on the page goes
   through the display layer in lib/currency, which converts the
   stored USD price into whatever the visitor has chosen. */

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
