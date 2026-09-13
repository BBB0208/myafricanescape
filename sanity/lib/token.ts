/* Viewer-role robot token. Lets the server read drafts in Draft Mode, and is
   handed to the browser only while Draft Mode is on (live draft updates). */
export const token = process.env.SANITY_API_READ_TOKEN;

if (!token && process.env.NODE_ENV !== "production") {
  console.warn(
    "SANITY_API_READ_TOKEN is not set — Presentation and draft previews will show published content only.",
  );
}
