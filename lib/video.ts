/* ============================================================
   Turning an editor's pasted link into an embed URL.

   Nothing is loaded from YouTube or Vimeo until a visitor
   presses play, and YouTube is served from its no-cookie
   domain, so simply having an episode on the page sets nothing
   and costs nothing.
   ============================================================ */

export type Embed = { src: string; provider: "YouTube" | "Vimeo" };

/* Accepts the shapes people actually paste:
   youtube.com/watch?v=…, youtu.be/…, /embed/…, /shorts/…, /live/…,
   vimeo.com/… and player.vimeo.com/video/… */
export function toEmbed(rawUrl: string | null | undefined): Embed | null {
  if (!rawUrl) return null;

  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  const path = url.pathname.replace(/^\/+|\/+$/g, "");
  const isId = (value: string | null | undefined): value is string =>
    !!value && /^[\w-]{6,}$/.test(value);

  if (host === "youtu.be") {
    const id = path.split("/")[0];
    return isId(id) ? { src: youtube(id), provider: "YouTube" } : null;
  }

  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "m.youtube.com") {
    const param = url.searchParams.get("v");
    if (isId(param)) return { src: youtube(param), provider: "YouTube" };
    const [first, second] = path.split("/");
    if (["embed", "shorts", "live", "v"].includes(first) && isId(second)) {
      return { src: youtube(second), provider: "YouTube" };
    }
    return null;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = path.split("/").find((part) => /^\d{6,}$/.test(part));
    return id
      ? { src: `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`, provider: "Vimeo" }
      : null;
  }

  return null;
}

const youtube = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
