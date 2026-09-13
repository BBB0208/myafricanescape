/* ============================================================
   One-off migration for the "My African Escape" redesign.

   Patches the live dataset in place — the published documents plus
   any drafts of them — so other edits made in the Studio are kept.
   Safe to re-run.

   npm run migrate:redesign
   (sanity exec scripts/migrate-redesign.ts --with-user-token)
   ============================================================ */

import { randomUUID } from "node:crypto";
import { getCliClient } from "sanity/cli";
import { MORE_SCENES } from "./scenes";

const client = getCliClient({ apiVersion: "2025-09-01" });
const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

/* Nav labels and pill colours, keyed by the page each item points at. */
const NAV: Record<string, { label: string; color: string }> = {
  "page-home": { label: "Property", color: "grape" },
  "page-lifestyle": { label: "Lifestyle", color: "saffron" },
  "page-financial": { label: "Invest", color: "jungle" },
  "page-events": { label: "Episodes", color: "flame" },
};

/* Renamed pages: title, slug and meta title. */
const RENAMED: Record<string, string> = {
  "page-financial": "invest",
  "page-events": "episodes",
};

type Block = { _key: string; _type: string; lede?: Portable[]; hidden?: boolean };
type Portable = { children?: { text?: string }[] };
type Doc = {
  _id: string;
  _type: string;
  navigation?: { page?: { _ref: string } }[];
  pageBuilder?: Block[];
  art?: { scene?: string };
  gallery?: unknown[];
  badge?: string;
};

const baseId = (id: string) => id.replace(/^drafts\./, "");

async function main() {
  const { projectId, dataset } = client.config();
  console.log(`Migrating ${projectId}/${dataset} …`);

  const docs = await client.fetch<Doc[]>(
    `*[_type in ["siteSettings", "page", "property"]]`,
    {},
    { perspective: "raw" },
  );

  const tx = client.transaction();
  const log: string[] = [];

  for (const doc of docs) {
    const base = baseId(doc._id);

    /* ---------- site settings ---------- */
    if (doc._type === "siteSettings") {
      const navigation = (doc.navigation ?? []).map((item) => {
        const match = NAV[item.page?._ref ?? ""];
        return match ? { ...item, ...match } : item;
      });
      tx.patch(doc._id, (p) => p.setIfMissing({ concierge: {}, seo: {}, footer: {} }));
      tx.patch(doc._id, (p) =>
        p.set({
          title: "My African Escape",
          wordmark: "My African",
          wordmarkTagline: "Escape",
          navigation,
          headerCta: {
            _type: "button",
            label: "Ask May",
            variant: "primary",
            link: { _type: "link", linkType: "concierge" },
          },
          "concierge.enabled": false,
          "seo.defaultTitle": "My African Escape — Bespoke Property Across Africa",
          "seo.description":
            "Bespoke property, lifestyle, investment and episodes across the African continent — curated by My African Escape.",
          "footer.copyright": "© 2026 My African Escape. All rights reserved.",
        }),
      );
      log.push(`${doc._id}: brand, nav pills, header button, May switched off`);
    }

    /* ---------- pages ---------- */
    if (doc._type === "page") {
      tx.patch(doc._id, (p) => p.unset(["headerCta", "reelLabel"]));

      const slug = RENAMED[base];
      if (slug) {
        const title = slug[0].toUpperCase() + slug.slice(1);
        tx.patch(doc._id, (p) => p.setIfMissing({ seo: { _type: "seo" } }));
        tx.patch(doc._id, (p) =>
          p.set({ title, slug: { _type: "slug", current: slug }, "seo.metaTitle": title }),
        );
        log.push(`${doc._id}: renamed to ${title} (/${slug})`);
      }

      for (const block of doc.pageBuilder ?? []) {
        const path = `pageBuilder[_key=="${block._key}"]`;
        if (block._type === "listingGrid") {
          tx.patch(doc._id, (p) => p.set({ [`${path}.showSceneTags`]: false }));
        }
        // the home page's closing "Tell May your number" section only exists to
        // open May, so it's hidden while May is off (untouched if already set)
        if (base === "page-home" && block._type === "ctaBanner" && block.hidden === undefined) {
          tx.patch(doc._id, (p) => p.set({ [`${path}.hidden`]: true }));
          log.push(`${doc._id}: hid the May call-to-action section`);
        }
        if (base === "page-home" && block._type === "hero" && block.lede) {
          const lede = block.lede.map((b) => ({
            ...b,
            children: (b.children ?? []).map((c) =>
              typeof c.text === "string"
                ? { ...c, text: c.text.replace(/^Amara curates/, "My African Escape curates") }
                : c,
            ),
          }));
          tx.patch(doc._id, (p) => p.set({ [`${path}.lede`]: lede }));
        }
      }
    }

    /* ---------- listings ---------- */
    if (doc._type === "property") {
      const extra = MORE_SCENES[doc.art?.scene ?? ""];
      if (!doc.gallery?.length && extra) {
        tx.patch(doc._id, (p) =>
          p.set({ gallery: extra.map((scene) => ({ _type: "art", _key: key(), scene })) }),
        );
      }
      if (base === "property-marrakech-riad-amara" && !doc.badge) {
        tx.patch(doc._id, (p) => p.set({ badge: "EPISODES" }));
      }
    }
  }

  await tx.commit({ visibility: "sync" });
  log.forEach((line) => console.log(`  ${line}`));
  console.log(`Done — ${docs.length} documents checked.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
