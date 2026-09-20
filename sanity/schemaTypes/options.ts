/* Option lists shared by the schema and the site. Plain data only, so the
   front end can import it without pulling in the Studio. */

export const SCENES = [
  "skyline",
  "riad",
  "coast",
  "savanna",
  "vineyard",
  "desert",
  "river",
  "lake",
] as const;
export type SceneName = (typeof SCENES)[number];

export const SCENE_OPTIONS = SCENES.map((value) => ({
  title: value[0].toUpperCase() + value.slice(1),
  value,
}));

export const TONES = ["cream", "teal", "sunset"] as const;
export type Tone = (typeof TONES)[number];

export const TONE_OPTIONS = [
  { title: "Cream", value: "cream" },
  { title: "Deep teal", value: "teal" },
  { title: "Sunset gradient", value: "sunset" },
];

/* Order here is the order May offers regions in. */
export const REGIONS = [
  "East Africa",
  "West Africa",
  "North Africa",
  "Southern Africa",
  "Central Africa",
] as const;

export const PROPERTY_TYPES = [
  "Villa",
  "Penthouse",
  "Apartment",
  "Estate",
  "Riad",
  "Townhouse",
  "Beach House",
] as const;

export const CURRENCIES = ["USD", "EUR", "GBP", "ZAR", "KES", "NGN", "GHS", "MAD", "EGP"];

/* Where a listing stands. "hidden" takes it off the public site without
   deleting it, so the document (and its URL) survives. Anything else is
   public: sold and reserved listings keep their page and their address. */
export const LISTING_STATUSES = [
  { title: "Available", value: "available" },
  { title: "Reserved", value: "reserved" },
  { title: "Sold", value: "sold" },
  { title: "Hidden (off the public site)", value: "hidden" },
] as const;

export type ListingStatus = (typeof LISTING_STATUSES)[number]["value"];

/* The short word printed on a card for anything no longer available. */
export const STATUS_LABEL: Record<string, string> = {
  reserved: "Reserved",
  sold: "Sold",
};

/* Header nav pill colours (see the @theme tokens in app/globals.css). */
export const NAV_COLORS = [
  { title: "Grape", value: "grape" },
  { title: "Saffron", value: "saffron" },
  { title: "Jungle", value: "jungle" },
  { title: "Flame", value: "flame" },
  { title: "Ink", value: "ink" },
];

export const BUTTON_VARIANTS = [
  { title: "Primary (sunset)", value: "primary" },
  { title: "Ghost (light outline, for dark grounds)", value: "ghost" },
  { title: "Outline (dark, for light grounds)", value: "default" },
];
