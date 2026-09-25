import { defineQuery } from "next-sanity";

/* ---------- shared projections ---------- */

const HOME_ID = /* groq */ `*[_id == "siteSettings"][0].homePage._ref`;

const LINK = /* groq */ `{
  linkType,
  anchor,
  url,
  openInNewTab,
  "pageHref": select(
    page._ref == ${HOME_ID} => "/",
    defined(page->slug.current) => "/" + page->slug.current
  )
}`;

const BUTTON = /* groq */ `{ _key, label, variant, link ${LINK} }`;

/* lqip: Sanity's tiny blurred preview, painted while the photo loads */
const IMAGE = /* groq */ `{ asset, crop, hotspot, alt, "lqip": asset->metadata.lqip }`;

const ART = /* groq */ `{ scene, image ${IMAGE} }`;

/* A listing is public unless it is hidden. Drafts never reach this filter:
   the client reads with perspective "published". Sold and reserved listings
   stay on the site so their addresses keep working. */
const PUBLIC_PROPERTY = /* groq */ `_type == "property" && defined(name) && status != "hidden"`;

/* Everything a listing card needs, and nothing more. */
const PROPERTY = /* groq */ `{
  _id,
  _updatedAt,
  name,
  "slug": slug.current,
  price,
  currency,
  status,
  type,
  beds,
  city,
  country,
  region,
  tag,
  badge,
  art ${ART},
  gallery[]{ _key, scene, image ${IMAGE} }
}`;

/* The card fields plus the write-up, for a listing's own page. */
const PROPERTY_DETAIL = /* groq */ `{
  _id,
  _updatedAt,
  name,
  "slug": slug.current,
  price,
  currency,
  status,
  type,
  beds,
  baths,
  area,
  city,
  country,
  region,
  tag,
  badge,
  summary,
  description,
  amenities,
  art ${ART},
  gallery[]{ _key, scene, image ${IMAGE} },
  seo{ metaTitle, metaDescription, noIndex, ogImage },
  "siteName": *[_id == "siteSettings"][0].title,
  "defaultOgImage": *[_id == "siteSettings"][0].seo.ogImage
}`;

const PAGE = /* groq */ `{
  _id,
  _type,
  title,
  "slug": slug.current,
  pageBuilder[]{
    ...,
    _type == "hero" => { buttons[] ${BUTTON}, art ${ART}, slides[]{ _key, scene, image ${IMAGE} } },
    _type == "editorial" => { buttons[] ${BUTTON}, art ${ART}, views[]{ _key, label, art ${ART}, gallery[]{ _key, scene, image ${IMAGE} } } },
    _type == "ctaBanner" => { buttons[] ${BUTTON} },
    _type == "cardGrid" => { cards[]{ _key, title, body, art ${ART} } },
    _type == "listingGrid" => {
      "selectedIds": properties[]._ref
    },
    _type == "episodeReel" => {
      episodes[]{
        _key,
        title,
        videoUrl,
        "videoFile": videoFile.asset->{ url, mimeType },
        poster ${IMAGE}
      }
    },
    _type == "eventList" => {
      "events": *[
        _type == "event" && defined(date) && (^.showPast == true || date >= $today)
      ] | order(date asc) { _id, title, date, city, description, rsvp ${LINK} }
    },
    _type == "statsBar" => {
      "live": {
        "listingCount": count(*[${PUBLIC_PROPERTY}]),
        "countryCount": count(array::unique(*[${PUBLIC_PROPERTY}].country)),
        "topPrice": math::max(*[${PUBLIC_PROPERTY}].price)
      }
    }
  }
}`;

const SEO = /* groq */ `{
  title,
  seo{ metaTitle, metaDescription, noIndex, ogImage },
  "siteName": *[_id == "siteSettings"][0].title,
  "defaultOgImage": *[_id == "siteSettings"][0].seo.ogImage
}`;

/* ---------- pages ---------- */

export const HOME_PAGE_QUERY = defineQuery(
  `*[_type == "page" && _id == ${HOME_ID}][0]${PAGE}`,
);

