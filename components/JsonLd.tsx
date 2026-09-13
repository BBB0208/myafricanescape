import { stegaClean } from "next-sanity";

/* Structured data for search engines. Values are stega-cleaned so preview
   markers never leak into it, and "<" is escaped so content can't close
   the script tag. */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(stegaClean(data)).replace(/</g, "\\u003c") }}
    />
  );
}
