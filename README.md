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
  studio/[[...tool]]/        the embedded Sanity Studio
  api/draft-mode/            enable (used by Presentation) / disable
components/
  PageBuilder.tsx            maps page sections to blocks/*
  blocks/                    one component per section type
  May.tsx                    the concierge, fed by Sanity
sanity/
  schemaTypes/               documents, page-builder blocks, shared objects
  lib/                       client, live (sanityFetch / SanityLive), queries, image
  presentation/resolve.ts    Presentation locations + main documents
  structure.ts               Studio desk structure (Site settings singleton)
scripts/seed.ts              the seed content
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
- The palette, fonts, container width and the two breakpoints live as
  `@theme` tokens in `app/globals.css`. `mobile:` and `tablet:` are custom variants
  matching the original `@media (max-width: 780px / 1080px)` rules.
- The eight scene illustrations are inline SVG; their gradients are defined once in
  `<SceneDefs />`.
