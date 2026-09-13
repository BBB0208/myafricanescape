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

const IMAGE = /* groq */ `{ asset, crop, hotspot, alt }`;

const ART = /* groq */ `{ scene, image ${IMAGE} }`;

const PROPERTY = /* groq */ `{
  _id,
  name,
  "slug": slug.current,
  price,
  currency,
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

const PAGE = /* groq */ `{
  _id,
  _type,
  title,
  "slug": slug.current,
  pageBuilder[]{
    ...,
    _type == "hero" => { buttons[] ${BUTTON}, art ${ART} },
    _type == "editorial" => { buttons[] ${BUTTON}, art ${ART} },
    _type == "ctaBanner" => { buttons[] ${BUTTON} },
    _type == "cardGrid" => { cards[]{ _key, title, body, art ${ART} } },
    _type == "listingGrid" => {
      "listings": select(
        source == "selected" => properties[]->${PROPERTY},
        *[_type == "property" && defined(name)] | order(coalesce(sortOrder, 9999) asc, price desc) ${PROPERTY}
      )
    },
    _type == "eventList" => {
      "events": *[
        _type == "event" && defined(date) && (^.showPast == true || date >= $today)
      ] | order(date asc) { _id, title, date, city, description, rsvp ${LINK} }
    },
    _type == "statsBar" => {
      "live": {
        "listingCount": count(*[_type == "property"]),
        "countryCount": count(array::unique(*[_type == "property"].country)),
        "topPrice": math::max(*[_type == "property"].price)
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
    *[_type == "property" && defined(city)] | order(coalesce(sortOrder, 9999) asc).city
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
  "properties": *[_type == "property" && defined(name) && defined(price)]
    | order(coalesce(sortOrder, 9999) asc) {
      _id, name, price, currency, type, beds, city, country, region, tag
    }
}`);
