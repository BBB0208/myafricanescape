/* ============================================================
   Seeds the Sanity dataset with the full Amara Estates site:
   site settings, four page-builder pages, 14 listings, 6 events.

   Idempotent — every document has a fixed _id and is written with
   createOrReplace, so re-running resets the content to this seed.

   npm run seed   (sanity exec scripts/seed.ts --with-user-token)
   ============================================================ */

import { randomUUID } from "node:crypto";
import { getCliClient } from "sanity/cli";
import { MORE_SCENES } from "./scenes";

const client = getCliClient({ apiVersion: "2025-09-01" });

/* ---------- helpers ---------- */

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type Span = string | { text: string; marks: string[] };
const em = (text: string): Span => ({ text, marks: ["em"] });
const strong = (text: string): Span => ({ text, marks: ["strong"] });

function block(...parts: Span[]) {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    markDefs: [],
    children: parts.map((part) =>
      typeof part === "string"
        ? { _type: "span", _key: key(), text: part, marks: [] }
        : { _type: "span", _key: key(), ...part },
    ),
  };
}

const ref = (id: string) => ({ _type: "reference", _ref: id });
const art = (scene: string) => ({ _type: "art", scene });

const toPage = (id: string, anchor?: string) => ({
  _type: "link",
  linkType: "internal",
  page: ref(id),
  ...(anchor ? { anchor } : {}),
});
const toAnchor = (anchor: string) => ({ _type: "link", linkType: "anchor", anchor });
const toMay = () => ({ _type: "link", linkType: "concierge" });

type Link = ReturnType<typeof toPage> | ReturnType<typeof toAnchor> | ReturnType<typeof toMay>;

const button = (label: string, variant: string, link: Link) => ({
  _type: "button",
  _key: key(),
  label,
  variant,
  link,
});
const headerCta = (label: string, link: Link) => ({
  _type: "button",
  label,
  variant: "primary",
  link,
});

const section = <T extends Record<string, unknown>>(type: string, fields: T) => ({
  _type: type,
  _key: key(),
  ...fields,
});

/* ---------- ids ---------- */

const PAGE_IDS = {
  home: "page-home",
  lifestyle: "page-lifestyle",
  financial: "page-financial",
  events: "page-events",
};

/* ---------- listings ---------- */

const REGION_BY_COUNTRY: Record<string, string> = {
  "South Africa": "Southern Africa",
  Morocco: "North Africa",
  Egypt: "North Africa",
  Nigeria: "West Africa",
  Ghana: "West Africa",
  Kenya: "East Africa",
  Tanzania: "East Africa",
  Rwanda: "East Africa",
  Uganda: "East Africa",
};

type Listing = {
  name: string;
  city: string;
  country: string;
  type: string;
  price: number;
  beds: number;
  tag: string;
};

const LISTINGS: Listing[] = [
  { name: "The Kloof House", city: "Camps Bay, Cape Town", country: "South Africa", type: "Villa", price: 1850000, beds: 5, tag: "Ocean-facing" },
  { name: "Marrakech Riad Amara", city: "Medina, Marrakech", country: "Morocco", type: "Riad", price: 620000, beds: 4, tag: "Restored 1920s" },
  { name: "Lekki Lagoon Penthouse", city: "Lekki, Lagos", country: "Nigeria", type: "Penthouse", price: 940000, beds: 3, tag: "Skyline views" },
  { name: "Karen Acacia Estate", city: "Karen, Nairobi", country: "Kenya", type: "Estate", price: 1250000, beds: 6, tag: "2-acre grounds" },
  { name: "Zanzibar Stone Villa", city: "Stone Town, Zanzibar", country: "Tanzania", type: "Beach House", price: 780000, beds: 4, tag: "Private beach" },
  { name: "Cantonments Townhouse", city: "Cantonments, Accra", country: "Ghana", type: "Townhouse", price: 410000, beds: 3, tag: "Gated compound" },
  { name: "Sandton Sky Residence", city: "Sandton, Johannesburg", country: "South Africa", type: "Penthouse", price: 990000, beds: 3, tag: "Rooftop pool" },
  { name: "Nile Corniche Apartment", city: "Zamalek, Cairo", country: "Egypt", type: "Apartment", price: 365000, beds: 2, tag: "River views" },
  { name: "Kigali Hills Villa", city: "Nyarutarama, Kigali", country: "Rwanda", type: "Villa", price: 560000, beds: 4, tag: "New build" },
  { name: "Diani Coast Bungalow", city: "Diani Beach", country: "Kenya", type: "Beach House", price: 495000, beds: 3, tag: "Steps to sand" },
  { name: "Constantia Wine Estate", city: "Constantia, Cape Town", country: "South Africa", type: "Estate", price: 2650000, beds: 7, tag: "Working vineyard" },
  { name: "Victoria Island Loft", city: "Victoria Island, Lagos", country: "Nigeria", type: "Apartment", price: 340000, beds: 2, tag: "Design-led" },
  { name: "Essaouira Ocean Riad", city: "Essaouira", country: "Morocco", type: "Riad", price: 295000, beds: 3, tag: "Rooftop terrace" },
  { name: "Entebbe Lakeside Villa", city: "Entebbe, Kampala", country: "Uganda", type: "Villa", price: 430000, beds: 4, tag: "Lake Victoria frontage" },
];

