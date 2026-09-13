import { stegaClean } from "next-sanity";

/* The `link` object as projected by the LINK fragment in queries.ts. */
export type LinkValue =
  | {
      linkType?: string | null;
      anchor?: string | null;
      url?: string | null;
      openInNewTab?: boolean | null;
      pageHref?: string | null;
    }
  | null
  | undefined;

export function isConciergeLink(link: LinkValue): boolean {
  return stegaClean(link?.linkType) === "concierge";
}

/* Turn a link into an href, or null when it points nowhere yet. */
export function resolveHref(link: LinkValue): string | null {
  if (!link) return null;
  const anchor = stegaClean(link.anchor)?.replace(/^#/, "");

  switch (stegaClean(link.linkType)) {
    case "internal": {
      const base = stegaClean(link.pageHref);
      if (!base) return null;
      return anchor ? `${base}#${anchor}` : base;
    }
    case "anchor":
      return anchor ? `#${anchor}` : null;
    case "external":
      return stegaClean(link.url) || null;
    default:
      return null;
  }
}

export function externalProps(link: LinkValue) {
  return stegaClean(link?.linkType) === "external" && link?.openInNewTab
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
}
