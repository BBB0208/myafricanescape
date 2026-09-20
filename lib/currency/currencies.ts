/* ============================================================
   AMARA ESTATES — display currencies.

   Prices are authored and stored in USD (see the "Listing"
   document type in Sanity, whose currency field defaults to
   USD). Everything here is a *display* layer: the stored
   figure never changes, only what a visitor is shown.

   Plain data only, so both the server and the browser can
   import it.
   ============================================================ */

/* One key for the whole site — read on the server so the first
   paint is already in the visitor's currency. */
export const CURRENCY_COOKIE = "preferred_currency";
export const CURRENCY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/* Rates are quoted against the dollar and prices are stored in it. */
export const BASE_CURRENCY = "USD";

/* No preference, or an unreadable one: the site looks exactly as
   it always has. */
export const DEFAULT_CURRENCY = "USD";

export type CurrencyConfig = {
  code: string;
  name: string;
  /* The locale Intl formats with. Chosen per currency so every
     amount reads left-to-right in Latin digits with the symbol
     the market itself uses — "Ksh 32,378,783", "₦333,923,681". */
  locale: string;
  /* "narrowSymbol" gives the short local symbol; "symbol" is used
     where the narrow form would collide with the dollar sign
     (CA$ / A$ rather than a bare $). */
  display: "narrowSymbol" | "symbol";
};

export const SUPPORTED_CURRENCIES = [
  { code: "USD", name: "US Dollar", locale: "en-US", display: "narrowSymbol" },
  { code: "EUR", name: "Euro", locale: "en-IE", display: "narrowSymbol" },
  { code: "GBP", name: "British Pound", locale: "en-GB", display: "narrowSymbol" },
  { code: "ZAR", name: "South African Rand", locale: "en-US", display: "narrowSymbol" },
  { code: "KES", name: "Kenyan Shilling", locale: "en-KE", display: "narrowSymbol" },
  { code: "NGN", name: "Nigerian Naira", locale: "en-NG", display: "narrowSymbol" },
  { code: "GHS", name: "Ghanaian Cedi", locale: "en-GH", display: "narrowSymbol" },
  { code: "MAD", name: "Moroccan Dirham", locale: "en-US", display: "narrowSymbol" },
  { code: "EGP", name: "Egyptian Pound", locale: "en-EG", display: "narrowSymbol" },
  { code: "AED", name: "UAE Dirham", locale: "en-AE", display: "narrowSymbol" },
  { code: "SAR", name: "Saudi Riyal", locale: "en-SA", display: "narrowSymbol" },
  { code: "CAD", name: "Canadian Dollar", locale: "en-US", display: "symbol" },
  { code: "AUD", name: "Australian Dollar", locale: "en-US", display: "symbol" },
  { code: "JPY", name: "Japanese Yen", locale: "en-US", display: "narrowSymbol" },
] as const satisfies readonly CurrencyConfig[];

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];

export const CURRENCY_CODES = SUPPORTED_CURRENCIES.map((c) => c.code) as CurrencyCode[];

const BY_CODE = new Map<string, CurrencyConfig>(SUPPORTED_CURRENCIES.map((c) => [c.code, c]));

const USD_CONFIG = BY_CODE.get(BASE_CURRENCY) as CurrencyConfig;

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === "string" && BY_CODE.has(value);
}

/* A code from a cookie, from Sanity or from a URL — anything we
   don't recognise becomes the fallback rather than reaching Intl. */
export function toCurrencyCode(
  value: unknown,
  fallback: CurrencyCode = DEFAULT_CURRENCY,
): CurrencyCode {
  if (typeof value !== "string") return fallback;
  const code = value.trim().toUpperCase();
  return isCurrencyCode(code) ? code : fallback;
}

export function currencyConfig(code: unknown): CurrencyConfig {
  return (typeof code === "string" ? BY_CODE.get(code.toUpperCase()) : undefined) ?? USD_CONFIG;
}

export function currencyName(code: unknown): string {
  return currencyConfig(code).name;
}
