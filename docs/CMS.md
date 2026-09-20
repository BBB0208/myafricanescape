# Managing listings

Listings live in Sanity. Adding, editing, selling or hiding one is done in the
Studio — no code change, no deploy.

---

## For the team: adding a listing

1. Open the Studio at **`/studio`** on the site (e.g. `https://…/studio`) and sign in.
2. In the left-hand list choose **Listings**, then **＋** to start a new one.
3. Fill in the **Listing** tab:
   - **Property name** — how it appears on cards and on its own page.
   - **Web address** — press **Generate** next to the field. This becomes
     `/property/your-listing-name`. Changing it later changes the link, so set it once.
   - **Status** — *Available*, *Reserved*, *Sold*, or *Hidden*.
   - **Price** — a plain number, in **US dollars**. No `$`, no commas.
     Visitors see it converted into their own currency automatically, so never
     type a local-currency figure here.
   - **Property type**, **Bedrooms**, and optionally **Bathrooms** and **Internal area**.
   - **Neighbourhood, city** and **Country**, plus the **Region** (May uses it when
     someone searches by region).
   - **Highlight** — one short selling point, e.g. "Ocean-facing".
   - **One-line summary** — a sentence. It sits under the name on the listing's page
     and becomes its Google description.
   - **Description** — the longer write-up.
   - **Features** — type each one and press Enter: *Private pool*, *Ocean view*, …
4. Open the **Photos** tab: set the **Main photo or artwork**, and add **More photos**
   for the frames visitors page through. Leave a photo out and the listing falls back
   to its scene illustration.
5. *(Optional)* The **Search & sharing** tab overrides the Google/social text. Left
   empty, the name and summary above are used.
6. Press **Publish**.

The listing appears on the site within a few seconds if the webhook below is
configured, and within ten minutes regardless.

### Selling, reserving, removing

- **Reserved / Sold** — set **Status**. The listing stays on the site with a label
  over its photo, and its web address keeps working. This is the normal choice:
  it protects the link and anyone who bookmarked it.
- **Hidden** — takes the listing off the site entirely (grids, its own page,
  the sitemap, May) without deleting anything. Its address starts returning
  *Page not found*.
