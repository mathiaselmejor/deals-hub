const q = process.argv[2] || "Ninja Airfryer MAX site:amazon.es";
const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
const res = await fetch(url, {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; DealsHub/1.0)" },
});
const h = await res.text();
const asins = [...h.matchAll(/amazon\.es\/(?:dp|gp\/product)\/([A-Z0-9]{10})/gi)].map((m) => m[1]);
console.log("status", res.status, "asins", [...new Set(asins)].slice(0, 5));
