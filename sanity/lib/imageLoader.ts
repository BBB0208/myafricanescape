"use client";

/* ============================================================
   next/image, served straight from Sanity's image CDN.

   Without this every photo made two trips — Sanity rendered the
   crop, then Next's optimizer fetched and re-encoded it — and a
   cold miss could take seconds. Here the browser asks Sanity's
   CDN directly for exactly the width each srcset entry needs,
   in WebP/AVIF where the browser takes it (auto=format).

   The URL coming in is the one Art built: its crop (rect), its
   shape (w × h, or max-w × max-h for a photo shown whole) and
   its size cap at the original. Only the width is swapped for
   the one requested, with the height following in proportion,
   so no srcset entry ever asks for more than the photo holds.
   Anything that isn't a Sanity image is left untouched.
   ============================================================ */

const SANITY = "https://cdn.sanity.io/images/";

export default function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src.startsWith(SANITY)) return src;

  const url = new URL(src);
  const params = url.searchParams;

  const box = (w: string, h: string) => {
    const cap = Number(params.get(w));
    const tall = Number(params.get(h));
    const next = cap ? Math.min(width, cap) : width;
    params.set(w, String(next));
    if (cap && tall) params.set(h, String(Math.max(1, Math.round((next * tall) / cap))));
  };

  if (params.has("max-w")) box("max-w", "max-h");
  else box("w", "h");

  params.set("q", String(quality ?? 75));
  if (!params.has("auto")) params.set("auto", "format");
  return url.toString();
}
