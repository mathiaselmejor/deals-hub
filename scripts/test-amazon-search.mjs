import fs from "fs";

const q = process.argv[2] || "Ninja Airfryer";
const res = await fetch(`https://www.amazon.es/s?k=${encodeURIComponent(q)}`, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "es-ES,es;q=0.9",
    Accept: "text/html,application/xhtml+xml",
  },
});
const h = await res.text();
fs.writeFileSync("data/_amazon-search-sample.html", h.slice(0, 80000));
console.log("status", res.status, "len", h.length);
console.log("captcha?", /captcha|robot/i.test(h));
console.log("dp matches", [...h.matchAll(/\/dp\/([A-Z0-9]{10})/gi)].length);