/* The scene each listing was drawn with on the original site. */
function sceneFor(p: Listing): string {
  if (["Nigeria", "South Africa"].includes(p.country) && ["Penthouse", "Apartment"].includes(p.type)) return "skyline";
  if (p.type === "Riad") return "riad";
  if (p.type === "Beach House") return "coast";
  if (p.name.includes("Constantia")) return "vineyard";
  if (p.country === "Egypt") return "river";
  if (p.country === "Uganda") return "lake";
  if (p.type === "Estate" || p.type === "Villa") return "savanna";
  return "desert";
}

const properties = LISTINGS.map((p, i) => {
  const slug = slugify(p.name);
  return {
    _id: `property-${slug}`,
    _type: "property",
    name: p.name,
    slug: { _type: "slug", current: slug },
    price: p.price,
    currency: "USD",
    type: p.type,
    beds: p.beds,
    city: p.city,
    country: p.country,
    region: REGION_BY_COUNTRY[p.country],
    tag: p.tag,
    art: art(sceneFor(p)),
    gallery: MORE_SCENES[sceneFor(p)].map((scene) => ({ ...art(scene), _key: key() })),
    ...(p.name === "Marrakech Riad Amara" ? { badge: "EPISODES" } : {}),
    sortOrder: (i + 1) * 10,
  };
});

/* ---------- events ---------- */

const EVENTS = [
  { date: "2026-09-14", city: "Cape Town, South Africa", title: "Constantia Estate — Harvest Preview", description: "A first look at the newly listed Constantia Wine Estate, with a tasting led by the estate's own cellar master." },
  { date: "2026-10-02", city: "Lagos, Nigeria", title: "Lekki Lagoon Penthouse — Launch Night", description: "The official opening of Amara's newest Lagos listing, with skyline views and a set from a Lagos-based DJ." },
  { date: "2026-10-18", city: "Marrakech, Morocco", title: "Riad Restoration Walkthrough", description: "Meet the ateliers behind the Marrakech Riad Amara restoration — zellige tilework, cedar carving and courtyard design." },
  { date: "2026-11-09", city: "Nairobi, Kenya", title: "Amara Owners' Circle — East Africa", description: "A seated dinner for current owners across Kenya, Tanzania, Rwanda and Uganda, hosted at Karen Acacia Estate." },
  { date: "2026-11-27", city: "Accra, Ghana", title: "Financing Desk — Open Clinic", description: "Drop-in sessions with Amara's financing team on cross-border mortgages and developer payment plans." },
  { date: "2026-12-12", city: "Zanzibar, Tanzania", title: "Stone Town Villa — Sunset Preview", description: "An evening viewing of the Zanzibar Stone Villa, timed to the sunset over Stone Town's harbour." },
];

const events = EVENTS.map((e) => ({
  _id: `event-${slugify(e.title)}`,
  _type: "event",
  ...e,
}));

/* ---------- pages ---------- */

