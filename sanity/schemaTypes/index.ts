import type { SchemaTypeDefinition } from "sanity";
import { cardGrid } from "./blocks/cardGrid";
import { ctaBanner } from "./blocks/ctaBanner";
import { editorial } from "./blocks/editorial";
import { eventList } from "./blocks/eventList";
import { featureList } from "./blocks/featureList";
import { hero } from "./blocks/hero";
import { listingGrid } from "./blocks/listingGrid";
import { mortgageCalculator } from "./blocks/mortgageCalculator";
import { statsBar } from "./blocks/statsBar";
import { event } from "./documents/event";
import { page } from "./documents/page";
import { property } from "./documents/property";
import { siteSettings } from "./documents/siteSettings";
import { art } from "./objects/art";
import { button } from "./objects/button";
import { link } from "./objects/link";
import { headline, simpleText } from "./objects/richText";
import { seo } from "./objects/seo";

export const schemaTypes: SchemaTypeDefinition[] = [
  // documents
  siteSettings,
  page,
  property,
  event,
  // page builder
  hero,
  statsBar,
  listingGrid,
  featureList,
  editorial,
  cardGrid,
  mortgageCalculator,
  eventList,
  ctaBanner,
  // objects
  link,
  button,
  art,
  headline,
  simpleText,
  seo,
];

/* Documents that exist exactly once. */
export const SINGLETONS = new Set(["siteSettings"]);
