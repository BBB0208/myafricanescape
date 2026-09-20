import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { PROPERTIES_TAG, propertyTag } from "@/lib/properties/api";

/* ============================================================
   Studio → site, on publish.

   Sanity posts here whenever a listing is created, edited,
   published, unpublished or deleted. We expire only what that
   listing touches, so the rest of the site keeps its cache.

   Setup lives in docs/CMS.md. Without this webhook the site
   still catches up on its own within ten minutes — the caches
   in lib/properties/api.ts carry that lifetime.
   ============================================================ */

export const runtime = "nodejs";
/* a webhook must never be served from a cache */
export const dynamic = "force-dynamic";

/* Server-only. Never referenced from a client component, so it cannot
   reach the browser bundle. */
const secret = process.env.SANITY_REVALIDATE_SECRET;

type WebhookBody = {
  _type?: string;
  slug?: string | null;
  /* the address a listing had before this edit, sent by the projection in
     docs/CMS.md so a renamed listing expires its old page too */
  previousSlug?: string | null;
};

const unauthorized = () => NextResponse.json({ revalidated: false, message: "Unauthorized" }, { status: 401 });

export async function POST(request: NextRequest) {
  if (!secret) {
    console.error("[revalidate] SANITY_REVALIDATE_SECRET is not set — refusing the request");
    return NextResponse.json(
      { revalidated: false, message: "Revalidation is not configured" },
      { status: 500 },
    );
  }

  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  if (!signature) return unauthorized();

  /* Read the body as text: the signature covers the exact bytes Sanity sent. */
  const raw = await request.text();
  if (!(await isValidSignature(raw, signature, secret))) return unauthorized();

  let body: WebhookBody;
  try {
    body = JSON.parse(raw) as WebhookBody;
  } catch {
    return NextResponse.json({ revalidated: false, message: "Malformed body" }, { status: 400 });
  }

  if (body._type !== "property") {
    /* Other document types are handled live by <SanityLive />. */
    return NextResponse.json({ revalidated: false, message: `Ignored ${body._type ?? "unknown"}` });
  }

  /* the grids, the stat counters and the sitemap all read the inventory */
  const tags = [PROPERTIES_TAG];

  /* the listing's own page, at its current address and any address it just
     moved away from */
  for (const slug of [body.slug, body.previousSlug]) {
    if (typeof slug === "string" && slug) tags.push(propertyTag(slug));
  }

  /* expire: 0 — drop the cached entries now rather than letting them ride
     out the ten-minute fallback */
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  /* the sitemap is a route, not a tagged fetch */
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ revalidated: true, tags, now: Date.now() });
}

/* A plain GET is a health check for whoever is wiring the webhook up —
   it reveals nothing and revalidates nothing. */
export async function GET() {
  return NextResponse.json({ ok: true, configured: Boolean(secret) });
}
