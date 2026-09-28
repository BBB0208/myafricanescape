/* ============================================================
   The "MAE web updates 2" content changes, applied to an
   existing dataset:

   · Episodes becomes the trailer alone (PDF page 2). The
     "Launches, previews" hero, the Event calendar and
     "Private viewings" move, in order, to the end of
     Lifestyle (page 4); the hero stays a banner over the
     calendar there. The reel loses its aside, gains its
     << Episodes >> label, and the page's footer note and
     description stop talking about events.
   · Lifestyle's Community tags become switchable pictures,
     like the sections either side of it (page 1), each with
     two or three photos from the uploaded photography so
     << >> has something to page through. Swap them in the
     Studio whenever the team supplies its own.
   · Site settings gets the YouTube channel behind the trailer.

   Safe to re-run: each step checks whether it has already
   happened. Both pages change in one transaction, so nothing
   is ever on neither page or on both. It stops if either page
   has an unpublished draft, rather than overwrite or ignore it.

   npm run migrate:web-updates        apply
   npx sanity exec scripts/migrate-web-updates.ts --with-user-token -- --dry-run
                                      only show the plan
   ============================================================ */

import { randomUUID } from "node:crypto";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-09-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const DRY_RUN = process.argv.includes("--dry-run");

const EPISODES = "page-events";
const LIFESTYLE = "page-lifestyle";
const YOUTUBE = "https://www.youtube.com/@MyAfricanEscape-SA";

/* Community's pictures, by uploaded file name. The first of each is
   the one shown when its button is pressed. */
const COMMUNITY: Record<string, { file: string; alt: string }[]> = {
  "Owner dinners": [
    { file: "nile-corniche-apartment-03.webp", alt: "A dining room laid for an owners' dinner" },
    { file: "the-kloof-house-09.webp", alt: "A long dining table set in an open-plan kitchen" },
  ],
  "Cross-city intros": [
    { file: "the-kloof-house-02.webp", alt: "A terrace looking out over the city to the ocean" },
    { file: "the-kloof-house-03.webp", alt: "Wicker chairs on a covered deck above the city" },
    { file: "sandton-sky-residence-01.webp", alt: "A residence and pool in Sandton, Johannesburg" },
  ],
  "Founders' circle": [
    { file: "nile-corniche-apartment-01.webp", alt: "A lounge arranged for a small gathering" },
    { file: "nile-corniche-apartment-02.webp", alt: "A sofa suite under warm gallery lighting" },
    { file: "nile-corniche-apartment-05.webp", alt: "A lounge with a feature wall and low lighting" },
  ],
};
/* a tag not listed above starts on an illustration */
const FALLBACK_SCENES = ["skyline", "lake", "coast", "desert"];

type Block = { _key: string; _type: string; [field: string]: unknown };
type Page = { _id: string; _rev: string; pageBuilder?: Block[]; footerNote?: string } | null;
type Settings = { _id: string; _rev: string; social?: { youtube?: string } } | null;