- **Unpublish** (the Studio's own button) does the same as Hidden.
- Only **delete** a listing if it was created by mistake.

---

## Switchable pictures on an Editorial section

The tags under an Editorial section can become buttons that change the picture
beside it — the Lifestyle page's *Private chefs / Chauffeur network / Art
advisory / Wellness retreats* row, for example.

1. Open the page in the Studio and find the **Editorial** section.
2. Scroll to **Switchable images** and press **Add item** for each button:
   - **Button label** — what visitors click, e.g. *Private chefs*.
   - **Main picture** — shown the moment that label is selected.
   - **More pictures** — optional. Add as many as you like and visitors can page
     through them with the `<< >>` buttons on the image, without leaving that
     label. A counter shows where they are, e.g. *02 / 04*.
3. Publish.

Each label keeps its own set of pictures, and every change cross-dissolves.
Switching label always starts again at that label's main picture. The first item
is what visitors see when the section loads. Leave **Switchable
images** empty and the section behaves exactly as before: the plain **Tags** are
shown and the single **Artwork** stays put. Once you add switchable images the
plain tags are no longer used, so you can clear them.

Every picture is sent with the page, so switching is instant — nothing loads when
a visitor clicks. Keep it to about six; more than that crowds the row.

Arrow keys move between the labels, and Home and End jump to the ends, so the
row works without a mouse.

---

## Rotating hero images

The **Hero** section takes more than one background:

1. **Background image** — the main one, shown first.
2. **More background images** — add as many as you like and the hero cross-fades
   through them, starting with the main one.
3. **Seconds per image** — how long each one holds. It appears once you've added
   a second image.

Leave *More background images* empty for a single still image, as before. The
first image still loads as the page's main image, so adding more doesn't slow
the page down; the rest load afterwards. Visitors who ask their device for
reduced motion see the first image only, held still.

---

## Paging through images

Anywhere the site shows more than one picture, visitors get the same `<< >>`
pill and a counter:

| Where | Controls |
| --- | --- |
| Listing cards | `<< >>` on the card |
| A listing's own page | `<< >>` plus `FRAME 01 / 03` |
| Editorial switchable images | `<< >>` plus `01 / 04` on the picture |
| Hero backgrounds | `<< >>` plus `01 / 03`, bottom right |

Those `<<` and `>>` are lucide icons, not typed characters, so they stay sharp at
any size and match everywhere they appear.

The hero also rotates on its own. The moment someone uses its arrows the timer
stops for the rest of the visit, so it never moves under them.

---

## Folding Episodes into Lifestyle (one-off)

Episodes is now part of Lifestyle. If you are setting up a fresh dataset the
seed already builds it that way; an existing dataset is migrated once:

```bash
npm run migrate:episodes
```

It moves the Event calendar and the "Private viewings" section to the end of
Lifestyle, turns the old Episodes hero into the Event calendar's own heading
(so Lifestyle keeps a single hero at the top), removes the Episodes nav pill and
deletes the page. It is safe to re-run — it stops if Lifestyle already has an
Event calendar.

`/episodes` and `/events` redirect to `/lifestyle`, so old links and anything
already indexed keep working.

**Order matters:** deploy the code first, then run the migration. That way the
redirect is already live when the page disappears and nobody meets a 404.

---

## Episode reel (video)

A full-width player. Add an **Episode reel** section to a page, then add an
episode for each film:

- **Episode name** — printed between the `<< >>` buttons, e.g. *Episodes*, or
  *Episode 01*.
- **YouTube or Vimeo link** — paste the link from the address bar. YouTube,
  youtu.be, Shorts and Vimeo links all work.
- **Or upload a video** — an MP4 plays everywhere. If both are filled in, the
  uploaded file wins.
- **Still image** — shown until someone presses play. Worth adding: it is what
  Google and anyone on a slow connection sees, and it is all that shows if the
  video ever fails.

With one episode the bar is just the name; with several, `<< >>` move between
them. Changing episode stops whatever was playing.

**Nothing loads from YouTube or Vimeo until a visitor presses play** — no video,
no thumbnail, no cookie. YouTube is served from its no-cookie domain. That keeps
the page fast and avoids needing a cookie banner for it.

**Play uploaded videos automatically** turns an uploaded video into a silent
looping showreel. It keeps its controls so it can be paused, and anyone whose
device asks for reduced motion sees the still image instead. Linked videos never
auto-play — YouTube and Vimeo do not allow it without sound.

### A section with no picture

The Editorial section's **Artwork position** now has a third choice, **No
picture — copy across the full width**. Use it when a section should be words
only, for instance above an Episode reel.

---

## For developers: configuration

### Environment variables

| Variable | Where | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | build + runtime | public |
| `NEXT_PUBLIC_SANITY_DATASET` | build + runtime | public, `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | build + runtime | public |
| `NEXT_PUBLIC_SITE_URL` | build + runtime | canonical URLs, sitemap |
| `SANITY_API_READ_TOKEN` | runtime, **server only** | viewer role; Draft Mode and Presentation |
| `SANITY_REVALIDATE_SECRET` | runtime, **server only** | the webhook below |

Set all of them in **Vercel → Project → Settings → Environment Variables**. The two
server-only values must *not* be prefixed `NEXT_PUBLIC_`, or they would be inlined
into the browser bundle.

Generate the webhook secret with:

```bash
openssl rand -base64 32
```

### The revalidation webhook

Without it the site still picks changes up on its own within ten minutes. With it,
a publish is live in seconds.

In **sanity.io/manage → API → Webhooks → Create webhook**:

```
Name:        Listing revalidation
URL:         https://<your-domain>/api/revalidate
Dataset:     production
Trigger on:  Create, Update, Delete
Filter:      _type == "property"
Projection:  {_type, "slug": slug.current, "previousSlug": before().slug.current}
HTTP method: POST
API version: v2025-09-01
Secret:      <the same value as SANITY_REVALIDATE_SECRET>
```

The projection matters: `previousSlug` lets a renamed listing expire its old
address as well as its new one.

**Authentication.** Sanity signs the body and sends the signature in the
`sanity-webhook-signature` header. The route verifies it with `@sanity/webhook`
against `SANITY_REVALIDATE_SECRET`. A missing or wrong signature gets `401`;
an unset secret gets `500` and no revalidation. `GET /api/revalidate` is a health
check that returns whether the secret is configured — it reveals nothing else.

**What it clears.** Only the listing caches:

| Change | Tags expired |
| --- | --- |
| any listing created, edited or deleted | `properties` (grids, stat counters, sitemap) |
| a listing edited | `property:<slug>` (its own page) |
| a listing renamed | `property:<new-slug>` **and** `property:<old-slug>` |

Plus `revalidatePath("/sitemap.xml")`. Nothing else on the site is touched.

### How the data flows

```
Sanity  →  lib/properties/api.ts  →  Next.js cache (tagged, 10-min life)  →  UI
                                            ↑
                              /api/revalidate expires tags on publish
```

`lib/properties/api.ts` is the only place the site reads the inventory.
Components call `getProperties()`, `getPropertiesByIds()`, `getPropertyBySlug()`
or `getPropertySlugs()` — never a GROQ query of their own. The GROQ itself lives
in `sanity/lib/queries.ts` so `npm run typegen` keeps the types in step.

Drafts and hidden listings are excluded in the query (`status != "hidden"`), and
the client reads with `perspective: "published"`, so neither can leak. In Draft
Mode the layer steps aside for `sanityFetch`, which is what Presentation needs to
show unpublished edits.

If Sanity is unreachable the layer logs the error server-side and returns an empty
list (or `null` for a single listing), so the page renders its empty state instead
of failing.

### After changing the schema

```bash
npm run typegen     # re-extract the schema and regenerate sanity/types.ts
npm run lint        # tsc --noEmit
npm run build
```
