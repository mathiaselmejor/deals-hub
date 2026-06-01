/**
 * URLs de tienda — prioriza ficha de producto (no búsqueda genérica).
 */

export const STORE_SEARCH = {
  amazon: (q) => `https://www.amazon.es/s?k=${encodeURIComponent(q)}`,
  pccomponentes: (q) => `https://www.pccomponentes.com/search/?query=${encodeURIComponent(q)}`,
  mediamarkt: (q) => `https://www.mediamarkt.es/es/search.html?query=${encodeURIComponent(q)}`,
  elcorteingles: (q) => `https://www.elcorteingles.es/search/?s=${encodeURIComponent(q)}`,
  fnac: (q) => `https://www.fnac.es/SearchResult/ResultList.aspx?Search=${encodeURIComponent(q)}`,
  decathlon: (q) => `https://www.decathlon.es/search?query=${encodeURIComponent(q)}`,
  ikea: (q) => `https://www.ikea.com/es/es/search/?q=${encodeURIComponent(q)}`,
  ebay: (q) => `https://www.ebay.es/sch/i.html?_nkw=${encodeURIComponent(q)}`,
  aliexpress: (q) => `https://es.aliexpress.com/wholesale?SearchText=${encodeURIComponent(q)}`,
  booking: (q) => `https://www.booking.com/searchresults.es.html?ss=${encodeURIComponent(q)}`,
};

export function amazonDpUrl(asin) {
  const clean = asin.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  if (!/^B[A-Z0-9]{9}$/.test(clean) && !/^\d{9,12}$/.test(clean)) return null;
  return `https://www.amazon.es/dp/${clean}`;
}

export function amazonRenewedUrl(asin) {
  const dp = amazonDpUrl(asin);
  if (!dp) return null;
  return `${dp}?aod=1`;
}

export function ebayItemUrl(itemId) {
  if (!itemId) return null;
  return `https://www.ebay.es/itm/${itemId}`;
}

/** @param {{ store: string, search: string, asin?: string, directUrl?: string, ebayItemId?: string }} opts */
export function buildStoreProductUrl(opts) {
  const { store, search, asin, directUrl, ebayItemId } = opts;

  if (directUrl && /^https?:\/\//i.test(directUrl)) {
    return directUrl;
  }

  if (store === "amazon" && asin) {
    return amazonDpUrl(asin) ?? STORE_SEARCH.amazon(search);
  }

  if (store === "ebay" && ebayItemId) {
    return ebayItemUrl(ebayItemId) ?? STORE_SEARCH.ebay(search);
  }

  const fn = STORE_SEARCH[store];
  return fn ? fn(search) : STORE_SEARCH.amazon(search);
}

export function extractAmazonAsin(url) {
  if (!url) return null;
  const m =
    url.match(/\/dp\/([A-Z0-9]{10})/i) ||
    url.match(/\/gp\/product\/([A-Z0-9]{10})/i) ||
    url.match(/[?&]asin=([A-Z0-9]{10})/i);
  return m ? m[1].toUpperCase() : null;
}

export function isSearchUrl(url, store) {
  if (!url) return true;
  if (store === "amazon") {
    return /\/s\?|\/search\//i.test(url) && !/\/dp\/|\/gp\/product\//i.test(url);
  }
  if (store === "pccomponentes") return /\/search\//i.test(url);
  if (store === "mediamarkt") return /\/search\.html/i.test(url);
  if (store === "fnac") return /SearchResult/i.test(url);
  if (store === "elcorteingles") return /\/search\//i.test(url);
  if (store === "decathlon") return /\/search\?/i.test(url);
  if (store === "ebay") return /\/sch\//i.test(url);
  return false;
}