async function main() {
  const { projectId, dataset } = client.config();
  console.log(`${DRY_RUN ? "Dry run on" : "Updating"} ${projectId}/${dataset}\n`);

  const [episodes, lifestyle, settings, drafts] = await Promise.all([
    client.fetch<Page>(`*[_id == $id][0]{ _id, _rev, pageBuilder, footerNote }`, { id: EPISODES }),
    client.fetch<Page>(`*[_id == $id][0]{ _id, _rev, pageBuilder, footerNote }`, { id: LIFESTYLE }),
    client.fetch<Settings>(`*[_id == "siteSettings"][0]{ _id, _rev, social }`),
    client.fetch<string[]>(`*[_id in $ids]._id`, {
      ids: [`drafts.${EPISODES}`, `drafts.${LIFESTYLE}`, "drafts.siteSettings"],
    }),
  ]);

  if (drafts.length) {
    throw new Error(
      `Unpublished changes on ${drafts.join(", ")}. Publish or discard them in the Studio, then run this again.`,
    );
  }
  if (!lifestyle) throw new Error(`No ${LIFESTYLE} document.`);

  const tx = client.transaction();
  let changes = 0;
  /* both Lifestyle changes go out as one patch, guarded by one revision */
  let toAppend: Block[] = [];
  const toSet: Record<string, unknown> = {};

  /* ---------- 1. Episodes → the trailer alone; the rest to Lifestyle ---------- */

  const episodeBlocks = episodes?.pageBuilder ?? [];
  const reels = episodeBlocks.filter((b) => b._type === "episodeReel");
  const leaving = episodeBlocks.filter((b) => b._type !== "episodeReel");
  const lifestyleBlocks = lifestyle.pageBuilder ?? [];

  if (!episodes) {
    console.log(`· No ${EPISODES} document — skipping the Episodes move.`);
  } else if (!reels.length) {
    throw new Error("The Episodes page has no Episode reel — refusing to strip it.");
  } else if (!leaving.length) {
    console.log("· Episodes is already the trailer alone.");
  } else if (lifestyleBlocks.some((b) => b._type === "eventList")) {
    throw new Error(
      "Lifestyle already has an Event calendar, and Episodes still has sections to move. Sort it out in the Studio first.",
    );
  } else {
    // fresh keys: a key is only unique within its own array
    const moved: Block[] = leaving.map((block) => ({ ...block, _key: key() }));
    console.log(`· Moving ${moved.length} section(s) from Episodes to the end of Lifestyle:`);
    for (const block of moved) console.log(`    ${block._type}${block.eyebrow ? ` — ${block.eyebrow}` : ""}`);

    toAppend = moved;

    const trailerOnly = reels.map((reel) => {
      const rest: Block = { ...reel, pagerLabel: reel.pagerLabel ?? "Episodes" };
      delete rest.aside;
      return rest;
    });
    tx.patch(EPISODES, (p) =>
      p
        .ifRevisionId(episodes._rev)
        .set({
          pageBuilder: trailerOnly,
          "seo.metaDescription":
            "Watch the My African Escape trailer — the homes, the cities and the people behind them, across the continent.",
        })
        // the event-dates note followed the calendar to Lifestyle
        .unset(["footerNote"]),
    );
    console.log("· Episodes keeps only its Episode reel (no aside, << Episodes >> under the player).");
    changes += 2;
  }

  /* ---------- 2. Community tags → switchable pictures ---------- */

  const community = lifestyleBlocks.find(
    (b) => b._type === "editorial" && typeof b.eyebrow === "string" && /community/i.test(b.eyebrow),
  );
  const pills = Array.isArray(community?.pills) ? (community.pills as string[]) : [];
  const hasViews = Array.isArray(community?.views) && (community.views as unknown[]).length > 0;

  if (!community) {
    console.log("· No Community section on Lifestyle — skipping its pictures.");
  } else if (hasViews) {
    console.log("· Community already has switchable pictures.");
  } else if (!pills.length) {
    console.log("· Community has no tags to turn into buttons.");
  } else {
    const files = Object.values(COMMUNITY).flat().map((photo) => photo.file);
    const assets = await client.fetch<{ _id: string; originalFilename: string }[]>(
      `*[_type == "sanity.imageAsset" && originalFilename in $files]{ _id, originalFilename }`,
      { files },
    );
    const assetId = new Map(assets.map((asset) => [asset.originalFilename, asset._id]));
    const photo = ({ file, alt }: { file: string; alt: string }) => {
      const id = assetId.get(file);
      return id
        ? { _type: "art", image: { _type: "image", asset: { _type: "reference", _ref: id }, alt } }
        : null;
    };

    let scene = 0;
    const views = pills.map((label) => {
      const [main, ...more] = (COMMUNITY[label] ?? []).map(photo).filter((art) => art !== null);
      const art = main ?? { _type: "art", scene: FALLBACK_SCENES[scene++ % FALLBACK_SCENES.length] };
      return {
        _key: key(),
        _type: "editorialView",
        label,
        art,
        ...(more.length ? { gallery: more.map((frame) => ({ ...frame, _key: key() })) } : {}),
      };
    });
    toSet[`pageBuilder[_key=="${community._key}"].views`] = views;
    console.log("· Community tags become switchable pictures:");
    for (const view of views) {
      const count = 1 + (view.gallery?.length ?? 0);
      const kind = "image" in view.art ? `${count} photo${count === 1 ? "" : "s"}` : "an illustration";
      console.log(`    ${view.label} — ${kind}`);
    }
    const missing = files.filter((file) => !assetId.has(file));
    if (missing.length) console.log(`    (not found, skipped: ${missing.join(", ")})`);
    changes += 1;
  }

  if (toAppend.length || Object.keys(toSet).length) {
    tx.patch(LIFESTYLE, (p) => {
      let patch = p.ifRevisionId(lifestyle._rev);
      if (Object.keys(toSet).length) patch = patch.set(toSet);
      if (toAppend.length) patch = patch.setIfMissing({ pageBuilder: [] }).append("pageBuilder", toAppend);
      return patch;
    });
  }

  /* ---------- 3. the YouTube channel ---------- */

  if (!settings) {
    console.log("· No Site settings document — skipping social links.");
  } else if (settings.social?.youtube) {
    console.log(`· YouTube is already set (${settings.social.youtube}).`);
  } else {
    tx.patch(settings._id, (p) =>
      p.ifRevisionId(settings._rev).setIfMissing({ social: {} }).set({ "social.youtube": YOUTUBE }),
    );
    console.log(`· Site settings → Social media → YouTube: ${YOUTUBE}`);
    changes += 1;
  }

  if (!changes) {
    console.log("\nNothing to do.");
    return;
  }
  if (DRY_RUN) {
    console.log("\nDry run — nothing written. Run without --dry-run to apply.");
    return;
  }

  await tx.commit({ visibility: "sync" });
  console.log("\nDone. /events now redirects to /lifestyle#calendar (next.config.ts).");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