const home = {
  _id: PAGE_IDS.home,
  _type: "page",
  title: "Property",
  slug: { _type: "slug", current: "home" },
  footerNote: "Property is illustrative demo content.",
  pageBuilder: [
    section("hero", {
      eyebrow: "Bespoke property, continent-wide",
      title: [block("Africa, in ", em("Technicolor"), "."), block("Find home in full saturation.")],
      lede: [
        block(
          "My African Escape curates villas, penthouses and estates across the continent — from Cape Town vineyards to Lagos skylines — with a private search led by ",
          strong("May"),
          ", our AI concierge.",
        ),
      ],
      buttons: [
        button("Ask May to find a property", "primary", toMay()),
        button("Browse the current reel", "ghost", toAnchor("listings")),
      ],
      art: art("skyline"),
      size: "full",
      showReelStrip: true,
    }),
    section("statsBar", {
      tone: "teal",
      stats: [
        { _key: key(), _type: "stat", kind: "listingCount", label: "CURRENT LISTINGS" },
        { _key: key(), _type: "stat", kind: "custom", value: "11", label: "COUNTRIES" },
        { _key: key(), _type: "stat", kind: "custom", value: "$2.1M", label: "TOP LISTING" },
        { _key: key(), _type: "stat", kind: "custom", value: "24/7", label: "MAY, ON CALL" },
      ],
    }),
    section("listingGrid", {
      eyebrow: "The current reel",
      title: "Fourteen frames, eleven countries.",
      aside:
        "Every listing is vetted and shot in-context — no stock photography, no filler. Ask May to filter by budget, type or region.",
      source: "all",
      showSceneTags: false,
      tone: "cream",
      anchorId: "listings",
    }),
    section("featureList", {
      eyebrow: "Why Amara",
      title: "Buying property on a new continent shouldn't feel like guesswork.",
      tone: "teal",
      items: [
        { title: "One advisor, every border", body: "A single Amara advisor follows you from Marrakech to Nairobi — no re-explaining your brief to a new agent in every country." },
        { title: "May, your AI concierge", body: "May reads your budget and lifestyle brief and matches it against live inventory across Africa in seconds, day or night." },
        { title: "Financing, demystified", body: "Our mortgage calculator and financing desk translate cross-border lending into a number you can actually plan around." },
        { title: "Title & transfer, handled", body: "Local legal partners in every market we operate in, so the paperwork moves as fast as the decision did." },
      ].map((item) => ({ _key: key(), _type: "feature", ...item })),
    }),
    section("ctaBanner", {
      // a May call to action — switch "Hide this section" off once May is on
      hidden: true,
      eyebrow: "Ready when you are",
      title: "Tell May your number. She'll find the frame.",
      buttons: [button("Start a search with May", "ghost", toMay())],
      tone: "sunset",
    }),
  ],
  seo: {
    _type: "seo",
    metaDescription:
      "Bespoke villas, penthouses and estates across Africa — from Cape Town vineyards to Lagos skylines — with a private search led by May, the Amara AI concierge.",
  },
};

const lifestyle = {
  _id: PAGE_IDS.lifestyle,
  _type: "page",
  title: "Lifestyle",
  slug: { _type: "slug", current: "lifestyle" },
  footerNote: "Property is illustrative demo content.",
  pageBuilder: [
    section("hero", {
      eyebrow: "Life, at full colour saturation",
      title: [block("Owning here is"), block("only the opening ", em("scene"), ".")],
      lede: [
        block(
          "Concierge, culture, cuisine and community — the Amara lifestyle desk is what turns a property into a life across Africa.",
        ),
      ],
      art: art("vineyard"),
      size: "tall",
      showReelStrip: true,
    }),
    section("editorial", {
      eyebrow: "Concierge",
      title: "A team that knows the difference between a fixer and a friend.",
      body: [
        block(
          "From private chefs in Zanzibar to gallery previews in Marrakech, your Amara concierge builds a black book specific to you — not a generic city guide.",
        ),
        block(
          "Members get first call on restaurant openings, art fairs and members' clubs, arranged directly through the app or a message to your advisor.",
        ),
      ],
      pills: ["Private chefs", "Chauffeur network", "Art advisory", "Wellness retreats"],
      art: art("coast"),
      artPosition: "left",
      tone: "cream",
    }),
    section("editorial", {
      eyebrow: "Community",
      title: "An address book that spans the continent.",
      body: [
        block(
          "Amara owners meet twice a year at a rotating gathering — Lagos one season, Cape Town the next — built for people whose lives now move between cities.",
        ),
        block(
          "It's introductions that matter: a Kigali-based owner meeting a Nairobi gallerist, a Marrakech host finding their next dinner-party guest in Accra.",
        ),
      ],
      pills: ["Owner dinners", "Cross-city intros", "Founders' circle"],
      art: art("savanna"),
      artPosition: "right",
      tone: "teal",
    }),
    section("editorial", {
      eyebrow: "Design & craft",
      title: "Interiors sourced from the block, not a catalogue.",
      body: [
        block(
          "Our design partners work with local ateliers — Moroccan zellige, Ghanaian kente weavers, Kenyan soapstone carvers — so every finished home is unmistakably of its place.",
        ),
        block(
          "Ask your advisor for a design consultation at the point of purchase; most owners move in fully furnished.",
        ),
      ],
      pills: ["Local ateliers", "Bespoke furnishing", "Turnkey move-in"],
      art: art("riad"),
      artPosition: "left",
      tone: "cream",
    }),
    section("cardGrid", {
      eyebrow: "What's included",
      title: "Every Amara membership",
      columns: 4,
      tone: "sunset",
      cards: [
        { scene: "skyline", title: "Advisor", body: "One point of contact, every market." },
        { scene: "desert", title: "Concierge", body: "On call for anything, day or night." },
        { scene: "lake", title: "Events", body: "Launches, previews and owner dinners." },
        { scene: "river", title: "Financing desk", body: "Cross-border mortgages, explained simply." },
      ].map(({ scene, ...card }) => ({ _key: key(), _type: "card", ...card, art: art(scene) })),
    }),
  ],
  seo: {
    _type: "seo",
    metaTitle: "Lifestyle",
    metaDescription:
      "Concierge, culture, cuisine and community — the Amara lifestyle desk turns a property into a life across Africa.",
  },
};