export const PAGE_QUERY = defineQuery(
  `*[_type == "page" && slug.current == $slug][0]${PAGE}`,
);

export const HOME_SEO_QUERY = defineQuery(`*[_type == "page" && _id == ${HOME_ID}][0]${SEO}`);

export const PAGE_SEO_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0]${SEO}`);

/* The home page's own slug, so /home can redirect to /. */
export const HOME_SLUG_QUERY = defineQuery(`*[_type == "page" && _id == ${HOME_ID}][0].slug.current`);

export const PAGE_SLUGS_QUERY = defineQuery(
  `*[_type == "page" && defined(slug.current) && _id != ${HOME_ID}]{ "slug": slug.current }`,
);

export const SITEMAP_QUERY = defineQuery(
  `*[_type == "page" && defined(slug.current) && seo.noIndex != true]{
    "path": select(_id == ${HOME_ID} => "/", "/" + slug.current),
    _updatedAt
  }`,
);

/* ---------- listings ---------- */

/* Every public listing, in display order. */
export const PROPERTIES_QUERY = defineQuery(
  `*[${PUBLIC_PROPERTY}] | order(coalesce(sortOrder, 9999) asc, price desc) ${PROPERTY}`,
);

/* The hand-picked subset a Listing grid names, kept in the editor's order. */
export const PROPERTIES_BY_ID_QUERY = defineQuery(
  `*[${PUBLIC_PROPERTY} && _id in $ids] ${PROPERTY}`,
);

/* One listing, by its web address. */
export const PROPERTY_QUERY = defineQuery(
  `*[${PUBLIC_PROPERTY} && slug.current == $slug][0] ${PROPERTY_DETAIL}`,
);

/* Addresses to pre-render, and to put in the sitemap. */
export const PROPERTY_SLUGS_QUERY = defineQuery(
  `*[${PUBLIC_PROPERTY} && defined(slug.current)]{ "slug": slug.current, _updatedAt }`,
);

/* ---------- layout: header, footer, per-page chrome ---------- */

export const LAYOUT_QUERY = defineQuery(`{
  "settings": *[_id == "siteSettings"][0]{
    title,
    wordmark,
    wordmarkTagline,
    logo{
      alt,
      "url": asset->url,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height
    },
    headerCta ${BUTTON},
    "conciergeEnabled": coalesce(concierge.enabled, false),
    navigation[]{
      _key,
      label,
      color,
      "href": select(
        page._ref == ${HOME_ID} => "/",
        defined(page->slug.current) => "/" + page->slug.current
      )
    },
    footer{ blurb, exploreHeading, regionsHeading, regions, contactHeading, contactLines, copyright, defaultNote },
    seo{ defaultTitle, description, ogImage }
  },
  "pages": *[_type == "page" && defined(slug.current)]{
    _id,
    "path": select(_id == ${HOME_ID} => "/", "/" + slug.current),
    footerNote,
    headerCta ${BUTTON}
  },
  "cities": array::unique(
    *[${PUBLIC_PROPERTY} && defined(city)] | order(coalesce(sortOrder, 9999) asc).city
  )
}`);

/* ---------- the generated social card ---------- */

export const OG_QUERY = defineQuery(`*[_id == "siteSettings"][0]{
  title,
  "tagline": seo.description
}`);

/* ---------- May, the concierge ---------- */

export const CONCIERGE_QUERY = defineQuery(`{
  "config": *[_id == "siteSettings"][0].concierge{
    launcherTitle,
    launcherSubtitle,
    panelTitle,
    panelSubtitle,
    greeting,
    inputPlaceholder,
    budgetBands[]{ _key, label, min, max },
    typeGroups[]{ _key, label, types },
    anywhereLabel,
    callbackMessage
  },
  "properties": *[${PUBLIC_PROPERTY} && defined(price)]
    | order(coalesce(sortOrder, 9999) asc) {
      _id, name, "slug": slug.current, price, currency, status, type, beds, city, country, region, tag
    }
}`);
