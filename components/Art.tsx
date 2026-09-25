import Image from "next/image";
import { stegaClean } from "next-sanity";
import Scene from "@/components/Scene";
import { urlFor } from "@/sanity/lib/image";
import { SCENES, type SceneName } from "@/sanity/schemaTypes/options";

/* The `art` object: a scene illustration, or an uploaded photo that
   replaces it. */
export type ArtValue =
  | {
      scene?: string | null;
      image?: {
        asset?: { _ref: string } | null;
        crop?: unknown;
        hotspot?: unknown;
        alt?: string | null;
        /* Sanity's blurred preview (asset->metadata.lqip) */
        lqip?: string | null;
      } | null;
    }
  | null
  | undefined;

/* Asset ids carry the original size: image-<hash>-<w>x<h>-<ext>. */
function assetSize(ref: string): { w: number; h: number } | null {
  const match = /-(\d+)x(\d+)-[a-z0-9]+$/i.exec(ref);
  return match ? { w: Number(match[1]), h: Number(match[2]) } : null;
}

/* How far a photo's shape may stray from its frame's before "auto"
   stops cropping it — a 3:4 portrait in a 4:3 frame (1.78×) is shown
   whole; a 3:2 landscape in a 5:4 frame (1.2×) is simply cropped. */
const CONTAIN_BEYOND = 1.5;

/* Fills its (positioned) parent. */
export default function Art({
  art,
  className,
  fallback = "savanna",
  width = 1200,
  height = 900,
  sizes = "(max-width: 780px) 100vw, 50vw",
  priority = false,
  loading,
  fit = "cover",
  blur = false,
}: {
  art: ArtValue;
  className?: string;
  fallback?: SceneName;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  /* "lazy" for anything offscreen at load — e.g. a hero's later slides */
  loading?: "eager" | "lazy";
  /* "cover" always fills the frame. "auto" does too, unless the photo's
     shape is far from the frame's — a portrait phone shot in a 16:9
     gallery — when it is shown whole over a soft, blurred fill of itself. */
  fit?: "cover" | "auto";
  /* paint the blurred preview while the photo loads — for pictures on
     show at load; kept off for frames further in, whose previews would
     only add weight to the page */
  blur?: boolean;
}) {
  const image = art?.image;

  if (image?.asset?._ref) {
    const source = image as Parameters<typeof urlFor>[0];
    const alt = stegaClean(image.alt) ?? "";
    /* the LCP picture is preloaded from the <head>; anything else loads
       as the caller says (lazy by default) */
    const loadProps = priority ? { preload: true } : { loading };
    const lqip = blur ? stegaClean(image.lqip) : null;
    const placeholder = lqip ? ({ placeholder: "blur", blurDataURL: lqip } as const) : {};

    const size = assetSize(image.asset._ref);
    const frame = width / height;
    const aspect = size ? size.w / size.h : null;
    const stretch = fit === "auto" && aspect ? Math.max(aspect / frame, frame / aspect) : 1;

    if (stretch > CONTAIN_BEYOND) {
      /* the whole photo, as large as the frame can show and never beyond
         the original (width + height together would make the builder
         crop to the frame's shape, which is exactly what this avoids) */
      const whole = urlFor(source).maxWidth(width).maxHeight(height).url();
      const backdrop = urlFor(source).width(64).height(64).fit("crop").blur(20).url();
      return (
        <div className="absolute inset-0 overflow-hidden bg-ink">
          <Image
            src={backdrop}
            alt=""
            aria-hidden
            fill
            sizes="64px"
            unoptimized
            loading={priority ? "eager" : loading}
            className="scale-110 object-cover opacity-60"
          />
          <Image
            src={whole}
            alt={alt}
            fill
            sizes={sizes}
            {...loadProps}
            {...placeholder}
            className="object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,.35)]"
          />
        </div>
      );
    }

    /* never ask for more than the photo holds: the largest crop of the
       frame's shape that fits the original, so nothing is upscaled */
    const w = size ? Math.min(width, size.w, Math.floor(size.h * frame)) : width;
    const src = urlFor(source)
      .width(w)
      .height(Math.round(w / frame))
      .fit("crop")
      .url();
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        {...loadProps}
        {...placeholder}
        className="object-cover"
      />
    );
  }

  const scene = stegaClean(art?.scene);
  const name = (SCENES as readonly unknown[]).includes(scene) ? (scene as SceneName) : fallback;
  return <Scene name={name} className={className} />;
}