const financial = {
  _id: PAGE_IDS.financial,
  _type: "page",
  title: "Invest",
  slug: { _type: "slug", current: "invest" },
  footerNote: "Calculator provides estimates only, not a loan offer.",
  pageBuilder: [
    section("hero", {
      eyebrow: "Financing, in plain numbers",
      title: [block("Run the ", em("numbers")), block("before you run the search.")],
      lede: [
        block(
          "A straightforward mortgage calculator, tuned for cross-border buyers, plus what to expect from financing property across African markets.",
        ),
      ],
      art: art("desert"),
      size: "compact",
      showReelStrip: true,
    }),
    section("mortgageCalculator", {
      eyebrow: "Mortgage calculator",
      title: "What would this actually cost, monthly?",
      aside:
        "Adjust the price, deposit, rate and term — figures update instantly. Estimates only; your lender's offer will vary by market and profile.",
      defaultPrice: 780000,
      defaultDeposit: 25,
      defaultRate: 9.5,
      defaultTerm: 20,
      resultLabel: "Estimated monthly payment",
      note: "Rates vary widely by country — South Africa and Egypt trend lower, parts of East and West Africa trend higher. Speak to the financing desk for market-specific quotes.",
      tone: "cream",
      anchorId: "calculator",
    }),
    section("featureList", {
      eyebrow: "Financing routes",
      title: "Three ways Amara buyers typically fund a purchase.",
      tone: "teal",
      items: [
        { title: "Local bank mortgage", body: "Financing through a bank in the property's own country — usually the lowest rate, but requires local income proof or a larger deposit for non-residents." },
        { title: "International / offshore lending", body: "Specialist lenders who finance African property against income earned elsewhere — faster approval, typically a higher rate." },
        { title: "Developer payment plans", body: "On new-build listings, staged payments tied to construction milestones — no traditional mortgage required." },
      ].map((item) => ({ _key: key(), _type: "feature", ...item })),
    }),
    section("editorial", {
      eyebrow: "Currency & transfer",
      title: "All Amara listings are quoted in USD.",
      body: [
        block(
          "Most cross-border buyers settle in US dollars to keep pricing comparable market to market, then convert locally at completion. Your advisor will introduce a currency partner to lock in a transfer rate ahead of closing, so a swing in the exchange rate doesn't change your final number.",
        ),
        block(
          "Legal and transfer fees typically run 3–7% of the purchase price depending on country — your advisor provides an exact figure before you make an offer.",
        ),
      ],
      art: art("river"),
      artPosition: "left",
      tone: "cream",
    }),
  ],
  seo: {
    _type: "seo",
    metaTitle: "Invest",
    metaDescription:
      "A mortgage calculator tuned for cross-border buyers, plus the three ways Amara buyers typically finance property across African markets.",
  },
};

