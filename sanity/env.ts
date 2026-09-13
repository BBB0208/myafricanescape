/* Public project coordinates, shared by the Next.js app, the embedded
   Studio and the Sanity CLI (seed script, TypeGen). The fallbacks keep the
   CLI working even when Next's .env loading isn't in play. */

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "u8ld2tbd";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-09-01";

/* Where the Studio is mounted — used by stega so click-to-edit links open
   the right document. */
export const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || "/studio";
