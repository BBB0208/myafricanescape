# My African Escape

The My African Escape site — bespoke property, lifestyle, investment and episodes
across Africa — as a Next.js App Router project styled with Tailwind CSS v4, with every
word, listing and page managed in **Sanity** (project `u8ld2tbd`, dataset `production`).

```bash
npm install
cp .env.example .env.local   # then add SANITY_API_READ_TOKEN
npm run dev                   # site at http://localhost:3000, Studio at /studio
npm run build && npm start
```

| Script             | What it does                                                      |
| ------------------ | ----------------------------------------------------------------- |
| `npm run seed`     | Loads the full site into Sanity (idempotent — resets to the seed) |
| `npm run migrate:redesign` | Applies the 2026 redesign to existing content, keeping edits |
| `npm run typegen`  | Extracts the schema and regenerates `sanity/types.ts`             |
| `npm run lint`     | Type-checks the project                                           |

## Editing content

Open **http://localhost:3000/studio**.

- **Presentation** — the live site beside the editor. Click any text to edit it,
  drag sections to reorder them, and watch drafts update in place.
- **Content → Site settings** — logo, home page, navigation (label and pill
  colour per item), the header button, footer, May, default SEO.
- **May, the concierge, is switched off for now** (Site settings → May concierge →
  "Show May on the site"). While off, the chat launcher, the header's Ask May button
  and every button that opens May are hidden; switching it on brings them all back.
- **Pages** — each page is a stack of sections (the page builder): Hero, Stats bar,
  Listing grid, Numbered list, Editorial, Card grid, Mortgage calculator,
  Event calendar and Call to action. Each page also sets its header button,
  footer note and SEO.
- **Listings** and **Events** — the property inventory and the event calendar.
  Listing grids, stats, May's search and the calendar all read from these.

Every visual is one of the eight scene illustrations; upload a photo on any
artwork field to replace it. Listings take extra frames under **More frames** —
visitors page through them with the `<< >>` buttons on the card.

`/financial` and `/events` redirect to their renamed pages, `/invest` and `/episodes`
(see `next.config.ts`).

## Layout

```
app/
  layout.tsx                 fonts + globals, shared by site and Studio
  (site)/layout.tsx          grain, header, footer, May, live preview, visual editing
  (site)/page.tsx            the home page chosen in Site settings
  (site)/[slug]/page.tsx     every other page
  (site)/property/[slug]/    a listing's own page, straight from the CMS
  (site)/error.tsx           shown if a page can't be built (e.g. CMS offline)
  api/revalidate/            the Studio webhook: expires the listing caches
  studio/[[...tool]]/        the embedded Sanity Studio
  api/draft-mode/            enable (used by Presentation) / disable
components/
  PageBuilder.tsx            maps page sections to blocks/*
  blocks/                    one component per section type
  May.tsx                    the concierge, fed by Sanity
  currency/                  the display-currency picker, prices and rate note
lib/
  currency/                  supported currencies, FX rates, conversion, Intl formatting
  properties/                the only place the site reads the listing inventory
sanity/
  schemaTypes/               documents, page-builder blocks, shared objects
  lib/                       client, live (sanityFetch / SanityLive), queries, image
  presentation/resolve.ts    Presentation locations + main documents
  structure.ts               Studio desk structure (Site settings singleton)
docs/CMS.md                  managing listings, env vars, the webhook
scripts/seed.ts              the seed content (a one-off fixture, not a live source)
scripts/migrate-episodes.ts  folds the Episodes page into Lifestyle (run once)
legacy/                      the original static site, kept for reference
```

## Notes

- `sanityFetch` + `<SanityLive />` (`next-sanity/live`) serve cached content and
  revalidate it the moment something is published. In Draft Mode (entered
  automatically from Presentation) they show drafts with click-to-edit overlays.
- `SANITY_API_READ_TOKEN` is a viewer-role token; it's what lets the preview read
  drafts. Without it the site still works and shows published content.
- Deploying: add your production URL as a CORS origin (with credentials) in
  sanity.io/manage, and set the same env vars on the host.
- **Listings live in Sanity** — adding, editing, selling or hiding one needs no
  deploy. `lib/properties/api.ts` is the only place the site reads them from;
  everything is cached under the `properties` and `property:<slug>` tags with a
  10-minute life, and the Studio webhook at `/api/revalidate` expires exactly
  what changed. Drafts and listings set to *Hidden* never reach the front end.
  See [docs/CMS.md](docs/CMS.md).
- Prices are stored and calculated in **USD** — listings, the concierge's budget
  bands and every mortgage sum. The header picker is a display layer only: rates
  are fetched once an hour on the server (free, keyless providers; override with
  `FX_API_URL`), handed to the browser as a small table, and `Intl.NumberFormat`
  does the formatting. The choice is kept in a `preferred_currency` cookie, read
  during SSR so the first paint is already right. If every provider is
  unreachable the site falls back to the last cached rates, then to USD.
- Icons are [lucide](https://lucide.dev) (`lucide-react`), imported one at a time
  so only what's used ships. Weight and the shared stroke live in
  [lib/icons.ts](lib/icons.ts); icons inherit `currentColor` and are
  `aria-hidden` inside any control that already has an `aria-label`.
- The palette, fonts, container width and the two breakpoints live as
  `@theme` tokens in `app/globals.css`. `mobile:` and `tablet:` are custom variants
  matching the original `@media (max-width: 780px / 1080px)` rules.
- The eight scene illustrations are inline SVG; their gradients are defined once in
  `<SceneDefs />`.
