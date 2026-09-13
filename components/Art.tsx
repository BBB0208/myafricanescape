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
      } | null;
    }
  | null
  | undefined;

/* Fills its (positioned) parent. */
export default function Art({
  art,
  className,
  fallback = "savanna",
  width = 1200,
  height = 900,
  sizes = "(max-width: 780px) 100vw, 50vw",
  priority = false,
}: {
  art: ArtValue;
  className?: string;
  fallback?: SceneName;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}) {
  const image = art?.image;

  if (image?.asset?._ref) {
    const src = urlFor(image as Parameters<typeof urlFor>[0])
      .width(width)
      .height(height)
      .fit("crop")
      .url();
    return (
      <Image
        src={src}
        alt={stegaClean(image.alt) ?? ""}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    );
  }

  const scene = stegaClean(art?.scene);
  const name = (SCENES as readonly unknown[]).includes(scene) ? (scene as SceneName) : fallback;
  return <Scene name={name} className={className} />;
}
