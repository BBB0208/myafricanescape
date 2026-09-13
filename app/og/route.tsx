import { ImageResponse } from "next/og";
import { client } from "@/sanity/lib/client";
import { OG_QUERY } from "@/sanity/lib/queries";

/* The default social card (1200 × 630), used wherever a page has no share
   image of its own. Built once at build time from Site settings. */
export const dynamic = "force-static";

export async function GET() {
  const settings = await client.fetch(OG_QUERY, {}, { stega: false });
  const title = settings?.title || "My African Escape";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "72px 80px",
          background: "linear-gradient(180deg, #F2B705 0%, #E85D2C 52%, #241608 100%)",
          color: "#F6EFE3",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 70,
            right: 110,
            width: 190,
            height: 190,
            borderRadius: 999,
            background: "#F6EFE3",
            opacity: 0.85,
          }}
        />
        <div style={{ fontSize: 26, letterSpacing: 8, color: "#F2B705", display: "flex" }}>
          BESPOKE PROPERTY · ACROSS AFRICA
        </div>
        <div style={{ fontSize: 108, fontWeight: 800, lineHeight: 1, marginTop: 18, display: "flex" }}>
          {title}
        </div>
        {settings?.tagline ? (
          <div style={{ fontSize: 30, marginTop: 24, maxWidth: 900, opacity: 0.85, display: "flex" }}>
            {settings.tagline}
          </div>
        ) : null}
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