const eventsPage = {
  _id: PAGE_IDS.events,
  _type: "page",
  title: "Episodes",
  slug: { _type: "slug", current: "episodes" },
  footerNote: "Event dates are illustrative demo content.",
  pageBuilder: [
    section("hero", {
      eyebrow: "On location, across the continent",
      title: [block("Launches, previews"), block("and the odd good party.")],
      lede: [
        block(
          "Property launches, design previews and owner gatherings — RSVP through your advisor or drop your details below.",
        ),
      ],
      art: art("lake"),
      size: "compact",
      showReelStrip: true,
    }),
    section("eventList", {
      eyebrow: "Upcoming",
      title: "The next few months, on location.",
      aside: "Members get priority RSVP two weeks before public invites go out.",
      showPast: false,
      rsvpLabel: "RSVP",
      emptyMessage: "New dates are being scheduled — check back soon.",
      tone: "cream",
      anchorId: "calendar",
    }),
    section("editorial", {
      eyebrow: "Private viewings",
      title: "Want a listing shown to you alone, on your schedule?",
      body: [
        block(
          "Amara advisors arrange private walkthroughs outside the public calendar — in person or over video, anywhere on the continent.",
        ),
      ],
      buttons: [button("Ask May to arrange a viewing", "ghost", toMay())],
      art: art("savanna"),
      artPosition: "right",
      tone: "sunset",
    }),
  ],
  seo: {
    _type: "seo",
    metaTitle: "Episodes",
    metaDescription:
      "Property launches, design previews and owner gatherings across Africa — RSVP through your Amara advisor.",
  },
};

/* ---------- site settings ---------- */

const settings = {
  _id: "siteSettings",
  _type: "siteSettings",
  title: "My African Escape",
  homePage: ref(PAGE_IDS.home),
  wordmark: "My African",
  wordmarkTagline: "Escape",
  navigation: [
    { label: "Property", page: ref(PAGE_IDS.home), color: "grape" },
    { label: "Lifestyle", page: ref(PAGE_IDS.lifestyle), color: "saffron" },
    { label: "Invest", page: ref(PAGE_IDS.financial), color: "jungle" },
    { label: "Episodes", page: ref(PAGE_IDS.events), color: "flame" },
  ].map((item) => ({ _key: key(), _type: "navItem", ...item })),
  // opens May, so it stays hidden until concierge.enabled is switched on
  headerCta: headerCta("Ask May", toMay()),
  footer: {
    blurb:
      "Bespoke property, lifestyle, financing and events across the African continent. Shot in full saturation, chosen with care.",
    exploreHeading: "Explore",
    regionsHeading: "Regions",
    regions: ["Southern Africa", "East Africa", "West Africa", "North Africa"],
    contactHeading: "Contact",
    contactLines: ["hello@amaraestates.africa", "+27 21 555 0148", "Cape Town · Nairobi · Lagos"],
    copyright: "© 2026 My African Escape. All rights reserved.",
    defaultNote: "Property is illustrative demo content.",
  },
  concierge: {
    enabled: false,
    launcherTitle: "Ask May",
    launcherSubtitle: "Find a property in Africa",
    panelTitle: "MAY",
    panelSubtitle: "Amara AI Concierge",
    greeting: [
      block(
        "Hello — I'm ",
        strong("May"),
        ", your Amara property concierge. I can search live across our African portfolio. What's your budget in USD?",
      ),
    ],
    inputPlaceholder: "e.g. villa in Kenya under $600k",
    budgetBands: [
      { label: "Under $400k", min: 0, max: 400000 },
      { label: "$400k – $800k", min: 400000, max: 800000 },
      { label: "$800k – $1.5M", min: 800000, max: 1500000 },
      { label: "$1.5M+", min: 1500000 },
    ].map((band) => ({ _key: key(), _type: "budgetBand", ...band })),
    typeGroups: [
      { label: "Villa", types: ["Villa"] },
      { label: "Penthouse / Apartment", types: ["Penthouse", "Apartment"] },
      { label: "Beach House", types: ["Beach House"] },
      { label: "Estate", types: ["Estate", "Riad", "Townhouse"] },
    ].map((group) => ({ _key: key(), _type: "typeGroup", ...group })),
    anywhereLabel: "Anywhere in Africa",
    callbackMessage:
      "Lovely — leave a phone number or email below and an advisor will reach out within one business day.",
  },
  seo: {
    defaultTitle: "My African Escape — Bespoke Property Across Africa",
    description:
      "Bespoke property, lifestyle, investment and episodes across the African continent — curated by My African Escape.",
  },
};

/* ---------- write ---------- */

async function main() {
  const { projectId, dataset } = client.config();
  console.log(`Seeding ${projectId}/${dataset} …`);

  const docs: Array<{ _id: string; _type: string }> = [
    settings,
    home,
    lifestyle,
    financial,
    eventsPage,
    ...properties,
    ...events,
  ];
  const tx = client.transaction();
  for (const doc of docs) tx.createOrReplace(doc);
  await tx.commit({ visibility: "sync" });

  console.log(
    `Done: 1 settings, 4 pages, ${properties.length} listings, ${events.length} events (${docs.length} documents).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
