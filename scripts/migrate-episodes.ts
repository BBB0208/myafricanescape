/* ============================================================
   Folds the Episodes page into Lifestyle.

   · its hero becomes the Event calendar's own section head, so
     Lifestyle keeps a single hero at the top
   · the Event calendar and the "Private viewings" section move
     across, in order, to the end of Lifestyle
   · the Episodes nav pill is removed and the page is deleted
   · /episodes and /events redirect to /lifestyle (next.config.ts)

   Safe to re-run: it stops if Lifestyle already has an Event
   calendar. Nothing is deleted until the move has committed.

   npm run migrate:episodes
   (sanity exec scripts/migrate-episodes.ts --with-user-token)
   ============================================================ */

import { randomUUID } from "node:crypto";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2025-09-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

const EPISODES = "page-events";
const LIFESTYLE = "page-lifestyle";

type Span = { text?: string };
type PortableBlock = { children?: Span[] };
type Block = { _key: string; _type: string; [field: string]: unknown };
type Page = { _id: string; pageBuilder?: Block[] } | null;
type Settings = { _id: string; navigation?: { _key: string; page?: { _ref?: string } }[] } | null;

/* "Launches, previews" + "and the odd good party." → one line. */
const flatten = (value: unknown): string =>
  Array.isArray(value)
    ? (value as PortableBlock[])
        .map((block) => (block.children ?? []).map((child) => child.text ?? "").join(""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    : "";

async function main() {
  const [episodes, lifestyle, settings] = await Promise.all([
    client.fetch<Page>(`*[_id == $id][0]{ _id, pageBuilder }`, { id: EPISODES }),
    client.fetch<Page>(`*[_id == $id][0]{ _id, pageBuilder }`, { id: LIFESTYLE }),
    client.fetch<Settings>(`*[_id == "siteSettings"][0]{ _id, navigation }`),
  ]);

  if (!lifestyle) throw new Error(`No ${LIFESTYLE} document — nothing to move into.`);

  const alreadyMoved = (lifestyle.pageBuilder ?? []).some((b) => b._type === "eventList");
  if (alreadyMoved) {
    console.log("Lifestyle already has an Event calendar — nothing to do.");
    return;
  }
  if (!episodes) {
    console.log(`No ${EPISODES} document — nothing to move.`);
    return;
  }

  const blocks = episodes.pageBuilder ?? [];

  /* Episodes became a page of its own again, around the trailer —
     folding it away would delete that */
  if (blocks.some((b) => b._type === "episodeReel")) {
    console.log("The Episodes page has its own Episode reel — it stays a page. Nothing to do.");
    return;
  }
  const hero = blocks.find((b) => b._type === "hero");
  const rest = blocks.filter((b) => b._type !== "hero");
  if (!rest.length) throw new Error("The Episodes page has nothing but a hero — stopping.");

  /* the hero's words become the section head of whatever came first
     after it, which is the Event calendar */
  const moved: Block[] = rest.map((block, i) => {
    const next: Block = { ...block, _key: key() };
    if (i === 0 && hero) {
      const title = flatten(hero.title);
      const aside = flatten(hero.lede);
      if (hero.eyebrow) next.eyebrow = hero.eyebrow;
      if (title) next.title = title;
      if (aside) next.aside = aside;
    }
    return next;
  });

  console.log(`Moving ${moved.length} section(s) to Lifestyle:`);
  for (const block of moved) console.log(`  · ${block._type}${block.title ? ` — ${block.title}` : ""}`);

  /* 1. add them to Lifestyle and drop the nav pill, together */
  const tx = client.transaction();
  tx.patch(LIFESTYLE, (p) => p.setIfMissing({ pageBuilder: [] }).append("pageBuilder", moved));

  const navItem = (settings?.navigation ?? []).find((item) => item.page?._ref === EPISODES);
  if (settings && navItem) {
    tx.patch(settings._id, (p) => p.unset([`navigation[_key=="${navItem._key}"]`]));
    console.log("Removing the Episodes nav pill.");
  }
  await tx.commit({ visibility: "sync" });

  /* 2. only once that landed, retire the page itself */
  await client.delete(EPISODES).catch((error: unknown) => {
    console.warn(`Could not delete ${EPISODES} — remove it in the Studio.`, error);
  });
  await client.delete(`drafts.${EPISODES}`).catch(() => {});
  console.log(`Deleted ${EPISODES}.`);

  console.log("\nDone. /episodes and /events now redirect to /lifestyle (next.config.ts).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
