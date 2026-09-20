/* ============================================================
   FX rates — server side only.

   One fetch per hour for the whole site, held in Next's data
   cache, then handed to the browser as a small table of props.
   No component ever calls a rate provider.

   Every provider below is free and needs no API key. If you would
   rather use a commercial feed, set FX_API_URL (and FX_API_KEY)
   and it is tried first; the free ones stay as the safety net.
   ============================================================ */

import { cache } from "react";
import { BASE_CURRENCY, CURRENCY_CODES } from "./currencies";
import { type ExchangeRates, type RateTable, USD_ONLY_RATES } from "./convert";

/* A property site does not need the minute — once an hour is
   generous, and the providers themselves publish daily. */
export const RATES_REVALIDATE_SECONDS = 60 * 60;
export const RATES_CACHE_TAG = "fx-rates";

const REQUEST_TIMEOUT_MS = 6000;

type Provider = { name: string; url: string };

/* Tried in order; the first usable answer wins. */
const PROVIDERS: Provider[] = [
  /* exchangerate-api's open endpoint: USD base, ~160 currencies,
     and an explicit "last updated" stamp */
  { name: "open.er-api.com", url: "https://open.er-api.com/v6/latest/USD" },
  /* a CDN-hosted daily snapshot — different infrastructure, so an
     outage at the first provider rarely takes this one with it */
  {
    name: "currency-api",
    url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json",
  },
  /* ECB reference rates: fewer currencies, but very reliable */
  { name: "frankfurter.dev", url: "https://api.frankfurter.dev/v1/latest?base=USD" },
];

function configuredProvider(): Provider | null {
  const base = process.env.FX_API_URL?.trim();
  if (!base) return null;
  const key = process.env.FX_API_KEY?.trim();
  if (!key) return { name: "FX_API_URL", url: base };
  try {
    const url = new URL(base);
    /* the key stays on the server: this request is never made from
       the browser */
    url.searchParams.set("apikey", key);
    return { name: "FX_API_URL", url: url.toString() };
  } catch {
    return { name: "FX_API_URL", url: base };
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/* The three providers disagree on shape but all boil down to
   "a map of code → units per dollar, plus a date". */
function readRateMap(payload: Record<string, unknown>): Record<string, unknown> | null {
  if (isRecord(payload.rates)) return payload.rates;
  const lower = BASE_CURRENCY.toLowerCase();
  if (isRecord(payload[lower])) return payload[lower] as Record<string, unknown>;
  return null;
}

function readUpdatedAt(payload: Record<string, unknown>): string | null {
  const unix = payload.time_last_update_unix;
  if (typeof unix === "number" && Number.isFinite(unix)) {
    return new Date(unix * 1000).toISOString();
  }
  for (const key of ["time_last_update_utc", "date", "last_updated_at", "updated"]) {
    const value = payload[key];
    if (typeof value === "string") {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
    }
  }
  return null;
}

/* Only the currencies the site offers are kept, so the table that
   crosses to the browser stays a few hundred bytes. */
function pickSupported(raw: Record<string, unknown>): RateTable {
  const table: RateTable = { [BASE_CURRENCY]: 1 };
  for (const code of CURRENCY_CODES) {
    if (code === BASE_CURRENCY) continue;
    const value = raw[code] ?? raw[code.toLowerCase()];
    if (typeof value === "number" && Number.isFinite(value) && value > 0) table[code] = value;
  }
  return table;
}

async function fetchFrom(provider: Provider): Promise<ExchangeRates | null> {
  try {
    const response = await fetch(provider.url, {
      /* Next's data cache — one live request an hour for every
         visitor and every page */
      next: { revalidate: RATES_REVALIDATE_SECONDS, tags: [RATES_CACHE_TAG] },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;

    const payload: unknown = await response.json();
    if (!isRecord(payload)) return null;
    if (typeof payload.result === "string" && payload.result !== "success") return null;

    const raw = readRateMap(payload);
    if (!raw) return null;

    const rates = pickSupported(raw);
    /* a table with nothing but USD in it is not worth caching */
    if (Object.keys(rates).length < 2) return null;

    return {
      base: BASE_CURRENCY,
      rates,
      updatedAt: readUpdatedAt(payload),
      source: provider.name,
      stale: false,
    };
  } catch {
    return null;
  }
}

/* The last table we successfully fetched, kept for as long as this
   server instance lives. If every provider is down, visitors keep
   seeing yesterday's rates rather than losing the feature. */
let lastGood: ExchangeRates | null = null;

/* `cache` dedupes this across a single render pass; the fetch above
   dedupes it across requests. */
export const getExchangeRates = cache(async (): Promise<ExchangeRates> => {
  const providers = [configuredProvider(), ...PROVIDERS].filter((p): p is Provider => p !== null);

  for (const provider of providers) {
    const result = await fetchFrom(provider);
    if (result) {
      lastGood = result;
      return result;
    }
  }

  if (lastGood) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[currency] every FX provider failed — serving the last cached rates");
    }
    return { ...lastGood, stale: true };
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn("[currency] no FX rates available — the site stays in USD");
  }
  return USD_ONLY_RATES;
});
